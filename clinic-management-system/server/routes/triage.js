const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get triage records for a patient
router.get('/patient/:patientId', auth, async (req, res) => {
  try {
    const { patientId } = req.params;
    
    const result = await db.query(
      `SELECT tr.*, p.first_name as patient_first_name, p.last_name as patient_last_name, 
              u.first_name as nurse_first_name, u.last_name as nurse_last_name
       FROM triage_records tr
       JOIN patients p ON tr.patient_id = p.id
       LEFT JOIN users u ON tr.nurse_id = u.id
       WHERE tr.patient_id = $1
       ORDER BY tr.created_at DESC`,
      [patientId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new triage record
router.post('/', auth, authorize('nurse', 'doctor', 'receptionist'), [
  body('patient_id').isUUID().withMessage('Valid patient ID is required'),
  body('blood_pressure_systolic').isInt({ min: 50, max: 250 }).withMessage('Invalid systolic BP'),
  body('blood_pressure_diastolic').isInt({ min: 30, max: 150 }).withMessage('Invalid diastolic BP'),
  body('heart_rate').isInt({ min: 30, max: 200 }).withMessage('Invalid heart rate'),
  body('temperature').isFloat({ min: 35.0, max: 42.0 }).withMessage('Invalid temperature'),
  body('weight').isFloat({ min: 0, max: 300 }).withMessage('Invalid weight'),
  body('height').optional().isFloat({ min: 0, max: 250 }).withMessage('Invalid height'),
  body('oxygen_saturation').optional().isInt({ min: 70, max: 100 }).withMessage('Invalid oxygen saturation'),
  body('respiratory_rate').optional().isInt({ min: 5, max: 40 }).withMessage('Invalid respiratory rate'),
  body('chief_complaint').notEmpty().withMessage('Chief complaint is required'),
  body('triage_category').isIn(['green', 'yellow', 'orange', 'red']).withMessage('Invalid triage category'),
  body('notes').optional().isLength({ max: 1000 }).withMessage('Notes too long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      patient_id,
      blood_pressure_systolic,
      blood_pressure_diastolic,
      heart_rate,
      temperature,
      weight,
      height,
      oxygen_saturation,
      respiratory_rate,
      chief_complaint,
      triage_category,
      notes
    } = req.body;

    // Check if patient exists
    const patientExists = await db.query('SELECT id FROM patients WHERE id = $1 AND is_active = true', [patient_id]);
    if (patientExists.rows.length === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Calculate BMI if height is provided
    let bmi = null;
    if (height) {
      bmi = (weight / ((height / 100) ** 2)).toFixed(2);
    }

    // Determine severity based on vital signs
    const severity = determineSeverity({
      blood_pressure_systolic,
      blood_pressure_diastolic,
      heart_rate,
      temperature,
      oxygen_saturation,
      triage_category
    });

    // Create triage record
    const result = await db.query(
      `INSERT INTO triage_records (patient_id, nurse_id, blood_pressure_systolic, blood_pressure_diastolic, 
       heart_rate, temperature, weight, height, bmi, oxygen_saturation, respiratory_rate, chief_complaint, 
       triage_category, severity, notes) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *`,
      [
        patient_id,
        req.user.id,
        blood_pressure_systolic,
        blood_pressure_diastolic,
        heart_rate,
        temperature,
        weight,
        height,
        bmi,
        oxygen_saturation,
        respiratory_rate,
        chief_complaint,
        triage_category,
        severity,
        notes
      ]
    );

    // Update patient's current vitals in their record
    await db.query(
      `UPDATE patients SET 
       last_vitals_check = CURRENT_TIMESTAMP,
       updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [patient_id]
    );

    res.status(201).json({
      message: 'Triage record created successfully',
      triage: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get today's triage records
router.get('/today', auth, async (req, res) => {
  try {
    const { category } = req.query;
    
    let query = `
      SELECT tr.*, p.first_name as patient_first_name, p.last_name as patient_last_name, 
             p.patient_id, p.phone as patient_phone, u.first_name as nurse_first_name, u.last_name as nurse_last_name
      FROM triage_records tr
      JOIN patients p ON tr.patient_id = p.id
      LEFT JOIN users u ON tr.nurse_id = u.id
      WHERE DATE(tr.created_at) = CURRENT_DATE
    `;
    
    const params = [];
    let paramCount = 1;

    if (category) {
      query += ` AND tr.triage_category = $${paramCount++}`;
      params.push(category);
    }

    query += ` ORDER BY tr.created_at DESC`;

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update triage record
router.put('/:id', auth, authorize('nurse', 'doctor'), [
  body('blood_pressure_systolic').optional().isInt({ min: 50, max: 250 }).withMessage('Invalid systolic BP'),
  body('blood_pressure_diastolic').optional().isInt({ min: 30, max: 150 }).withMessage('Invalid diastolic BP'),
  body('heart_rate').optional().isInt({ min: 30, max: 200 }).withMessage('Invalid heart rate'),
  body('temperature').optional().isFloat({ min: 35.0, max: 42.0 }).withMessage('Invalid temperature'),
  body('weight').optional().isFloat({ min: 0, max: 300 }).withMessage('Invalid weight'),
  body('height').optional().isFloat({ min: 0, max: 250 }).withMessage('Invalid height'),
  body('oxygen_saturation').optional().isInt({ min: 70, max: 100 }).withMessage('Invalid oxygen saturation'),
  body('respiratory_rate').optional().isInt({ min: 5, max: 40 }).withMessage('Invalid respiratory rate'),
  body('chief_complaint').optional().notEmpty().withMessage('Chief complaint cannot be empty'),
  body('triage_category').optional().isIn(['green', 'yellow', 'orange', 'red']).withMessage('Invalid triage category'),
  body('notes').optional().isLength({ max: 1000 }).withMessage('Notes too long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const triageId = req.params.id;
    const {
      blood_pressure_systolic,
      blood_pressure_diastolic,
      heart_rate,
      temperature,
      weight,
      height,
      oxygen_saturation,
      respiratory_rate,
      chief_complaint,
      triage_category,
      notes
    } = req.body;

    // Check if triage record exists
    const triageExists = await db.query('SELECT * FROM triage_records WHERE id = $1', [triageId]);
    if (triageExists.rows.length === 0) {
      return res.status(404).json({ message: 'Triage record not found' });
    }

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramCount = 1;

    const fields = {
      blood_pressure_systolic: blood_pressure_systolic,
      blood_pressure_diastolic: blood_pressure_diastolic,
      heart_rate: heart_rate,
      temperature: temperature,
      weight: weight,
      height: height,
      oxygen_saturation: oxygen_saturation,
      respiratory_rate: respiratory_rate,
      chief_complaint: chief_complaint,
      triage_category: triage_category,
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

    // Recalculate BMI if height or weight changed
    const currentRecord = triageExists.rows[0];
    if (height !== undefined || weight !== undefined) {
      const newHeight = height !== undefined ? height : currentRecord.height;
      const newWeight = weight !== undefined ? weight : currentRecord.weight;
      
      if (newHeight && newWeight) {
        const bmi = (newWeight / ((newHeight / 100) ** 2)).toFixed(2);
        updates.push(`bmi = $${paramCount++}`);
        values.push(bmi);
      }
    }

    // Recalculate severity if vital signs changed
    if (blood_pressure_systolic !== undefined || blood_pressure_diastolic !== undefined || 
        heart_rate !== undefined || temperature !== undefined || oxygen_saturation !== undefined ||
        triage_category !== undefined) {
      const vitalSigns = {
        blood_pressure_systolic: blood_pressure_systolic !== undefined ? blood_pressure_systolic : currentRecord.blood_pressure_systolic,
        blood_pressure_diastolic: blood_pressure_diastolic !== undefined ? blood_pressure_diastolic : currentRecord.blood_pressure_diastolic,
        heart_rate: heart_rate !== undefined ? heart_rate : currentRecord.heart_rate,
        temperature: temperature !== undefined ? temperature : currentRecord.temperature,
        oxygen_saturation: oxygen_saturation !== undefined ? oxygen_saturation : currentRecord.oxygen_saturation,
        triage_category: triage_category !== undefined ? triage_category : currentRecord.triage_category
      };
      
      const severity = determineSeverity(vitalSigns);
      updates.push(`severity = $${paramCount++}`);
      values.push(severity);
    }

    values.push(triageId);

    const result = await db.query(
      `UPDATE triage_records SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    res.json({
      message: 'Triage record updated successfully',
      triage: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get triage statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const stats = await db.query(`
      SELECT 
        COUNT(*) as total_triage,
        COUNT(CASE WHEN triage_category = 'green' THEN 1 END) as green,
        COUNT(CASE WHEN triage_category = 'yellow' THEN 1 END) as yellow,
        COUNT(CASE WHEN triage_category = 'orange' THEN 1 END) as orange,
        COUNT(CASE WHEN triage_category = 'red' THEN 1 END) as red,
        COUNT(CASE WHEN severity = 'critical' THEN 1 END) as critical,
        COUNT(CASE WHEN severity = 'urgent' THEN 1 END) as urgent,
        COUNT(CASE WHEN severity = 'stable' THEN 1 END) as stable
      FROM triage_records 
      WHERE DATE(created_at) = $1
    `, [today]);

    res.json(stats.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to determine severity based on vital signs
function determineSeverity(vitals) {
  const {
    blood_pressure_systolic,
    blood_pressure_diastolic,
    heart_rate,
    temperature,
    oxygen_saturation,
    triage_category
  } = vitals;

  // Critical indicators
  if (
    blood_pressure_systolic < 70 || blood_pressure_systolic > 200 ||
    blood_pressure_diastolic < 40 || blood_pressure_diastolic > 120 ||
    heart_rate < 40 || heart_rate > 160 ||
    temperature < 35.0 || temperature > 40.0 ||
    (oxygen_saturation && oxygen_saturation < 90) ||
    triage_category === 'red'
  ) {
    return 'critical';
  }

  // Urgent indicators
  if (
    blood_pressure_systolic < 90 || blood_pressure_systolic > 160 ||
    blood_pressure_diastolic < 60 || blood_pressure_diastolic > 100 ||
    heart_rate < 50 || heart_rate > 120 ||
    temperature < 36.0 || temperature > 38.5 ||
    (oxygen_saturation && oxygen_saturation < 95) ||
    triage_category === 'orange'
  ) {
    return 'urgent';
  }

  // Stable
  return 'stable';
}

module.exports = router;


// Assign doctor to triage record
router.post('/assign-doctor', auth, authorize('nurse', 'doctor', 'receptionist'), [
  body('triage_id').isUUID().withMessage('Valid triage ID is required'),
  body('doctor_id').isUUID().withMessage('Valid doctor ID is required'),
  body('assignment_notes').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { triage_id, doctor_id, assignment_notes } = req.body;

    // Check if triage record exists
    const triageExists = await db.query(
      'SELECT tr.*, p.id as patient_id FROM triage_records tr JOIN patients p ON tr.patient_id = p.id WHERE tr.id = $1',
      [triage_id]
    );
    if (triageExists.rows.length === 0) {
      return res.status(404).json({ message: 'Triage record not found' });
    }

    const triage = triageExists.rows[0];

    // Check if doctor exists and is active
    const doctorExists = await db.query(
      'SELECT id, first_name, last_name FROM users WHERE id = $1 AND role = $2 AND is_active = true',
      [doctor_id, 'doctor']
    );
    if (doctorExists.rows.length === 0) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const doctor = doctorExists.rows[0];

    // Update triage record with doctor assignment
    await db.query(
      'UPDATE triage_records SET assigned_doctor_id = $1, assignment_notes = $2 WHERE id = $3',
      [doctor_id, assignment_notes, triage_id]
    );

    // Update queue with doctor assignment if patient is in queue
    await db.query(
      `UPDATE queue SET doctor_id = $1, priority_level = $2 
       WHERE patient_id = $3 AND status = 'waiting'`,
      [doctor_id, triage.triage_category, triage.patient_id]
    );

    // Send notification to patient about doctor assignment
    const notificationService = require('../services/notificationService');
    await notificationService.sendDoctorAssignmentNotification(triage.patient_id, doctor);

    res.json({
      message: 'Doctor assigned successfully',
      triage_id,
      assigned_doctor: {
        id: doctor.id,
        name: `${doctor.first_name} ${doctor.last_name}`
      },
      notification_sent: true
    });
  } catch (error) {
    console.error('Error assigning doctor:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get triage results for patient (for patient dashboard)
router.get('/results/:patient_id', auth, async (req, res) => {
  try {
    const { patient_id } = req.params;

    // Patients can only view their own results
    if (req.user.role === 'patient' && req.user.id !== patient_id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const result = await db.query(
      `SELECT tr.*, 
              u.first_name as nurse_first_name, u.last_name as nurse_last_name,
              d.first_name as doctor_first_name, d.last_name as doctor_last_name
       FROM triage_records tr
       LEFT JOIN users u ON tr.nurse_id = u.id
       LEFT JOIN users d ON tr.assigned_doctor_id = d.id
       WHERE tr.patient_id = $1
       ORDER BY tr.created_at DESC
       LIMIT 1`,
      [patient_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No triage results found' });
    }

    const triageData = result.rows[0];

    res.json({
      triage_id: triageData.id,
      vital_signs: {
        blood_pressure: `${triageData.blood_pressure_systolic}/${triageData.blood_pressure_diastolic}`,
        heart_rate: triageData.heart_rate,
        temperature: triageData.temperature,
        oxygen_saturation: triageData.oxygen_saturation,
        respiratory_rate: triageData.respiratory_rate,
        weight: triageData.weight,
        height: triageData.height,
        bmi: triageData.bmi
      },
      priority_level: triageData.triage_category,
      chief_complaint: triageData.chief_complaint,
      assigned_doctor: triageData.assigned_doctor_id ? {
        id: triageData.assigned_doctor_id,
        name: `${triageData.doctor_first_name} ${triageData.doctor_last_name}`
      } : null,
      performed_at: triageData.created_at,
      nurse_name: `${triageData.nurse_first_name} ${triageData.nurse_last_name}`,
      notes: triageData.notes
    });
  } catch (error) {
    console.error('Error getting triage results:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get available doctors for assignment
router.get('/available-doctors', auth, authorize('nurse', 'doctor', 'receptionist'), async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, first_name, last_name, email 
       FROM users 
       WHERE role = 'doctor' AND is_active = true
       ORDER BY first_name, last_name`
    );

    res.json({ doctors: result.rows });
  } catch (error) {
    console.error('Error getting available doctors:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
