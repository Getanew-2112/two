import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PatientRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    bloodType: '',
    allergies: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [patientId, setPatientId] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';

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
      const response = await fetch('http://localhost:5000/api/patients/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setPatientId(data.patient.patientId);
        
        // Store patient info and token
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.patient));
        
        // Redirect to patient dashboard after 3 seconds
        setTimeout(() => {
          window.location.href = '/patient-dashboard';
        }, 3000);
      } else {
        setErrors({ general: data.message || 'Registration failed' });
      }
    } catch (error) {
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-0 left-[-10%] w-[40%] h-[40%] bg-blue-600/30 rounded-full blur-[120px] mix-blend-screen animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/30 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        <div className="max-w-md w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] p-10 text-center relative z-10 transition-all duration-500">
          <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(52,211,153,0.5)] transform hover:scale-110 transition-transform">
            <span className="text-5xl text-white drop-shadow-md">✓</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-4 tracking-tight">Registration Successful!</h2>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 backdrop-blur-sm">
            <p className="text-sm text-blue-200 mb-2 font-medium uppercase tracking-wider">Your Patient ID:</p>
            <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 drop-shadow-sm">{patientId}</p>
          </div>
          <p className="text-gray-300 mb-6 font-medium">
            Please save your Patient ID for future reference.
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-blue-300">
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Redirecting to your secure dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  const inputClasses = (errorField) => `appearance-none relative block w-full px-4 py-3 bg-white/5 border ${
    errorField ? 'border-red-400' : 'border-white/10'
  } placeholder-gray-400 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 focus:bg-white/10`;

  const labelClasses = "block text-sm font-medium text-gray-200 mb-2";

  return (
    <div className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-0 left-[-10%] w-[40%] h-[40%] bg-blue-600/30 rounded-full blur-[120px] mix-blend-screen animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/30 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-[30%] right-[20%] w-[30%] h-[30%] bg-emerald-500/20 rounded-full blur-[100px] mix-blend-screen animate-pulse" style={{ animationDelay: '4s' }}></div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center shadow-xl transform hover:scale-105 transition-transform overflow-hidden">
              <img 
                src="/clinic-logo.jpg" 
                alt="Agmas Clinic Logo" 
                className="h-full w-full object-cover"
              />
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">Patient Registration</h1>
          </div>
          <p className="text-blue-200 text-lg font-medium">Create your secure account to access our healthcare services</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] p-8 sm:p-10">
          <form onSubmit={handleSubmit} className="space-y-10">
            {errors.general && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-200 px-5 py-4 rounded-xl flex items-center backdrop-blur-md">
                <svg className="w-6 h-6 mr-3 flex-shrink-0 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-base font-medium">{errors.general}</span>
              </div>
            )}

            {/* Personal Information */}
            <div className="bg-white/5 border border-white/10 p-6 sm:p-8 rounded-2xl">
              <div className="flex items-center mb-6 border-b border-white/10 pb-4">
                <span className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold mr-3 border border-blue-500/30">1</span>
                <h3 className="text-xl font-bold text-white tracking-wide">Personal Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClasses}>
                    First Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={inputClasses(errors.firstName)}
                    placeholder="John"
                  />
                  {errors.firstName && <p className="mt-2 text-sm text-red-400 flex items-center"><span className="mr-1">⚠️</span>{errors.firstName}</p>}
                </div>

                <div>
                  <label className={labelClasses}>
                    Last Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={inputClasses(errors.lastName)}
                    placeholder="Doe"
                  />
                  {errors.lastName && <p className="mt-2 text-sm text-red-400 flex items-center"><span className="mr-1">⚠️</span>{errors.lastName}</p>}
                </div>

                <div>
                  <label className={labelClasses}>
                    Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={inputClasses(errors.email)}
                    placeholder="john.doe@example.com"
                  />
                  {errors.email && <p className="mt-2 text-sm text-red-400 flex items-center"><span className="mr-1">⚠️</span>{errors.email}</p>}
                </div>

                <div>
                  <label className={labelClasses}>
                    Phone Number <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={inputClasses(errors.phone)}
                    placeholder="+251 912 345 678"
                  />
                  {errors.phone && <p className="mt-2 text-sm text-red-400 flex items-center"><span className="mr-1">⚠️</span>{errors.phone}</p>}
                </div>

                <div>
                  <label className={labelClasses}>
                    Date of Birth <span className="text-red-400">*</span>
                  </label>
                  {/* Style fix for date input icon across browsers */}
                  <style>{`
                    input[type="date"]::-webkit-calendar-picker-indicator {
                      filter: invert(1);
                      opacity: 0.6;
                      cursor: pointer;
                    }
                    input[type="date"]::-webkit-calendar-picker-indicator:hover {
                      opacity: 1;
                    }
                  `}</style>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className={inputClasses(errors.dateOfBirth)}
                  />
                  {errors.dateOfBirth && <p className="mt-2 text-sm text-red-400 flex items-center"><span className="mr-1">⚠️</span>{errors.dateOfBirth}</p>}
                </div>

                <div>
                  <label className={labelClasses}>
                    Gender <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className={`${inputClasses(errors.gender)} appearance-none`}
                    style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%239CA3AF\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")', backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
                  >
                    <option value="" className="bg-slate-800 text-gray-400">Select Gender</option>
                    <option value="male" className="bg-slate-800 text-white">Male</option>
                    <option value="female" className="bg-slate-800 text-white">Female</option>
                    <option value="other" className="bg-slate-800 text-white">Other</option>
                  </select>
                  {errors.gender && <p className="mt-2 text-sm text-red-400 flex items-center"><span className="mr-1">⚠️</span>{errors.gender}</p>}
                </div>
              </div>
            </div>

            {/* Account Security */}
            <div className="bg-white/5 border border-white/10 p-6 sm:p-8 rounded-2xl">
              <div className="flex items-center mb-6 border-b border-white/10 pb-4">
                <span className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold mr-3 border border-purple-500/30">2</span>
                <h3 className="text-xl font-bold text-white tracking-wide">Account Security</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClasses}>
                    Password <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={inputClasses(errors.password)}
                    placeholder="Min. 6 characters"
                  />
                  {errors.password && <p className="mt-2 text-sm text-red-400 flex items-center"><span className="mr-1">⚠️</span>{errors.password}</p>}
                </div>

                <div>
                  <label className={labelClasses}>
                    Confirm Password <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={inputClasses(errors.confirmPassword)}
                    placeholder="Re-enter password"
                  />
                  {errors.confirmPassword && <p className="mt-2 text-sm text-red-400 flex items-center"><span className="mr-1">⚠️</span>{errors.confirmPassword}</p>}
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-white/5 border border-white/10 p-6 sm:p-8 rounded-2xl">
              <div className="flex items-center mb-6 border-b border-white/10 pb-4">
                <span className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold mr-3 border border-emerald-500/30">3</span>
                <h3 className="text-xl font-bold text-white tracking-wide">Additional Information <span className="text-sm font-normal text-gray-400 ml-2">(Optional)</span></h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className={labelClasses}>
                    Address
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows="2"
                    className={inputClasses()}
                    placeholder="Street address, City"
                  />
                </div>

                <div>
                  <label className={labelClasses}>
                    Emergency Contact Name
                  </label>
                  <input
                    type="text"
                    name="emergencyContactName"
                    value={formData.emergencyContactName}
                    onChange={handleChange}
                    className={inputClasses()}
                    placeholder="Contact person name"
                  />
                </div>

                <div>
                  <label className={labelClasses}>
                    Emergency Contact Phone
                  </label>
                  <input
                    type="tel"
                    name="emergencyContactPhone"
                    value={formData.emergencyContactPhone}
                    onChange={handleChange}
                    className={inputClasses()}
                    placeholder="Emergency phone number"
                  />
                </div>

                <div>
                  <label className={labelClasses}>
                    Blood Type
                  </label>
                  <select
                    name="bloodType"
                    value={formData.bloodType}
                    onChange={handleChange}
                    className={`${inputClasses()} appearance-none`}
                    style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%239CA3AF\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")', backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
                  >
                    <option value="" className="bg-slate-800 text-gray-400">Select Blood Type</option>
                    <option value="A+" className="bg-slate-800 text-white">A+</option>
                    <option value="A-" className="bg-slate-800 text-white">A-</option>
                    <option value="B+" className="bg-slate-800 text-white">B+</option>
                    <option value="B-" className="bg-slate-800 text-white">B-</option>
                    <option value="AB+" className="bg-slate-800 text-white">AB+</option>
                    <option value="AB-" className="bg-slate-800 text-white">AB-</option>
                    <option value="O+" className="bg-slate-800 text-white">O+</option>
                    <option value="O-" className="bg-slate-800 text-white">O-</option>
                  </select>
                </div>

                <div>
                  <label className={labelClasses}>
                    Allergies
                  </label>
                  <input
                    type="text"
                    name="allergies"
                    value={formData.allergies}
                    onChange={handleChange}
                    className={inputClasses()}
                    placeholder="Any known allergies"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button & Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-white/10 gap-6">
              <button
                type="button"
                onClick={() => navigate('/home')}
                className="order-2 sm:order-1 px-6 py-3.5 bg-white/5 border border-white/10 text-gray-300 rounded-xl hover:bg-white/10 hover:text-white transition-colors duration-300 font-medium w-full sm:w-auto flex justify-center items-center"
              >
                <span className="mr-2">←</span> Back to Home
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className={`order-1 sm:order-2 w-full sm:w-auto px-10 py-3.5 rounded-xl text-white font-bold transition-all duration-300 ${
                  loading
                    ? 'bg-white/20 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500 transform hover:-translate-y-1 shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_25px_rgba(79,70,229,0.6)]'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Registering...
                  </span>
                ) : (
                  'Create Account securely'
                )}
              </button>
            </div>

            <div className="text-center pt-6">
              <p className="text-sm text-gray-400">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-blue-400 hover:text-blue-300 font-semibold transition-colors focus:outline-none hover:underline ml-1"
                >
                  Login here
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PatientRegister;
