const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');
const paymentService = require('../services/paymentService');

const router = express.Router();

// Initiate payment
router.post('/initiate', auth, [
  body('payment_method').isIn(['card', 'mobile', 'cash']).withMessage('Invalid payment method'),
  body('amount').isNumeric().withMessage('Valid amount is required'),
  body('payment_type').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { payment_method, amount, payment_type } = req.body;
    const patient_id = req.user.id;

    const result = await paymentService.initiatePayment({
      patient_id,
      payment_method,
      amount,
      payment_type
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Error initiating payment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Verify payment (for receptionists)
router.post('/verify', auth, authorize('receptionist', 'admin'), [
  body('payment_id').isUUID().withMessage('Valid payment ID is required'),
  body('verification_status').isIn(['confirmed', 'rejected']).withMessage('Invalid verification status'),
  body('notes').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { payment_id, verification_status, notes } = req.body;
    const verified_by = req.user.id;

    const payment = await paymentService.verifyPayment({
      payment_id,
      verification_status,
      notes,
      verified_by
    });

    res.json({
      message: 'Payment verification completed',
      payment
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Payment webhook (for payment gateway callbacks)
router.post('/webhook', async (req, res) => {
  try {
    // In production, verify webhook signature here
    const { transaction_id, status, amount, payment_method, card_last4, card_brand } = req.body;

    await paymentService.handleWebhook({
      transaction_id,
      status,
      amount,
      payment_method,
      card_last4,
      card_brand
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get payment history
router.get('/history/:patient_id', auth, async (req, res) => {
  try {
    const { patient_id } = req.params;
    const { status, start_date, end_date } = req.query;

    // Patients can only view their own history
    if (req.user.role === 'patient' && req.user.id !== patient_id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const payments = await paymentService.getPaymentHistory(patient_id, {
      status,
      start_date,
      end_date
    });

    res.json({ payments });
  } catch (error) {
    console.error('Error getting payment history:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get pending payments (for receptionists)
router.get('/pending', auth, authorize('receptionist', 'admin'), async (req, res) => {
  try {
    const payments = await paymentService.getPendingPayments();
    res.json({ payments });
  } catch (error) {
    console.error('Error getting pending payments:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Process refund
router.post('/refund', auth, authorize('receptionist', 'admin'), [
  body('payment_id').isUUID().withMessage('Valid payment ID is required'),
  body('refund_reason').isString().withMessage('Refund reason is required'),
  body('refund_amount').isNumeric().withMessage('Valid refund amount is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { payment_id, refund_reason, refund_amount } = req.body;
    const processed_by = req.user.id;

    const result = await paymentService.processRefund({
      payment_id,
      refund_reason,
      refund_amount,
      processed_by
    });

    res.json(result);
  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get receipt
router.get('/receipt/:receipt_number', auth, async (req, res) => {
  try {
    const { receipt_number } = req.params;
    const receipt = await paymentService.getReceipt(receipt_number);

    res.json({ receipt });
  } catch (error) {
    console.error('Error getting receipt:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
