# Testing Instructions - Enhanced Patient Payment Flow

## Quick Testing Guide

This guide will help you test all the new features that have been implemented.

---

## Prerequisites

### 1. Ensure Servers are Running

**Backend Server:**
```bash
cd clinic-management-system/server
node server.js
# Should show: Server running on port 5000
```

**Frontend Server:**
```bash
cd clinic-management-system/client
npm start
# Should open browser at http://localhost:3000
```

### 2. Create Test Accounts

Login as admin and create the following test accounts:

**Admin Login:**
- Username: `admin`
- Password: `admin123`

**Create These Accounts via Admin Dashboard:**
1. **Patient**: 
   - Username: `patient1`
   - Email: `patient1@test.com`
   - Password: `patient123`
   - Role: Patient (register via patient registration)

2. **Receptionist**:
   - Username: `receptionist1`
   - Email: `receptionist1@test.com`
   - Password: `recep123`
   - Role: Receptionist

3. **Nurse**:
   - Username: `nurse1`
   - Email: `nurse1@test.com`
   - Password: `nurse123`
   - Role: Nurse

4. **Doctor**:
   - Username: `doctor1`
   - Email: `doctor1@test.com`
   - Password: `doc12345`
   - Role: Doctor

---

## Test Scenario 1: Patient Joins Queue with Card Payment

### Step 1: Patient Registration (if needed)
1. Go to http://localhost:3000
2. Click "Patient Registration"
3. Fill in the form:
   - First Name: John
   - Last Name: Doe
   - Date of Birth: 1990-01-01
   - Gender: Male
   - Phone: 0911234567
   - Email: john.doe@test.com
4. Click "Register"
5. Note the Patient ID (e.g., P-2024-0001)

### Step 2: Patient Login
1. Go to http://localhost:3000/unified-login
2. Login with patient credentials
3. You should see the Patient Dashboard

### Step 3: Join Queue with Payment
1. Click on "Queue" tab (should be active by default)
2. Click "Join Queue Now" button
3. **PaymentModal should open** ✅
4. Select "Credit/Debit Card" option
5. Click "Proceed to Pay"
6. **Watch the payment process:**
   - Shows "Processing payment..."
   - Simulates gateway processing (2 seconds)
   - Shows "Payment Successful!" ✅
   - Displays transaction ID
7. Modal closes automatically
8. **QueueStatusCard should update** ✅
9. You should see:
   - Your queue number
   - Patients ahead: 0 (if first)
   - Estimated wait time
   - Priority badge (Green by default)

### Expected Results:
- ✅ Payment modal works
- ✅ Payment processes successfully
- ✅ Queue status updates
- ✅ No errors in console

---

## Test Scenario 2: Patient Joins Queue with Cash Payment

### Step 1: Patient Initiates Cash Payment
1. Login as a different patient (or logout and re-register)
2. Go to Queue tab
3. Click "Join Queue Now"
4. Select "Cash at Reception"
5. Click "Proceed to Pay"
6. **Should see success message** ✅
7. Message says: "Please proceed to reception for verification"
8. Note the transaction ID

### Step 2: Receptionist Verifies Payment
1. **Open a new browser window/tab** (or use incognito)
2. Go to http://localhost:3000/unified-login
3. Login as receptionist (receptionist1/recep123)
4. **Go to "Payment Verification" tab** ✅
5. You should see the pending payment
6. **Verify the payment details:**
   - Patient name
   - Amount: ETB 500
   - Payment method: Cash
   - Transaction ID
7. Click "Confirm Payment"
8. **Payment should be verified** ✅
9. Patient should disappear from pending list

### Step 3: Verify Patient Added to Queue
1. Go to "Queue Management" tab
2. **Patient should be in the queue** ✅
3. Note the queue number

### Step 4: Check Patient Dashboard
1. Go back to patient browser window
2. Refresh the page
3. **QueueStatusCard should show queue status** ✅

### Expected Results:
- ✅ Cash payment initiated
- ✅ Receptionist sees pending payment
- ✅ Verification works
- ✅ Patient added to queue automatically
- ✅ Queue status updates

---

## Test Scenario 3: Triage with Doctor Assignment

### Step 1: Triage Assessment
1. Login as nurse (nurse1/nurse123)
2. Go to Triage Dashboard
3. Click "New Triage" button
4. **Fill in the triage form:**
   - Select Patient: Choose the patient from dropdown
   - Blood Pressure: 120/80
   - Heart Rate: 75
   - Temperature: 36.8
   - Weight: 70
   - Height: 175
   - Oxygen Saturation: 98
   - Respiratory Rate: 16
   - Chief Complaint: "Fever and headache"
   - Triage Category: Yellow (Urgent)
   - Notes: "Patient reports symptoms for 2 days"
5. Click "Save Triage Record"
6. **Triage should be saved** ✅
7. **DoctorAssignment component should appear** ✅

### Step 2: Assign Doctor
1. In the DoctorAssignment section:
2. Select a doctor from dropdown (doctor1)
3. Add assignment notes: "Patient requires general consultation"
4. Click "Assign Doctor"
5. **Should see success message** ✅
6. Modal should close after 1.5 seconds

### Step 3: Verify Assignment
1. Go to "Triage Records" tab
2. Find the triage record
3. **Should show assigned doctor** ✅

### Expected Results:
- ✅ Triage form works
- ✅ BMI calculated automatically
- ✅ Doctor assignment component appears
- ✅ Doctor assigned successfully
- ✅ Assignment visible in records

---

## Test Scenario 4: Real-Time Queue Updates

### Step 1: Monitor Queue Status
1. Login as patient
2. Go to Queue tab
3. **Observe QueueStatusCard:**
   - Shows current position
   - Shows estimated wait time
   - Shows priority badge
   - Shows assigned doctor (if assigned)
4. **Wait 30 seconds**
5. **Card should auto-refresh** ✅
6. Check browser console for API calls

### Step 2: Test Priority Display
1. The priority badge should show:
   - 🟢 Green for non-urgent
   - 🟡 Yellow for urgent
   - 🟠 Orange for very urgent
   - 🔴 Red for emergency

### Expected Results:
- ✅ Auto-refresh works (every 30 seconds)
- ✅ Queue data updates
- ✅ Priority badge displays correctly
- ✅ No console errors

---

## Test Scenario 5: Notification System

### Step 1: Check Notification Bell
1. Login as patient
2. Look at the header
3. **Should see bell icon (🔔)** ✅
4. **Should show unread count badge** ✅ (if notifications exist)

### Step 2: View Notifications
1. Click the bell icon
2. **NotificationCenter should open** ✅
3. Should see notifications for:
   - Payment receipt
   - Queue update
   - Doctor assignment (if assigned)
4. **Filter by "Unread"** ✅
5. Should show only unread notifications

### Step 3: Mark as Read
1. Click "Mark as read" on a notification
2. **Notification should update** ✅
3. **Unread count should decrease** ✅
4. Close notification center
5. **Bell badge should update** ✅

### Expected Results:
- ✅ Bell icon shows unread count
- ✅ Notification center opens
- ✅ Notifications display correctly
- ✅ Mark as read works
- ✅ Auto-refresh works (every 60 seconds)

---

## Test Scenario 6: Complete Patient Journey

### Full Workflow Test:
1. **Patient registers** → Gets Patient ID
2. **Patient joins queue** → Pays with card → Gets queue number
3. **Receptionist views queue** → Sees patient waiting
4. **Nurse performs triage** → Records vitals → Assigns doctor
5. **Patient receives notifications** → Payment receipt, queue update, doctor assignment
6. **Patient checks queue status** → Sees position, wait time, assigned doctor
7. **Doctor views queue** → Sees patient with triage data
8. **Doctor calls patient** → Provides consultation

### Verification Points:
- ✅ Each step completes successfully
- ✅ Data flows between dashboards
- ✅ Notifications sent at each stage
- ✅ Queue updates in real-time
- ✅ No errors or crashes

---

## Common Issues & Solutions

### Issue 1: Payment Modal Not Opening
**Solution:**
- Check browser console for errors
- Verify backend is running on port 5000
- Check that PaymentModal component is imported

### Issue 2: Queue Status Not Updating
**Solution:**
- Check if patient is actually in queue
- Verify API endpoint: GET http://localhost:5000/api/queue
- Check browser console for API errors
- Wait 30 seconds for auto-refresh

### Issue 3: Notifications Not Showing
**Solution:**
- Check if notifications exist in database
- Verify API endpoint: GET http://localhost:5000/api/notifications/:patient_id
- Check unread count endpoint
- Refresh the page

### Issue 4: Doctor Assignment Not Working
**Solution:**
- Ensure triage record is saved first
- Check if doctors exist in system
- Verify API endpoint: POST http://localhost:5000/api/triage/assign-doctor
- Check browser console for errors

### Issue 5: Payment Verification Not Showing
**Solution:**
- Ensure cash payment was initiated
- Check API endpoint: GET http://localhost:5000/api/payments/pending
- Verify receptionist is logged in
- Refresh the Payment Verification tab

---

## API Testing with cURL

### Test Payment Initiation
```bash
curl -X POST http://localhost:5000/api/payments/initiate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "payment_method": "card",
    "amount": 500,
    "payment_type": "consultation"
  }'
```

### Test Get Notifications
```bash
curl -X GET http://localhost:5000/api/notifications/PATIENT_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Queue Status
```bash
curl -X GET http://localhost:5000/api/queue \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Doctor Assignment
```bash
curl -X POST http://localhost:5000/api/triage/assign-doctor \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "triage_id": "TRIAGE_ID",
    "doctor_id": "DOCTOR_ID",
    "assignment_notes": "Test assignment"
  }'
```

---

## Database Verification

### Check Payments Table
```sql
SELECT * FROM payments ORDER BY created_at DESC LIMIT 10;
```

### Check Notifications Table
```sql
SELECT * FROM notifications ORDER BY created_at DESC LIMIT 10;
```

### Check Queue Table
```sql
SELECT q.*, p.first_name, p.last_name 
FROM queue q 
JOIN patients p ON q.patient_id = p.id 
WHERE q.status = 'waiting';
```

### Check Triage with Doctor Assignment
```sql
SELECT tr.*, u.first_name as doctor_first_name, u.last_name as doctor_last_name
FROM triage_records tr
LEFT JOIN users u ON tr.assigned_doctor_id = u.id
ORDER BY tr.created_at DESC LIMIT 10;
```

---

## Success Criteria

### All Tests Pass When:
- ✅ Payment modal opens and processes payments
- ✅ Cash payments can be verified by receptionist
- ✅ Queue status updates automatically
- ✅ Notifications appear with correct counts
- ✅ Doctor assignment works in triage
- ✅ All dashboards show correct data
- ✅ No console errors
- ✅ No API errors (check Network tab)
- ✅ Database records created correctly

---

## Performance Checks

### Monitor These:
1. **API Response Times** (should be < 500ms)
2. **Page Load Times** (should be < 3 seconds)
3. **Auto-refresh Impact** (should not slow down UI)
4. **Memory Usage** (check browser task manager)
5. **Network Requests** (check for unnecessary calls)

---

## Next Steps After Testing

### If All Tests Pass:
1. ✅ System is ready for staging deployment
2. ✅ Can proceed with user acceptance testing
3. ✅ Ready for production with real payment gateway

### If Tests Fail:
1. Check error messages in console
2. Verify API endpoints are responding
3. Check database connections
4. Review server logs
5. Restart servers if needed

---

## Support

### For Issues:
1. Check browser console (F12)
2. Check server logs
3. Verify database state
4. Review API responses in Network tab
5. Check this testing guide for solutions

---

**Happy Testing! 🎉**

All features have been implemented and should work as described in this guide. If you encounter any issues, refer to the troubleshooting section or check the implementation documentation.
