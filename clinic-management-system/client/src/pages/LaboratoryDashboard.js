import React, { useState, useEffect } from 'react';

const LaboratoryDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [labTests, setLabTests] = useState([]);
  const [stats, setStats] = useState({
    pending: 0,
    inProgress: 0,
    completed: 0,
    total: 0
  });
  const [loading, setLoading] = useState(true);
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [resultForm, setResultForm] = useState({
    results: '',
    normal_range: ''
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/lab-tests', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setLabTests(data || []);
        setStats({
          pending: data?.filter(t => t.status === 'pending').length || 0,
          inProgress: data?.filter(t => t.status === 'in_progress').length || 0,
          completed: data?.filter(t => t.status === 'completed').length || 0,
          total: data?.length || 0
        });
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const handleStartTest = async (testId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/lab-tests/${testId}/start`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('Test started successfully!');
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error starting test:', error);
      alert('Failed to start test');
    }
  };

  const handleSubmitResults = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/lab-tests/${selectedTest.id}/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(resultForm)
      });

      if (response.ok) {
        alert('Test results submitted successfully!');
        setShowResultModal(false);
        setSelectedTest(null);
        setResultForm({ results: '', normal_range: '' });
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error submitting results:', error);
      alert('Failed to submit results');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-500';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-500';
      case 'completed': return 'bg-green-100 text-green-800 border-green-500';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-500';
      default: return 'bg-gray-100 text-gray-800 border-gray-500';
    }
  };

  const filteredTests = labTests.filter(test =>
    test.patient_first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    test.patient_last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    test.test_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-slate-800 text-white min-h-screen">
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">🔬</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">Laboratory</h1>
              <h2 className="text-lg font-semibold">Management</h2>
            </div>
          </div>
        </div>

        <nav className="mt-8">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
              activeTab === 'dashboard' ? 'bg-blue-600 border-l-4 border-blue-400' : 'hover:bg-slate-700'
            }`}
          >
            <span className="mr-3">📊</span>
            Dashboard
          </button>
          
          <button
            onClick={() => setActiveTab('tests')}
            className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
              activeTab === 'tests' ? 'bg-blue-600 border-l-4 border-blue-400' : 'hover:bg-slate-700'
            }`}
          >
            <span className="mr-3">🧪</span>
            Lab Tests
          </button>
          
          <button
            onClick={() => setActiveTab('results')}
            className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
              activeTab === 'results' ? 'bg-blue-600 border-l-4 border-blue-400' : 'hover:bg-slate-700'
            }`}
          >
            <span className="mr-3">📋</span>
            Results
          </button>
          
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
              activeTab === 'portfolio' ? 'bg-blue-600 border-l-4 border-blue-400' : 'hover:bg-slate-700'
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
              <h2 className="text-2xl font-bold text-gray-900">Laboratory Dashboard</h2>
              <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleTimeString()}</p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-gray-500">Lab Technician</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
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
              <div className="bg-gradient-to-r from-blue-400 to-indigo-500 rounded-xl shadow-lg p-8 mb-8 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">Welcome, {user?.firstName}!</h1>
                    <p className="text-lg text-white opacity-90">Manage laboratory tests and results</p>
                  </div>
                  <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <span className="text-5xl">🔬</span>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 mb-1">Pending Tests</p>
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
                      <p className="text-gray-600 mb-1">In Progress</p>
                      <p className="text-4xl font-bold text-blue-600">{stats.inProgress}</p>
                    </div>
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-3xl">🧪</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 mb-1">Completed</p>
                      <p className="text-4xl font-bold text-green-600">{stats.completed}</p>
                    </div>
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-3xl">✅</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 mb-1">Total Tests</p>
                      <p className="text-4xl font-bold text-gray-900">{stats.total}</p>
                    </div>
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-3xl">📊</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pending Tests */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Pending Lab Tests</h3>

                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="text-gray-600 mt-4">Loading tests...</p>
                  </div>
                ) : labTests.filter(t => t.status === 'pending').length === 0 ? (
                  <div className="text-center py-12">
                    <span className="text-6xl mb-4 block">🔬</span>
                    <p className="text-gray-600 text-lg">No pending tests</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {labTests.filter(t => t.status === 'pending').slice(0, 5).map((test) => (
                      <div
                        key={test.id}
                        className="flex items-center justify-between p-4 rounded-lg border-l-4 bg-yellow-50 border-yellow-500"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <div>
                              <p className="font-semibold text-gray-900">
                                {test.patient_first_name} {test.patient_last_name}
                              </p>
                              <p className="text-sm text-gray-600">Ordered by: Dr. {test.doctor_first_name} {test.doctor_last_name}</p>
                            </div>
                          </div>
                          <div className="mt-2 grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium text-gray-700">Test Type</p>
                              <p className="text-sm text-gray-900">{test.test_type}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">Test Name</p>
                              <p className="text-sm text-gray-900">{test.test_name}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">Requested</p>
                              <p className="text-sm text-gray-900">{new Date(test.requested_at).toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleStartTest(test.id)}
                          className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
                        >
                          Start Test
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'tests' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">All Lab Tests</h3>
                <input
                  type="text"
                  placeholder="Search by patient or test name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Test</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTests.map((test) => (
                      <tr key={test.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {test.patient_first_name} {test.patient_last_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{test.test_name}</div>
                          <div className="text-xs text-gray-500">{test.test_type}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          Dr. {test.doctor_first_name} {test.doctor_last_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(test.requested_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(test.status)}`}>
                            {test.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                          {test.status === 'pending' && (
                            <button
                              onClick={() => handleStartTest(test.id)}
                              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                              Start
                            </button>
                          )}
                          {test.status === 'in_progress' && (
                            <button
                              onClick={() => {
                                setSelectedTest(test);
                                setShowResultModal(true);
                              }}
                              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                            >
                              Submit Results
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

          {activeTab === 'results' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Completed Test Results</h3>
              
              <div className="space-y-4">
                {labTests.filter(t => t.status === 'completed').length === 0 ? (
                  <div className="text-center py-12">
                    <span className="text-6xl mb-4 block">📋</span>
                    <p className="text-gray-600 text-lg">No completed tests</p>
                  </div>
                ) : (
                  labTests.filter(t => t.status === 'completed').map((test) => (
                    <div key={test.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {test.patient_first_name} {test.patient_last_name}
                          </p>
                          <p className="text-sm text-gray-600">{test.test_name}</p>
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                          COMPLETED
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Results:</p>
                          <p className="text-gray-900">{test.results || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Normal Range:</p>
                          <p className="text-gray-900">{test.normal_range || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Completed:</p>
                          <p className="text-gray-900">{test.completed_at ? new Date(test.completed_at).toLocaleString() : 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
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
                  <p className="text-lg text-gray-900">Lab Technician</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Submit Results Modal */}
      {showResultModal && selectedTest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-semibold mb-4">Submit Test Results</h3>
            
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="block text-gray-600">Patient</label>
                  <p className="text-gray-900">{selectedTest.patient_first_name} {selectedTest.patient_last_name}</p>
                </div>
                <div>
                  <label className="block text-gray-600">Test</label>
                  <p className="text-gray-900">{selectedTest.test_name}</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmitResults}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Test Results *</label>
                  <textarea
                    value={resultForm.results}
                    onChange={(e) => setResultForm({ ...resultForm, results: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="4"
                    placeholder="Enter test results..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Normal Range</label>
                  <input
                    type="text"
                    value={resultForm.normal_range}
                    onChange={(e) => setResultForm({ ...resultForm, normal_range: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 70-100 mg/dL"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowResultModal(false);
                    setSelectedTest(null);
                    setResultForm({ results: '', normal_range: '' });
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Submit Results
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LaboratoryDashboard;
