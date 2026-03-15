const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Patient joins queue (with payment)
router.post('/join', auth, [
  body('paymentMethod').isIn(['card', 'mobile', 'cash']).withMessage('Invalid payment method'),
  body('amount').isNumeric().withMessage('Valid amount is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const patientId = req.user.id; // From JWT token
    const { paymentMethod, amount } = req.body;

    // Check if patient exists
    const patientExists = await db.query('SELECT id, patient_id, first_name, last_name FROM patients WHERE id = $1 AND is_active = true', [patientId]);
    if (patientExists.rows.length === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const patient = patientExists.rows[0];

    // Check if patient is already in queue
    const existingInQueue = await db.query(
      'SELECT id FROM queue WHERE patient_id = $1 AND status NOT IN (\'completed\', \'cancelled\')',
      [patientId]
    );
    if (existingInQueue.rows.length > 0) {
      return res.status(400).json({ message: 'You are already in the queue' });
    }

    // Initiate payment
    const paymentService = require('../services/paymentService');
    const paymentResult = await paymentService.initiatePayment({
      patient_id: patientId,
      payment_method: paymentMethod,
      amount,
      payment_type: 'consultation'
    });

    // For cash payments, payment needs receptionist verification
    // For digital payments, return payment URL
    if (paymentMethod === 'cash') {
      return res.status(201).json({
        message: 'Payment initiated. Please proceed to reception for verification.',
        payment: paymentResult,
        requires_verification: true
      });
    }

    // For digital payments, return payment URL
    res.status(201).json({
      message: 'Payment initiated. Please complete payment.',
      payment: paymentResult,
      payment_url: paymentResult.payment_url
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current queue
router.get('/', auth, async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = `
      SELECT q.*, p.first_name as patient_first_name, p.last_name as patient_last_name, 
             p.patient_id, p.phone as patient_phone, u.first_name as doctor_first_name, u.last_name as doctor_last_name
      FROM queue q
      JOIN patients p ON q.patient_id = p.id
      LEFT JOIN users u ON q.doctor_id = u.id
      WHERE q.status NOT IN ('completed', 'cancelled')
    `;
    
    const params = [];
    let paramCount = 1;

    if (status) {
      query += ` AND q.status = $${paramCount++}`;
      params.push(status);
    }

    query += ` ORDER BY q.queue_number ASC`;

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add patient to queue
router.post('/', auth, authorize('receptionist', 'admin'), [
  body('patient_id').isUUID().withMessage('Valid patient ID is required'),
  body('doctor_id').optional().isUUID().withMessage('Valid doctor ID is required'),
  body('assigned_room').optional().isLength({ max: 10 }).withMessage('Room number too long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { patient_id, doctor_id, assigned_room, payment_id, priority_level } = req.body;

    // Check if patient exists
    const patientExists = await db.query('SELECT id FROM patients WHERE id = $1 AND is_active = true', [patient_id]);
    if (patientExists.rows.length === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Check if patient is already in queue
    const existingInQueue = await db.query(
      'SELECT id FROM queue WHERE patient_id = $1 AND status NOT IN (\'completed\', \'cancelled\')',
      [patient_id]
    );
    if (existingInQueue.rows.length > 0) {
      return res.status(400).json({ message: 'Patient is already in queue' });
    }

    // Check if doctor exists and is active
    if (doctor_id) {
      const doctorExists = await db.query('SELECT id FROM users WHERE id = $1 AND role = $2 AND is_active = true', [doctor_id, 'doctor']);
      if (doctorExists.rows.length === 0) {
        return res.status(404).json({ message: 'Doctor not found' });
      }
    }

    // Get next queue number
    const maxQueueNumber = await db.query(
      'SELECT MAX(queue_number) as max_number FROM queue WHERE DATE(created_at) = CURRENT_DATE'
    );
    const nextQueueNumber = (maxQueueNumber.rows[0].max_number || 0) + 1;

    // Calculate estimated wait time (5 minutes per person ahead)
    const peopleAhead = await db.query(
      'SELECT COUNT(*) as count FROM queue WHERE status = \'waiting\' AND queue_number < $1',
      [nextQueueNumber]
    );
    const estimatedWaitTime = parseInt(peopleAhead.rows[0].count) * 5;

    // Add to queue with payment and priority
    const result = await db.query(
      `INSERT INTO queue (patient_id, queue_number, status, assigned_room, doctor_id, estimated_wait_time, payment_id, priority_level) 
       VALUES ($1, $2, 'waiting', $3, $4, $5, $6, $7) RETURNING *`,
      [patient_id, nextQueueNumber, assigned_room, doctor_id, estimatedWaitTime, payment_id, priority_level]
    );

    // Send queue update notification
    const notificationService = require('../services/notificationService');
    await notificationService.sendQueueUpdateNotification(patient_id, {
      queue_number: nextQueueNumber,
      position: nextQueueNumber,
      estimated_wait_time: estimatedWaitTime
    });

    res.status(201).json({
      message: 'Patient added to queue successfully',
      queue: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update queue status
router.put('/:id', auth, [
  body('status').isIn(['waiting', 'in_consultation', 'completed', 'cancelled']).withMessage('Invalid status'),
  body('assigned_room').optional().isLength({ max: 10 }).withMessage('Room number too long'),
  body('doctor_id').optional().isUUID().withMessage('Valid doctor ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const queueId = req.params.id;
    const { status, assigned_room, doctor_id } = req.body;

    // Check if queue entry exists
    const queueExists = await db.query('SELECT * FROM queue WHERE id = $1', [queueId]);
    if (queueExists.rows.length === 0) {
      return res.status(404).json({ message: 'Queue entry not found' });
    }

    // Check if doctor exists when assigning
    if (doctor_id) {
      const doctorExists = await db.query('SELECT id FROM users WHERE id = $1 AND role = $2 AND is_active = true', [doctor_id, 'doctor']);
      if (doctorExists.rows.length === 0) {
        return res.status(404).json({ message: 'Doctor not found' });
      }
    }

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (status !== undefined) {
      updates.push(`status = $${paramCount++}`);
      values.push(status);
    }
    if (assigned_room !== undefined) {
      updates.push(`assigned_room = $${paramCount++}`);
      values.push(assigned_room);
    }
    if (doctor_id !== undefined) {
      updates.push(`doctor_id = $${paramCount++}`);
      values.push(doctor_id);
    }

    values.push(queueId);

    const result = await db.query(
      `UPDATE queue SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    res.json({
      message: 'Queue updated successfully',
      queue: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove patient from queue
router.delete('/:id', auth, authorize('receptionist', 'admin', 'doctor'), async (req, res) => {
  try {
    const queueId = req.params.id;

    // Check if queue entry exists
    const queueExists = await db.query('SELECT id FROM queue WHERE id = $1', [queueId]);
    if (queueExists.rows.length === 0) {
      return res.status(404).json({ message: 'Queue entry not found' });
    }

    // Remove from queue (soft delete by marking as completed)
    await db.query('UPDATE queue SET status = \'completed\' WHERE id = $1', [queueId]);

    res.json({ message: 'Patient removed from queue' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get queue statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const stats = await db.query(`
      SELECT 
        COUNT(*) as total_in_queue,
        COUNT(CASE WHEN status = 'waiting' THEN 1 END) as waiting,
        COUNT(CASE WHEN status = 'in_consultation' THEN 1 END) as in_consultation,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        AVG(estimated_wait_time) as avg_wait_time
      FROM queue 
      WHERE DATE(created_at) = $1
    `, [today]);

    res.json(stats.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get next patient in queue
router.get('/next', auth, authorize('doctor', 'receptionist'), async (req, res) => {
  try {
    const { doctor_id } = req.query;

    let query = `
      SELECT q.*, p.first_name as patient_first_name, p.last_name as patient_last_name, 
             p.patient_id, p.phone as patient_phone, p.date_of_birth, p.gender, p.allergies, p.medical_history
      FROM queue q
      JOIN patients p ON q.patient_id = p.id
      WHERE q.status = 'waiting'
    `;
    
    const params = [];
    let paramCount = 1;

    if (doctor_id) {
      query += ` AND (q.doctor_id = $${paramCount++} OR q.doctor_id IS NULL)`;
      params.push(doctor_id);
    }

    query += ` ORDER BY q.queue_number ASC LIMIT 1`;

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      return res.json({ message: 'No patients waiting in queue' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Call next patient to consultation
router.post('/call-next', auth, authorize('doctor'), [
  body('doctor_id').isUUID().withMessage('Valid doctor ID is required'),
  body('room_number').optional().isLength({ max: 10 }).withMessage('Room number too long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { doctor_id, room_number } = req.body;

    // Get next waiting patient
    const nextPatient = await db.query(
      `SELECT q.*, p.first_name as patient_first_name, p.last_name as patient_last_name, p.patient_id
       FROM queue q
       JOIN patients p ON q.patient_id = p.id
       WHERE q.status = 'waiting' AND (q.doctor_id = $1 OR q.doctor_id IS NULL)
       ORDER BY q.queue_number ASC LIMIT 1`,
      [doctor_id]
    );

    if (nextPatient.rows.length === 0) {
      return res.status(404).json({ message: 'No patients waiting in queue' });
    }

    const queueEntry = nextPatient.rows[0];

    // Update queue entry to in_consultation
    await db.query(
      'UPDATE queue SET status = \'in_consultation\', doctor_id = $1, assigned_room = $2 WHERE id = $3',
      [doctor_id, room_number, queueEntry.id]
    );

    res.json({
      message: 'Patient called to consultation',
      patient: queueEntry
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
