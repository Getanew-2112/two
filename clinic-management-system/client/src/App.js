import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import AdminSidebar from './components/AdminSidebar';
import AdminDashboard from './components/AdminDashboard';
import ManageUsers from './components/ManageUsers';
import UnifiedLogin from './pages/UnifiedLogin';
import AdminLogin from './pages/AdminLogin';
import Home from './pages/Home';
import TestPage from './pages/TestPage';
import AboutUs from './pages/AboutUs';
import Services from './pages/Services';
import Contact from './pages/Contact';
import PatientRegister from './pages/PatientRegister';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import ReceptionistDashboard from './pages/ReceptionistDashboard';
import PharmacyDashboard from './pages/PharmacyDashboard';
import LaboratoryDashboard from './pages/LaboratoryDashboard';
import TriageDashboard from './pages/TriageDashboard';
import auth from './services/auth';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = auth.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    auth.logout();
    setUser(null);
    window.location.href = '/home';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-xl text-gray-700 font-semibold">Loading Clinic Management System...</p>
        </div>
      </div>
    );
  }

  return (
    <LanguageProvider>
      <Router>
        <Routes>
          {/* Public Routes - Always accessible */}
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/test" element={<TestPage />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/services" element={<Services />} />
        <Route path="/contact" element={<Contact />} />
        
        {/* Patient Registration */}
        <Route 
          path="/patient-register" 
          element={!user ? <PatientRegister /> : user.role === 'patient' ? <Navigate to="/patient-dashboard" /> : <Navigate to="/home" />} 
        />
        
        {/* Patient Dashboard */}
        <Route 
          path="/patient-dashboard" 
          element={user && user.role === 'patient' ? <PatientDashboard patient={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
        />

        {/* Unified Login for Patients, Doctors, and Staff (NOT Admin) */}
        <Route 
          path="/login" 
          element={
            !user ? (
              <UnifiedLogin onLogin={setUser} />
            ) : user.role === 'doctor' ? (
              <Navigate to="/doctor-dashboard" />
            ) : user.role === 'patient' ? (
              <Navigate to="/patient-dashboard" />
            ) : user.role === 'admin' ? (
              <Navigate to="/admin" />
            ) : (
              <Navigate to="/dashboard" />
            )
          } 
        />

        {/* Admin Routes - Login and Dashboard through /admin */}
        <Route 
          path="/admin" 
          element={
            !user ? (
              <AdminLogin onLogin={setUser} />
            ) : user.role === 'admin' ? (
              <div className="flex h-screen bg-gray-50">
                <AdminSidebar onLogout={handleLogout} />
                <div className="flex-1 overflow-auto">
                  <AdminDashboard user={user} />
                </div>
              </div>
            ) : (
              <Navigate to="/home" />
            )
          } 
        />

        {/* Legacy admin-login route - redirect to /admin */}
        <Route path="/admin-login" element={<Navigate to="/admin" />} />

        {/* Manage Users Route (Admin only) */}
        <Route 
          path="/manage-users" 
          element={
            user && user.role === 'admin' ? (
              <div className="flex h-screen bg-gray-50">
                <AdminSidebar onLogout={handleLogout} />
                <div className="flex-1 overflow-auto">
                  <ManageUsers />
                </div>
              </div>
            ) : (
              <Navigate to="/admin" />
            )
          } 
        />

        {/* Doctor Dashboard */}
        <Route 
          path="/doctor-dashboard" 
          element={
            user && user.role === 'doctor' ? (
              <DoctorDashboard user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          } 
        />

        {/* Triage Dashboard - Standalone like Doctor Dashboard */}
        <Route 
          path="/triage-dashboard" 
          element={
            user && (user.role === 'nurse' || user.role === 'receptionist' || user.role === 'admin') ? (
              <TriageDashboard user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          } 
        />

        {/* Receptionist Dashboard - Standalone */}
        <Route 
          path="/receptionist-dashboard" 
          element={
            user && user.role === 'receptionist' ? (
              <ReceptionistDashboard user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          } 
        />

        {/* Pharmacy Dashboard - Standalone */}
        <Route 
          path="/pharmacy-dashboard" 
          element={
            user && user.role === 'pharmacist' ? (
              <PharmacyDashboard user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          } 
        />

        {/* Laboratory Dashboard - Standalone */}
        <Route 
          path="/laboratory-dashboard" 
          element={
            user && user.role === 'lab_technician' ? (
              <LaboratoryDashboard user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          } 
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/home" />} />
      </Routes>
    </Router>
    </LanguageProvider>
  );
}

export default App;
