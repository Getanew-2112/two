# 📚 API Documentation

## Base URL
```
Development: http://localhost:5000
Production: https://your-domain.com
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### POST /api/auth/login
Login for staff members (doctor, nurse, receptionist, pharmacist, lab technician)

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "token": "jwt_token_string",
  "user": {
    "id": "uuid",
    "username": "string",
    "email": "string",
    "role": "doctor|nurse|receptionist|pharmacist|lab_technician",
    "firstName": "string",
    "lastName": "string"
  }
}
```

**Status Codes:**
- 200: Success
- 400: Invalid credentials
- 500: Server error

---

### POST /api/auth/patient-login
Login for patients

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "token": "jwt_token_string",
  "patient": {
    "id": "uuid",
    "patientId": "P-YYYY-NNNN",
    "email": "string",
    "firstName": "string",
    "lastName": "string"
  }
}
```

---

## User Management Endpoints

### POST /api/users/create
Create new staff user (Admin only)

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "role": "doctor|nurse|receptionist|pharmacist|lab_technician",
  "firstName": "string",
  "lastName": "string"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "uuid",
    "username": "string",
    "email": "string",
    "role": "string",
    "firstName": "string",
    "lastName": "string"
  }
}
```

**Status Codes:**
- 201: Created
- 400: Validation error
- 403: Unauthorized (not admin)
- 409: User already exists
- 500: Server error

---

### GET /api/users
Get all users (Admin only)

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:**
```json
[
  {
    "id": "uuid",
    "username": "string",
    "email": "string",
    "role": "string",
    "firstName": "string",
    "lastName": "string",
    "isActive": true,
    "createdAt": "timestamp"
  }
]
```

---

## Patient Endpoints

### POST /api/patients/register
Register new patient

**Request Body:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "dateOfBirth": "YYYY-MM-DD",
  "gender": "male|female|other",
  "phone": "string",
  "email": "string",
  "address": "string",
  "emergencyContact": "string",
  "bloodType": "A+|A-|B+|B-|AB+|AB-|O+|O-",
  "allergies": "string"
}
```

**Response:**
```json
{
  "message": "Patient registered successfully",
  "patient": {
    "id": "uuid",
    "patientId": "P-2024-0001",
    "firstName": "string",
    "lastName": "string",
    "dateOfBirth": "date",
    "gender": "string",
    "phone": "string",
    "email": "string"
  }
}
```

---

### GET /api/patients
Get all patients

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `search`: Search by name or patient ID
- `limit`: Number of results (default: 50)
- `offset`: Pagination offset

**Response:**
```json
[
  {
    "id": "uuid",
    "patientId": "P-2024-0001",
    "firstName": "string",
    "lastName": "string",
    "dateOfBirth": "date",
    "gender": "string",
    "phone": "string",
    "email": "string",
    "isActive": true
  }
]
```

---

### GET /api/patients/:id
Get patient by ID

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "uuid",
  "patientId": "P-2024-0001",
  "firstName": "string",
  "lastName": "string",
  "dateOfBirth": "date",
  "gender": "string",
  "phone": "string",
  "email": "string",
  "address": "string",
  "emergencyContact": "string",
  "bloodType": "string",
  "allergies": "string",
  "isActive": true,
  "createdAt": "timestamp"
}
```

---

## Queue Endpoints

### GET /api/queue
Get all queue entries

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `status`: Filter by status (waiting|in_consultation|completed|cancelled)
- `date`: Filter by date (YYYY-MM-DD)

**Response:**
```json
[
  {
    "id": "uuid",
    "queueNumber": 1,
    "patientId": "uuid",
    "patient_id": "P-2024-0001",
    "patient_first_name": "string",
    "patient_last_name": "string",
    "status": "waiting",
    "priority": "normal|urgent|emergency",
    "createdAt": "timestamp"
  }
]
```

---

### POST /api/queue/add
Add patient to queue

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "patientId": "uuid"
}
```

**Response:**
```json
{
  "message": "Patient added to queue",
  "queue": {
    "id": "uuid",
    "queueNumber": 5,
    "patientId": "uuid",
    "status": "waiting"
  }
}
```

---

### POST /api/queue/call-next
Call next patient (Doctor only)

**Headers:**
```
Authorization: Bearer <doctor_token>
```

**Request Body:**
```json
{
  "doctorId": "uuid",
  "roomNumber": "string"
}
```

**Response:**
```json
{
  "message": "Patient called",
  "queue": {
    "id": "uuid",
    "queueNumber": 1,
    "status": "in_consultation"
  }
}
```

---

## Triage Endpoints

### POST /api/triage
Create triage record

**Headers:**
```
Authorization: Bearer <nurse_token>
```

**Request Body:**
```json
{
  "patientId": "uuid",
  "bloodPressureSystolic": 120,
  "bloodPressureDiastolic": 80,
  "heartRate": 75,
  "temperature": 36.8,
  "weight": 70,
  "height": 175,
  "oxygenSaturation": 98,
  "respiratoryRate": 16,
  "chiefComplaint": "string",
  "triageCategory": "green|yellow|orange|red"
}
```

**Response:**
```json
{
  "message": "Triage record created",
  "triage": {
    "id": "uuid",
    "patientId": "uuid",
    "bmi": 22.86,
    "triageCategory": "yellow",
    "createdAt": "timestamp"
  }
}
```

---

### GET /api/triage
Get all triage records

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `patientId`: Filter by patient
- `date`: Filter by date
- `category`: Filter by triage category

**Response:**
```json
[
  {
    "id": "uuid",
    "patientId": "uuid",
    "patient_first_name": "string",
    "patient_last_name": "string",
    "bloodPressureSystolic": 120,
    "bloodPressureDiastolic": 80,
    "heartRate": 75,
    "temperature": 36.8,
    "weight": 70,
    "height": 175,
    "bmi": 22.86,
    "oxygenSaturation": 98,
    "respiratoryRate": 16,
    "chiefComplaint": "string",
    "triageCategory": "yellow",
    "createdAt": "timestamp"
  }
]
```

---

## Prescription Endpoints

### POST /api/prescriptions
Create prescription (Doctor only)

**Headers:**
```
Authorization: Bearer <doctor_token>
```

**Request Body:**
```json
{
  "patient_id": "uuid",
  "medication_name": "string",
  "dosage": "string",
  "frequency": "string",
  "duration": "string",
  "instructions": "string"
}
```

**Response:**
```json
{
  "message": "Prescription created successfully",
  "prescription": {
    "id": "uuid",
    "patientId": "uuid",
    "doctorId": "uuid",
    "medicationName": "string",
    "dosage": "string",
    "frequency": "string",
    "duration": "string",
    "instructions": "string",
    "status": "active",
    "issuedAt": "timestamp",
    "expiresAt": "timestamp"
  }
}
```

---

### GET /api/prescriptions
Get all prescriptions

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "uuid",
    "patientId": "uuid",
    "patient_id": "P-2024-0001",
    "patient_first_name": "string",
    "patient_last_name": "string",
    "doctorId": "uuid",
    "doctor_first_name": "string",
    "doctor_last_name": "string",
    "medicationName": "string",
    "dosage": "string",
    "frequency": "string",
    "duration": "string",
    "instructions": "string",
    "status": "active|dispensed|expired|cancelled",
    "issuedAt": "timestamp",
    "dispensedAt": "timestamp",
    "expiresAt": "timestamp"
  }
]
```

---

### GET /api/prescriptions/active
Get active prescriptions

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `patient_id`: Filter by patient UUID

**Response:**
```json
[
  {
    "id": "uuid",
    "patientId": "uuid",
    "patient_id": "P-2024-0001",
    "patient_first_name": "string",
    "patient_last_name": "string",
    "medicationName": "string",
    "dosage": "string",
    "frequency": "string",
    "status": "active",
    "issuedAt": "timestamp",
    "expiresAt": "timestamp"
  }
]
```

---

### GET /api/prescriptions/patient/:patientId
Get prescriptions for specific patient

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "uuid",
    "medicationName": "string",
    "dosage": "string",
    "frequency": "string",
    "duration": "string",
    "instructions": "string",
    "status": "active|dispensed",
    "doctor_first_name": "string",
    "doctor_last_name": "string",
    "issuedAt": "timestamp",
    "dispensedAt": "timestamp"
  }
]
```

---

### POST /api/prescriptions/:id/dispense
Dispense prescription (Pharmacist only)

**Headers:**
```
Authorization: Bearer <pharmacist_token>
```

**Request Body:**
```json
{
  "notes": "string"
}
```

**Response:**
```json
{
  "message": "Prescription dispensed successfully",
  "prescription": {
    "id": "uuid",
    "status": "dispensed",
    "pharmacistId": "uuid",
    "dispensedAt": "timestamp"
  }
}
```

---

## Lab Test Endpoints

### POST /api/lab-tests
Create lab test order (Doctor only)

**Headers:**
```
Authorization: Bearer <doctor_token>
```

**Request Body:**
```json
{
  "patient_id": "uuid",
  "test_type": "hematology|chemistry|microbiology|immunology|urinalysis|parasitology",
  "test_name": "string",
  "notes": "string"
}
```

**Response:**
```json
{
  "message": "Lab test requested successfully",
  "labTest": {
    "id": "uuid",
    "patientId": "uuid",
    "doctorId": "uuid",
    "testType": "string",
    "testName": "string",
    "notes": "string",
    "status": "pending",
    "requestedAt": "timestamp"
  }
}
```

---

### GET /api/lab-tests
Get all lab tests

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "uuid",
    "patientId": "uuid",
    "patient_id": "P-2024-0001",
    "patient_first_name": "string",
    "patient_last_name": "string",
    "doctorId": "uuid",
    "doctor_first_name": "string",
    "doctor_last_name": "string",
    "technicianId": "uuid",
    "technician_first_name": "string",
    "technician_last_name": "string",
    "testType": "string",
    "testName": "string",
    "status": "pending|in_progress|completed|cancelled",
    "results": "string",
    "normalRange": "string",
    "notes": "string",
    "requestedAt": "timestamp",
    "completedAt": "timestamp"
  }
]
```

---

### GET /api/lab-tests/patient/:patientId
Get lab tests for specific patient

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "uuid",
    "testType": "string",
    "testName": "string",
    "status": "pending|in_progress|completed",
    "results": "string",
    "normalRange": "string",
    "notes": "string",
    "doctor_first_name": "string",
    "doctor_last_name": "string",
    "technician_first_name": "string",
    "technician_last_name": "string",
    "requestedAt": "timestamp",
    "completedAt": "timestamp"
  }
]
```

---

### PUT /api/lab-tests/:id
Update lab test (Lab Technician or Doctor)

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "status": "pending|in_progress|completed|cancelled",
  "results": "string",
  "normal_range": "string",
  "notes": "string"
}
```

**Response:**
```json
{
  "message": "Lab test updated successfully",
  "labTest": {
    "id": "uuid",
    "status": "completed",
    "results": "string",
    "normalRange": "string",
    "completedAt": "timestamp"
  }
}
```

---

### GET /api/lab-tests/test-types
Get common lab test types

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "type": "hematology",
    "name": "Complete Blood Count (CBC)"
  },
  {
    "type": "chemistry",
    "name": "Liver Function Tests"
  }
]
```

---

## Error Responses

All endpoints may return these error responses:

### 400 Bad Request
```json
{
  "message": "Validation error",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Server error"
}
```

---

## Rate Limiting

- Window: 15 minutes
- Max requests: 100 per IP
- Headers returned:
  - `X-RateLimit-Limit`: Maximum requests
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset time

---

## CORS

Allowed origins configured in backend:
- Development: `http://localhost:3000`
- Production: Configure in `.env` file

---

## Pagination

Endpoints supporting pagination use these query parameters:
- `limit`: Number of results (default: 50, max: 100)
- `offset`: Skip number of results (default: 0)

Response includes:
```json
{
  "data": [],
  "pagination": {
    "total": 150,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

---

## Webhooks (Future Feature)

Planned webhook events:
- `prescription.created`
- `prescription.dispensed`
- `lab_test.completed`
- `patient.registered`
- `queue.updated`

---

## API Versioning

Current version: v1 (implicit)
Future versions will use URL prefix: `/api/v2/...`

---

## Testing

### Example cURL Commands

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"doctor1","password":"doc12345"}'
```

**Get Patients:**
```bash
curl -X GET http://localhost:5000/api/patients \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Create Prescription:**
```bash
curl -X POST http://localhost:5000/api/prescriptions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "patient_id":"uuid-here",
    "medication_name":"Paracetamol",
    "dosage":"500mg",
    "frequency":"3 times daily",
    "duration":"5 days"
  }'
```

---

## Support

For API support:
- Email: support@clinic.com
- Documentation: https://docs.clinic.com
- Status: https://status.clinic.com

---

**API Version:** 1.0.0
**Last Updated:** Today
**Status:** Production Ready
