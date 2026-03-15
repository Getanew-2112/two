import React, { useState, useEffect } from 'react';
import DoctorAssignment from '../components/DoctorAssignment';

const TriageDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [triageRecords, setTriageRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState({
    total_triage: 0,
    green: 0,
    yellow: 0,
    orange: 0,
    red: 0
  });
  const [formData, setFormData] = useState({
    patient_id: '',
    blood_pressure_systolic: '',
    blood_pressure_diastolic: '',
    heart_rate: '',
    temperature: '',
    weight: '',
    height: '',
    oxygen_saturation: '',
    respiratory_rate: '',
    chief_complaint: '',
    triage_category: 'green',
    notes: ''
  });
  const [currentTriageId, setCurrentTriageId] = useState(null);
  const [assignedDoctor, setAssignedDoctor] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch triage records
      const triageResponse = await fetch('http://localhost:5000/api/triage/today', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (triageResponse.ok) {
        const data = await triageResponse.json();
        setTriageRecords(data);
      }

      // Fetch stats
      const statsResponse = await fetch('http://localhost:5000/api/triage/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (statsResponse.ok) {
        const data = await statsResponse.json();
        setStats(data);
      }

      // Fetch patients
      const patientsResponse = await fetch('http://localhost:5000/api/patients', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (patientsResponse.ok) {
        const data = await patientsResponse.json();
        setPatients(data.patients || []);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/triage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentTriageId(data.triage?.id || null);
        alert('Triage record created successfully!');
        fetchDashboardData();
        
        // Don't close modal yet - allow doctor assignment
        // setShowModal(false);
      }
    } catch (error) {
      console.error('Error creating triage record:', error);
      alert('Failed to create triage record');
    }
  };

  const handleDoctorAssignment = (doctor) => {
    setAssignedDoctor(doctor);
    // Close modal after successful assignment
    setTimeout(() => {
      setShowModal(false);
      setCurrentTriageId(null);
      setAssignedDoctor(null);
      setFormData({
        patient_id: '',
        blood_pressure_systolic: '',
        blood_pressure_diastolic: '',
        heart_rate: '',
        temperature: '',
        weight: '',
        height: '',
        oxygen_saturation: '',
        respiratory_rate: '',
        chief_complaint: '',
        triage_category: 'green',
        notes: ''
      });
    }, 1500);
  };

  const handleSendTriageToDoctor = async (triageRecord) => {
    try {
      // Check if doctor is assigned
      if (!triageRecord.assigned_doctor_id) {
        alert('Please assign a doctor first before sending triage data');
        return;
      }

      const token = localStorage.getItem('token');
      
      // Since the notification system is designed for patients only,
      // we'll just mark the triage as "sent to doctor" by logging it
      // The doctor can view the triage data in their "Patient History" tab
      
      console.log('Triage data ready for doctor:');
      console.log(`Patient: ${triageRecord.patient_first_name} ${triageRecord.patient_last_name}`);
      console.log(`Priority: ${triageRecord.triage_category.toUpperCase()}`);
      console.log(`Vital Signs:`, {
        blood_pressure: `${triageRecord.blood_pressure_systolic}/${triageRecord.blood_pressure_diastolic}`,
        heart_rate: triageRecord.heart_rate,
        temperature: triageRecord.temperature,
        weight: triageRecord.weight
      });
      
      // In a production system, you would:
      // 1. Send email to doctor's email address
      // 2. Create a staff notification system
      // 3. Use WebSocket for real-time updates
      
      alert(`Triage data is now available for the assigned doctor.\n\nThe doctor can view this patient's complete triage history in their "Patient History" tab by selecting:\n${triageRecord.patient_first_name} ${triageRecord.patient_last_name} (${triageRecord.patient_id})`);
      
    } catch (error) {
      console.error('Error processing triage data:', error);
      alert('Failed to process triage data');
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'green': return 'bg-green-100 text-green-800 border-green-500';
      case 'yellow': return 'bg-yellow-100 text-yellow-800 border-yellow-500';
      case 'orange': return 'bg-orange-100 text-orange-800 border-orange-500';
      case 'red': return 'bg-red-100 text-red-800 border-red-500';
      default: return 'bg-gray-100 text-gray-800 border-gray-500';
    }
  };

  const calculateBMI = () => {
    if (formData.weight && formData.height) {
      const weight = parseFloat(formData.weight);
      const height = parseFloat(formData.height) / 100;
      return (weight / (height * height)).toFixed(2);
    }
    return '';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-slate-800 text-white min-h-screen">
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">🏥</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">Triage</h1>
              <h2 className="text-lg font-semibold">Management</h2>
            </div>
          </div>
        </div>

        <nav className="mt-8">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-blue-600 border-l-4 border-blue-400'
                : 'hover:bg-slate-700'
            }`}
          >
            <span className="mr-3">📊</span>
            Dashboard
          </button>
          
          <button
            onClick={() => setActiveTab('triage')}
            className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
              activeTab === 'triage'
                ? 'bg-blue-600 border-l-4 border-blue-400'
                : 'hover:bg-slate-700'
            }`}
          >
            <span className="mr-3">🩺</span>
            Triage Records
          </button>
          
          <button
            onClick={() => setActiveTab('vitals')}
            className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
              activeTab === 'vitals'
                ? 'bg-blue-600 border-l-4 border-blue-400'
                : 'hover:bg-slate-700'
            }`}
          >
            <span className="mr-3">❤️</span>
            Vital Signs
          </button>
          
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
              activeTab === 'portfolio'
                ? 'bg-blue-600 border-l-4 border-blue-400'
                : 'hover:bg-slate-700'
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
              <h2 className="text-2xl font-bold text-gray-900">Triage Dashboard</h2>
              <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleTimeString()}</p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-gray-500">Triage Nurse</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
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
          {activeTab === 'dashboard' && (
            <div>
              {/* Welcome Banner */}
              <div className="bg-gradient-to-r from-blue-400 to-green-500 rounded-xl shadow-lg p-8 mb-8 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">Welcome, {user?.firstName}!</h1>
                    <p className="text-lg text-white opacity-90">Monitor patient vitals and triage status</p>
                  </div>
                  <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <span className="text-5xl">🩺</span>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Triage</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.total_triage || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">📋</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Green</p>
                      <p className="text-3xl font-bold text-green-600">{stats.green || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">🟢</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Yellow</p>
                      <p className="text-3xl font-bold text-yellow-600">{stats.yellow || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">🟡</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Orange</p>
                      <p className="text-3xl font-bold text-orange-600">{stats.orange || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">🟠</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Red</p>
                      <p className="text-3xl font-bold text-red-600">{stats.red || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">🔴</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Triage Records */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Recent Triage Records</h3>
                  <button
                    onClick={() => setShowModal(true)}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
                  >
                    + New Triage
                  </button>
                </div>

                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="text-gray-600 mt-4">Loading records...</p>
                  </div>
                ) : triageRecords.length === 0 ? (
                  <div className="text-center py-12">
                    <span className="text-6xl mb-4 block">🩺</span>
                    <p className="text-gray-600 text-lg">No triage records today</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {triageRecords.slice(0, 5).map((record) => (
                      <div
                        key={record.id}
                        className={`flex items-center justify-between p-4 rounded-lg border-l-4 ${getCategoryColor(record.triage_category)}`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 font-bold">
                            {record.patient_first_name?.charAt(0)}{record.patient_last_name?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {record.patient_first_name} {record.patient_last_name}
                            </p>
                            <p className="text-sm text-gray-600">{record.patient_id}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-6">
                          <div className="text-sm">
                            <p className="text-gray-600">BP: {record.blood_pressure_systolic}/{record.blood_pressure_diastolic}</p>
                            <p className="text-gray-600">HR: {record.heart_rate} bpm</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(record.triage_category)}`}>
                            {record.triage_category.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'triage' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">All Triage Records</h3>
                <button
                  onClick={() => setShowModal(true)}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
                >
                  + New Triage
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vitals</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chief Complaint</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {triageRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(record.created_at).toLocaleTimeString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {record.patient_first_name} {record.patient_last_name}
                          </div>
                          <div className="text-sm text-gray-500">{record.patient_id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="text-xs space-y-1">
                            <div>BP: {record.blood_pressure_systolic}/{record.blood_pressure_diastolic}</div>
                            <div>HR: {record.heart_rate} bpm | Temp: {record.temperature}°C</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getCategoryColor(record.triage_category)}`}>
                            {record.triage_category.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {record.chief_complaint}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleSendTriageToDoctor(record)}
                            className={`px-3 py-1 rounded-md transition-colors text-xs font-medium ${
                              record.assigned_doctor_id 
                                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                            title={record.assigned_doctor_id ? "Send triage data to assigned doctor" : "Assign a doctor first"}
                            disabled={!record.assigned_doctor_id}
                          >
                            📤 Send to Doctor
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'vitals' && (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Vital Signs Monitoring</h3>
              <p className="text-gray-600">Monitor and track patient vital signs in real-time.</p>
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
                  <p className="text-lg text-gray-900">Triage Nurse</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* New Triage Record Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-screen overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">New Triage Record</h3>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
                  <select
                    value={formData.patient_id}
                    onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Patient</option>
                    {patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.first_name} {patient.last_name} ({patient.patient_id})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chief Complaint</label>
                  <input
                    type="text"
                    value={formData.chief_complaint}
                    onChange={(e) => setFormData({ ...formData, chief_complaint: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Main reason for visit"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Blood Pressure (Systolic/Diastolic)</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={formData.blood_pressure_systolic}
                      onChange={(e) => setFormData({ ...formData, blood_pressure_systolic: e.target.value })}
                      className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Systolic"
                      min="50"
                      max="250"
                      required
                    />
                    <input
                      type="number"
                      value={formData.blood_pressure_diastolic}
                      onChange={(e) => setFormData({ ...formData, blood_pressure_diastolic: e.target.value })}
                      className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Diastolic"
                      min="30"
                      max="150"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Heart Rate (bpm)</label>
                  <input
                    type="number"
                    value={formData.heart_rate}
                    onChange={(e) => setFormData({ ...formData, heart_rate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="60-100"
                    min="30"
                    max="200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Temperature (°C)</label>
                  <input
                    type="number"
                    value={formData.temperature}
                    onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="36.5-37.5"
                    min="35"
                    max="42"
                    step="0.1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg) & Height (cm)</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Weight"
                      min="0"
                      max="300"
                      step="0.1"
                      required
                    />
                    <input
                      type="number"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                      className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Height"
                      min="0"
                      max="250"
                    />
                  </div>
                  {calculateBMI() && (
                    <p className="text-sm text-gray-600 mt-1">BMI: {calculateBMI()}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Oxygen Saturation (%) & Respiratory Rate</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={formData.oxygen_saturation}
                      onChange={(e) => setFormData({ ...formData, oxygen_saturation: e.target.value })}
                      className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="SpO2"
                      min="70"
                      max="100"
                    />
                    <input
                      type="number"
                      value={formData.respiratory_rate}
                      onChange={(e) => setFormData({ ...formData, respiratory_rate: e.target.value })}
                      className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="RR"
                      min="5"
                      max="40"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Triage Category</label>
                  <select
                    value={formData.triage_category}
                    onChange={(e) => setFormData({ ...formData, triage_category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="green">🟢 Green - Non-urgent</option>
                    <option value="yellow">🟡 Yellow - Urgent</option>
                    <option value="orange">🟠 Orange - Very Urgent</option>
                    <option value="red">🔴 Red - Immediate</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Additional observations..."
                  />
                </div>
              </div>

              {/* Doctor Assignment Section */}
              {currentTriageId && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <DoctorAssignment
                    triageId={currentTriageId}
                    currentDoctor={assignedDoctor}
                    onAssignmentChange={handleDoctorAssignment}
                  />
                </div>
              )}

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setCurrentTriageId(null);
                    setAssignedDoctor(null);
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  {currentTriageId ? 'Close' : 'Cancel'}
                </button>
                {!currentTriageId && (
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Save Triage Record
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TriageDashboard;
