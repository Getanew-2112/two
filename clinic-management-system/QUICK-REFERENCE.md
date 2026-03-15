# 🚀 Quick Reference Card

## System Access

### URLs
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Admin Login:** http://localhost:3000/admin-login
- **Staff/Patient Login:** http://localhost:3000/login

### Default Credentials
```
Admin:
Username: admin
Password: admin123
```

---

## Quick Commands

### Start System
```bash
# Terminal 1 - Backend
cd server
node server.js

# Terminal 2 - Frontend
cd client
npm start
```

### Stop System
```bash
# Press Ctrl+C in each terminal
```

### Database Access
```bash
psql -U postgres -d clinic_management
```

---

## User Roles & Permissions

| Role | Create Users | Register Patients | Triage | Prescribe | Dispense | Lab Tests |
|------|-------------|-------------------|--------|-----------|----------|-----------|
| Admin | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Receptionist | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Nurse | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Doctor | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ (Order) |
| Pharmacist | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Lab Tech | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ (Process) |
| Patient | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ (View only) |

---

## Workflow Cheat Sheet

### 1. Create Staff (Admin)
```
Login → Manage Users → Add User → Fill Form → Submit
```

### 2. Register Patient (Receptionist)
```
Login → Patients Tab → Register Patient → Fill Form → Submit
```

### 3. Add to Queue (Receptionist)
```
Patients Tab → Search Patient → Add to Queue
```

### 4. Triage (Nurse)
```
Login → New Triage → Select Patient → Enter Vitals → Assign Priority → Save
```

### 5. Create Prescription (Doctor)
```
Login → Pharmacy Tab → + Create Prescription → Select Patient → Fill Details → Submit
```

### 6. Order Lab Test (Doctor)
```
Login → Laboratory Tab → + Order Lab Test → Select Patient → Choose Test → Submit
```

### 7. Dispense Medication (Pharmacist)
```
Login → View Pending → Click Dispense → Confirm
```

### 8. Process Lab Test (Lab Tech)
```
Login → View Pending → Start Test → Submit Results → Enter Data → Submit
```

---

## API Quick Reference

### Authentication
```bash
POST /api/auth/login
Body: { "username": "string", "password": "string" }
```

### Create Prescription
```bash
POST /api/prescriptions
Headers: Authorization: Bearer <token>
Body: {
  "patient_id": "uuid",
  "medication_name": "string",
  "dosage": "string",
  "frequency": "string",
  "duration": "string"
}
```

### Order Lab Test
```bash
POST /api/lab-tests
Headers: Authorization: Bearer <token>
Body: {
  "patient_id": "uuid",
  "test_type": "hematology",
  "test_name": "Complete Blood Count (CBC)"
}
```

---

## Triage Priority Colors

| Color | Priority | Description |
|-------|----------|-------------|
| 🟢 Green | Non-urgent | Stable, can wait |
| 🟡 Yellow | Urgent | Needs attention soon |
| 🟠 Orange | Very Urgent | Needs immediate attention |
| 🔴 Red | Emergency | Life-threatening |

---

## Common Lab Test Types

### Hematology
- Complete Blood Count (CBC)
- Blood Typing
- ESR

### Chemistry
- Liver Function Tests
- Kidney Function Tests
- Lipid Profile
- Blood Glucose

### Microbiology
- Blood Culture
- Urine Culture
- Wound Culture

### Immunology
- HIV Test
- Hepatitis B/C
- VDRL/RPR

---

## Status Indicators

### Prescriptions
- **Active** 🟡 - Pending dispensing
- **Dispensed** 🟢 - Medication given
- **Expired** ⚫ - Past expiry date
- **Cancelled** 🔴 - Cancelled by doctor

### Lab Tests
- **Pending** 🟡 - Awaiting processing
- **In Progress** 🔵 - Being processed
- **Completed** 🟢 - Results available
- **Cancelled** 🔴 - Cancelled

### Queue
- **Waiting** 🟡 - In queue
- **In Consultation** 🔵 - With doctor
- **Completed** 🟢 - Consultation done
- **Cancelled** 🔴 - Removed from queue

---

## Troubleshooting Quick Fixes

### Backend Not Starting
```bash
cd server
rm -rf node_modules
npm install
node server.js
```

### Frontend Not Starting
```bash
cd client
rm -rf node_modules
npm install
npm start
```

### Database Connection Error
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql

# Check credentials in server/.env
```

### Login Not Working
```bash
# Clear browser localStorage
# Open DevTools → Application → Local Storage → Clear

# Or use incognito/private window
```

---

## File Locations

### Configuration
- Backend env: `server/.env`
- Database schema: `server/database/schema.sql`
- Frontend config: `client/package.json`

### Logs
- Backend: Console output
- Frontend: Browser console
- Database: PostgreSQL logs

### Important Files
- Main backend: `server/server.js`
- Main frontend: `client/src/App.js`
- Auth service: `client/src/services/auth.js`

---

## Port Numbers

| Service | Port | URL |
|---------|------|-----|
| Frontend | 3000 | http://localhost:3000 |
| Backend | 5000 | http://localhost:5000 |
| PostgreSQL | 5432 | localhost:5432 |

---

## Environment Variables

### Required (.env)
```bash
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=clinic_management
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key
NODE_ENV=development
```

---

## Database Quick Commands

```sql
-- View all patients
SELECT * FROM patients;

-- View all users
SELECT * FROM users;

-- View queue
SELECT * FROM queue WHERE status = 'waiting';

-- View active prescriptions
SELECT * FROM prescriptions WHERE status = 'active';

-- View pending lab tests
SELECT * FROM lab_tests WHERE status = 'pending';

-- Count patients
SELECT COUNT(*) FROM patients;
```

---

## Keyboard Shortcuts

### Browser
- **Ctrl+Shift+I** - Open DevTools
- **Ctrl+Shift+C** - Inspect Element
- **F5** - Refresh Page
- **Ctrl+Shift+R** - Hard Refresh

### Terminal
- **Ctrl+C** - Stop Process
- **Ctrl+L** - Clear Terminal
- **↑/↓** - Command History

---

## Testing Checklist

- [ ] Admin can create users
- [ ] Receptionist can register patients
- [ ] Nurse can record triage
- [ ] Doctor can create prescriptions
- [ ] Doctor can order lab tests
- [ ] Pharmacist can dispense
- [ ] Lab tech can process tests
- [ ] Patient can view data

---

## Emergency Contacts

### System Issues
- Check TESTING-GUIDE.md
- Check DEPLOYMENT-GUIDE.md
- Check API-DOCUMENTATION.md

### Database Issues
- Check server/.env configuration
- Verify PostgreSQL is running
- Check database schema

### Authentication Issues
- Clear browser cache
- Check JWT_SECRET in .env
- Verify user exists in database

---

## Quick Links

📖 **Documentation**
- [README.md](README.md) - Main documentation
- [QUICK-START.md](QUICK-START.md) - Setup guide
- [WORKFLOW-INTEGRATION.md](WORKFLOW-INTEGRATION.md) - Workflows
- [TESTING-GUIDE.md](TESTING-GUIDE.md) - Testing
- [DEPLOYMENT-GUIDE.md](DEPLOYMENT-GUIDE.md) - Deployment
- [API-DOCUMENTATION.md](API-DOCUMENTATION.md) - API reference
- [PROJECT-SUMMARY.md](PROJECT-SUMMARY.md) - Overview

---

## Version Info

- **Version:** 1.0.0
- **Status:** Production Ready
- **Last Updated:** Today

---

**Keep this card handy for quick reference! 📋**
