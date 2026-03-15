const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const notificationService = require('../services/notificationService');

const router = express.Router();

// Send notification (internal use or admin)
router.post('/send', auth, [
  body('patient_id').isUUID().withMessage('Valid patient ID is required'),
  body('notification_type').isString().withMessage('Notification type is required'),
  body('title').isString().withMessage('Title is required'),
  body('message').isString().withMessage('Message is required'),
  body('channels').isObject().withMessage('Channels must be an object')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { patient_id, notification_type, title, message, channels, metadata } = req.body;

    const notification = await notificationService.sendNotification({
      patient_id,
      notification_type,
      title,
      message,
      channels,
      metadata
    });

    res.status(201).json({
      message: 'Notification sent successfully',
      notification
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get notification history for patient
router.get('/:patient_id', auth, async (req, res) => {
  try {
    const { patient_id } = req.params;
    const { type, unread_only, limit } = req.query;

    // Patients can only view their own notifications
    if (req.user.role === 'patient' && req.user.id !== patient_id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const notifications = await notificationService.getNotificationHistory(patient_id, {
      type,
      unread_only: unread_only === 'true',
      limit: limit ? parseInt(limit) : undefined
    });

    res.json({ notifications });
  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get unread count
router.get('/:patient_id/unread-count', auth, async (req, res) => {
  try {
    const { patient_id } = req.params;

    // Patients can only view their own count
    if (req.user.role === 'patient' && req.user.id !== patient_id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const count = await notificationService.getUnreadCount(patient_id);

    res.json({ unread_count: count });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark notification as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await notificationService.markAsRead(id);

    res.json({
      message: 'Notification marked as read',
      ...result
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
