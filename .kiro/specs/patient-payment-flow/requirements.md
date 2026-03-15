# Requirements Document: Enhanced Patient Payment Flow

## Introduction

This document specifies the requirements for an enhanced patient payment flow feature in the clinic management system. The feature enables patients to authenticate, pay consultation fees digitally, join the queue automatically after payment confirmation, receive real-time notifications, and view comprehensive health information including queue status, triage results, prescriptions, and lab results. The system also enhances receptionist capabilities for payment verification and triage capabilities for doctor assignment.

## Glossary

- **Patient_Portal**: The web interface that patients use to access their personalized dashboard and health information
- **Payment_Gateway**: The external service that processes digital card and mobile money payments
- **Queue_System**: The system component that manages patient queue positions and wait times
- **Receptionist_Interface**: The web interface used by receptionists to verify payments and manage patient queue entry
- **Triage_System**: The system component that records vital signs, assigns priority levels, and assigns doctors to patients
- **Notification_Service**: The system component that sends real-time notifications to patients via email, SMS, or push notifications
- **Payment_Processor**: The system component that handles payment transactions and verification
- **Doctor_Assignment_Module**: The system component that manages the assignment of patients to specific doctors
- **Digital_Receipt**: An electronic payment confirmation document sent to patients after successful payment
- **Queue_Position**: The numerical position of a patient in the waiting queue
- **Estimated_Wait_Time**: The calculated time a patient is expected to wait before consultation based on queue position
- **Priority_Level**: The urgency classification assigned during triage (Green, Yellow, Orange, Red)
- **Consultation_Fee**: The fixed amount (ETB 500) charged for a doctor consultation
- **Payment_Status**: The state of a payment transaction (Pending, Confirmed, Failed, Refunded)
- **Triage_Results**: The vital signs and priority level recorded during patient triage
- **Payment_Method**: The type of payment used (Credit_Card, Debit_Card, Mobile_Money, Cash)

## Requirements

### Requirement 1: Patient Authentication and Dashboard Access

**User Story:** As a patient, I want to login to my personalized dashboard, so that I can access my health information and manage my clinic visits.

#### Acceptance Criteria

1. WHEN a patient provides valid credentials, THE Patient_Portal SHALL authenticate the patient and grant access to their dashboard
2. WHEN authentication fails, THE Patient_Portal SHALL display an error message and deny access
3. THE Patient_Portal SHALL display the patient's queue status on the dashboard
4. THE Patient_Portal SHALL display the patient's prescriptions on the dashboard
5. THE Patient_Portal SHALL display the patient's lab results on the dashboard
6. THE Patient_Portal SHALL display the patient's vital signs history on the dashboard
7. WHEN a patient accesses their dashboard, THE Patient_Portal SHALL retrieve and display data within 2 seconds

### Requirement 2: Digital Payment Processing for Queue Entry

**User Story:** As a patient, I want to pay the consultation fee digitally when joining the queue, so that I can complete the payment conveniently without handling cash.

#### Acceptance Criteria

1. WHEN a patient initiates queue joining, THE Payment_Processor SHALL present available payment methods (Credit_Card, Debit_Card, Mobile_Money, Cash)
2. WHERE Credit_Card or Debit_Card is selected, THE Payment_Gateway SHALL process the card payment securely
3. WHERE Mobile_Money is selected, THE Payment_Gateway SHALL process the mobile money payment
4. WHEN a digital payment is initiated, THE Payment_Processor SHALL create a payment record with status Pending
5. WHEN a digital payment succeeds, THE Payment_Processor SHALL update the payment status to Confirmed
6. WHEN a digital payment fails, THE Payment_Processor SHALL update the payment status to Failed and notify the patient
7. THE Payment_Processor SHALL charge the Consultation_Fee amount of ETB 500 for queue entry payments
8. WHEN a payment transaction is processed, THE Payment_Gateway SHALL complete the transaction within 30 seconds

### Requirement 3: Payment Verification by Receptionists

**User Story:** As a receptionist, I want to verify patient payments, so that I can confirm payment status before adding patients to the queue.

#### Acceptance Criteria

1. WHEN a receptionist views a patient record, THE Receptionist_Interface SHALL display the patient's payment status
2. WHERE Cash payment method is selected, THE Receptionist_Interface SHALL provide a manual payment confirmation control
3. WHEN a receptionist confirms a cash payment, THE Payment_Processor SHALL update the payment status to Confirmed
4. THE Receptionist_Interface SHALL display payment history for each patient
5. WHEN a payment status is Pending, THE Receptionist_Interface SHALL prevent queue entry until payment is confirmed
6. WHEN a payment status is Confirmed, THE Receptionist_Interface SHALL enable queue entry for the patient
7. THE Receptionist_Interface SHALL display payment method, amount, timestamp, and status for each payment record

### Requirement 4: Automatic Queue Entry After Payment Confirmation

**User Story:** As a patient, I want to be automatically added to the queue after my payment is confirmed, so that I can secure my place without additional steps.

#### Acceptance Criteria

1. WHEN a payment status changes to Confirmed, THE Queue_System SHALL automatically add the patient to the queue
2. WHEN a patient is added to the queue, THE Queue_System SHALL assign a Queue_Position
3. WHEN a patient is added to the queue, THE Queue_System SHALL calculate and assign an Estimated_Wait_Time
4. WHEN a patient is added to the queue, THE Queue_System SHALL notify the patient of their Queue_Position
5. THE Queue_System SHALL calculate Estimated_Wait_Time based on current queue length and average consultation duration
6. WHEN queue entry is completed, THE Queue_System SHALL update the patient's queue status within 1 second

### Requirement 5: Digital Receipt Generation and Delivery

**User Story:** As a patient, I want to receive a digital receipt after payment, so that I have proof of payment for my records.

#### Acceptance Criteria

1. WHEN a payment status changes to Confirmed, THE Payment_Processor SHALL generate a Digital_Receipt
2. THE Digital_Receipt SHALL include patient name, payment amount, payment method, transaction ID, timestamp, and clinic information
3. WHEN a Digital_Receipt is generated, THE Notification_Service SHALL send the receipt to the patient via email
4. WHERE the patient has provided a mobile number, THE Notification_Service SHALL send the receipt via SMS
5. THE Patient_Portal SHALL store all Digital_Receipts in the patient's payment history
6. WHEN a patient views their payment history, THE Patient_Portal SHALL display all Digital_Receipts with download capability

### Requirement 6: Doctor Assignment During Triage

**User Story:** As a triage nurse, I want to assign specific doctors to patients during triage, so that patients can be directed to the appropriate physician.

#### Acceptance Criteria

1. WHEN a triage nurse performs triage, THE Triage_System SHALL display a list of available doctors
2. THE Triage_System SHALL provide a control to assign a doctor to the patient
3. WHEN a doctor is assigned, THE Doctor_Assignment_Module SHALL record the assignment with the patient record
4. WHEN a doctor is assigned, THE Doctor_Assignment_Module SHALL update the doctor's patient queue
5. THE Triage_System SHALL allow reassignment of doctors if needed before consultation begins
6. WHEN a doctor assignment is made, THE Triage_System SHALL notify both the patient and the assigned doctor

### Requirement 7: Doctor Assignment Visibility

**User Story:** As a patient, I want to see which doctor I am assigned to, so that I know who will be providing my consultation.

#### Acceptance Criteria

1. WHEN a doctor is assigned to a patient, THE Patient_Portal SHALL display the doctor's name on the patient dashboard
2. THE Patient_Portal SHALL display the assigned doctor's specialization
3. WHEN a patient views their queue status, THE Patient_Portal SHALL display the assigned doctor information
4. WHEN a doctor views their queue, THE Doctor_Dashboard SHALL display only patients assigned to them
5. THE Doctor_Dashboard SHALL display patient names, Queue_Position, Priority_Level, and Triage_Results for assigned patients

### Requirement 8: Real-Time Queue Status Updates

**User Story:** As a patient, I want to see my real-time queue position and estimated wait time, so that I can plan my time accordingly.

#### Acceptance Criteria

1. WHEN a patient's Queue_Position changes, THE Queue_System SHALL update the position in real-time
2. THE Patient_Portal SHALL display the current Queue_Position on the patient dashboard
3. THE Patient_Portal SHALL display the Estimated_Wait_Time on the patient dashboard
4. WHEN the queue advances, THE Queue_System SHALL recalculate Estimated_Wait_Time for all waiting patients
5. THE Patient_Portal SHALL refresh queue status automatically every 30 seconds
6. THE Patient_Portal SHALL display the total number of patients ahead in the queue

### Requirement 9: Queue Position Change Notifications

**User Story:** As a patient, I want to receive notifications when my queue position changes significantly, so that I stay informed about my wait status.

#### Acceptance Criteria

1. WHEN a patient's Queue_Position advances by 3 or more positions, THE Notification_Service SHALL send a notification to the patient
2. WHEN a patient reaches position 3 in the queue, THE Notification_Service SHALL send a notification to prepare for consultation
3. WHEN a patient is called for consultation, THE Notification_Service SHALL send an immediate notification
4. WHERE the patient has enabled push notifications, THE Notification_Service SHALL send push notifications
5. WHERE the patient has provided a mobile number, THE Notification_Service SHALL send SMS notifications
6. THE Notification_Service SHALL send email notifications for all queue position changes

### Requirement 10: Prescription and Lab Result Notifications

**User Story:** As a patient, I want to receive notifications when my prescriptions are ready or lab results are available, so that I can collect them promptly.

#### Acceptance Criteria

1. WHEN a prescription is marked as ready by the pharmacy, THE Notification_Service SHALL send a notification to the patient
2. WHEN lab results are uploaded by the laboratory, THE Notification_Service SHALL send a notification to the patient
3. THE Notification_Service SHALL include the prescription details in prescription ready notifications
4. THE Notification_Service SHALL include the lab test name in lab result notifications
5. WHERE the patient has enabled push notifications, THE Notification_Service SHALL send push notifications for prescriptions and lab results
6. THE Notification_Service SHALL send email notifications for all prescription and lab result updates

### Requirement 11: Triage Results Visibility for Patients

**User Story:** As a patient, I want to see my triage results on my dashboard, so that I understand my health status and priority level.

#### Acceptance Criteria

1. WHEN triage is completed for a patient, THE Patient_Portal SHALL display the Triage_Results on the patient dashboard
2. THE Patient_Portal SHALL display vital signs including blood pressure, heart rate, temperature, and oxygen saturation
3. THE Patient_Portal SHALL display the assigned Priority_Level with color coding (Green, Yellow, Orange, Red)
4. THE Patient_Portal SHALL display the timestamp of when triage was performed
5. THE Patient_Portal SHALL display any notes recorded by the triage nurse
6. WHEN Triage_Results are updated, THE Patient_Portal SHALL refresh the display within 5 seconds

### Requirement 12: Payment History Tracking

**User Story:** As a patient, I want to view my complete payment history, so that I can track my healthcare expenses.

#### Acceptance Criteria

1. THE Patient_Portal SHALL provide a payment history view accessible from the dashboard
2. THE Patient_Portal SHALL display all payment transactions with date, amount, payment method, and status
3. THE Patient_Portal SHALL allow filtering of payment history by date range
4. THE Patient_Portal SHALL allow filtering of payment history by Payment_Status
5. THE Patient_Portal SHALL provide a download option for payment history as PDF
6. WHEN a patient views payment history, THE Patient_Portal SHALL display transactions in reverse chronological order

### Requirement 13: Payment Refund Processing

**User Story:** As a receptionist, I want to process payment refunds when necessary, so that patients can receive refunds for cancelled appointments or errors.

#### Acceptance Criteria

1. WHERE a payment needs to be refunded, THE Receptionist_Interface SHALL provide a refund initiation control
2. WHEN a refund is initiated, THE Payment_Processor SHALL update the payment status to Refunded
3. WHERE the original payment was digital, THE Payment_Gateway SHALL process the refund to the original payment method
4. WHEN a refund is processed, THE Payment_Processor SHALL generate a refund receipt
5. WHEN a refund is completed, THE Notification_Service SHALL notify the patient of the refund
6. THE Payment_Processor SHALL process refunds within 5 business days for digital payments

### Requirement 14: Queue Position Calculation with Priority

**User Story:** As a patient, I want my queue position to reflect my priority level, so that urgent cases are handled appropriately.

#### Acceptance Criteria

1. WHEN a patient is added to the queue, THE Queue_System SHALL consider the Priority_Level in position calculation
2. WHEN a patient's Priority_Level is Red, THE Queue_System SHALL place the patient at the front of the queue
3. WHEN a patient's Priority_Level is Orange, THE Queue_System SHALL place the patient ahead of Yellow and Green priority patients
4. WHEN multiple patients have the same Priority_Level, THE Queue_System SHALL order them by payment confirmation timestamp
5. WHEN a patient's Priority_Level is updated during triage, THE Queue_System SHALL recalculate their Queue_Position
6. THE Queue_System SHALL maintain separate queue views for each assigned doctor

### Requirement 15: Payment Gateway Integration Security

**User Story:** As a system administrator, I want payment transactions to be secure, so that patient financial information is protected.

#### Acceptance Criteria

1. THE Payment_Gateway SHALL encrypt all payment data using TLS 1.2 or higher during transmission
2. THE Payment_Processor SHALL not store complete card numbers in the database
3. THE Payment_Processor SHALL store only the last 4 digits of card numbers for reference
4. THE Payment_Gateway SHALL comply with PCI DSS standards for card payment processing
5. WHEN a payment transaction fails, THE Payment_Processor SHALL log the failure without storing sensitive payment details
6. THE Payment_Gateway SHALL use tokenization for storing payment method references

### Requirement 16: Notification Delivery Reliability

**User Story:** As a patient, I want to reliably receive all notifications, so that I don't miss important updates about my care.

#### Acceptance Criteria

1. WHEN a notification is sent, THE Notification_Service SHALL attempt delivery at least 3 times if initial delivery fails
2. THE Notification_Service SHALL log all notification delivery attempts with timestamps and status
3. WHEN all delivery attempts fail, THE Notification_Service SHALL mark the notification as failed and alert system administrators
4. THE Notification_Service SHALL queue notifications for delivery within 10 seconds of the triggering event
5. WHERE multiple notification channels are available, THE Notification_Service SHALL send notifications to all enabled channels
6. THE Patient_Portal SHALL display a notification history showing all sent notifications

### Requirement 17: Estimated Wait Time Accuracy

**User Story:** As a patient, I want accurate estimated wait times, so that I can plan my schedule effectively.

#### Acceptance Criteria

1. THE Queue_System SHALL calculate Estimated_Wait_Time using the average of the last 10 completed consultations
2. THE Queue_System SHALL factor in the Priority_Level when calculating Estimated_Wait_Time
3. THE Queue_System SHALL update Estimated_Wait_Time every time a patient completes consultation
4. WHEN no historical data is available, THE Queue_System SHALL use a default consultation duration of 15 minutes
5. THE Queue_System SHALL display Estimated_Wait_Time in minutes for waits under 60 minutes
6. THE Queue_System SHALL display Estimated_Wait_Time in hours and minutes for waits over 60 minutes

### Requirement 18: Multi-Language Support for Notifications

**User Story:** As a patient, I want to receive notifications in my preferred language, so that I can understand all communications clearly.

#### Acceptance Criteria

1. THE Patient_Portal SHALL allow patients to select their preferred language (English, Amharic)
2. WHEN a notification is sent, THE Notification_Service SHALL use the patient's preferred language
3. THE Notification_Service SHALL support English and Amharic for all notification templates
4. WHEN a patient changes their language preference, THE Patient_Portal SHALL update the preference immediately
5. THE Digital_Receipt SHALL be generated in the patient's preferred language

### Requirement 19: Payment Reconciliation Reporting

**User Story:** As a clinic administrator, I want to generate payment reconciliation reports, so that I can track revenue and identify discrepancies.

#### Acceptance Criteria

1. THE Receptionist_Interface SHALL provide a payment reconciliation report generation feature
2. THE Payment_Processor SHALL generate reports showing all payments by date range, payment method, and status
3. THE Payment_Processor SHALL calculate total revenue by payment method
4. THE Payment_Processor SHALL identify and highlight failed or pending payments in reports
5. THE Payment_Processor SHALL provide export functionality for reports in CSV and PDF formats
6. THE Payment_Processor SHALL include transaction IDs, patient names, amounts, and timestamps in reconciliation reports

### Requirement 20: Queue System Performance Under Load

**User Story:** As a system administrator, I want the queue system to perform well under high load, so that patient experience remains smooth during busy periods.

#### Acceptance Criteria

1. THE Queue_System SHALL support at least 100 concurrent patients in the queue
2. WHEN queue updates occur, THE Queue_System SHALL propagate changes to all connected clients within 2 seconds
3. THE Queue_System SHALL handle at least 50 queue position updates per minute
4. THE Patient_Portal SHALL maintain responsive performance with page load times under 3 seconds during peak usage
5. THE Queue_System SHALL use database indexing on Queue_Position and Priority_Level fields for query optimization
