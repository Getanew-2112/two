# Design Document: Enhanced Patient Payment Flow

## Overview

This document provides the technical design for implementing the enhanced patient payment flow feature. The design integrates payment processing, queue management, doctor assignment, and real-time notifications into the existing clinic management system.

## System Architecture

### High-Level Architecture

```
┌─────────────────┐
│  Patient Portal │
│   (React App)   │
└────────┬────────┘
         │
         ├──────────────────────────────────┐
         │                                  │
         ▼                                  ▼
┌─────────────────┐              ┌──────────────────┐
│ Payment Gateway │              │  Notification    │
│   (External)    │              │    Service       │
└────────┬────────┘              └────────┬─────────┘
         │                                │
         ▼                                ▼
┌──────────────────────────────────────────────────┐
│           Backend API (Node.js/Express)          │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │ Payment  │  │  Queue   │  │ Notification │  │
│  │ Service  │  │ Service  │  │   Manager    │  │
│  └──────────┘  └──────────┘  └──────────────┘  │
└────────────────────┬─────────────────────────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │  PostgreSQL Database  │
         │  - payments           │
         │  - queue              │
         │  - triage_records     │
         │  - notifications      │
         └───────────────────────┘
```

### Component Interactions

1. **Patient → Payment Flow**
   - Patient initiates queue join
   - Payment modal displays payment options
   - Payment Gateway processes digital payments
   - Payment Service records transaction
   - Queue Service adds patient after confirmation

2. **Receptionist → Verification Flow**
   - Receptionist views patient payment status
   - Manual confirmation for cash payments
   - Payment Service updates status
   - Queue Service triggers automatic entry

3. **Triage → Doctor Assignment Flow**
   - Triage nurse records vital signs
   - Doctor selection dropdown populated from active doctors
   - Assignment saved to triage_records
   - Doctor's queue updated
   - Patient and doctor notified

4. **Notification Flow**
   - Event triggers (payment, queue change, results ready)
   - Notification Manager creates notification record
   - Notification Service sends via email/SMS/push
   - Delivery status tracked

## Data Models

### Enhanced Database Schema

#### 1. Payments Table (Enhanced)

```sql
ALTER TABLE payments ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(100);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_reference VARCHAR(100);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS receipt_url TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS refund_reason TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMP;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES users(id);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP;

CREATE INDEX idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at);
```

#### 2. Triage Records Table (Enhanced)

```sql
ALTER TABLE triage_records ADD COLUMN IF NOT EXISTS assigned_doctor_id UUID REFERENCES users(id);
ALTER TABLE triage_records ADD COLUMN IF NOT EXISTS assignment_notes TEXT;

CREATE INDEX idx_triage_assigned_doctor ON triage_records(assigned_doctor_id);
```

#### 3. Notifications Table (New)

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL, -- payment_receipt, queue_update, prescription_ready, lab_result_ready
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    channels JSONB NOT NULL, -- {"email": true, "sms": true, "push": false}
    delivery_status JSONB, -- {"email": "sent", "sms": "delivered", "push": "failed"}
    metadata JSONB, -- Additional data like payment_id, queue_number, etc.
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_patient_id ON notifications(patient_id);
CREATE INDEX idx_notifications_type ON notifications(notification_type);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
```

#### 4. Queue Table (Enhanced)

```sql
ALTER TABLE queue ADD COLUMN IF NOT EXISTS payment_id UUID REFERENCES payments(id);
ALTER TABLE queue ADD COLUMN IF NOT EXISTS priority_level VARCHAR(10) CHECK (priority_level IN ('green', 'yellow', 'orange', 'red'));
ALTER TABLE queue ADD COLUMN IF NOT EXISTS actual_wait_time INTEGER; -- in minutes, recorded after consultation

CREATE INDEX idx_queue_priority ON queue(priority_level);
CREATE INDEX idx_queue_payment_id ON queue(payment_id);
```

#### 5. Payment Receipts Table (New)

```sql
CREATE TABLE payment_receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
    receipt_number VARCHAR(50) UNIQUE NOT NULL, -- Format: RCP-YYYY-NNNN
    patient_name VARCHAR(200) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(20) NOT NULL,
    transaction_id VARCHAR(100),
    clinic_name VARCHAR(200) NOT NULL,
    clinic_address TEXT,
    receipt_data JSONB, -- Full receipt details
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_receipts_payment_id ON payment_receipts(payment_id);
CREATE INDEX idx_receipts_number ON payment_receipts(receipt_number);
```

## API Design

### Payment Endpoints

#### POST /api/payments/initiate
**Purpose**: Initiate a payment for queue entry

**Request Body**:
```json
{
  "patient_id": "uuid",
  "payment_method": "card|mobile|cash",
  "amount": 500,
  "payment_type": "consultation"
}
```

**Response**:
```json
{
  "payment_id": "uuid",
  "status": "pending",
  "payment_url": "https://gateway.com/pay/xxx", // For digital payments
  "transaction_id": "TXN-123456"
}
```

#### POST /api/payments/verify
**Purpose**: Verify payment status (for receptionists)

**Request Body**:
```json
{
  "payment_id": "uuid",
  "verification_status": "confirmed|rejected",
  "notes": "Cash received"
}
```

**Response**:
```json
{
  "payment_id": "uuid",
  "status": "confirmed",
  "verified_by": "receptionist_name",
  "verified_at": "2024-03-15T10:30:00Z"
}
```

#### POST /api/payments/webhook
**Purpose**: Receive payment gateway callbacks

**Request Body** (from payment gateway):
```json
{
  "transaction_id": "TXN-123456",
  "status": "success|failed",
  "amount": 500,
  "payment_method": "card",
  "card_last4": "1234"
}
```

#### GET /api/payments/history/:patient_id
**Purpose**: Get payment history for a patient

**Response**:
```json
{
  "payments": [
    {
      "id": "uuid",
      "amount": 500,
      "payment_method": "card",
      "status": "confirmed",
      "transaction_id": "TXN-123456",
      "receipt_url": "/receipts/RCP-2024-0001",
      "created_at": "2024-03-15T10:00:00Z"
    }
  ]
}
```

#### POST /api/payments/refund
**Purpose**: Process payment refund

**Request Body**:
```json
{
  "payment_id": "uuid",
  "refund_reason": "Appointment cancelled",
  "refund_amount": 500
}
```

### Queue Endpoints (Enhanced)

#### POST /api/queue/join-with-payment
**Purpose**: Join queue after payment confirmation (automatic)

**Request Body**:
```json
{
  "patient_id": "uuid",
  "payment_id": "uuid",
  "priority_level": "green|yellow|orange|red"
}
```

**Response**:
```json
{
  "queue_id": "uuid",
  "queue_number": 5,
  "estimated_wait_time": 45,
  "position_in_queue": 5,
  "assigned_doctor": {
    "id": "uuid",
    "name": "Dr. John Doe"
  }
}
```

#### GET /api/queue/status/:patient_id
**Purpose**: Get real-time queue status for patient

**Response**:
```json
{
  "queue_number": 5,
  "current_position": 3,
  "patients_ahead": 2,
  "estimated_wait_time": 30,
  "status": "waiting",
  "assigned_doctor": {
    "id": "uuid",
    "name": "Dr. John Doe",
    "specialization": "General Medicine"
  },
  "priority_level": "yellow"
}
```

### Triage Endpoints (Enhanced)

#### POST /api/triage/assign-doctor
**Purpose**: Assign doctor during triage

**Request Body**:
```json
{
  "triage_id": "uuid",
  "doctor_id": "uuid",
  "assignment_notes": "Patient requires specialist consultation"
}
```

**Response**:
```json
{
  "triage_id": "uuid",
  "assigned_doctor": {
    "id": "uuid",
    "name": "Dr. John Doe",
    "specialization": "Cardiology"
  },
  "notification_sent": true
}
```

#### GET /api/triage/results/:patient_id
**Purpose**: Get triage results for patient

**Response**:
```json
{
  "triage_id": "uuid",
  "vital_signs": {
    "blood_pressure": "120/80",
    "heart_rate": 75,
    "temperature": 36.8,
    "oxygen_saturation": 98,
    "weight": 70,
    "height": 175,
    "bmi": 22.86
  },
  "priority_level": "yellow",
  "chief_complaint": "Chest pain",
  "assigned_doctor": {
    "id": "uuid",
    "name": "Dr. John Doe"
  },
  "performed_at": "2024-03-15T10:15:00Z",
  "nurse_name": "Nurse Jane"
}
```

### Notification Endpoints

#### POST /api/notifications/send
**Purpose**: Send notification to patient

**Request Body**:
```json
{
  "patient_id": "uuid",
  "notification_type": "payment_receipt|queue_update|prescription_ready|lab_result_ready",
  "title": "Payment Successful",
  "message": "Your payment of ETB 500 has been confirmed.",
  "channels": {
    "email": true,
    "sms": true,
    "push": false
  },
  "metadata": {
    "payment_id": "uuid",
    "receipt_url": "/receipts/RCP-2024-0001"
  }
}
```

#### GET /api/notifications/:patient_id
**Purpose**: Get notification history for patient

**Response**:
```json
{
  "notifications": [
    {
      "id": "uuid",
      "type": "payment_receipt",
      "title": "Payment Successful",
      "message": "Your payment of ETB 500 has been confirmed.",
      "delivery_status": {
        "email": "delivered",
        "sms": "sent"
      },
      "read_at": null,
      "created_at": "2024-03-15T10:00:00Z"
    }
  ]
}
```

#### PUT /api/notifications/:id/read
**Purpose**: Mark notification as read

**Response**:
```json
{
  "notification_id": "uuid",
  "read_at": "2024-03-15T10:30:00Z"
}
```

### Receipt Endpoints

#### GET /api/receipts/:receipt_number
**Purpose**: Get digital receipt

**Response**:
```json
{
  "receipt_number": "RCP-2024-0001",
  "patient_name": "John Doe",
  "amount": 500,
  "payment_method": "Credit Card",
  "transaction_id": "TXN-123456",
  "clinic_info": {
    "name": "Agmas Clinic",
    "address": "Addis Ababa, Ethiopia",
    "phone": "+251-911-234567"
  },
  "generated_at": "2024-03-15T10:00:00Z"
}
```

#### GET /api/receipts/:receipt_number/pdf
**Purpose**: Download receipt as PDF

**Response**: PDF file download

## Frontend Component Design

### 1. PaymentModal Component

**Location**: `client/src/components/PaymentModal.js`

**Props**:
- `isOpen`: boolean
- `onClose`: function
- `patientId`: string
- `amount`: number
- `onPaymentSuccess`: function

**State**:
- `selectedMethod`: 'card' | 'mobile' | 'cash'
- `processing`: boolean
- `paymentStatus`: 'idle' | 'processing' | 'success' | 'failed'

**Features**:
- Payment method selection (Card, Mobile Money, Cash)
- Card payment form with validation
- Mobile money phone number input
- Cash payment confirmation message
- Loading states during processing
- Success/failure feedback
- Digital receipt display after success

### 2. PaymentVerification Component

**Location**: `client/src/components/PaymentVerification.js`

**Props**:
- `patientId`: string
- `onVerificationComplete`: function

**State**:
- `payments`: array
- `selectedPayment`: object
- `verificationNotes`: string

**Features**:
- Display pending payments for patient
- Payment details view (amount, method, timestamp)
- Verification controls (Confirm/Reject)
- Notes input for verification
- Payment history display

### 3. DoctorAssignment Component

**Location**: `client/src/components/DoctorAssignment.js`

**Props**:
- `triageId`: string
- `currentDoctor`: object | null
- `onAssignmentChange`: function

**State**:
- `doctors`: array
- `selectedDoctor`: string
- `assignmentNotes`: string

**Features**:
- Dropdown list of available doctors
- Doctor info display (name, specialization)
- Assignment notes textarea
- Save/Update assignment button
- Current assignment display

### 4. QueueStatusCard Component

**Location**: `client/src/components/QueueStatusCard.js`

**Props**:
- `patientId`: string
- `autoRefresh`: boolean (default: true)

**State**:
- `queueStatus`: object
- `loading`: boolean
- `lastUpdated`: timestamp

**Features**:
- Real-time queue position display
- Estimated wait time countdown
- Patients ahead counter
- Assigned doctor information
- Priority level badge with color coding
- Auto-refresh every 30 seconds

### 5. NotificationCenter Component

**Location**: `client/src/components/NotificationCenter.js`

**Props**:
- `patientId`: string

**State**:
- `notifications`: array
- `unreadCount`: number
- `filter`: 'all' | 'unread'

**Features**:
- Notification list with icons by type
- Unread badge counter
- Mark as read functionality
- Filter by read/unread
- Notification detail view
- Auto-refresh for new notifications

### 6. PaymentHistory Component

**Location**: `client/src/components/PaymentHistory.js`

**Props**:
- `patientId`: string

**State**:
- `payments`: array
- `dateRange`: object
- `statusFilter`: string

**Features**:
- Payment list with details
- Date range filter
- Status filter (All, Paid, Refunded)
- Receipt download buttons
- Export to PDF functionality
- Total amount calculation

### 7. TriageResults Component

**Location**: `client/src/components/TriageResults.js`

**Props**:
- `patientId`: string

**State**:
- `triageData`: object
- `loading`: boolean

**Features**:
- Vital signs display with icons
- Priority level badge
- BMI calculation display
- Chief complaint
- Assigned doctor information
- Triage timestamp
- Nurse name

## Real-Time Updates Strategy

### Polling Approach (Initial Implementation)

**Rationale**: Simpler to implement, no additional infrastructure needed

**Implementation**:
1. Patient dashboard polls `/api/queue/status/:patient_id` every 30 seconds
2. Notification center polls `/api/notifications/:patient_id` every 60 seconds
3. Payment status polls during active payment process every 5 seconds

**Optimization**:
- Use `If-Modified-Since` headers to reduce bandwidth
- Implement exponential backoff for failed requests
- Stop polling when tab is not active (Page Visibility API)

### WebSocket Approach (Future Enhancement)

**Rationale**: True real-time updates, better user experience

**Implementation**:
1. WebSocket server using Socket.io
2. Rooms for each patient (patient:uuid)
3. Events: `queue:update`, `payment:confirmed`, `notification:new`
4. Automatic reconnection handling

## Security Design

### Payment Data Security

1. **PCI DSS Compliance**:
   - Never store full card numbers
   - Store only last 4 digits for reference
   - Use payment gateway tokenization
   - Encrypt sensitive data in transit (TLS 1.2+)

2. **Payment Gateway Integration**:
   - Use hosted payment pages (redirect to gateway)
   - Implement webhook signature verification
   - Store only payment tokens, not card data

3. **Database Security**:
   ```sql
   -- Store only tokenized references
   ALTER TABLE payments ADD COLUMN payment_token VARCHAR(255);
   ALTER TABLE payments ADD COLUMN card_last4 VARCHAR(4);
   ALTER TABLE payments ADD COLUMN card_brand VARCHAR(20);
   ```

### Authentication & Authorization

1. **Patient Access**:
   - JWT tokens with 24-hour expiration
   - Patients can only access their own data
   - Middleware validates patient_id matches token

2. **Staff Access**:
   - Role-based access control (RBAC)
   - Receptionists can verify payments
   - Nurses can assign doctors
   - Doctors see only assigned patients

3. **API Security**:
   ```javascript
   // Middleware example
   const authorizePatientAccess = (req, res, next) => {
     const { patient_id } = req.params;
     if (req.user.role === 'patient' && req.user.id !== patient_id) {
       return res.status(403).json({ message: 'Access denied' });
     }
     next();
   };
   ```

## Error Handling

### Payment Failures

1. **Network Errors**:
   - Retry logic with exponential backoff
   - Display user-friendly error messages
   - Log errors for debugging

2. **Gateway Errors**:
   - Handle timeout scenarios
   - Provide alternative payment methods
   - Allow payment retry

3. **Validation Errors**:
   - Client-side validation before submission
   - Server-side validation with detailed messages
   - Field-level error display

### Queue Management Errors

1. **Duplicate Entry Prevention**:
   - Check existing queue entries before adding
   - Database unique constraints
   - User-friendly error messages

2. **Priority Conflicts**:
   - Validate priority level changes
   - Recalculate queue positions
   - Notify affected patients

## Performance Considerations

### Database Optimization

1. **Indexes**:
   - All foreign keys indexed
   - Composite indexes for common queries
   - Index on frequently filtered columns (status, created_at)

2. **Query Optimization**:
   ```sql
   -- Efficient queue status query
   SELECT q.*, p.first_name, p.last_name, u.first_name as doctor_first_name
   FROM queue q
   JOIN patients p ON q.patient_id = p.id
   LEFT JOIN users u ON q.doctor_id = u.id
   WHERE q.patient_id = $1 AND q.status = 'waiting'
   ORDER BY q.queue_number ASC;
   ```

3. **Caching**:
   - Cache doctor list (rarely changes)
   - Cache clinic information
   - Use Redis for session storage

### Frontend Optimization

1. **Code Splitting**:
   - Lazy load payment modal
   - Lazy load notification center
   - Separate bundle for patient dashboard

2. **State Management**:
   - Use React Context for global state
   - Minimize re-renders with useMemo/useCallback
   - Debounce search inputs

3. **Asset Optimization**:
   - Compress images
   - Minify CSS/JS
   - Use CDN for static assets

## Testing Strategy

### Unit Tests

1. **Backend**:
   - Payment service functions
   - Queue calculation logic
   - Notification formatting

2. **Frontend**:
   - Component rendering
   - Form validation
   - State management

### Integration Tests

1. **API Tests**:
   - Payment flow end-to-end
   - Queue entry after payment
   - Doctor assignment workflow

2. **Database Tests**:
   - Transaction integrity
   - Constraint validation
   - Trigger functionality

### End-to-End Tests

1. **User Flows**:
   - Patient joins queue with payment
   - Receptionist verifies cash payment
   - Triage assigns doctor
   - Patient receives notifications

## Deployment Considerations

### Environment Variables

```env
# Payment Gateway
PAYMENT_GATEWAY_URL=https://api.paymentgateway.com
PAYMENT_GATEWAY_API_KEY=xxx
PAYMENT_GATEWAY_SECRET=xxx
PAYMENT_WEBHOOK_SECRET=xxx

# Notification Services
EMAIL_SERVICE_API_KEY=xxx
SMS_SERVICE_API_KEY=xxx
SMS_SENDER_ID=AgmasClinic

# Application
CONSULTATION_FEE=500
QUEUE_REFRESH_INTERVAL=30000
NOTIFICATION_REFRESH_INTERVAL=60000
```

### Database Migrations

1. Run schema updates in transaction
2. Backup database before migration
3. Test migrations on staging first
4. Rollback plan for each migration

### Monitoring

1. **Application Metrics**:
   - Payment success/failure rates
   - Queue entry times
   - Notification delivery rates

2. **Performance Metrics**:
   - API response times
   - Database query performance
   - Frontend page load times

3. **Error Tracking**:
   - Payment gateway errors
   - Failed notifications
   - Queue calculation errors

## Implementation Phases

### Phase 1: Payment Infrastructure (Week 1)
- Database schema updates for payments
- Payment API endpoints
- Payment modal component
- Basic payment gateway integration

### Phase 2: Queue Integration (Week 2)
- Queue entry after payment
- Priority-based queue calculation
- Real-time queue status
- Queue status component

### Phase 3: Doctor Assignment (Week 3)
- Triage schema updates
- Doctor assignment API
- Doctor assignment component
- Assignment notifications

### Phase 4: Notifications (Week 4)
- Notification infrastructure
- Email/SMS integration
- Notification center component
- Receipt generation

### Phase 5: Testing & Polish (Week 5)
- End-to-end testing
- Performance optimization
- Security audit
- Documentation updates

## Success Metrics

1. **Payment Success Rate**: > 95%
2. **Queue Entry Time**: < 5 seconds after payment
3. **Notification Delivery**: > 98%
4. **Page Load Time**: < 3 seconds
5. **User Satisfaction**: > 4.5/5 rating

## Conclusion

This design provides a comprehensive technical blueprint for implementing the enhanced patient payment flow feature. The modular approach allows for incremental development and testing, while the security and performance considerations ensure a robust, scalable solution.
