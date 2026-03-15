# 🧪 Complete Testing Guide

## Prerequisites

Before testing, ensure:
- ✅ Backend server running on port 5000
- ✅ Frontend server running on port 3000
- ✅ PostgreSQL database connected
- ✅ Admin account exists (admin/admin123)

---

## Test 1: Admin Creates All Staff Accounts

**Objective:** Create all necessary staff accounts for testing

**Steps:**
1. Navigate to `http://localhost:3000/admin-login`
2. Login with:
   - Username: `admin`
   - Password: `admin123`
3. Click "Manage Users" in sidebar
4. Create the following accounts:

| Role | Username | Email | Password | First Name | Last Name |
|------|----------|-------|----------|------------|-----------|
| Doctor | doctor1 | doctor1@clinic.com | doc12345 | John | Smith |
| Nurse | nurse1 | nurse1@clinic.com | nurse123 | Sarah | Johnson |
| Receptionist | receptionist1 | recep1@clinic.com | recep123 | Mary | Williams |
| Pharmacist | pharmacist1 | pharma1@clinic.com | pharma123 | David | Brown |
| Lab Technician | labtech1 | lab1@clinic.com | lab123 | Lisa | Davis |

**Expected Result:**
- ✅ All 5 staff accounts created successfully
- ✅ Success message appears for each creation
- ✅ Users appear in the user management table

---

## Test 2: Receptionist Registers Patient

**Objective:** Register a new patient and add to queue

**Steps:**
1. Logout from admin
2. Navigate to `http://localhost:3000/login`
3. Login as receptionist:
   - Username: `receptionist1`
   - Password: `recep123`
4. Click "Patients" tab
5. Click "Register Patient" button
6. Fill in patient details:
   - First Name: `John`
   - Last Name: `Doe`
   - Date of Birth: `1990-01-15`
   - Gender: `Male`
   - Phone: `0911234567`
   - Email: `john.doe@email.com`
   - Address: `123 Main St, Addis Ababa`
7. Click "Register Patient"
8. Note the Patient ID (e.g., P-2024-0001)
9. Search for "John Doe" in the patients list
10. Click "Add to Queue" button

**Expected Result:**
- ✅ Patient registered successfully
- ✅ Patient ID generated (P-YYYY-NNNN format)
- ✅ Patient appears in patients list
- ✅ Patient added to queue with queue number
- ✅ Success message appears

---

## Test 3: Triage Nurse Records Vital Signs

**Objective:** Record vital signs and assign priority

**Steps:**
1. Logout from receptionist
2. Login as nurse:
   - Username: `nurse1`
   - Password: `nurse123`
3. Click "New Triage" button
4. Select patient: `John Doe (P-2024-0001)`
5. Fill in vital signs:
   - Blood Pressure Systolic: `140`
   - Blood Pressure Diastolic: `90`
   - Heart Rate: `85` bpm
   - Temperature: `38.5` °C
   - Weight: `75` kg
   - Height: `175` cm
   - Oxygen Saturation: `96` %
   - Respiratory Rate: `18`
   - Chief Complaint: `Fever and headache for 3 days`
6. Select Triage Category: `Yellow (Urgent)`
7. Click "Save Triage Record"

**Expected Result:**
- ✅ Triage record saved successfully
- ✅ BMI calculated automatically (24.49)
- ✅ Record appears in recent triage list
- ✅ Priority color-coded (Yellow)
- ✅ Statistics updated

---

## Test 4: Doctor Sees Patient and Creates Prescription

**Objective:** Doctor views queue, calls patient, and creates prescription

**Steps:**
1. Logout from nurse
2. Login as doctor:
   - Username: `doctor1`
   - Password: `doc12345`
3. Verify John Doe appears in queue with Yellow priority
4. Click "Call Next Patient" button
5. Go to "Pharmacy" tab
6. Click "+ Create Prescription" button
7. Fill in prescription form:
   - Select Patient: `P-2024-0001 - John Doe`
   - Medication Name: `Paracetamol`
   - Dosage: `500mg`
   - Frequency: `3 times daily`
   - Duration: `5 days`
   - Instructions: `Take after meals with plenty of water`
8. Click "Create Prescription"

**Expected Result:**
- ✅ Patient visible in queue
- ✅ Priority shown correctly (Yellow)
- ✅ Prescription created successfully
- ✅ Success message appears
- ✅ Prescription appears in Pharmacy tab
- ✅ Status shows "active"

---

## Test 5: Doctor Orders Lab Test

**Objective:** Doctor orders laboratory test for patient

**Steps:**
1. Still logged in as doctor
2. Go to "Laboratory" tab
3. Click "+ Order Lab Test" button
4. Fill in lab test form:
   - Select Patient: `P-2024-0001 - John Doe`
   - Test Type: `Hematology`
   - Test Name: `Complete Blood Count (CBC)`
   - Notes: `Patient has fever, check for infection`
5. Click "Order Lab Test"

**Expected Result:**
- ✅ Lab test ordered successfully
- ✅ Success message appears
- ✅ Lab test appears in Laboratory tab
- ✅ Status shows "pending"

---

## Test 6: Pharmacist Dispenses Medication

**Objective:** Pharmacist receives and dispenses prescription

**Steps:**
1. Logout from doctor
2. Login as pharmacist:
   - Username: `pharmacist1`
   - Password: `pharma123`
3. Verify John Doe's prescription appears in "Pending Prescriptions"
4. Click "Dispense" button on the prescription
5. Review prescription details
6. Click "Confirm Dispense"

**Expected Result:**
- ✅ Prescription visible in pending list
- ✅ Patient details shown correctly
- ✅ Medication details accurate
- ✅ Dispensing successful
- ✅ Status changes to "dispensed"
- ✅ Prescription moves to "Dispensed" section
- ✅ Dispensed date recorded

---

## Test 7: Lab Technician Processes Test

**Objective:** Lab tech receives, processes, and submits results

**Steps:**
1. Logout from pharmacist
2. Login as lab technician:
   - Username: `labtech1`
   - Password: `lab123`
3. Verify John Doe's CBC test appears in "Pending Tests"
4. Click "Start Test" button
5. Verify status changes to "In Progress"
6. Click "Submit Results" button
7. Fill in results form:
   - Results: `WBC: 12.5 x10^9/L, RBC: 4.8 x10^12/L, Hgb: 14.2 g/dL, Platelets: 250 x10^9/L`
   - Normal Range: `WBC: 4-11, RBC: 4.5-5.5, Hgb: 13-17, Platelets: 150-400`
   - Notes: `Elevated WBC suggests infection`
8. Click "Submit"

**Expected Result:**
- ✅ Test visible in pending list
- ✅ "Start Test" changes status to "in_progress"
- ✅ Test moves to "In Progress" section
- ✅ Results submitted successfully
- ✅ Status changes to "completed"
- ✅ Test moves to "Completed" section
- ✅ Completion date recorded

---

## Test 8: Patient Views Prescriptions and Lab Results

**Objective:** Patient logs in and views all their medical information

**Steps:**
1. Logout from lab technician
2. Navigate to `http://localhost:3000/login`
3. Login as patient (if patient login is enabled)
   - OR use patient registration to create account
4. Go to "Prescriptions" tab
5. Verify prescription details:
   - Medication: Paracetamol
   - Dosage: 500mg
   - Frequency: 3 times daily
   - Duration: 5 days
   - Status: Dispensed
   - Instructions visible
   - Dispensed date shown
6. Go to "Lab Results" tab
7. Verify lab test details:
   - Test Name: Complete Blood Count (CBC)
   - Test Type: Hematology
   - Status: Completed
   - Results visible with values
   - Normal range shown
   - Completion date shown
8. Go to "Dashboard" tab
9. Verify statistics:
   - Prescriptions count: 1
   - Lab Tests count: 1

**Expected Result:**
- ✅ Patient can login successfully
- ✅ Prescription visible with all details
- ✅ Status shows "Dispensed"
- ✅ Lab results visible with complete information
- ✅ Results and normal ranges displayed
- ✅ Dashboard shows correct counts
- ✅ All information accurate and up-to-date

---

## Test 9: Real-Time Integration Verification

**Objective:** Verify data flows between all dashboards in real-time

**Steps:**
1. Open multiple browser windows/tabs
2. Login to different dashboards simultaneously:
   - Tab 1: Doctor Dashboard
   - Tab 2: Pharmacy Dashboard
   - Tab 3: Laboratory Dashboard
   - Tab 4: Patient Dashboard (if available)
3. In Doctor Dashboard:
   - Create a new prescription
   - Immediately check Pharmacy Dashboard
   - Verify prescription appears instantly
4. In Doctor Dashboard:
   - Order a new lab test
   - Immediately check Laboratory Dashboard
   - Verify lab test appears instantly
5. In Pharmacy Dashboard:
   - Dispense a prescription
   - Check Patient Dashboard
   - Verify status updated
6. In Laboratory Dashboard:
   - Complete a lab test
   - Check Patient Dashboard
   - Verify results appear

**Expected Result:**
- ✅ Prescriptions appear in pharmacy immediately after creation
- ✅ Lab tests appear in laboratory immediately after ordering
- ✅ Status updates reflect in patient dashboard
- ✅ No delays or synchronization issues
- ✅ All data consistent across dashboards

---

## Test 10: Multiple Patients Workflow

**Objective:** Test system with multiple patients simultaneously

**Steps:**
1. As receptionist, register 3 more patients:
   - Patient 2: Jane Smith
   - Patient 3: Bob Wilson
   - Patient 4: Alice Brown
2. Add all 3 to queue
3. As nurse, do triage for all 3 patients with different priorities:
   - Jane: Green (Non-urgent)
   - Bob: Orange (Very Urgent)
   - Alice: Red (Emergency)
4. As doctor, verify queue shows correct priority order
5. Create prescriptions for 2 patients
6. Order lab tests for 2 patients (can be same or different)
7. As pharmacist, dispense prescriptions
8. As lab tech, process lab tests
9. Verify all data correctly associated with each patient

**Expected Result:**
- ✅ All patients registered with unique IDs
- ✅ Queue shows correct priority order (Red → Orange → Yellow → Green)
- ✅ Triage data correctly associated
- ✅ Prescriptions linked to correct patients
- ✅ Lab tests linked to correct patients
- ✅ No data mixing between patients
- ✅ All workflows work simultaneously

---

## Common Issues and Solutions

### Issue 1: "Route not found" error
**Solution:** Restart backend server to load new routes
```bash
cd server
node server.js
```

### Issue 2: Prescription/Lab test not appearing
**Solution:** 
- Check browser console for errors
- Verify backend server is running
- Check network tab for API call status
- Ensure patient ID is correct

### Issue 3: Login fails
**Solution:**
- Verify credentials are correct
- Check if user was created successfully
- Ensure database connection is active

### Issue 4: Data not updating in real-time
**Solution:**
- Refresh the page
- Check if API endpoints are responding
- Verify token is valid (check localStorage)

---

## Performance Testing

### Load Test Checklist
- [ ] Register 50+ patients
- [ ] Create 100+ prescriptions
- [ ] Order 100+ lab tests
- [ ] Verify system remains responsive
- [ ] Check database query performance
- [ ] Monitor memory usage

### Stress Test Checklist
- [ ] Multiple users logged in simultaneously (10+)
- [ ] Rapid prescription creation (10 in 1 minute)
- [ ] Rapid lab test ordering (10 in 1 minute)
- [ ] Concurrent dispensing operations
- [ ] Concurrent lab test processing

---

## Security Testing

### Authentication Test Checklist
- [ ] Cannot access dashboards without login
- [ ] Token expires after logout
- [ ] Invalid credentials rejected
- [ ] Password hashing working (bcrypt)

### Authorization Test Checklist
- [ ] Doctor cannot access admin functions
- [ ] Pharmacist cannot create prescriptions
- [ ] Lab tech cannot dispense medications
- [ ] Patient cannot access staff dashboards
- [ ] Receptionist cannot modify prescriptions

### Data Privacy Test Checklist
- [ ] Patients can only see their own data
- [ ] Staff can see all patient data (as needed)
- [ ] Sensitive data not exposed in URLs
- [ ] API endpoints require authentication

---

## Browser Compatibility Testing

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers (Chrome Mobile, Safari Mobile)

---

## Accessibility Testing

- [ ] Keyboard navigation works
- [ ] Form labels properly associated
- [ ] Color contrast sufficient
- [ ] Screen reader compatible
- [ ] Error messages clear and helpful

---

## Final Checklist

- [ ] All 10 main tests passed
- [ ] No console errors
- [ ] No network errors
- [ ] All data persists after page refresh
- [ ] All workflows complete successfully
- [ ] Performance acceptable
- [ ] Security measures working
- [ ] Documentation complete

---

**Testing Status:** Ready for comprehensive testing
**Last Updated:** Today
**Version:** 1.0.0

---

## Quick Test Commands

```bash
# Start backend
cd server
node server.js

# Start frontend (in new terminal)
cd client
npm start

# Check backend health
curl http://localhost:5000/

# Check database connection
psql -U postgres -d clinic_management -c "SELECT COUNT(*) FROM users;"
```

---

**Happy Testing! 🧪**
