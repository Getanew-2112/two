const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all lab tests (for lab technicians and doctors)
router.get('/', auth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT lt.*, u.first_name as doctor_first_name, u.last_name as doctor_last_name,
              tech.first_name as technician_first_name, tech.last_name as technician_last_name,
              pat.first_name as patient_first_name, pat.last_name as patient_last_name, pat.patient_id
       FROM lab_tests lt
       LEFT JOIN users u ON lt.doctor_id = u.id
       LEFT JOIN users tech ON lt.technician_id = tech.id
       LEFT JOIN patients pat ON lt.patient_id = pat.id
       ORDER BY lt.requested_at DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get lab tests for a patient
router.get('/patient/:patientId', auth, async (req, res) => {
  try {
    const { patientId } = req.params;
    
    const result = await db.query(
      `SELECT lt.*, u.first_name as doctor_first_name, u.last_name as doctor_last_name,
              tech.first_name as technician_first_name, tech.last_name as technician_last_name
       FROM lab_tests lt
       LEFT JOIN users u ON lt.doctor_id = u.id
       LEFT JOIN users tech ON lt.technician_id = tech.id
       WHERE lt.patient_id = $1
       ORDER BY lt.requested_at DESC`,
      [patientId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new lab test request
router.post('/', auth, authorize('doctor'), [
  body('patient_id').isUUID().withMessage('Valid patient ID is required'),
  body('test_type').notEmpty().withMessage('Test type is required'),
  body('test_name').notEmpty().withMessage('Test name is required'),
  body('notes').optional().isLength({ max: 1000 }).withMessage('Notes too long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      patient_id,
      test_type,
      test_name,
      notes
    } = req.body;

    // Check if patient exists
    const patientExists = await db.query('SELECT id FROM patients WHERE id = $1 AND is_active = true', [patient_id]);
    if (patientExists.rows.length === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Create lab test request
    const result = await db.query(
      `INSERT INTO lab_tests (patient_id, doctor_id, test_type, test_name, notes) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [patient_id, req.user.id, test_type, test_name, notes]
    );

    res.status(201).json({
      message: 'Lab test requested successfully',
      labTest: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get lab test by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT lt.*, u.first_name as doctor_first_name, u.last_name as doctor_last_name,
              tech.first_name as technician_first_name, tech.last_name as technician_last_name,
              pat.first_name as patient_first_name, pat.last_name as patient_last_name, pat.patient_id
       FROM lab_tests lt
       LEFT JOIN users u ON lt.doctor_id = u.id
       LEFT JOIN users tech ON lt.technician_id = tech.id
       LEFT JOIN patients pat ON lt.patient_id = pat.id
       WHERE lt.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Lab test not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update lab test status and results
router.put('/:id', auth, authorize('lab_technician', 'doctor'), [
  body('status').isIn(['pending', 'in_progress', 'completed', 'cancelled']).withMessage('Invalid status'),
  body('results').optional().isLength({ max: 2000 }).withMessage('Results too long'),
  body('normal_range').optional().isLength({ max: 500 }).withMessage('Normal range too long'),
  body('notes').optional().isLength({ max: 1000 }).withMessage('Notes too long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const labTestId = req.params.id;
    const { status, results, normal_range, notes } = req.body;

    // Check if lab test exists
    const labTestExists = await db.query('SELECT * FROM lab_tests WHERE id = $1', [labTestId]);
    if (labTestExists.rows.length === 0) {
      return res.status(404).json({ message: 'Lab test not found' });
    }

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramCount = 1;

    const fields = {
      status: status,
      results: results,
      normal_range: normal_range,
      notes: notes
    };

    for (const [field, value] of Object.entries(fields)) {
      if (value !== undefined) {
        updates.push(`${field} = $${paramCount++}`);
        values.push(value);
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    // Add technician_id if lab technician is updating
    if (req.user.role === 'lab_technician') {
      updates.push(`technician_id = $${paramCount++}`);
      values.push(req.user.id);
    }

    // Add completed_at if status is completed
    if (status === 'completed' && labTestExists.rows[0].status !== 'completed') {
      updates.push(`completed_at = CURRENT_TIMESTAMP`);
    }

    values.push(labTestId);

    const result = await db.query(
      `UPDATE lab_tests SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    res.json({
      message: 'Lab test updated successfully',
      labTest: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get pending lab tests for lab technician
router.get('/pending', auth, authorize('lab_technician'), async (req, res) => {
  try {
    const result = await db.query(
      `SELECT lt.*, u.first_name as doctor_first_name, u.last_name as doctor_last_name,
              pat.first_name as patient_first_name, pat.last_name as patient_last_name, pat.patient_id,
              pat.phone as patient_phone
       FROM lab_tests lt
       LEFT JOIN users u ON lt.doctor_id = u.id
       LEFT JOIN patients pat ON lt.patient_id = pat.id
       WHERE lt.status IN ('pending', 'in_progress')
       ORDER BY lt.requested_at ASC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get today's lab tests
router.get('/today', auth, async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = `
      SELECT lt.*, u.first_name as doctor_first_name, u.last_name as doctor_last_name,
              tech.first_name as technician_first_name, tech.last_name as technician_last_name,
              pat.first_name as patient_first_name, pat.last_name as patient_last_name, pat.patient_id
      FROM lab_tests lt
      LEFT JOIN users u ON lt.doctor_id = u.id
      LEFT JOIN users tech ON lt.technician_id = tech.id
      LEFT JOIN patients pat ON lt.patient_id = pat.id
      WHERE DATE(lt.requested_at) = CURRENT_DATE
    `;
    
    const params = [];
    let paramCount = 1;

    if (status) {
      query += ` AND lt.status = $${paramCount++}`;
      params.push(status);
    }

    query += ` ORDER BY lt.requested_at DESC`;

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get completed lab tests with results
router.get('/completed', auth, async (req, res) => {
  try {
    const { patient_id, date_from, date_to } = req.query;
    
    let query = `
      SELECT lt.*, u.first_name as doctor_first_name, u.last_name as doctor_last_name,
              tech.first_name as technician_first_name, tech.last_name as technician_last_name,
              pat.first_name as patient_first_name, pat.last_name as patient_last_name, pat.patient_id
      FROM lab_tests lt
      LEFT JOIN users u ON lt.doctor_id = u.id
      LEFT JOIN users tech ON lt.technician_id = tech.id
      LEFT JOIN patients pat ON lt.patient_id = pat.id
      WHERE lt.status = 'completed' AND lt.results IS NOT NULL
    `;
    
    const params = [];
    let paramCount = 1;

    if (patient_id) {
      query += ` AND lt.patient_id = $${paramCount++}`;
      params.push(patient_id);
    }

    if (date_from) {
      query += ` AND lt.completed_at >= $${paramCount++}`;
      params.push(date_from);
    }

    if (date_to) {
      query += ` AND lt.completed_at <= $${paramCount++}`;
      params.push(date_to);
    }

    query += ` ORDER BY lt.completed_at DESC`;

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get lab test statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const { date_from, date_to } = req.query;
    
    let sql = `
      SELECT 
        COUNT(*) as total_tests,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
        COUNT(DISTINCT patient_id) as unique_patients,
        COUNT(DISTINCT doctor_id) as requesting_doctors,
        COUNT(DISTINCT technician_id) as processing_technicians
      FROM lab_tests
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 1;

    if (date_from) {
      sql += ` AND requested_at >= $${paramCount++}`;
      params.push(date_from);
    }

    if (date_to) {
      sql += ` AND requested_at <= $${paramCount++}`;
      params.push(date_to);
    }

    const result = await db.query(sql, params);
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search lab tests
router.get('/search', auth, async (req, res) => {
  try {
    const { query, patient_id, doctor_id, test_type, status, date_from, date_to } = req.query;
    
    let sql = `
      SELECT lt.*, u.first_name as doctor_first_name, u.last_name as doctor_last_name,
              tech.first_name as technician_first_name, tech.last_name as technician_last_name,
              pat.first_name as patient_first_name, pat.last_name as patient_last_name, pat.patient_id
      FROM lab_tests lt
      LEFT JOIN users u ON lt.doctor_id = u.id
      LEFT JOIN users tech ON lt.technician_id = tech.id
      LEFT JOIN patients pat ON lt.patient_id = pat.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 1;

    if (query) {
      sql += ` AND (lt.test_name ILIKE $${paramCount++} OR lt.test_type ILIKE $${paramCount++} OR lt.results ILIKE $${paramCount++})`;
      const searchTerm = `%${query}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (patient_id) {
      sql += ` AND lt.patient_id = $${paramCount++}`;
      params.push(patient_id);
    }

    if (doctor_id) {
      sql += ` AND lt.doctor_id = $${paramCount++}`;
      params.push(doctor_id);
    }

    if (test_type) {
      sql += ` AND lt.test_type = $${paramCount++}`;
      params.push(test_type);
    }

    if (status) {
      sql += ` AND lt.status = $${paramCount++}`;
      params.push(status);
    }

    if (date_from) {
      sql += ` AND lt.requested_at >= $${paramCount++}`;
      params.push(date_from);
    }

    if (date_to) {
      sql += ` AND lt.requested_at <= $${paramCount++}`;
      params.push(date_to);
    }

    sql += ` ORDER BY lt.requested_at DESC LIMIT 50`;

    const result = await db.query(sql, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get common lab test types
router.get('/test-types', auth, async (req, res) => {
  try {
    const commonTests = [
      { type: 'hematology', name: 'Complete Blood Count (CBC)' },
      { type: 'hematology', name: 'Blood Typing' },
      { type: 'hematology', name: 'Erythrocyte Sedimentation Rate (ESR)' },
      { type: 'chemistry', name: 'Comprehensive Metabolic Panel' },
      { type: 'chemistry', name: 'Liver Function Tests' },
      { type: 'chemistry', name: 'Kidney Function Tests' },
      { type: 'chemistry', name: 'Lipid Profile' },
      { type: 'chemistry', name: 'Blood Glucose' },
      { type: 'chemistry', name: 'HbA1c' },
      { type: 'chemistry', name: 'Electrolytes' },
      { type: 'microbiology', name: 'Blood Culture' },
      { type: 'microbiology', name: 'Urine Culture' },
      { type: 'microbiology', name: 'Wound Culture' },
      { type: 'microbiology', name: 'Stool Culture' },
      { type: 'immunology', name: 'HIV Test' },
      { type: 'immunology', name: 'Hepatitis B Surface Antigen' },
      { type: 'immunology', name: 'Hepatitis C Antibody' },
      { type: 'immunology', name: 'VDRL/RPR' },
      { type: 'urinalysis', name: 'Urine Analysis' },
      { type: 'urinalysis', name: 'Urine Pregnancy Test' },
      { type: 'parasitology', name: 'Stool Ova & Parasites' },
      { type: 'parasitology', name: 'Blood Parasite Smear' },
      { type: 'hormone', name: 'TSH' },
      { type: 'hormone', name: 'T3, T4' },
      { type: 'cardiac', name: 'Troponin' },
      { type: 'cardiac', name: 'CK-MB' },
      { type: 'toxicology', name: 'Drug Screen' }
    ];

    res.json(commonTests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
