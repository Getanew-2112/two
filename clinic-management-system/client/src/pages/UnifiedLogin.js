import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import auth from '../services/auth';

const UnifiedLogin = ({ onLogin }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    emailOrUsername: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.emailOrUsername.trim()) {
      newErrors.emailOrUsername = 'Email or username is required';
    }
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Try patient login first (since patients use email only)
      const patientResponse = await fetch('http://localhost:5000/api/patients/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.emailOrUsername,
          password: formData.password
        }),
      });

      const patientData = await patientResponse.json();

      if (patientResponse.ok && patientData.patient) {
        // Patient login successful
        localStorage.setItem('user', JSON.stringify({
          ...patientData.patient,
          role: 'patient'
        }));
        window.location.href = '/patient-dashboard';
        return;
      }

      // If patient login fails, try staff login (but exclude admin)
      const staffResult = await auth.login(formData.emailOrUsername, formData.password);

      if (staffResult.success) {
        // Check if user is admin - reject admin login here
        if (staffResult.data.user.role === 'admin') {
          setErrors({ general: 'Admin users must login through the Admin Portal at /admin' });
          setLoading(false);
          return;
        }
        
        // Staff login successful (non-admin)
        const role = staffResult.data.user.role;
        if (role === 'doctor') {
          window.location.href = '/doctor-dashboard';
        } else if (role === 'receptionist') {
          window.location.href = '/receptionist-dashboard';
        } else if (role === 'nurse') {
          window.location.href = '/triage-dashboard';
        } else if (role === 'pharmacist') {
          window.location.href = '/pharmacy-dashboard';
        } else if (role === 'lab_technician') {
          window.location.href = '/laboratory-dashboard';
        } else {
          window.location.href = '/dashboard';
        }
        return;
      }

      // Both logins failed
      setErrors({ general: 'Invalid email/username or password' });
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ general: 'Login failed. Please check your credentials.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-0 left-[-10%] w-[40%] h-[40%] bg-blue-600/30 rounded-full blur-[120px] mix-blend-screen animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/30 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-indigo-500/20 rounded-full blur-[100px] mix-blend-screen animate-pulse" style={{ animationDelay: '4s' }}></div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        <div>
          <div className="mx-auto h-24 w-24 flex items-center justify-center rounded-2xl bg-white/5 backdrop-blur-xl border border-white/20 shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden">
            <img 
              src="/clinic-logo.jpg" 
              alt="Agmas Clinic Logo" 
              className="h-full w-full object-cover"
            />
          </div>
          <h2 className="mt-8 text-center text-4xl font-extrabold text-white tracking-tight">
            Welcome Back
          </h2>
          <p className="mt-3 text-center text-base text-blue-200 font-medium">
            Agmas Medium Clinic
          </p>
          <div className="mt-2 text-center">
            <p className="text-sm text-gray-400">
              For Patients, Doctors, and Staff
            </p>
          </div>
        </div>

        <form className="mt-8 space-y-6 bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]" onSubmit={handleSubmit}>
          <div className="space-y-5">
            <div>
              <label htmlFor="emailOrUsername" className="block text-sm font-medium text-gray-200 mb-2">
                Email or Username
              </label>
              <input
                id="emailOrUsername"
                name="emailOrUsername"
                type="text"
                required
                className={`appearance-none relative block w-full px-4 py-3 bg-white/5 border ${
                  errors.emailOrUsername ? 'border-red-400' : 'border-white/10'
                } placeholder-gray-400 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 focus:bg-white/10`}
                placeholder="Enter your email or username"
                value={formData.emailOrUsername}
                onChange={handleChange}
              />
              {errors.emailOrUsername && (
                <p className="mt-2 text-sm text-red-400 flex items-center">
                  <span className="mr-1">⚠️</span> {errors.emailOrUsername}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className={`appearance-none relative block w-full px-4 py-3 bg-white/5 border ${
                  errors.password ? 'border-red-400' : 'border-white/10'
                } placeholder-gray-400 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 focus:bg-white/10`}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && (
                <p className="mt-2 text-sm text-red-400 flex items-center">
                  <span className="mr-1">⚠️</span> {errors.password}
                </p>
              )}
            </div>
          </div>

          {errors.general && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl flex items-center backdrop-blur-md">
              <svg className="w-5 h-5 mr-3 flex-shrink-0 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">{errors.general}</span>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white ${
                loading
                  ? 'bg-white/20 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500 transform hover:-translate-y-1 transition-all duration-300 shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_25px_rgba(79,70,229,0.6)]'
              }`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Authenticating...
                </span>
              ) : (
                'Sign In Securely'
              )}
            </button>
          </div>

          <div className="text-center space-y-4 pt-4 border-t border-white/10">
            <p className="text-sm text-gray-400">
              New patient?{' '}
              <button
                type="button"
                onClick={() => navigate('/patient-register')}
                className="text-blue-400 hover:text-blue-300 font-semibold transition-colors focus:outline-none ml-1 hover:underline"
              >
                Register here
              </button>
            </p>

            <div className="flex justify-between items-center text-sm">
              <button
                type="button"
                onClick={() => navigate('/home')}
                className="text-gray-400 hover:text-white transition-colors flex items-center"
              >
                <span className="mr-1">←</span> Home
              </button>
              
              <button
                type="button"
                onClick={() => navigate('/admin')}
                className="text-gray-400 hover:text-red-400 transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Admin
              </button>
            </div>
          </div>
        </form>

        <div className="text-center">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <p className="text-xs text-blue-300 font-semibold tracking-wider uppercase mb-3 flex items-center justify-center">
              <span className="w-4 h-px bg-blue-400/50 mr-2"></span>
              Demo Credentials
              <span className="w-4 h-px bg-blue-400/50 ml-2"></span>
            </p>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex justify-between items-center px-4 py-2 bg-black/20 rounded-lg">
                <span className="font-medium text-blue-200">Doctor</span>
                <span className="font-mono text-xs opacity-75">doctor@gmail.com / doc12345</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedLogin;
