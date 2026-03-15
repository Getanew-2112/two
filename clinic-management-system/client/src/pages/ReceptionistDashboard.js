import React, { useState, useEffect } from 'react';
import PaymentVerification from '../components/PaymentVerification';

const ReceptionistDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [patients, setPatients] = useState([]);
  const [queueData, setQueueData] = useState([]);
  const [stats, setStats] = useState({
    todayPatients: 0,
    inQueue: 0,
    registered: 0
  });
  const [loading, setLoading] = useState(true);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showQueueModal, setShowQueueModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [registerForm, setRegisterForm] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: 'male',
    phone: '',
    email: '',
    address: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    blood_type: '',
    allergies: '',
    medical_history: ''
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch patients
      const patientsResponse = await fetch('http://localhost:5000/api/patients', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (patientsResponse.ok) {
        const data = await patientsResponse.json();
        setPatients(data.patients || []);
        setStats(prev => ({ ...prev, registered: data.patients?.length || 0 }));
      }

      // Fetch queue
      const queueResponse = await fetch('http://localhost:5000/api/queue', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (queueResponse.ok) {
        const queueData = await queueResponse.json();
        setQueueData(queueData);
        setStats(prev => ({ 
          ...prev, 
          inQueue: queueData.filter(q => q.status === 'waiting').length,
          todayPatients: queueData.length
        }));
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const handleRegisterPatient = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/patients/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(registerForm)
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Patient registered successfully!\nPatient ID: ${data.patient.patient_id}`);
        setShowRegisterModal(false);
        fetchDashboardData();
        setRegisterForm({
          first_name: '', last_name: '', date_of_birth: '', gender: 'male',
          phone: '', email: '', address: '', emergency_contact_name: '',
          emergency_contact_phone: '', blood_type: '', allergies: '', medical_history: ''
        });
      } else {
        const error = await response.json();
        alert(`Registration failed: ${error.message}`);
      }
    } catch (error) {
      console.error('Error registering patient:', error);
      alert('Failed to register patient');
    }
  };

  const handleAddToQueue = async (patientId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/queue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ patient_id: patientId })
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Patient added to queue!\nQueue Number: ${data.queue.queue_number}`);
        fetchDashboardData();
      } else {
        const error = await response.json();
        alert(`Failed to add to queue: ${error.message}`);
      }
    } catch (error) {
      console.error('Error adding to queue:', error);
      alert('Failed to add patient to queue');
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.patient_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-slate-800 text-white min-h-screen">
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">🏥</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">Reception</h1>
              <h2 className="text-lg font-semibold">Desk</h2>
            </div>
          </div>
        </div>

        <nav className="mt-8">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
              activeTab === 'dashboard' ? 'bg-purple-600 border-l-4 border-purple-400' : 'hover:bg-slate-700'
            }`}
          >
            <span className="mr-3">📊</span>
            Dashboard
          </button>
          
          <button
            onClick={() => setActiveTab('payments')}
            className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
              activeTab === 'payments' ? 'bg-purple-600 border-l-4 border-purple-400' : 'hover:bg-slate-700'
            }`}
          >
            <span className="mr-3">💳</span>
            Payment Verification
          </button>
          
          <button
            onClick={() => setActiveTab('patients')}
            className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
              activeTab === 'patients' ? 'bg-purple-600 border-l-4 border-purple-400' : 'hover:bg-slate-700'
            }`}
          >
            <span className="mr-3">👥</span>
            Patients
          </button>
          
          <button
            onClick={() => setActiveTab('queue')}
            className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
              activeTab === 'queue' ? 'bg-purple-600 border-l-4 border-purple-400' : 'hover:bg-slate-700'
            }`}
          >
            <span className="mr-3">📋</span>
            Queue Management
          </button>
          
          <button
            onClick={() => setActiveTab('appointments')}
            className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
              activeTab === 'appointments' ? 'bg-purple-600 border-l-4 border-purple-400' : 'hover:bg-slate-700'
            }`}
          >
            <span className="mr-3">📅</span>
            Appointments
          </button>
          
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
              activeTab === 'portfolio' ? 'bg-purple-600 border-l-4 border-purple-400' : 'hover:bg-slate-700'
            }`}
          >
            <span className="mr-3">👤</span>
            Portfolio
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="px-8 py-4 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Receptionist Dashboard</h2>
              <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleTimeString()}</p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-gray-500">Receptionist</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </div>
              <button
                onClick={onLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-8 overflow-auto">
          {activeTab === 'payments' && (
            <PaymentVerification onVerificationComplete={fetchDashboardData} />
          )}

          {activeTab === 'dashboard' && (
            <div>
              {/* Welcome Banner */}
              <div className="bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl shadow-lg p-8 mb-8 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">Welcome, {user?.firstName}!</h1>
                    <p className="text-lg text-white opacity-90">Manage patient registrations and appointments</p>
                  </div>
                  <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <span className="text-5xl">💼</span>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 mb-1">Today's Patients</p>
                      <p className="text-4xl font-bold text-gray-900">{stats.todayPatients}</p>
                    </div>
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-3xl">📅</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 mb-1">In Queue</p>
                      <p className="text-4xl font-bold text-gray-900">{stats.inQueue}</p>
                    </div>
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-3xl">⏳</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 mb-1">Registered Patients</p>
                      <p className="text-4xl font-bold text-gray-900">{stats.registered}</p>
                    </div>
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-3xl">👥</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => setShowRegisterModal(true)}
                      className="w-full px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-semibold flex items-center justify-center"
                    >
                      <span className="mr-2">➕</span>
                      Register New Patient
                    </button>
                    <button
                      onClick={() => setActiveTab('queue')}
                      className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold flex items-center justify-center"
                    >
                      <span className="mr-2">📋</span>
                      Manage Queue
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Current Queue</h3>
                  {queueData.filter(q => q.status === 'waiting').slice(0, 3).length === 0 ? (
                    <p className="text-gray-600 text-center py-4">No patients in queue</p>
                  ) : (
                    <div className="space-y-2">
                      {queueData.filter(q => q.status === 'waiting').slice(0, 3).map((patient) => (
                        <div key={patient.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                              {patient.queue_number}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{patient.patient_first_name} {patient.patient_last_name}</p>
                              <p className="text-xs text-gray-600">{patient.patient_id}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'patients' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Patient Records</h3>
                <button
                  onClick={() => setShowRegisterModal(true)}
                  className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-semibold"
                >
                  + Register Patient
                </button>
              </div>

              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search by name or patient ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gender</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPatients.map((patient) => (
                      <tr key={patient.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {patient.patient_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {patient.first_name} {patient.last_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{patient.phone}</div>
                          <div className="text-sm text-gray-500">{patient.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {patient.gender}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleAddToQueue(patient.id)}
                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            Add to Queue
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'queue' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Queue Management</h3>
              
              <div className="space-y-3">
                {queueData.filter(q => q.status === 'waiting').length === 0 ? (
                  <div className="text-center py-12">
                    <span className="text-6xl mb-4 block">📋</span>
                    <p className="text-gray-600 text-lg">No patients in queue</p>
                  </div>
                ) : (
                  queueData.filter(q => q.status === 'waiting').map((patient, index) => (
                    <div
                      key={patient.id}
                      className={`flex items-center justify-between p-4 rounded-lg border-l-4 ${
                        index === 0 ? 'bg-blue-50 border-blue-500' : 'bg-gray-50 border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                          index === 0 ? 'bg-blue-500' : 'bg-gray-400'
                        }`}>
                          {patient.queue_number}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {patient.patient_first_name} {patient.patient_last_name}
                          </p>
                          <p className="text-sm text-gray-600">{patient.patient_id}</p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(patient.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'appointments' && (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Appointment Scheduling</h3>
              <p className="text-gray-600">Schedule and manage patient appointments.</p>
            </div>
          )}

          {activeTab === 'portfolio' && (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">My Portfolio</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <p className="text-lg text-gray-900">{user?.firstName} {user?.lastName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <p className="text-lg text-gray-900">{user?.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <p className="text-lg text-gray-900">Receptionist</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Register Patient Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-screen overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Register New Patient</h3>
            <form onSubmit={handleRegisterPatient}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    value={registerForm.first_name}
                    onChange={(e) => setRegisterForm({ ...registerForm, first_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    value={registerForm.last_name}
                    onChange={(e) => setRegisterForm({ ...registerForm, last_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    value={registerForm.date_of_birth}
                    onChange={(e) => setRegisterForm({ ...registerForm, date_of_birth: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                  <select
                    value={registerForm.gender}
                    onChange={(e) => setRegisterForm({ ...registerForm, gender: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    value={registerForm.phone}
                    onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    value={registerForm.address}
                    onChange={(e) => setRegisterForm({ ...registerForm, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Name</label>
                  <input
                    type="text"
                    value={registerForm.emergency_contact_name}
                    onChange={(e) => setRegisterForm({ ...registerForm, emergency_contact_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Phone</label>
                  <input
                    type="tel"
                    value={registerForm.emergency_contact_phone}
                    onChange={(e) => setRegisterForm({ ...registerForm, emergency_contact_phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Blood Type</label>
                  <select
                    value={registerForm.blood_type}
                    onChange={(e) => setRegisterForm({ ...registerForm, blood_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select Blood Type</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Allergies</label>
                  <input
                    type="text"
                    value={registerForm.allergies}
                    onChange={(e) => setRegisterForm({ ...registerForm, allergies: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., Penicillin, Peanuts"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Medical History</label>
                  <textarea
                    value={registerForm.medical_history}
                    onChange={(e) => setRegisterForm({ ...registerForm, medical_history: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows="3"
                    placeholder="Previous conditions, surgeries, etc."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
                >
                  Register Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceptionistDashboard;
