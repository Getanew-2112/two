const jwt = require('jsonwebtoken');
const db = require('../config/database');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({ message: 'Access denied. No authorization header.' });
    }

    const token = authHeader.replace('Bearer ', '');
    
    if (!token || token === 'null' || token === 'undefined') {
      return res.status(401).json({ message: 'Access denied. No valid token provided.' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError.message);
      return res.status(401).json({ message: 'Invalid or expired token. Please log in again.' });
    }
    
    // Check if user is a patient (either by role or by patientId field)
    if (decoded.role === 'patient' || decoded.patientId) {
      const patientQuery = await db.query(
        'SELECT id, patient_id, first_name, last_name, email, phone, is_active FROM patients WHERE id = $1',
        [decoded.id]
      );

      if (patientQuery.rows.length === 0) {
        return res.status(401).json({ message: 'Invalid token - patient not found.' });
      }

      const patient = patientQuery.rows[0];
      
      if (!patient.is_active) {
        return res.status(401).json({ message: 'Account is deactivated.' });
      }

      req.user = {
        id: patient.id,
        patientId: patient.patient_id,
        firstName: patient.first_name,
        lastName: patient.last_name,
        email: patient.email,
        phone: patient.phone,
        role: 'patient',
        is_active: patient.is_active
      };
      next();
    } else {
      // Handle staff/admin users
      const userQuery = await db.query(
        'SELECT id, username, email, first_name, last_name, role, is_active FROM users WHERE id = $1',
        [decoded.id]
      );

      if (userQuery.rows.length === 0) {
        return res.status(401).json({ message: 'Invalid token - user not found.' });
      }

      const user = userQuery.rows[0];
      
      if (!user.is_active) {
        return res.status(401).json({ message: 'Account is deactivated.' });
      }

      req.user = user;
      next();
    }
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    res.status(401).json({ message: 'Authentication failed. Please log in again.' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
    }
    next();
  };
};

module.exports = { auth, authorize };
