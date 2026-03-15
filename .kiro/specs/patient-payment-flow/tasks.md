# Implementation Tasks: Enhanced Patient Payment Flow

## Task Breakdown

### Phase 1: Database Schema & Payment Infrastructure

#### Task 1.1: Update Database Schema
**Status**: pending
**Estimated Time**: 2 hours
**Dependencies**: None

**Description**: Create migration script to update database schema with new tables and columns for payments, notifications, and doctor assignments.

**Subtasks**:
- [ ] Create migration file `add-payment-enhancements.sql`
- [ ] Add columns to payments table (transaction_id, receipt_url, verified_by, etc.)
- [ ] Add assigned_doctor_id to triage_records table
- [ ] Create notifications table
- [ ] Create payment_receipts table
- [ ] Add payment_id and priority_level to queue table
- [ ] Create all necessary indexes
- [ ] Test migration on development database

**Files to Create/Modify**:
- `server/database/migrations/add-payment-enhancements.sql`

---

#### Task 1.2: Payment Service Backend
**Status**: pending
**Estimated Time**: 4 hours
**Dependencies**: Task 1.1

**Description**: Implement payment service with API endpoints for payment initiation, verification, and webhook handling.

**Subtasks**:
- [ ] Create `server/services/paymentService.js`
- [ ] Implement payment initiation logic
- [ ] Implement payment verification logic
- [ ] Implement webhook handler for payment gateway
- [ ] Implement receipt generation logic
- [ ] Add payment history retrieval
- [ ] Add refund processing logic
- [ ] Add error handling and logging

**Files to Create/Modify**:
- `server/services/paymentService.js` (new)
- `server/routes/payments.js` (new)
- `server/server.js` (add payment routes)

---

#### Task 1.3: Payment Modal Component
**Status**: pending
**Estimated Time**: 3 hours
**Dependencies**: Task 1.2

**Description**: Create React component for payment modal with multiple payment method support.

**Subtasks**:
- [ ] Create `client/src/components/PaymentModal.js`
- [ ] Implement payment method selection UI
- [ ] Add card payment form with validation
- [ ] Add mobile money payment form
- [ ] Add cash payment option
- [ ] Implement payment processing logic
- [ ] Add success/failure feedback UI
- [ ] Add loading states
- [ ] Style with Tailwind CSS

**Files to Create/Modify**:
- `client/src/components/PaymentModal.js` (new)

---

### Phase 2: Queue Integration with Payment

#### Task 2.1: Enhanced Queue Service
**Status**: pending
**Estimated Time**: 3 hours
**Dependencies**: Task 1.2

**Description**: Update queue service to integrate with payment system and support priority-based queue management.

**Subtasks**:
- [ ] Update `server/routes/queue.js`
- [ ] Implement automatic queue entry after payment confirmation
- [ ] Add priority-based queue calculation
- [ ] Implement queue position recalculation
- [ ] Add estimated wait time calculation with priority
- [ ] Update queue status endpoint to include payment info
- [ ] Add queue statistics with priority breakdown

**Files to Create/Modify**:
- `server/routes/queue.js` (modify)
- `server/services/queueService.js` (new)

---

#### Task 2.2: Queue Status Component
**Status**: pending
**Estimated Time**: 2 hours
**Dependencies**: Task 2.1

**Description**: Create component to display real-time queue status with auto-refresh.

**Subtasks**:
- [ ] Create `client/src/components/QueueStatusCard.js`
- [ ] Implement queue position display
- [ ] Add estimated wait time countdown
- [ ] Add patients ahead counter
- [ ] Implement auto-refresh with polling
- [ ] Add priority level badge
- [ ] Add assigned doctor display
- [ ] Style with Tailwind CSS

**Files to Create/Modify**:
- `client/src/components/QueueStatusCard.js` (new)

---

#### Task 2.3: Update Patient Dashboard for Queue
**Status**: pending
**Estimated Time**: 2 hours
**Dependencies**: Task 2.2

**Description**: Integrate queue status component and payment flow into patient dashboard.

**Subtasks**:
- [ ] Update `client/src/pages/PatientDashboard.js`
- [ ] Replace mock queue data with real API calls
- [ ] Integrate PaymentModal component
- [ ] Integrate QueueStatusCard component
- [ ] Add payment history tab
- [ ] Update queue joining flow
- [ ] Add error handling

**Files to Create/Modify**:
- `client/src/pages/PatientDashboard.js` (modify)

---

### Phase 3: Doctor Assignment in Triage

#### Task 3.1: Doctor Assignment Backend
**Status**: pending
**Estimated Time**: 2 hours
**Dependencies**: Task 1.1

**Description**: Implement API endpoints for doctor assignment during triage.

**Subtasks**:
- [ ] Update `server/routes/triage.js`
- [ ] Add endpoint for assigning doctor to triage record
- [ ] Add endpoint for getting available doctors
- [ ] Update triage creation to include doctor assignment
- [ ] Add validation for doctor availability
- [ ] Update queue to reflect doctor assignment

**Files to Create/Modify**:
- `server/routes/triage.js` (modify)

---

#### Task 3.2: Doctor Assignment Component
**Status**: pending
**Estimated Time**: 2 hours
**Dependencies**: Task 3.1

**Description**: Create component for selecting and assigning doctors during triage.

**Subtasks**:
- [ ] Create `client/src/components/DoctorAssignment.js`
- [ ] Implement doctor dropdown with search
- [ ] Add doctor info display (name, specialization)
- [ ] Add assignment notes textarea
- [ ] Implement save/update functionality
- [ ] Add current assignment display
- [ ] Style with Tailwind CSS

**Files to Create/Modify**:
- `client/src/components/DoctorAssignment.js` (new)

---

#### Task 3.3: Update Triage Dashboard
**Status**: pending
**Estimated Time**: 2 hours
**Dependencies**: Task 3.2

**Description**: Integrate doctor assignment component into triage dashboard.

**Subtasks**:
- [ ] Update `client/src/pages/TriageDashboard.js`
- [ ] Add DoctorAssignment component to triage form
- [ ] Update triage submission to include doctor assignment
- [ ] Add doctor filter to triage records view
- [ ] Update triage record display to show assigned doctor

**Files to Create/Modify**:
- `client/src/pages/TriageDashboard.js` (modify)

---

#### Task 3.4: Update Doctor Dashboard
**Status**: pending
**Estimated Time**: 2 hours
**Dependencies**: Task 3.1

**Description**: Update doctor dashboard to show only assigned patients.

**Subtasks**:
- [ ] Update `client/src/pages/DoctorDashboard.js`
- [ ] Filter queue to show only assigned patients
- [ ] Add "All Patients" toggle option
- [ ] Update patient details to show assignment info
- [ ] Add triage results display with assignment

**Files to Create/Modify**:
- `client/src/pages/DoctorDashboard.js` (modify)

---

### Phase 4: Notification System

#### Task 4.1: Notification Service Backend
**Status**: pending
**Estimated Time**: 4 hours
**Dependencies**: Task 1.1

**Description**: Implement notification service with email, SMS, and push notification support.

**Subtasks**:
- [ ] Create `server/services/notificationService.js`
- [ ] Implement email notification using nodemailer
- [ ] Implement SMS notification (integrate with SMS gateway)
- [ ] Create notification templates for each type
- [ ] Implement notification creation and storage
- [ ] Add notification delivery tracking
- [ ] Implement retry logic for failed deliveries
- [ ] Add notification history endpoint

**Files to Create/Modify**:
- `server/services/notificationService.js` (new)
- `server/routes/notifications.js` (new)
- `server/templates/email/` (new directory with templates)

---

#### Task 4.2: Receipt Generation Service
**Status**: pending
**Estimated Time**: 3 hours
**Dependencies**: Task 4.1

**Description**: Implement digital receipt generation with PDF export.

**Subtasks**:
- [ ] Create `server/services/receiptService.js`
- [ ] Implement receipt number generation (RCP-YYYY-NNNN)
- [ ] Create receipt HTML template
- [ ] Implement PDF generation using puppeteer or pdfkit
- [ ] Add receipt storage in database
- [ ] Add receipt retrieval endpoint
- [ ] Add receipt download endpoint

**Files to Create/Modify**:
- `server/services/receiptService.js` (new)
- `server/routes/receipts.js` (new)
- `server/templates/receipt.html` (new)

---

#### Task 4.3: Notification Center Component
**Status**: pending
**Estimated Time**: 3 hours
**Dependencies**: Task 4.1

**Description**: Create notification center component for patient dashboard.

**Subtasks**:
- [ ] Create `client/src/components/NotificationCenter.js`
- [ ] Implement notification list display
- [ ] Add unread badge counter
- [ ] Implement mark as read functionality
- [ ] Add filter by type and read/unread
- [ ] Implement auto-refresh with polling
- [ ] Add notification detail modal
- [ ] Style with Tailwind CSS

**Files to Create/Modify**:
- `client/src/components/NotificationCenter.js` (new)

---

#### Task 4.4: Integrate Notifications
**Status**: pending
**Estimated Time**: 2 hours
**Dependencies**: Task 4.3

**Description**: Integrate notification system across all relevant workflows.

**Subtasks**:
- [ ] Add notification trigger after payment confirmation
- [ ] Add notification trigger for queue position changes
- [ ] Add notification trigger for prescription ready
- [ ] Add notification trigger for lab results ready
- [ ] Add notification trigger for doctor assignment
- [ ] Update patient dashboard to show notification center
- [ ] Add notification bell icon with unread count

**Files to Create/Modify**:
- `server/routes/payments.js` (modify)
- `server/routes/queue.js` (modify)
- `server/routes/prescriptions.js` (modify)
- `server/routes/lab-tests.js` (modify)
- `client/src/pages/PatientDashboard.js` (modify)

---

### Phase 5: Receptionist Payment Verification

#### Task 5.1: Payment Verification Component
**Status**: pending
**Estimated Time**: 2 hours
**Dependencies**: Task 1.2

**Description**: Create component for receptionists to verify payments.

**Subtasks**:
- [ ] Create `client/src/components/PaymentVerification.js`
- [ ] Implement pending payments list
- [ ] Add payment details display
- [ ] Add verification controls (Confirm/Reject)
- [ ] Add notes input for verification
- [ ] Implement verification submission
- [ ] Add payment history view
- [ ] Style with Tailwind CSS

**Files to Create/Modify**:
- `client/src/components/PaymentVerification.js` (new)

---

#### Task 5.2: Update Receptionist Dashboard
**Status**: pending
**Estimated Time**: 2 hours
**Dependencies**: Task 5.1

**Description**: Integrate payment verification into receptionist dashboard.

**Subtasks**:
- [ ] Update `client/src/pages/ReceptionistDashboard.js`
- [ ] Add payment verification tab
- [ ] Show payment status when viewing patients
- [ ] Add pending payments counter
- [ ] Update queue entry to check payment status
- [ ] Add manual payment confirmation for cash

**Files to Create/Modify**:
- `client/src/pages/ReceptionistDashboard.js` (modify)

---

### Phase 6: Patient Transparency Features

#### Task 6.1: Triage Results Component
**Status**: pending
**Estimated Time**: 2 hours
**Dependencies**: Task 3.1

**Description**: Create component to display triage results to patients.

**Subtasks**:
- [ ] Create `client/src/components/TriageResults.js`
- [ ] Implement vital signs display with icons
- [ ] Add priority level badge with color coding
- [ ] Add BMI display
- [ ] Add chief complaint display
- [ ] Add assigned doctor information
- [ ] Add triage timestamp and nurse name
- [ ] Style with Tailwind CSS

**Files to Create/Modify**:
- `client/src/components/TriageResults.js` (new)

---

#### Task 6.2: Payment History Component
**Status**: pending
**Estimated Time**: 2 hours
**Dependencies**: Task 4.2

**Description**: Create component to display payment history with receipts.

**Subtasks**:
- [ ] Create `client/src/components/PaymentHistory.js`
- [ ] Implement payment list with details
- [ ] Add date range filter
- [ ] Add status filter
- [ ] Add receipt download buttons
- [ ] Implement export to PDF
- [ ] Add total amount calculation
- [ ] Style with Tailwind CSS

**Files to Create/Modify**:
- `client/src/components/PaymentHistory.js` (new)

---

#### Task 6.3: Enhanced Patient Dashboard
**Status**: pending
**Estimated Time**: 3 hours
**Dependencies**: Task 6.1, Task 6.2

**Description**: Integrate all patient transparency features into dashboard.

**Subtasks**:
- [ ] Update `client/src/pages/PatientDashboard.js`
- [ ] Add triage results tab with TriageResults component
- [ ] Add payment history tab with PaymentHistory component
- [ ] Update queue tab with real-time updates
- [ ] Add notification center to header
- [ ] Add assigned doctor display
- [ ] Improve overall layout and navigation

**Files to Create/Modify**:
- `client/src/pages/PatientDashboard.js` (modify)

---

### Phase 7: Testing & Quality Assurance

#### Task 7.1: Unit Tests
**Status**: pending
**Estimated Time**: 4 hours
**Dependencies**: All previous tasks

**Description**: Write unit tests for backend services and frontend components.

**Subtasks**:
- [ ] Write tests for paymentService
- [ ] Write tests for queueService
- [ ] Write tests for notificationService
- [ ] Write tests for receiptService
- [ ] Write tests for PaymentModal component
- [ ] Write tests for QueueStatusCard component
- [ ] Write tests for NotificationCenter component
- [ ] Achieve >80% code coverage

**Files to Create/Modify**:
- `server/tests/paymentService.test.js` (new)
- `server/tests/queueService.test.js` (new)
- `client/src/components/__tests__/` (new directory)

---

#### Task 7.2: Integration Tests
**Status**: pending
**Estimated Time**: 3 hours
**Dependencies**: Task 7.1

**Description**: Write integration tests for complete workflows.

**Subtasks**:
- [ ] Test payment to queue entry flow
- [ ] Test receptionist payment verification flow
- [ ] Test triage with doctor assignment flow
- [ ] Test notification delivery flow
- [ ] Test receipt generation flow
- [ ] Test queue priority calculation

**Files to Create/Modify**:
- `server/tests/integration/payment-flow.test.js` (new)
- `server/tests/integration/queue-flow.test.js` (new)

---

#### Task 7.3: End-to-End Tests
**Status**: pending
**Estimated Time**: 4 hours
**Dependencies**: Task 7.2

**Description**: Write E2E tests for complete user journeys.

**Subtasks**:
- [ ] Test patient joins queue with card payment
- [ ] Test patient joins queue with cash payment
- [ ] Test receptionist verifies cash payment
- [ ] Test triage nurse assigns doctor
- [ ] Test patient receives notifications
- [ ] Test patient views triage results
- [ ] Test patient downloads receipt

**Files to Create/Modify**:
- `client/cypress/e2e/patient-payment-flow.cy.js` (new)

---

### Phase 8: Documentation & Deployment

#### Task 8.1: API Documentation
**Status**: pending
**Estimated Time**: 2 hours
**Dependencies**: All backend tasks

**Description**: Update API documentation with new endpoints.

**Subtasks**:
- [ ] Document payment endpoints
- [ ] Document notification endpoints
- [ ] Document receipt endpoints
- [ ] Document enhanced queue endpoints
- [ ] Document enhanced triage endpoints
- [ ] Add request/response examples
- [ ] Add error code documentation

**Files to Create/Modify**:
- `clinic-management-system/API-DOCUMENTATION.md` (modify)

---

#### Task 8.2: User Documentation
**Status**: pending
**Estimated Time**: 2 hours
**Dependencies**: All frontend tasks

**Description**: Create user guides for new features.

**Subtasks**:
- [ ] Write patient guide for payment and queue joining
- [ ] Write receptionist guide for payment verification
- [ ] Write triage nurse guide for doctor assignment
- [ ] Update workflow integration documentation
- [ ] Create troubleshooting guide
- [ ] Add screenshots and examples

**Files to Create/Modify**:
- `clinic-management-system/USER-GUIDE.md` (new)
- `clinic-management-system/WORKFLOW-INTEGRATION.md` (modify)

---

#### Task 8.3: Environment Configuration
**Status**: pending
**Estimated Time**: 1 hour
**Dependencies**: None

**Description**: Set up environment variables and configuration for new features.

**Subtasks**:
- [ ] Add payment gateway configuration
- [ ] Add email service configuration
- [ ] Add SMS service configuration
- [ ] Add notification settings
- [ ] Update .env.example file
- [ ] Document configuration options

**Files to Create/Modify**:
- `server/.env.example` (modify)
- `clinic-management-system/CONFIGURATION.md` (new)

---

#### Task 8.4: Database Migration Script
**Status**: pending
**Estimated Time**: 1 hour
**Dependencies**: Task 1.1

**Description**: Create production-ready migration script with rollback.

**Subtasks**:
- [ ] Create migration runner script
- [ ] Add rollback script
- [ ] Add migration verification
- [ ] Test on staging database
- [ ] Create backup procedure
- [ ] Document migration process

**Files to Create/Modify**:
- `server/database/migrate.js` (new)
- `server/database/rollback.js` (new)
- `clinic-management-system/MIGRATION-GUIDE.md` (new)

---

#### Task 8.5: Deployment
**Status**: pending
**Estimated Time**: 2 hours
**Dependencies**: All previous tasks

**Description**: Deploy enhanced features to production.

**Subtasks**:
- [ ] Backup production database
- [ ] Run database migrations
- [ ] Deploy backend updates
- [ ] Deploy frontend updates
- [ ] Configure payment gateway
- [ ] Configure notification services
- [ ] Verify all features working
- [ ] Monitor for errors

**Files to Create/Modify**:
- None (deployment process)

---

## Summary

**Total Tasks**: 35
**Estimated Total Time**: 80 hours (2 weeks with 2 developers)

**Critical Path**:
1. Database Schema (Task 1.1)
2. Payment Service (Task 1.2)
3. Queue Integration (Task 2.1)
4. Notification Service (Task 4.1)
5. Integration & Testing (Tasks 7.x)
6. Deployment (Task 8.5)

**Parallel Work Opportunities**:
- Frontend components can be developed alongside backend services
- Doctor assignment can be developed in parallel with payment features
- Notification system can be developed in parallel with queue integration
- Documentation can be written as features are completed

**Risk Areas**:
- Payment gateway integration complexity
- Real-time update performance
- Notification delivery reliability
- Database migration on production

**Mitigation Strategies**:
- Use payment gateway sandbox for testing
- Implement polling first, WebSocket later
- Add retry logic and fallback for notifications
- Test migrations thoroughly on staging
