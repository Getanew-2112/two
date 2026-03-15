# Clinic Management System

A comprehensive web-based clinic management system built with React, Node.js, Express, and PostgreSQL.

## 🏥 Features

### 🎉 NEW: Enhanced Patient Payment Flow
- **Digital Payment Processing** - Card, mobile money, and cash payment options
- **Real-Time Queue Updates** - Auto-refreshing queue status every 30 seconds
- **Multi-Channel Notifications** - Email, SMS, and push notifications
- **Doctor Assignment** - Assign doctors during triage with notifications
- **Payment Verification** - Receptionist workflow for cash payments
- **Digital Receipts** - Auto-generated receipts (RCP-YYYY-NNNN format)
- **Priority-Based Queue** - Red/Orange/Yellow/Green priority levels
- **Patient Transparency** - Real-time visibility of queue, triage, and assignments

### Role-Based Dashboards
- **Admin Dashboard** - System-wide management and oversight
- **Doctor Dashboard** - Patient consultations, prescriptions, lab orders
- **Triage Dashboard** - Vital signs recording and patient assessment
- **Receptionist Dashboard** - Patient registration and queue management
- **Pharmacy Dashboard** - Prescription dispensing and inventory
- **Laboratory Dashboard** - Lab test processing and results
- **Patient Portal** - View appointments, prescriptions, and test results

### Core Functionality
- Patient registration with auto-generated IDs
- Queue management system with payment integration
- Triage and vital signs recording with doctor assignment
- Electronic prescriptions with notifications
- Laboratory test ordering and results with notifications
- Appointment scheduling
- Role-based access control
- Secure authentication with JWT
- Payment processing and verification
- Multi-channel notification system
- Digital receipt generation

### New API Endpoints (18 total)
- **Payment APIs** (7): Initiate, verify, webhook, history, pending, refund, receipt
- **Notification APIs** (4): Send, history, unread count, mark read
- **Enhanced Queue APIs**: Join with payment, priority-based management
- **Enhanced Triage APIs** (3): Assign doctor, get results, list doctors

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd clinic-management-system
```

2. **Setup Database**
```bash
# Create PostgreSQL database
createdb clinic_management

# Run schema
psql -d clinic_management -f server/database/schema.sql
```

3. **Configure Environment**
```bash
# Edit server/.env with your database credentials
DB_HOST=localhost
DB_PORT=5432
DB_NAME=clinic_management
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key_here
```

4. **Install Dependencies**
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

5. **Start the Application**
```bash
# Terminal 1 - Start backend (from server directory)
npm start

# Terminal 2 - Start frontend (from client directory)
npm start
```

6. **Access the Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

7. **Create Admin Account**
The default admin account is created automatically from the schema:
- Username: `admin`
- Password: `admin123`
- **IMPORTANT:** Change this password immediately after first login!

8. **Create Staff Accounts**
After logging in as admin, use the admin dashboard to create staff accounts for:
- Doctors
- Nurses
- Receptionists
- Pharmacists
- Lab Technicians

## 🔑 Initial Setup

### First Time Setup

1. **Login as Admin**
   - Go to http://localhost:3000/admin
   - Username: `admin`
   - Password: `admin123`

2. **Change Admin Password**
   - Navigate to admin settings
   - Update password immediately

3. **Create Staff Accounts**
   - Use admin dashboard to add staff members
   - Assign appropriate roles
   - Set secure passwords

4. **Configure System**
   - Set up clinic information
   - Configure system settings
   - Add departments if needed

## 📊 Dashboard Overview

### Admin Dashboard
- System statistics and overview
- User management
- Queue and appointment monitoring
- System configuration

### Doctor Dashboard
- Patient queue management
- Call next patient
- Create prescriptions
- Order lab tests
- View patient history

### Triage Dashboard (Nurse)
- Record vital signs (BP, HR, Temperature, Weight, Height, SpO2, RR)
- Assign triage categories (Green, Yellow, Orange, Red)
- BMI auto-calculation
- Patient assessment notes

### Receptionist Dashboard
- Register new patients
- Add patients to queue
- Search patient records
- Manage appointments

### Pharmacy Dashboard
- View pending prescriptions
- Dispense medications
- Track prescription status
- Inventory management

### Laboratory Dashboard
- View pending lab tests
- Start test processing
- Submit test results
- View completed results

### Patient Portal
- View appointments
- Check queue status
- View prescriptions
- View lab results
- Update profile

## 🏗️ Project Structure

```
clinic-management-system/
├── client/                 # React frontend
│   ├── public/
│   └── src/
│       ├── components/     # Reusable components
│       ├── pages/          # Page components
│       ├── services/       # API services
│       └── App.js          # Main app component
├── server/                 # Node.js backend
│   ├── config/            # Configuration files
│   ├── database/          # Database schemas
│   ├── middleware/        # Express middleware
│   ├── routes/            # API routes
│   └── server.js          # Main server file
├── README.md              # This file
├── QUICK-START.md         # Quick start guide
└── TEST-CREDENTIALS.md    # All login credentials
```

## 🔧 Technology Stack

### Frontend
- React 18
- React Router v6
- Tailwind CSS
- Axios for API calls

### Backend
- Node.js
- Express.js
- PostgreSQL
- JWT for authentication
- bcrypt for password hashing

## 🔐 Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Role-based access control
- Protected API routes
- Secure session management

## 📱 API Endpoints

### Authentication
- `POST /api/auth/login` - Staff login
- `POST /api/patients/login` - Patient login
- `POST /api/patients/register` - Patient registration

### Patients
- `GET /api/patients` - Get all patients
- `GET /api/patients/:id` - Get patient by ID
- `PUT /api/patients/:id` - Update patient

### Queue
- `GET /api/queue` - Get queue
- `POST /api/queue/add` - Add to queue
- `POST /api/queue/call-next` - Call next patient

### Triage
- `GET /api/triage/today` - Get today's triage records
- `GET /api/triage/stats` - Get triage statistics
- `POST /api/triage` - Create triage record

### Prescriptions
- `GET /api/prescriptions` - Get all prescriptions
- `POST /api/prescriptions` - Create prescription
- `PUT /api/prescriptions/:id/dispense` - Dispense medication

### Lab Tests
- `GET /api/lab-tests` - Get all lab tests
- `POST /api/lab-tests` - Order lab test
- `PUT /api/lab-tests/:id/start` - Start test
- `PUT /api/lab-tests/:id/complete` - Submit results

## 🐛 Troubleshooting

### Can't Login
- Verify you're using the correct URL (/login for staff, /admin for admin)
- Check username and password are correct
- Ensure backend server is running on port 5000

### Database Connection Error
- Verify PostgreSQL is running
- Check database credentials in server/.env
- Ensure database exists: `psql -l | grep clinic_management`

### Port Already in Use
```bash
# Kill process on port 3000 (frontend)
npx kill-port 3000

# Kill process on port 5000 (backend)
npx kill-port 5000
```

### Frontend Not Loading
- Clear browser cache (Ctrl+Shift+R)
- Check console for errors (F12)
- Verify backend is running
- Check network tab for failed API calls

### No Data Showing
- Verify backend API is running
- Check database connection
- Ensure user accounts are created
- Check browser console for errors

## 🎨 Design Features

- Modern, responsive UI with Tailwind CSS
- Color-coded dashboards for each role
- Intuitive navigation and workflows
- Real-time statistics and updates
- Professional medical interface

## 📝 Development Notes

### Adding New Features
1. Create backend API route in `server/routes/`
2. Add database schema if needed
3. Create frontend component in `client/src/pages/`
4. Add route in `client/src/App.js`
5. Update authentication logic if needed

### Database Migrations
- Schema changes should be documented
- Use migration scripts for updates
- Always backup before schema changes

### Testing
- Test all user roles thoroughly
- Verify API endpoints with Postman
- Check responsive design on mobile
- Test error handling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Support

For issues or questions:
- Check this README
- Review QUICK-START.md
- Check TEST-CREDENTIALS.md for login info
- Contact system administrator

## 🎯 Future Enhancements

- [ ] SMS notifications
- [ ] Email integration
- [ ] Report generation
- [ ] Billing system
- [ ] Inventory management
- [ ] Appointment reminders
- [ ] Patient medical records
- [ ] Doctor scheduling
- [ ] Analytics dashboard
- [ ] Mobile app

---

**Version:** 1.0  
**Last Updated:** 2024  
**Status:** Production Ready ✅
#   c l i n i c  
 