const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all appointments with filters
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, date, doctor_id, status, patient_id } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT a.*, p.first_name as patient_first_name, p.last_name as patient_last_name, 
             p.patient_id, u.first_name as doctor_first_name, u.last_name as doctor_last_name
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      LEFT JOIN users u ON a.doctor_id = u.id
      WHERE 1=1
    `;
    
    let countQuery = 'SELECT COUNT(*) FROM appointments WHERE 1=1';
    const params = [];
    const countParams = [];
    let paramCount = 1;

    if (date) {
      query += ` AND a.appointment_date = $${paramCount++}`;
      countQuery += ` AND appointment_date = $${paramCount - 1}`;
      params.push(date);
      countParams.push(date);
    }

    if (doctor_id) {
      query += ` AND a.doctor_id = $${paramCount++}`;
      countQuery += ` AND doctor_id = $${paramCount - 1}`;
      params.push(doctor_id);
      countParams.push(doctor_id);
    }

    if (status) {
      query += ` AND a.status = $${paramCount++}`;
      countQuery += ` AND status = $${paramCount - 1}`;
      params.push(status);
      countParams.push(status);
    }

    if (patient_id) {
      query += ` AND a.patient_id = $${paramCount++}`;
      countQuery += ` AND patient_id = $${paramCount - 1}`;
      params.push(patient_id);
      countParams.push(patient_id);
    }

    query += ` ORDER BY a.appointment_date, a.appointment_time LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    params.push(limit, offset);

    const [appointmentsResult, countResult] = await Promise.all([
      db.query(query, params),
      db.query(countQuery, countParams)
    ]);

    res.json({
      appointments: appointmentsResult.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(countResult.rows[0].count / limit)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get appointments for today
router.get('/today', auth, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { doctor_id } = req.query;

    let query = `
      SELECT a.*, p.first_name as patient_first_name, p.last_name as patient_last_name, 
             p.patient_id, p.phone as patient_phone, u.first_name as doctor_first_name, u.last_name as doctor_last_name
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      LEFT JOIN users u ON a.doctor_id = u.id
      WHERE a.appointment_date = $1 AND a.status NOT IN ('cancelled', 'no_show')
    `;
    
    const params = [today];

    if (doctor_id) {
      query += ` AND a.doctor_id = $2`;
      params.push(doctor_id);
    }

    query += ` ORDER BY a.appointment_time`;

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new appointment
router.post('/', auth, authorize('receptionist', 'admin', 'doctor'), [
  body('patient_id').isUUID().withMessage('Valid patient ID is required'),
  body('doctor_id').isUUID().withMessage('Valid doctor ID is required'),
  body('appointment_date').isISO8601().withMessage('Valid appointment date is required'),
  body('appointment_time').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid time format (HH:MM) is required'),
  body('appointment_type').isIn(['consultation', 'follow_up', 'emergency']).withMessage('Invalid appointment type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { patient_id, doctor_id, appointment_date, appointment_time, appointment_type, notes } = req.body;

    // Check if patient exists
    const patientExists = await db.query('SELECT id FROM patients WHERE id = $1 AND is_active = true', [patient_id]);
    if (patientExists.rows.length === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Check if doctor exists and is a doctor
    const doctorExists = await db.query('SELECT id FROM users WHERE id = $1 AND role = $2 AND is_active = true', [doctor_id, 'doctor']);
    if (doctorExists.rows.length === 0) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Check doctor's daily appointment limit (25 appointments per day)
    const doctorAppointmentsCount = await db.query(
      'SELECT COUNT(*) FROM appointments WHERE doctor_id = $1 AND appointment_date = $2 AND status NOT IN (\'cancelled\', \'no_show\')',
      [doctor_id, appointment_date]
    );

    if (parseInt(doctorAppointmentsCount.rows[0].count) >= 25) {
      return res.status(400).json({ message: 'Doctor has reached maximum appointments for this day' });
    }

    // Check for time conflicts
    const conflictCheck = await db.query(
      'SELECT id FROM appointments WHERE doctor_id = $1 AND appointment_date = $2 AND appointment_time = $3 AND status NOT IN (\'cancelled\', \'no_show\')',
      [doctor_id, appointment_date, appointment_time]
    );

    if (conflictCheck.rows.length > 0) {
      return res.status(400).json({ message: 'Time slot already booked for this doctor' });
    }

    // Create appointment
    const result = await db.query(
      `INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, appointment_type, notes) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [patient_id, doctor_id, appointment_date, appointment_time, appointment_type, notes]
    );

    res.status(201).json({
      message: 'Appointment created successfully',
      appointment: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get appointment by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT a.*, p.first_name as patient_first_name, p.last_name as patient_last_name, 
              p.patient_id, p.phone as patient_phone, p.date_of_birth, p.gender,
              u.first_name as doctor_first_name, u.last_name as doctor_last_name
       FROM appointments a
       JOIN patients p ON a.patient_id = p.id
       LEFT JOIN users u ON a.doctor_id = u.id
       WHERE a.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update appointment
router.put('/:id', auth, [
  body('appointment_date').optional().isISO8601().withMessage('Valid appointment date is required'),
  body('appointment_time').optional().matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid time format (HH:MM) is required'),
  body('status').optional().isIn(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show']).withMessage('Invalid status'),
  body('appointment_type').optional().isIn(['consultation', 'follow_up', 'emergency']).withMessage('Invalid appointment type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const appointmentId = req.params.id;
    const { appointment_date, appointment_time, status, appointment_type, notes, doctor_id } = req.body;

    // Check if appointment exists
    const appointmentExists = await db.query('SELECT * FROM appointments WHERE id = $1', [appointmentId]);
    if (appointmentExists.rows.length === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramCount = 1;

    const fields = {
      appointment_date: appointment_date,
      appointment_time: appointment_time,
      status: status,
      appointment_type: appointment_type,
      notes: notes,
      doctor_id: doctor_id
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

    values.push(appointmentId);

    const result = await db.query(
      `UPDATE appointments SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    res.json({
      message: 'Appointment updated successfully',
      appointment: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel appointment
router.delete('/:id', auth, authorize('receptionist', 'admin', 'doctor'), async (req, res) => {
  try {
    const appointmentId = req.params.id;

    // Check if appointment exists
    const appointmentExists = await db.query('SELECT id FROM appointments WHERE id = $1', [appointmentId]);
    if (appointmentExists.rows.length === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Update appointment status to cancelled
    await db.query('UPDATE appointments SET status = \'cancelled\' WHERE id = $1', [appointmentId]);

    res.json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get available time slots for a doctor on a specific date
router.get('/available-slots', auth, async (req, res) => {
  try {
    const { doctor_id, date } = req.query;

    if (!doctor_id || !date) {
      return res.status(400).json({ message: 'Doctor ID and date are required' });
    }

    // Check if doctor exists
    const doctorExists = await db.query('SELECT id FROM users WHERE id = $1 AND role = $2 AND is_active = true', [doctor_id, 'doctor']);
    if (doctorExists.rows.length === 0) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Get existing appointments for the doctor on that date
    const existingAppointments = await db.query(
      'SELECT appointment_time FROM appointments WHERE doctor_id = $1 AND appointment_date = $2 AND status NOT IN (\'cancelled\', \'no_show\')',
      [doctor_id, date]
    );

    const bookedTimes = existingAppointments.rows.map(row => row.appointment_time);

    // Generate available time slots (9:00 AM to 5:00 PM, 30-minute intervals)
    const availableSlots = [];
    const startHour = 9;
    const endHour = 17;

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeSlot = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        if (!bookedTimes.includes(timeSlot)) {
          availableSlots.push(timeSlot);
        }
      }
    }

    res.json({ availableSlots });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
