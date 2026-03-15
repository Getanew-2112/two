const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Generate unique patient ID
const generatePatientId = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `P-${year}-${random}`;
};

// Patient self-registration (public route)
router.post('/register', [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('dateOfBirth').isISO8601().withMessage('Valid date of birth is required'),
  body('gender').isIn(['male', 'female', 'other']).withMessage('Invalid gender'),
  body('phone').notEmpty().withMessage('Phone number is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      firstName, lastName, email, password, dateOfBirth, gender, phone, address,
      emergencyContactName, emergencyContactPhone, bloodType, allergies
    } = req.body;

    // Check if email already exists
    const existingPatient = await db.query('SELECT id FROM patients WHERE email = $1', [email]);
    if (existingPatient.rows.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Generate unique patient ID
    let patientId = generatePatientId();
    let idExists = true;
    
    while (idExists) {
      const existing = await db.query('SELECT patient_id FROM patients WHERE patient_id = $1', [patientId]);
      if (existing.rows.length === 0) {
        idExists = false;
      } else {
        patientId = generatePatientId();
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create patient with password
    const result = await db.query(
      `INSERT INTO patients (patient_id, first_name, last_name, date_of_birth, gender, phone, email, 
       password_hash, address, emergency_contact_name, emergency_contact_phone, blood_type, allergies) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
       RETURNING id, patient_id, first_name, last_name, email, phone, date_of_birth, gender`,
      [patientId, firstName, lastName, dateOfBirth, gender, phone, email, passwordHash, address,
       emergencyContactName, emergencyContactPhone, bloodType, allergies]
    );

    const patient = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      { id: patient.id, patientId: patient.patient_id, role: 'patient' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      patient: {
        ...patient,
        role: 'patient'
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Patient login (public route)
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find patient
    const result = await db.query(
      'SELECT id, patient_id, first_name, last_name, email, phone, password_hash, is_active FROM patients WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const patient = result.rows[0];

    if (!patient.is_active) {
      return res.status(400).json({ message: 'Account is deactivated' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, patient.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: patient.id, patientId: patient.patient_id, role: 'patient' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      patient: {
        id: patient.id,
        patientId: patient.patient_id,
        firstName: patient.first_name,
        lastName: patient.last_name,
        email: patient.email,
        phone: patient.phone,
        role: 'patient'
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Register new patient
router.post('/', auth, authorize('receptionist', 'admin'), [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('dateOfBirth').isISO8601().withMessage('Valid date of birth is required'),
  body('gender').isIn(['male', 'female', 'other']).withMessage('Invalid gender'),
  body('phone').optional().isLength({ max: 20 }).withMessage('Phone number too long'),
  body('email').optional().isEmail().withMessage('Invalid email format')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      firstName, lastName, dateOfBirth, gender, phone, email, address,
      emergencyContactName, emergencyContactPhone, bloodType, allergies, medicalHistory
    } = req.body;

    // Generate unique patient ID
    let patientId = generatePatientId();
    let idExists = true;
    
    // Ensure patient ID is unique
    while (idExists) {
      const existing = await db.query('SELECT patient_id FROM patients WHERE patient_id = $1', [patientId]);
      if (existing.rows.length === 0) {
        idExists = false;
      } else {
        patientId = generatePatientId();
      }
    }

    // Create patient
    const result = await db.query(
      `INSERT INTO patients (patient_id, first_name, last_name, date_of_birth, gender, phone, email, address, 
       emergency_contact_name, emergency_contact_phone, blood_type, allergies, medical_history) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
       RETURNING *`,
      [patientId, firstName, lastName, dateOfBirth, gender, phone, email, address,
       emergencyContactName, emergencyContactPhone, bloodType, allergies, medicalHistory]
    );

    res.status(201).json({
      message: 'Patient registered successfully',
      patient: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all patients
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM patients WHERE is_active = true';
    let countQuery = 'SELECT COUNT(*) FROM patients WHERE is_active = true';
    const params = [];

    if (search) {
      query += ' AND (first_name ILIKE $1 OR last_name ILIKE $1 OR patient_id ILIKE $1)';
      countQuery += ' AND (first_name ILIKE $1 OR last_name ILIKE $1 OR patient_id ILIKE $1)';
      params.push(`%${search}%`);
    }

    query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);

    const [patientsResult, countResult] = await Promise.all([
      db.query(query, params),
      db.query(countQuery, search ? [`%${search}%`] : [])
    ]);

    res.json({
      patients: patientsResult.rows,
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

// Get patient by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM patients WHERE id = $1 AND is_active = true', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update patient information
router.put('/:id', auth, authorize('receptionist', 'admin'), [
  body('firstName').optional().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().notEmpty().withMessage('Last name cannot be empty'),
  body('phone').optional().isLength({ max: 20 }).withMessage('Phone number too long'),
  body('email').optional().isEmail().withMessage('Invalid email format')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const patientId = req.params.id;
    const {
      firstName, lastName, phone, email, address,
      emergencyContactName, emergencyContactPhone, bloodType, allergies, medicalHistory
    } = req.body;

    // Check if patient exists
    const patientExists = await db.query('SELECT id FROM patients WHERE id = $1 AND is_active = true', [patientId]);
    if (patientExists.rows.length === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramCount = 1;

    const fields = {
      first_name: firstName,
      last_name: lastName,
      phone: phone,
      email: email,
      address: address,
      emergency_contact_name: emergencyContactName,
      emergency_contact_phone: emergencyContactPhone,
      blood_type: bloodType,
      allergies: allergies,
      medical_history: medicalHistory
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

    values.push(patientId);

    const result = await db.query(
      `UPDATE patients SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    res.json({
      message: 'Patient updated successfully',
      patient: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete patient (soft delete)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const patientId = req.params.id;

    // Check if patient exists
    const patientExists = await db.query('SELECT id FROM patients WHERE id = $1 AND is_active = true', [patientId]);
    if (patientExists.rows.length === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Soft delete patient
    await db.query('UPDATE patients SET is_active = false WHERE id = $1', [patientId]);

    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update patient profile
router.put('/:id/profile', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Patients can only update their own profile
    if (req.user.role === 'patient' && req.user.id !== parseInt(id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const {
      firstName, lastName, email, phone, dateOfBirth, gender, address,
      emergencyContact, emergencyPhone, bloodType, allergies
    } = req.body;

    // Check if email is already taken by another patient
    if (email) {
      const existingPatient = await db.query(
        'SELECT id FROM patients WHERE email = $1 AND id != $2',
        [email, id]
      );
      if (existingPatient.rows.length > 0) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (firstName) {
      updates.push(`first_name = $${paramCount++}`);
      values.push(firstName);
    }
    if (lastName) {
      updates.push(`last_name = $${paramCount++}`);
      values.push(lastName);
    }
    if (email) {
      updates.push(`email = $${paramCount++}`);
      values.push(email);
    }
    if (phone) {
      updates.push(`phone = $${paramCount++}`);
      values.push(phone);
    }
    if (dateOfBirth) {
      updates.push(`date_of_birth = $${paramCount++}`);
      values.push(dateOfBirth);
    }
    if (gender) {
      updates.push(`gender = $${paramCount++}`);
      values.push(gender);
    }
    if (address !== undefined) {
      updates.push(`address = $${paramCount++}`);
      values.push(address);
    }
    if (emergencyContact !== undefined) {
      updates.push(`emergency_contact_name = $${paramCount++}`);
      values.push(emergencyContact);
    }
    if (emergencyPhone !== undefined) {
      updates.push(`emergency_contact_phone = $${paramCount++}`);
      values.push(emergencyPhone);
    }
    if (bloodType !== undefined) {
      updates.push(`blood_type = $${paramCount++}`);
      values.push(bloodType);
    }
    if (allergies !== undefined) {
      updates.push(`allergies = $${paramCount++}`);
      values.push(allergies);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE patients 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, patient_id, first_name, last_name, email, phone, 
                date_of_birth, gender, address, emergency_contact_name, 
                emergency_contact_phone, blood_type, allergies
    `;

    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const updatedPatient = result.rows[0];

    res.json({
      message: 'Profile updated successfully',
      patient: {
        id: updatedPatient.id,
        patientId: updatedPatient.patient_id,
        firstName: updatedPatient.first_name,
        lastName: updatedPatient.last_name,
        email: updatedPatient.email,
        phone: updatedPatient.phone,
        dateOfBirth: updatedPatient.date_of_birth,
        gender: updatedPatient.gender,
        address: updatedPatient.address,
        emergencyContact: updatedPatient.emergency_contact_name,
        emergencyPhone: updatedPatient.emergency_contact_phone,
        bloodType: updatedPatient.blood_type,
        allergies: updatedPatient.allergies,
        role: 'patient'
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
