import React, { useState, useEffect } from 'react';

const PharmacyDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [prescriptions, setPrescriptions] = useState([]);
  const [stats, setStats] = useState({
    pending: 0,
    dispensed: 0,
    total: 0
  });
  const [loading, setLoading] = useState(true);
  const [showDispenseModal, setShowDispenseModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/prescriptions/active', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPrescriptions(data || []);
        setStats({
          pending: data?.filter(p => p.status === 'active').length || 0,
          dispensed: data?.filter(p => p.status === 'dispensed').length || 0,
          total: data?.length || 0
        });
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const handleDispense = async (prescriptionId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/prescriptions/${prescriptionId}/dispense`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({})
      });

      if (response.ok) {
        alert('Prescription dispensed successfully!');
        setShowDispenseModal(false);
        setSelectedPrescription(null);
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error dispensing prescription:', error);
      alert('Failed to dispense prescription');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-yellow-100 text-yellow-800 border-yellow-500';
      case 'dispensed': return 'bg-green-100 text-green-800 border-green-500';
      case 'expired': return 'bg-red-100 text-red-800 border-red-500';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-500';
      default: return 'bg-gray-100 text-gray-800 border-gray-500';
    }
  };

  const filteredPrescriptions = prescriptions.filter(prescription =>
    prescription.patient_first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prescription.patient_last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prescription.medication_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-slate-800 text-white min-h-screen">
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-teal-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">💊</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">Pharmacy</h1>
              <h2 className="text-lg font-semibold">Management</h2>
            </div>
          </div>
        </div>

        <nav className="mt-8">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
              activeTab === 'dashboard' ? 'bg-green-600 border-l-4 border-green-400' : 'hover:bg-slate-700'
            }`}
          >
            <span className="mr-3">📊</span>
            Dashboard
          </button>
          
          <button
            onClick={() => setActiveTab('prescriptions')}
            className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
              activeTab === 'prescriptions' ? 'bg-green-600 border-l-4 border-green-400' : 'hover:bg-slate-700'
            }`}
          >
            <span className="mr-3">📋</span>
            Prescriptions
          </button>
          
          <button
            onClick={() => setActiveTab('inventory')}
            className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
              activeTab === 'inventory' ? 'bg-green-600 border-l-4 border-green-400' : 'hover:bg-slate-700'
            }`}
          >
            <span className="mr-3">📦</span>
            Inventory
          </button>
          
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
              activeTab === 'portfolio' ? 'bg-green-600 border-l-4 border-green-400' : 'hover:bg-slate-700'
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
              <h2 className="text-2xl font-bold text-gray-900">Pharmacy Dashboard</h2>
              <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleTimeString()}</p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-gray-500">Pharmacist</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
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
              <div className="bg-gradient-to-r from-green-400 to-teal-500 rounded-xl shadow-lg p-8 mb-8 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">Welcome, {user?.firstName}!</h1>
                    <p className="text-lg text-white opacity-90">Manage prescriptions and medication dispensing</p>
                  </div>
                  <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <span className="text-5xl">💊</span>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 mb-1">Pending Prescriptions</p>
                      <p className="text-4xl font-bold text-yellow-600">{stats.pending}</p>
                    </div>
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                      <span className="text-3xl">⏳</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 mb-1">Dispensed Today</p>
                      <p className="text-4xl font-bold text-green-600">{stats.dispensed}</p>
                    </div>
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-3xl">✅</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 mb-1">Total Prescriptions</p>
                      <p className="text-4xl font-bold text-gray-900">{stats.total}</p>
                    </div>
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-3xl">📋</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Prescriptions */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Pending Prescriptions</h3>

                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
                    <p className="text-gray-600 mt-4">Loading prescriptions...</p>
                  </div>
                ) : prescriptions.filter(p => p.status === 'active').length === 0 ? (
                  <div className="text-center py-12">
                    <span className="text-6xl mb-4 block">💊</span>
                    <p className="text-gray-600 text-lg">No pending prescriptions</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {prescriptions.filter(p => p.status === 'active').slice(0, 5).map((prescription) => (
                      <div
                        key={prescription.id}
                        className="flex items-center justify-between p-4 rounded-lg border-l-4 bg-yellow-50 border-yellow-500"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <div>
                              <p className="font-semibold text-gray-900">
                                {prescription.patient_first_name} {prescription.patient_last_name}
                              </p>
                              <p className="text-sm text-gray-600">Dr. {prescription.doctor_first_name} {prescription.doctor_last_name}</p>
                            </div>
                          </div>
                          <div className="mt-2 grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium text-gray-700">Medication</p>
                              <p className="text-sm text-gray-900">{prescription.medication_name}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">Dosage</p>
                              <p className="text-sm text-gray-900">{prescription.dosage}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">Frequency</p>
                              <p className="text-sm text-gray-900">{prescription.frequency}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">Duration</p>
                              <p className="text-sm text-gray-900">{prescription.duration}</p>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedPrescription(prescription);
                            setShowDispenseModal(true);
                          }}
                          className="ml-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
                        >
                          Dispense
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'prescriptions' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">All Prescriptions</h3>
                <input
                  type="text"
                  placeholder="Search by patient or medication..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medication</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dosage</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPrescriptions.map((prescription) => (
                      <tr key={prescription.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {prescription.patient_first_name} {prescription.patient_last_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {prescription.medication_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {prescription.dosage}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          Dr. {prescription.doctor_first_name} {prescription.doctor_last_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(prescription.status)}`}>
                            {prescription.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {prescription.status === 'active' && (
                            <button
                              onClick={() => {
                                setSelectedPrescription(prescription);
                                setShowDispenseModal(true);
                              }}
                              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                            >
                              Dispense
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Medication Inventory</h3>
              <p className="text-gray-600">Manage medication stock levels and inventory.</p>
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
                  <p className="text-lg text-gray-900">Pharmacist</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Dispense Modal */}
      {showDispenseModal && selectedPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-semibold mb-4">Dispense Prescription</h3>
            
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
                  <p className="text-gray-900">{selectedPrescription.patient_first_name} {selectedPrescription.patient_last_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
                  <p className="text-gray-900">Dr. {selectedPrescription.doctor_first_name} {selectedPrescription.doctor_last_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Medication</label>
                  <p className="text-gray-900">{selectedPrescription.medication_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dosage</label>
                  <p className="text-gray-900">{selectedPrescription.dosage}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                  <p className="text-gray-900">{selectedPrescription.frequency}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                  <p className="text-gray-900">{selectedPrescription.duration}</p>
                </div>
              </div>
              
              {selectedPrescription.instructions && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
                  <p className="text-gray-900">{selectedPrescription.instructions}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDispenseModal(false);
                  setSelectedPrescription(null);
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDispense(selectedPrescription.id)}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                Confirm Dispense
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmacyDashboard;
