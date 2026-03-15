const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get medical records for a patient
router.get('/patient/:patientId', auth, async (req, res) => {
  try {
    const { patientId } = req.params;
    
    const result = await db.query(
      `SELECT mr.*, p.first_name as patient_first_name, p.last_name as patient_last_name, 
              u.first_name as doctor_first_name, u.last_name as doctor_last_name
       FROM medical_records mr
       JOIN patients p ON mr.patient_id = p.id
       LEFT JOIN users u ON mr.doctor_id = u.id
       WHERE mr.patient_id = $1
       ORDER BY mr.visit_date DESC, mr.created_at DESC`,
      [patientId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new medical record
router.post('/', auth, authorize('doctor'), [
  body('patient_id').isUUID().withMessage('Valid patient ID is required'),
  body('visit_date').isISO8601().withMessage('Valid visit date is required'),
  body('chief_complaint').notEmpty().withMessage('Chief complaint is required'),
  body('diagnosis').optional().isLength({ max: 2000 }).withMessage('Diagnosis too long'),
  body('treatment_plan').optional().isLength({ max: 2000 }).withMessage('Treatment plan too long'),
  body('notes').optional().isLength({ max: 2000 }).withMessage('Notes too long'),
  body('vital_signs').optional().isObject().withMessage('Vital signs must be an object')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      patient_id,
      visit_date,
      chief_complaint,
      diagnosis,
      treatment_plan,
      notes,
      vital_signs
    } = req.body;

    // Check if patient exists
    const patientExists = await db.query('SELECT id FROM patients WHERE id = $1 AND is_active = true', [patient_id]);
    if (patientExists.rows.length === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Validate vital signs structure if provided
    if (vital_signs) {
      const validVitalSigns = {
        blood_pressure_systolic: vital_signs.blood_pressure_systolic,
        blood_pressure_diastolic: vital_signs.blood_pressure_diastolic,
        heart_rate: vital_signs.heart_rate,
        temperature: vital_signs.temperature,
        weight: vital_signs.weight,
        height: vital_signs.height,
        oxygen_saturation: vital_signs.oxygen_saturation,
        respiratory_rate: vital_signs.respiratory_rate
      };

      // Store vital signs as JSON
      const vitalSignsJson = JSON.stringify(validVitalSigns);

      const result = await db.query(
        `INSERT INTO medical_records (patient_id, doctor_id, visit_date, chief_complaint, diagnosis, 
         treatment_plan, vital_signs, notes) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [patient_id, req.user.id, visit_date, chief_complaint, diagnosis, treatment_plan, vitalSignsJson, notes]
      );

      res.status(201).json({
        message: 'Medical record created successfully',
        record: result.rows[0]
      });
    } else {
      const result = await db.query(
        `INSERT INTO medical_records (patient_id, doctor_id, visit_date, chief_complaint, diagnosis, 
         treatment_plan, notes) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [patient_id, req.user.id, visit_date, chief_complaint, diagnosis, treatment_plan, notes]
      );

      res.status(201).json({
        message: 'Medical record created successfully',
        record: result.rows[0]
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get medical record by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT mr.*, p.first_name as patient_first_name, p.last_name as patient_last_name, 
              p.patient_id, p.date_of_birth, p.gender, p.phone as patient_phone,
              u.first_name as doctor_first_name, u.last_name as doctor_last_name
       FROM medical_records mr
       JOIN patients p ON mr.patient_id = p.id
       LEFT JOIN users u ON mr.doctor_id = u.id
       WHERE mr.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Medical record not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update medical record
router.put('/:id', auth, authorize('doctor'), [
  body('chief_complaint').optional().notEmpty().withMessage('Chief complaint cannot be empty'),
  body('diagnosis').optional().isLength({ max: 2000 }).withMessage('Diagnosis too long'),
  body('treatment_plan').optional().isLength({ max: 2000 }).withMessage('Treatment plan too long'),
  body('notes').optional().isLength({ max: 2000 }).withMessage('Notes too long'),
  body('vital_signs').optional().isObject().withMessage('Vital signs must be an object')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const recordId = req.params.id;
    const {
      chief_complaint,
      diagnosis,
      treatment_plan,
      notes,
      vital_signs
    } = req.body;

    // Check if medical record exists
    const recordExists = await db.query('SELECT * FROM medical_records WHERE id = $1', [recordId]);
    if (recordExists.rows.length === 0) {
      return res.status(404).json({ message: 'Medical record not found' });
    }

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramCount = 1;

    const fields = {
      chief_complaint: chief_complaint,
      diagnosis: diagnosis,
      treatment_plan: treatment_plan,
      notes: notes
    };

    for (const [field, value] of Object.entries(fields)) {
      if (value !== undefined) {
        updates.push(`${field} = $${paramCount++}`);
        values.push(value);
      }
    }

    if (vital_signs !== undefined) {
      updates.push(`vital_signs = $${paramCount++}`);
      values.push(JSON.stringify(vital_signs));
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    values.push(recordId);

    const result = await db.query(
      `UPDATE medical_records SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    res.json({
      message: 'Medical record updated successfully',
      record: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get patient medical history summary
router.get('/summary/:patientId', auth, async (req, res) => {
  try {
    const { patientId } = req.params;
    
    // Get basic patient info
    const patientResult = await db.query(
      'SELECT * FROM patients WHERE id = $1 AND is_active = true',
      [patientId]
    );

    if (patientResult.rows.length === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const patient = patientResult.rows[0];

    // Get recent medical records
    const recordsResult = await db.query(
      `SELECT mr.*, u.first_name as doctor_first_name, u.last_name as doctor_last_name
       FROM medical_records mr
       LEFT JOIN users u ON mr.doctor_id = u.id
       WHERE mr.patient_id = $1
       ORDER BY mr.visit_date DESC
       LIMIT 10`,
      [patientId]
    );

    // Get recent triage records
    const triageResult = await db.query(
      `SELECT tr.*, u.first_name as nurse_first_name, u.last_name as nurse_last_name
       FROM triage_records tr
       LEFT JOIN users u ON tr.nurse_id = u.id
       WHERE tr.patient_id = $1
       ORDER BY tr.created_at DESC
       LIMIT 5`,
      [patientId]
    );

    // Get active prescriptions
    const prescriptionsResult = await db.query(
      `SELECT p.*, u.first_name as doctor_first_name, u.last_name as doctor_last_name
       FROM prescriptions p
       LEFT JOIN users u ON p.doctor_id = u.id
       WHERE p.patient_id = $1 AND p.status = 'active' AND p.expires_at > CURRENT_TIMESTAMP
       ORDER BY p.issued_at DESC`,
      [patientId]
    );

    // Get recent lab tests
    const labTestsResult = await db.query(
      `SELECT lt.*, u.first_name as doctor_first_name, u.last_name as doctor_last_name
       FROM lab_tests lt
       LEFT JOIN users u ON lt.doctor_id = u.id
       WHERE lt.patient_id = $1
       ORDER BY lt.requested_at DESC
       LIMIT 10`,
      [patientId]
    );

    // Get appointment history
    const appointmentsResult = await db.query(
      `SELECT a.*, u.first_name as doctor_first_name, u.last_name as doctor_last_name
       FROM appointments a
       LEFT JOIN users u ON a.doctor_id = u.id
       WHERE a.patient_id = $1
       ORDER BY a.appointment_date DESC, a.appointment_time DESC
       LIMIT 10`,
      [patientId]
    );

    res.json({
      patient: patient,
      medical_records: recordsResult.rows,
      triage_records: triageResult.rows,
      active_prescriptions: prescriptionsResult.rows,
      recent_lab_tests: labTestsResult.rows,
      appointment_history: appointmentsResult.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search medical records
router.get('/search', auth, async (req, res) => {
  try {
    const { query, date_from, date_to, doctor_id, patient_id } = req.query;
    
    let sql = `
      SELECT mr.*, p.first_name as patient_first_name, p.last_name as patient_last_name, 
             p.patient_id, u.first_name as doctor_first_name, u.last_name as doctor_last_name
      FROM medical_records mr
      JOIN patients p ON mr.patient_id = p.id
      LEFT JOIN users u ON mr.doctor_id = u.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 1;

    if (query) {
      sql += ` AND (mr.chief_complaint ILIKE $${paramCount++} OR mr.diagnosis ILIKE $${paramCount++} OR mr.treatment_plan ILIKE $${paramCount++})`;
      const searchTerm = `%${query}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (date_from) {
      sql += ` AND mr.visit_date >= $${paramCount++}`;
      params.push(date_from);
    }

    if (date_to) {
      sql += ` AND mr.visit_date <= $${paramCount++}`;
      params.push(date_to);
    }

    if (doctor_id) {
      sql += ` AND mr.doctor_id = $${paramCount++}`;
      params.push(doctor_id);
    }

    if (patient_id) {
      sql += ` AND mr.patient_id = $${paramCount++}`;
      params.push(patient_id);
    }

    sql += ` ORDER BY mr.visit_date DESC, mr.created_at DESC LIMIT 50`;

    const result = await db.query(sql, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get medical records statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const { date_from, date_to } = req.query;
    
    let sql = `
      SELECT 
        COUNT(*) as total_records,
        COUNT(DISTINCT patient_id) as unique_patients,
        COUNT(DISTINCT doctor_id) as attending_doctors,
        COUNT(CASE WHEN diagnosis IS NOT NULL THEN 1 END) as with_diagnosis,
        COUNT(CASE WHEN treatment_plan IS NOT NULL THEN 1 END) as with_treatment
      FROM medical_records
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 1;

    if (date_from) {
      sql += ` AND visit_date >= $${paramCount++}`;
      params.push(date_from);
    }

    if (date_to) {
      sql += ` AND visit_date <= $${paramCount++}`;
      params.push(date_to);
    }

    const result = await db.query(sql, params);
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
