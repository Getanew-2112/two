const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all prescriptions (for pharmacists and doctors)
router.get('/', auth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT p.*, u.first_name as doctor_first_name, u.last_name as doctor_last_name,
              ph.first_name as pharmacist_first_name, ph.last_name as pharmacist_last_name,
              pat.first_name as patient_first_name, pat.last_name as patient_last_name, pat.patient_id
       FROM prescriptions p
       LEFT JOIN users u ON p.doctor_id = u.id
       LEFT JOIN users ph ON p.pharmacist_id = ph.id
       LEFT JOIN patients pat ON p.patient_id = pat.id
       ORDER BY p.issued_at DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get prescriptions for a patient
router.get('/patient/:patientId', auth, async (req, res) => {
  try {
    const { patientId } = req.params;
    
    const result = await db.query(
      `SELECT p.*, u.first_name as doctor_first_name, u.last_name as doctor_last_name,
              ph.first_name as pharmacist_first_name, ph.last_name as pharmacist_last_name
       FROM prescriptions p
       LEFT JOIN users u ON p.doctor_id = u.id
       LEFT JOIN users ph ON p.pharmacist_id = ph.id
       WHERE p.patient_id = $1
       ORDER BY p.issued_at DESC`,
      [patientId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new prescription
router.post('/', auth, authorize('doctor'), [
  body('patient_id').isUUID().withMessage('Valid patient ID is required'),
  body('medication_name').notEmpty().withMessage('Medication name is required'),
  body('dosage').notEmpty().withMessage('Dosage is required'),
  body('frequency').notEmpty().withMessage('Frequency is required'),
  body('duration').notEmpty().withMessage('Duration is required'),
  body('instructions').optional().isLength({ max: 1000 }).withMessage('Instructions too long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      patient_id,
      medication_name,
      dosage,
      frequency,
      duration,
      instructions
    } = req.body;

    // Check if patient exists
    const patientExists = await db.query('SELECT id FROM patients WHERE id = $1 AND is_active = true', [patient_id]);
    if (patientExists.rows.length === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Create prescription with 7-day expiry
    const result = await db.query(
      `INSERT INTO prescriptions (patient_id, doctor_id, medication_name, dosage, frequency, duration, instructions) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [patient_id, req.user.id, medication_name, dosage, frequency, duration, instructions]
    );

    res.status(201).json({
      message: 'Prescription created successfully',
      prescription: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get active prescriptions
router.get('/active', auth, async (req, res) => {
  try {
    const { patient_id } = req.query;
    
    let query = `
      SELECT p.*, u.first_name as doctor_first_name, u.last_name as doctor_last_name,
             pat.first_name as patient_first_name, pat.last_name as patient_last_name, pat.patient_id
      FROM prescriptions p
      LEFT JOIN users u ON p.doctor_id = u.id
      LEFT JOIN patients pat ON p.patient_id = pat.id
      WHERE p.status = 'active' AND p.expires_at > CURRENT_TIMESTAMP
    `;
    
    const params = [];
    
    if (patient_id) {
      query += ` AND p.patient_id = $1`;
      params.push(patient_id);
    }

    query += ` ORDER BY p.issued_at DESC`;

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get prescription by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT p.*, u.first_name as doctor_first_name, u.last_name as doctor_last_name,
              ph.first_name as pharmacist_first_name, ph.last_name as pharmacist_last_name,
              pat.first_name as patient_first_name, pat.last_name as patient_last_name, pat.patient_id
       FROM prescriptions p
       LEFT JOIN users u ON p.doctor_id = u.id
       LEFT JOIN users ph ON p.pharmacist_id = ph.id
       LEFT JOIN patients pat ON p.patient_id = pat.id
       WHERE p.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update prescription status (dispense/cancel)
router.put('/:id/status', auth, [
  body('status').isIn(['active', 'dispensed', 'expired', 'cancelled']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const prescriptionId = req.params.id;
    const { status } = req.body;

    // Check if prescription exists
    const prescriptionExists = await db.query('SELECT * FROM prescriptions WHERE id = $1', [prescriptionId]);
    if (prescriptionExists.rows.length === 0) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    // Update prescription
    let updateQuery = 'UPDATE prescriptions SET status = $1, updated_at = CURRENT_TIMESTAMP';
    let params = [status];
    
    // If being dispensed, add pharmacist_id and dispensed_at
    if (status === 'dispensed' && req.user.role === 'pharmacist') {
      updateQuery += ', pharmacist_id = $2, dispensed_at = CURRENT_TIMESTAMP';
      params.push(req.user.id);
    }
    
    updateQuery += ' WHERE id = $' + (params.length + 1) + ' RETURNING *';
    params.push(prescriptionId);

    const result = await db.query(updateQuery, params);

    res.json({
      message: 'Prescription status updated successfully',
      prescription: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get today's prescriptions
router.get('/today', auth, async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = `
      SELECT p.*, u.first_name as doctor_first_name, u.last_name as doctor_last_name,
             pat.first_name as patient_first_name, pat.last_name as patient_last_name, pat.patient_id
      FROM prescriptions p
      LEFT JOIN users u ON p.doctor_id = u.id
      LEFT JOIN patients pat ON p.patient_id = pat.id
      WHERE DATE(p.issued_at) = CURRENT_DATE
    `;
    
    const params = [];
    let paramCount = 1;

    if (status) {
      query += ` AND p.status = $${paramCount++}`;
      params.push(status);
    }

    query += ` ORDER BY p.issued_at DESC`;

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get prescriptions for pharmacist (pending dispensing)
router.get('/pending', auth, authorize('pharmacist'), async (req, res) => {
  try {
    const result = await db.query(
      `SELECT p.*, u.first_name as doctor_first_name, u.last_name as doctor_last_name,
              pat.first_name as patient_first_name, pat.last_name as patient_last_name, pat.patient_id,
              pat.phone as patient_phone, pat.allergies
       FROM prescriptions p
       LEFT JOIN users u ON p.doctor_id = u.id
       LEFT JOIN patients pat ON p.patient_id = pat.id
       WHERE p.status = 'active' AND p.expires_at > CURRENT_TIMESTAMP
       ORDER BY p.issued_at ASC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Dispense prescription
router.post('/:id/dispense', auth, authorize('pharmacist'), [
  body('notes').optional().isLength({ max: 500 }).withMessage('Notes too long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const prescriptionId = req.params.id;
    const { notes } = req.body;

    // Check if prescription exists and is active
    const prescriptionExists = await db.query(
      'SELECT * FROM prescriptions WHERE id = $1 AND status = \'active\' AND expires_at > CURRENT_TIMESTAMP',
      [prescriptionId]
    );
    if (prescriptionExists.rows.length === 0) {
      return res.status(404).json({ message: 'Prescription not found or expired' });
    }

    // Update prescription as dispensed
    const result = await db.query(
      `UPDATE prescriptions SET status = 'dispensed', pharmacist_id = $1, dispensed_at = CURRENT_TIMESTAMP, 
       notes = COALESCE(notes, '') || CASE WHEN $2::text != '' THEN '\nDispensed by: ' || $2 ELSE '' END,
       updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 RETURNING *`,
      [req.user.id, notes || '', prescriptionId]
    );

    res.json({
      message: 'Prescription dispensed successfully',
      prescription: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get prescription statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const { date_from, date_to } = req.query;
    
    let sql = `
      SELECT 
        COUNT(*) as total_prescriptions,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
        COUNT(CASE WHEN status = 'dispensed' THEN 1 END) as dispensed,
        COUNT(CASE WHEN status = 'expired' THEN 1 END) as expired,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
        COUNT(DISTINCT patient_id) as unique_patients,
        COUNT(DISTINCT doctor_id) as prescribing_doctors
      FROM prescriptions
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 1;

    if (date_from) {
      sql += ` AND issued_at >= $${paramCount++}`;
      params.push(date_from);
    }

    if (date_to) {
      sql += ` AND issued_at <= $${paramCount++}`;
      params.push(date_to);
    }

    const result = await db.query(sql, params);
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search prescriptions
router.get('/search', auth, async (req, res) => {
  try {
    const { query, patient_id, doctor_id, status, date_from, date_to } = req.query;
    
    let sql = `
      SELECT p.*, u.first_name as doctor_first_name, u.last_name as doctor_last_name,
             pat.first_name as patient_first_name, pat.last_name as patient_last_name, pat.patient_id
      FROM prescriptions p
      LEFT JOIN users u ON p.doctor_id = u.id
      LEFT JOIN patients pat ON p.patient_id = pat.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 1;

    if (query) {
      sql += ` AND (p.medication_name ILIKE $${paramCount++} OR p.instructions ILIKE $${paramCount++})`;
      const searchTerm = `%${query}%`;
      params.push(searchTerm, searchTerm);
    }

    if (patient_id) {
      sql += ` AND p.patient_id = $${paramCount++}`;
      params.push(patient_id);
    }

    if (doctor_id) {
      sql += ` AND p.doctor_id = $${paramCount++}`;
      params.push(doctor_id);
    }

    if (status) {
      sql += ` AND p.status = $${paramCount++}`;
      params.push(status);
    }

    if (date_from) {
      sql += ` AND p.issued_at >= $${paramCount++}`;
      params.push(date_from);
    }

    if (date_to) {
      sql += ` AND p.issued_at <= $${paramCount++}`;
      params.push(date_to);
    }

    sql += ` ORDER BY p.issued_at DESC LIMIT 50`;

    const result = await db.query(sql, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
