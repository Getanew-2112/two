# Quick Start Guide

## 🚀 Start the System

### 1. Start Backend Server
```bash
cd clinic-management-system/server
npm start
```
✅ Should show: "Server running on port 5000"

### 2. Start Frontend Client
```bash
cd clinic-management-system/client
npm start
```
✅ Should show: "webpack compiled successfully"
✅ Opens at: http://localhost:3000

---

## 🔑 Initial Login

### Admin Login (First Time)
- **URL:** http://localhost:3000/admin
- **Username:** `admin`
- **Password:** `admin123`
- ⚠️ **IMPORTANT:** Change this password immediately after first login!

### After Admin Setup
1. Login as admin
2. Create staff accounts through admin dashboard
3. Staff can then login at http://localhost:3000/login

### Patient Registration
- **URL:** http://localhost:3000/patient-register
- Register new patients
- Login at http://localhost:3000/login

---

## 🎯 Quick Test

1. **Test Admin:**
   - Go to: http://localhost:3000/admin
   - Login: `admin` / `admin123`
   - Change password immediately
   - Create staff accounts

2. **Test Patient Registration:**
   - Go to: http://localhost:3000
   - Click "Register" button
   - Fill form and register
   - Login with your credentials
   - See patient dashboard

---

## 🔧 Troubleshooting

### Buttons not working?
- Hard refresh: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
- Clear browser cache
- Check browser console (F12) for errors

### Can't login?
- Make sure both servers are running
- Check you're using the correct URL
- Admin uses `/admin`, others use `/login`
- Verify credentials are correct

### Database error?
- Check PostgreSQL is running
- Verify credentials in `server/.env`
- Database name should be `clinic_management`
- Run schema: `psql -d clinic_management -f server/database/schema.sql`

---

## 📱 Important URLs

- **Home:** http://localhost:3000
- **Login:** http://localhost:3000/login
- **Admin:** http://localhost:3000/admin
- **Register:** http://localhost:3000/patient-register
- **About:** http://localhost:3000/about
- **Services:** http://localhost:3000/services
- **Contact:** http://localhost:3000/contact

---

## ✨ Features to Test

- [ ] Beautiful home page with carousel
- [ ] Patient registration with auto-generated ID
- [ ] Patient login and dashboard
- [ ] Admin login and dashboard
- [ ] Create staff accounts via admin
- [ ] Queue management
- [ ] Navigation between pages

---

That's it! You're ready to go! 🎉
