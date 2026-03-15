const db = require('../config/database');

class NotificationService {
  /**
   * Send notification to patient
   */
  async sendNotification({ patient_id, notification_type, title, message, channels, metadata = {} }) {
    try {
      // Create notification record
      const result = await db.query(
        `INSERT INTO notifications 
         (patient_id, notification_type, title, message, channels, metadata) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [
          patient_id,
          notification_type,
          title,
          message,
          JSON.stringify(channels),
          JSON.stringify(metadata)
        ]
      );

      const notification = result.rows[0];

      // Send via enabled channels
      const deliveryStatus = {};

      if (channels.email) {
        deliveryStatus.email = await this.sendEmail(patient_id, title, message, metadata);
      }

      if (channels.sms) {
        deliveryStatus.sms = await this.sendSMS(patient_id, message);
      }

      if (channels.push) {
        deliveryStatus.push = await this.sendPushNotification(patient_id, title, message);
      }

      // Update delivery status
      await db.query(
        'UPDATE notifications SET delivery_status = $1 WHERE id = $2',
        [JSON.stringify(deliveryStatus), notification.id]
      );

      return { ...notification, delivery_status: deliveryStatus };
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  /**
   * Send email notification
   */
  async sendEmail(patient_id, subject, message, metadata = {}) {
    try {
      // Get patient email
      const patientResult = await db.query(
        'SELECT email, first_name, last_name FROM patients WHERE id = $1',
        [patient_id]
      );

      if (patientResult.rows.length === 0 || !patientResult.rows[0].email) {
        return 'failed';
      }

      const patient = patientResult.rows[0];

      // Mock email sending
      // In production, use nodemailer or email service
      console.log(`Sending email to ${patient.email}:`);
      console.log(`Subject: ${subject}`);
      console.log(`Message: ${message}`);
      console.log(`Metadata:`, metadata);

      // Simulate email sending
      // const nodemailer = require('nodemailer');
      // const transporter = nodemailer.createTransport({...});
      // await transporter.sendMail({
      //   from: 'noreply@agmasclinic.com',
      //   to: patient.email,
      //   subject: subject,
      //   html: this.getEmailTemplate(subject, message, patient, metadata)
      // });

      return 'sent';
    } catch (error) {
      console.error('Error sending email:', error);
      return 'failed';
    }
  }

  /**
   * Send SMS notification
   */
  async sendSMS(patient_id, message) {
    try {
      // Get patient phone
      const patientResult = await db.query(
        'SELECT phone, first_name FROM patients WHERE id = $1',
        [patient_id]
      );

      if (patientResult.rows.length === 0 || !patientResult.rows[0].phone) {
        return 'failed';
      }

      const patient = patientResult.rows[0];

      // Mock SMS sending
      // In production, integrate with SMS gateway (Twilio, Africa's Talking, etc.)
      console.log(`Sending SMS to ${patient.phone}:`);
      console.log(`Message: ${message}`);

      // Simulate SMS sending
      // const smsGateway = require('sms-gateway-sdk');
      // await smsGateway.send({
      //   to: patient.phone,
      //   message: message,
      //   sender: 'AgmasClinic'
      // });

      return 'sent';
    } catch (error) {
      console.error('Error sending SMS:', error);
      return 'failed';
    }
  }

  /**
   * Send push notification
   */
  async sendPushNotification(patient_id, title, message) {
    try {
      // Mock push notification
      // In production, use Firebase Cloud Messaging or similar
      console.log(`Sending push notification to patient ${patient_id}:`);
      console.log(`Title: ${title}`);
      console.log(`Message: ${message}`);

      return 'sent';
    } catch (error) {
      console.error('Error sending push notification:', error);
      return 'failed';
    }
  }

  /**
   * Send payment receipt notification
   */
  async sendPaymentReceiptNotification(payment) {
    try {
      const title = 'Payment Successful';
      const message = `Your payment of ETB ${payment.amount} has been confirmed. Receipt number: ${payment.transaction_id}`;

      await this.sendNotification({
        patient_id: payment.patient_id,
        notification_type: 'payment_receipt',
        title,
        message,
        channels: { email: true, sms: true, push: false },
        metadata: {
          payment_id: payment.id,
          transaction_id: payment.transaction_id,
          amount: payment.amount,
          receipt_url: payment.receipt_url
        }
      });
    } catch (error) {
      console.error('Error sending payment receipt notification:', error);
    }
  }

  /**
   * Send queue update notification
   */
  async sendQueueUpdateNotification(patient_id, queueData) {
    try {
      const { queue_number, position, estimated_wait_time } = queueData;
      
      let title = 'Queue Update';
      let message = `You are now #${queue_number} in the queue. `;
      
      if (position <= 3) {
        title = 'Almost Your Turn!';
        message += `Only ${position - 1} patient(s) ahead of you. Please be ready.`;
      } else {
        message += `Estimated wait time: ${estimated_wait_time} minutes.`;
      }

      await this.sendNotification({
        patient_id,
        notification_type: 'queue_update',
        title,
        message,
        channels: { email: false, sms: true, push: true },
        metadata: {
          queue_number,
          position,
          estimated_wait_time
        }
      });
    } catch (error) {
      console.error('Error sending queue update notification:', error);
    }
  }

  /**
   * Send consultation ready notification
   */
  async sendConsultationReadyNotification(patient_id, doctorName, roomNumber) {
    try {
      const title = 'Your Turn for Consultation';
      const message = `Please proceed to Room ${roomNumber}. Dr. ${doctorName} is ready to see you.`;

      await this.sendNotification({
        patient_id,
        notification_type: 'consultation_ready',
        title,
        message,
        channels: { email: false, sms: true, push: true },
        metadata: {
          doctor_name: doctorName,
          room_number: roomNumber
        }
      });
    } catch (error) {
      console.error('Error sending consultation ready notification:', error);
    }
  }

  /**
   * Send prescription ready notification
   */
  async sendPrescriptionReadyNotification(patient_id, prescriptionDetails) {
    try {
      const title = 'Prescription Ready';
      const message = `Your prescription for ${prescriptionDetails.medication_name} is ready for collection at the pharmacy.`;

      await this.sendNotification({
        patient_id,
        notification_type: 'prescription_ready',
        title,
        message,
        channels: { email: true, sms: true, push: true },
        metadata: {
          prescription_id: prescriptionDetails.id,
          medication_name: prescriptionDetails.medication_name
        }
      });
    } catch (error) {
      console.error('Error sending prescription ready notification:', error);
    }
  }

  /**
   * Send lab result ready notification
   */
  async sendLabResultReadyNotification(patient_id, labTestDetails) {
    try {
      const title = 'Lab Results Available';
      const message = `Your ${labTestDetails.test_name} results are now available. Please check your patient portal.`;

      await this.sendNotification({
        patient_id,
        notification_type: 'lab_result_ready',
        title,
        message,
        channels: { email: true, sms: true, push: true },
        metadata: {
          lab_test_id: labTestDetails.id,
          test_name: labTestDetails.test_name
        }
      });
    } catch (error) {
      console.error('Error sending lab result ready notification:', error);
    }
  }

  /**
   * Send doctor assignment notification
   */
  async sendDoctorAssignmentNotification(patient_id, doctorDetails) {
    try {
      const title = 'Doctor Assigned';
      const message = `You have been assigned to Dr. ${doctorDetails.first_name} ${doctorDetails.last_name} (${doctorDetails.specialization || 'General Medicine'}).`;

      await this.sendNotification({
        patient_id,
        notification_type: 'doctor_assigned',
        title,
        message,
        channels: { email: true, sms: false, push: true },
        metadata: {
          doctor_id: doctorDetails.id,
          doctor_name: `${doctorDetails.first_name} ${doctorDetails.last_name}`,
          specialization: doctorDetails.specialization
        }
      });
    } catch (error) {
      console.error('Error sending doctor assignment notification:', error);
    }
  }

  /**
   * Send refund notification
   */
  async sendRefundNotification(payment, refund_amount) {
    try {
      const title = 'Payment Refunded';
      const message = `A refund of ETB ${refund_amount} has been processed for transaction ${payment.transaction_id}. It will be credited to your account within 5-7 business days.`;

      await this.sendNotification({
        patient_id: payment.patient_id,
        notification_type: 'payment_receipt',
        title,
        message,
        channels: { email: true, sms: true, push: false },
        metadata: {
          payment_id: payment.id,
          transaction_id: payment.transaction_id,
          refund_amount,
          refund_reason: payment.refund_reason
        }
      });
    } catch (error) {
      console.error('Error sending refund notification:', error);
    }
  }

  /**
   * Get notification history for patient
   */
  async getNotificationHistory(patient_id, filters = {}) {
    try {
      let query = 'SELECT * FROM notifications WHERE patient_id = $1';
      const params = [patient_id];
      let paramCount = 2;

      if (filters.type) {
        query += ` AND notification_type = $${paramCount}`;
        params.push(filters.type);
        paramCount++;
      }

      if (filters.unread_only) {
        query += ' AND read_at IS NULL';
      }

      query += ' ORDER BY created_at DESC';

      if (filters.limit) {
        query += ` LIMIT $${paramCount}`;
        params.push(filters.limit);
      }

      const result = await db.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('Error getting notification history:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notification_id) {
    try {
      await db.query(
        'UPDATE notifications SET read_at = CURRENT_TIMESTAMP WHERE id = $1',
        [notification_id]
      );
      return { success: true };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(patient_id) {
    try {
      const result = await db.query(
        'SELECT COUNT(*) as count FROM notifications WHERE patient_id = $1 AND read_at IS NULL',
        [patient_id]
      );
      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  }

  /**
   * Get email template (basic HTML template)
   */
  getEmailTemplate(subject, message, patient, metadata) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .button { display: inline-block; padding: 10px 20px; background: #4F46E5; color: white; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Agmas Clinic</h1>
          </div>
          <div class="content">
            <h2>Hello ${patient.first_name},</h2>
            <p>${message}</p>
            ${metadata.receipt_url ? `<p><a href="${metadata.receipt_url}" class="button">View Receipt</a></p>` : ''}
          </div>
          <div class="footer">
            <p>Agmas Clinic | Addis Ababa, Ethiopia | +251-911-234567</p>
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

module.exports = new NotificationService();
