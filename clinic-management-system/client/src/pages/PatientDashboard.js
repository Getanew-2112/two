import React, { useState, useEffect } from 'react';
import PaymentModal from '../components/PaymentModal';
import NotificationCenter from '../components/NotificationCenter';
import QueueStatusCard from '../components/QueueStatusCard';
import PaymentReceipt from '../components/PaymentReceipt';
import ProfileEdit from '../components/ProfileEdit';

const PatientDashboard = ({ patient, onLogout }) => {
  const [activeTab, setActiveTab] = useState('queue');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [currentPatient, setCurrentPatient] = useState(patient);
  const [inQueue, setInQueue] = useState(false);
  const [prescriptions, setPrescriptions] = useState([]);
  const [labTests, setLabTests] = useState([]);
  const [triageHistory, setTriageHistory] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [historySubTab, setHistorySubTab] = useState('prescriptions');

  useEffect(() => {
    fetchPatientData();
    fetchUnreadNotifications();
    
    // Auto-refresh unread notifications every minute
    const interval = setInterval(fetchUnreadNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const patientId = patient?.id || patient?.patientId;
      
      const response = await fetch(`http://localhost:5000/api/notifications/${patientId}/unread-count`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUnreadNotifications(data.unread_count || 0);
      }
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
    }
  };

  const fetchPatientData = async () => {
    try {
      const token = localStorage.getItem('token');
      const patientId = patient?.id || patient?.patientId;
      
      // Fetch prescriptions
      const prescriptionsResponse = await fetch(`http://localhost:5000/api/prescriptions/patient/${patientId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (prescriptionsResponse.ok) {
        const prescriptionsData = await prescriptionsResponse.json();
        setPrescriptions(prescriptionsData);
      }
      
      // Fetch lab tests
      const labTestsResponse = await fetch(`http://localhost:5000/api/lab-tests/patient/${patientId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (labTestsResponse.ok) {
        const labTestsData = await labTestsResponse.json();
        setLabTests(labTestsData);
      }
      
      // Fetch triage history
      const triageResponse = await fetch(`http://localhost:5000/api/triage/patient/${patientId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (triageResponse.ok) {
        const triageData = await triageResponse.json();
        setTriageHistory(triageData);
      }
      
      // Fetch payment history
      const paymentsResponse = await fetch(`http://localhost:5000/api/payments/history/${patientId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (paymentsResponse.ok) {
        const paymentsData = await paymentsResponse.json();
        setPayments(paymentsData.payments || []);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching patient data:', error);
      setLoading(false);
    }
  };

  // Mock data - replace with actual API calls
  const queueData = {
    patientId: patient?.patientId || 'P-2023-0425',
    queueNumber: 4,
    patientsAhead: 3,
    estimatedTime: '11:44 PM',
    status: 'Waiting',
    queueList: [
      { queueNumber: 1, patientId: 'P-2023-0421', status: 'In Consultation', time: 'Currently' },
      { queueNumber: 2, patientId: 'P-2023-0422', status: 'Waiting', time: '11:24 PM' },
      { queueNumber: 3, patientId: 'P-2023-0423', status: 'Waiting', time: '11:34 PM' },
      { queueNumber: 4, patientId: 'P-2023-0425', status: 'Waiting', time: '11:44 PM', isYou: true },
    ]
  };

  const appointments = [
    { id: 1, doctor: 'Dr. Abebe Tadesse', date: '2024-03-15', time: '10:00 AM', status: 'Confirmed' },
    { id: 2, doctor: 'Dr. Marta Bekele', date: '2024-03-20', time: '2:30 PM', status: 'Pending' },
  ];

  const handleJoinQueue = () => {
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async (paymentData) => {
    console.log('Payment successful:', paymentData);
    setShowPaymentModal(false);
    setInQueue(true);
    
    // Refresh queue status
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        patientId={patient?.id || patient?.patientId}
        amount={500}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Payment Receipt Modal */}
      <PaymentReceipt
        isOpen={showReceipt}
        onClose={() => {
          setShowReceipt(false);
          setSelectedPayment(null);
        }}
        payment={selectedPayment}
      />

      {/* Notification Center */}
      <NotificationCenter
        patientId={patient?.id || patient?.patientId}
        isOpen={showNotifications}
        onClose={() => {
          setShowNotifications(false);
          fetchUnreadNotifications();
        }}
      />

      {/* Sidebar */}
      <div className="w-64 bg-slate-800 text-white min-h-screen">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-1.5">
              <img 
                src="/agmas-logo.png" 
                alt="Agmas Clinic" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.classList.add('bg-gradient-to-br', 'from-green-400', 'to-blue-500');
                  e.target.parentElement.innerHTML = '<span class="text-white text-xl">🏥</span>';
                }}
              />
            </div>
            <div>
              <h1 className="text-lg font-bold">Agmas</h1>
              <h2 className="text-sm font-semibold text-gray-300">Medium Clinic</h2>
            </div>
          </div>
        </div>

        <nav className="mt-8">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-slate-700 border-l-4 border-blue-400'
                : 'hover:bg-slate-700'
            }`}
          >
            <span className="mr-3">📊</span>
            Dashboard
          </button>
          
          <button
            onClick={() => setActiveTab('queue')}
            className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
              activeTab === 'queue'
                ? 'bg-blue-600 border-l-4 border-blue-400'
                : 'hover:bg-slate-700'
            }`}
          >
            <span className="mr-3">🚶‍♂️</span>
            Queue
          </button>
          
          <button
            onClick={() => setActiveTab('history')}
            className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
              activeTab === 'history'
                ? 'bg-blue-600 border-l-4 border-blue-400'
                : 'hover:bg-slate-700'
            }`}
          >
            <span className="mr-3">🕒</span>
            Medical History
          </button>
          
          <button
            onClick={() => setActiveTab('appointment')}
            className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
              activeTab === 'appointment'
                ? 'bg-slate-700 border-l-4 border-blue-400'
                : 'hover:bg-slate-700'
            }`}
          >
            <span className="mr-3">📅</span>
            Appointment
          </button>
          
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
              activeTab === 'portfolio'
                ? 'bg-slate-700 border-l-4 border-blue-400'
                : 'hover:bg-slate-700'
            }`}
          >
            <span className="mr-3">📋</span>
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
              <h2 className="text-2xl font-bold text-gray-900">
                {activeTab === 'queue' && 'Your Queue Status'}
                {activeTab === 'dashboard' && 'Patient Dashboard'}
                {activeTab === 'history' && 'Medical History'}
                {activeTab === 'appointment' && 'My Appointments'}
                {activeTab === 'portfolio' && 'Medical Portfolio'}
              </h2>
              <p className="text-sm text-gray-500">
                {activeTab === 'queue' && 'Showing patients ahead of you in the queue'}
                {activeTab === 'history' && 'View your past records, test results, and prescriptions'}
              </p>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notification Bell */}
              <button
                onClick={() => setShowNotifications(true)}
                className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <span className="text-2xl">🔔</span>
                {unreadNotifications > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                    {unreadNotifications}
                  </span>
                )}
              </button>

              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {currentPatient?.firstName} {currentPatient?.lastName}
                </p>
                <p className="text-xs text-gray-500">ID: {currentPatient?.patientId || currentPatient?.id}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg overflow-hidden">
                {currentPatient?.profileImage ? (
                  <img src={currentPatient.profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span>{currentPatient?.firstName?.charAt(0).toUpperCase() || 'P'}</span>
                )}
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
          {activeTab === 'queue' && (
            <div className="max-w-5xl">
              {/* Join Queue Button */}
              {!inQueue && (
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 mb-8 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold mb-2">Ready to see a doctor?</h3>
                      <p className="text-blue-100">Join the queue now and get your queue number</p>
                    </div>
                    <button
                      onClick={handleJoinQueue}
                      className="px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all transform hover:scale-105 font-bold text-lg shadow-lg"
                    >
                      Join Queue Now
                    </button>
                  </div>
                </div>
              )}

              {/* Queue Status Card */}
              <QueueStatusCard 
                patientId={patient?.id || patient?.patientId}
                autoRefresh={true}
              />
            </div>
          )}

          {activeTab === 'appointment' && (
            <div className="max-w-5xl">
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">My Appointments</h3>
                <div className="space-y-4">
                  {appointments.map((apt) => (
                    <div key={apt.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{apt.doctor}</h4>
                          <p className="text-gray-600">{apt.date} at {apt.time}</p>
                        </div>
                        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                          apt.status === 'Confirmed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {apt.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="max-w-5xl">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* History Sub-navigation */}
                <div className="flex border-b border-gray-200">
                  <button
                    onClick={() => setHistorySubTab('prescriptions')}
                    className={`flex-1 py-4 text-center font-medium transition-colors ${
                      historySubTab === 'prescriptions' 
                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    💊 Prescriptions
                  </button>
                  <button
                    onClick={() => setHistorySubTab('labresults')}
                    className={`flex-1 py-4 text-center font-medium transition-colors ${
                      historySubTab === 'labresults' 
                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    🔬 Lab Results
                  </button>
                  <button
                    onClick={() => setHistorySubTab('triage')}
                    className={`flex-1 py-4 text-center font-medium transition-colors ${
                      historySubTab === 'triage' 
                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    🩺 Vital Signs
                  </button>
                  <button
                    onClick={() => setHistorySubTab('payments')}
                    className={`flex-1 py-4 text-center font-medium transition-colors ${
                      historySubTab === 'payments' 
                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    💳 Payments
                  </button>
                </div>

                <div className="p-8">
                  {/* Prescriptions Tab Content */}
                  {historySubTab === 'prescriptions' && (
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-6">My Prescriptions</h3>
                      
                      {loading ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                          <p className="text-gray-600 mt-4">Loading prescriptions...</p>
                        </div>
                      ) : prescriptions.length === 0 ? (
                        <div className="text-center py-12">
                          <span className="text-6xl mb-4 block">💊</span>
                          <p className="text-gray-600 text-lg">No prescriptions yet</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {prescriptions.map((prescription) => (
                            <div key={prescription.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <h4 className="text-lg font-semibold text-gray-900">{prescription.medication_name}</h4>
                                  <p className="text-sm text-gray-600">
                                    Prescribed by Dr. {prescription.doctor_first_name} {prescription.doctor_last_name}
                                  </p>
                                </div>
                                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                                  prescription.status === 'dispensed' ? 'bg-green-100 text-green-800' :
                                  prescription.status === 'active' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {prescription.status}
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Dosage</p>
                                  <p className="text-sm font-medium text-gray-900">{prescription.dosage}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Frequency</p>
                                  <p className="text-sm font-medium text-gray-900">{prescription.frequency}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Duration</p>
                                  <p className="text-sm font-medium text-gray-900">{prescription.duration}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Issued Date</p>
                                  <p className="text-sm font-medium text-gray-900">
                                    {new Date(prescription.issued_at).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              
                              {prescription.instructions && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                  <p className="text-xs text-blue-600 font-semibold mb-1">Instructions</p>
                                  <p className="text-sm text-gray-700">{prescription.instructions}</p>
                                </div>
                              )}
                              
                              {prescription.dispensed_at && (
                                <div className="mt-4 text-sm text-gray-600">
                                  <span className="text-green-600">✓</span> Dispensed on {new Date(prescription.dispensed_at).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Lab Results Tab Content */}
                  {historySubTab === 'labresults' && (
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-6">My Lab Results</h3>
                      
                      {loading ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                          <p className="text-gray-600 mt-4">Loading lab results...</p>
                        </div>
                      ) : labTests.length === 0 ? (
                        <div className="text-center py-12">
                          <span className="text-6xl mb-4 block">🔬</span>
                          <p className="text-gray-600 text-lg">No lab tests yet</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {labTests.map((test) => (
                            <div key={test.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <h4 className="text-lg font-semibold text-gray-900">{test.test_name}</h4>
                                  <p className="text-sm text-gray-600">
                                    Ordered by Dr. {test.doctor_first_name} {test.doctor_last_name}
                                  </p>
                                </div>
                                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                                  test.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  test.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {test.status}
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Test Type</p>
                                  <p className="text-sm font-medium text-gray-900 capitalize">{test.test_type}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Requested Date</p>
                                  <p className="text-sm font-medium text-gray-900">
                                    {new Date(test.requested_at).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              
                              {test.status === 'completed' && test.results && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                                  <p className="text-xs text-green-600 font-semibold mb-2">Results</p>
                                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{test.results}</p>
                                  
                                  {test.normal_range && (
                                    <div className="mt-3 pt-3 border-t border-green-200">
                                      <p className="text-xs text-green-600 font-semibold mb-1">Normal Range</p>
                                      <p className="text-sm text-gray-700">{test.normal_range}</p>
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              {test.notes && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                  <p className="text-xs text-blue-600 font-semibold mb-1">Notes</p>
                                  <p className="text-sm text-gray-700">{test.notes}</p>
                                </div>
                              )}
                              
                              {test.completed_at && (
                                <div className="mt-4 text-sm text-gray-600">
                                  <span className="text-green-600">✓</span> Completed on {new Date(test.completed_at).toLocaleDateString()}
                                  {test.technician_first_name && (
                                    <span> by {test.technician_first_name} {test.technician_last_name}</span>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Vital Signs Tab Content */}
                  {historySubTab === 'triage' && (
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-6">Vital Signs History</h3>
                      
                      {loading ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                          <p className="text-gray-600 mt-4">Loading vital signs...</p>
                        </div>
                      ) : triageHistory.length === 0 ? (
                        <div className="text-center py-12">
                          <span className="text-6xl mb-4 block">🩺</span>
                          <p className="text-gray-600 text-lg">No triage records yet</p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {triageHistory.map((record) => (
                            <div key={record.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <h4 className="text-lg font-semibold text-gray-900">
                                    Triage Assessment - {new Date(record.created_at).toLocaleDateString()}
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    Performed by {record.nurse_first_name} {record.nurse_last_name}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {new Date(record.created_at).toLocaleTimeString()}
                                  </p>
                                </div>
                                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                                  record.triage_category === 'red' ? 'bg-red-100 text-red-800' :
                                  record.triage_category === 'orange' ? 'bg-orange-100 text-orange-800' :
                                  record.triage_category === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {record.triage_category.toUpperCase()} Priority
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                <div className="bg-blue-50 rounded-lg p-3">
                                  <p className="text-xs text-blue-600 font-semibold mb-1">Blood Pressure</p>
                                  <p className="text-lg font-bold text-gray-900">
                                    {record.blood_pressure_systolic}/{record.blood_pressure_diastolic}
                                  </p>
                                  <p className="text-xs text-gray-500">mmHg</p>
                                </div>
                                
                                <div className="bg-red-50 rounded-lg p-3">
                                  <p className="text-xs text-red-600 font-semibold mb-1">Heart Rate</p>
                                  <p className="text-lg font-bold text-gray-900">{record.heart_rate}</p>
                                  <p className="text-xs text-gray-500">bpm</p>
                                </div>
                                
                                <div className="bg-orange-50 rounded-lg p-3">
                                  <p className="text-xs text-orange-600 font-semibold mb-1">Temperature</p>
                                  <p className="text-lg font-bold text-gray-900">{record.temperature}</p>
                                  <p className="text-xs text-gray-500">°C</p>
                                </div>
                                
                                <div className="bg-purple-50 rounded-lg p-3">
                                  <p className="text-xs text-purple-600 font-semibold mb-1">Weight</p>
                                  <p className="text-lg font-bold text-gray-900">{record.weight}</p>
                                  <p className="text-xs text-gray-500">kg</p>
                                </div>
                              </div>
                              
                              {(record.oxygen_saturation || record.respiratory_rate || record.height || record.bmi) && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                  {record.oxygen_saturation && (
                                    <div className="bg-green-50 rounded-lg p-3">
                                      <p className="text-xs text-green-600 font-semibold mb-1">Oxygen Saturation</p>
                                      <p className="text-lg font-bold text-gray-900">{record.oxygen_saturation}</p>
                                      <p className="text-xs text-gray-500">%</p>
                                    </div>
                                  )}
                                  
                                  {record.respiratory_rate && (
                                    <div className="bg-teal-50 rounded-lg p-3">
                                      <p className="text-xs text-teal-600 font-semibold mb-1">Respiratory Rate</p>
                                      <p className="text-lg font-bold text-gray-900">{record.respiratory_rate}</p>
                                      <p className="text-xs text-gray-500">breaths/min</p>
                                    </div>
                                  )}
                                  
                                  {record.height && (
                                    <div className="bg-indigo-50 rounded-lg p-3">
                                      <p className="text-xs text-indigo-600 font-semibold mb-1">Height</p>
                                      <p className="text-lg font-bold text-gray-900">{record.height}</p>
                                      <p className="text-xs text-gray-500">cm</p>
                                    </div>
                                  )}
                                  
                                  {record.bmi && (
                                    <div className="bg-pink-50 rounded-lg p-3">
                                      <p className="text-xs text-pink-600 font-semibold mb-1">BMI</p>
                                      <p className="text-lg font-bold text-gray-900">{record.bmi}</p>
                                      <p className="text-xs text-gray-500">kg/m²</p>
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              {record.chief_complaint && (
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                                  <p className="text-xs text-gray-600 font-semibold mb-1">Chief Complaint</p>
                                  <p className="text-sm text-gray-900">{record.chief_complaint}</p>
                                </div>
                              )}
                              
                              {record.notes && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                  <p className="text-xs text-blue-600 font-semibold mb-1">Notes</p>
                                  <p className="text-sm text-gray-700">{record.notes}</p>
                                </div>
                              )}
                              
                              {record.assigned_doctor_id && (
                                <div className="mt-4 flex items-center text-sm text-gray-600">
                                  <span className="text-green-600 mr-2">✓</span>
                                  <span>Assigned to Doctor</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Payments Tab Content */}
                  {historySubTab === 'payments' && (
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-6">Payment History</h3>
                      
                      {loading ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                          <p className="text-gray-600 mt-4">Loading payment history...</p>
                        </div>
                      ) : payments.length === 0 ? (
                        <div className="text-center py-12">
                          <span className="text-6xl mb-4 block">💳</span>
                          <p className="text-gray-600 text-lg">No payment records yet</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {payments.map((payment) => (
                            <div key={payment.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <h4 className="text-lg font-semibold text-gray-900">
                                    Receipt #{payment.receipt_number}
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    {new Date(payment.payment_date).toLocaleString()}
                                  </p>
                                </div>
                                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                                  payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  payment.status === 'verified' ? 'bg-blue-100 text-blue-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {payment.status.toUpperCase()}
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Amount</p>
                                  <p className="text-lg font-bold text-blue-600">{payment.amount} ETB</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Payment Method</p>
                                  <p className="text-sm font-medium text-gray-900 capitalize">{payment.payment_method}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Transaction ID</p>
                                  <p className="text-sm font-medium text-gray-900 font-mono">{payment.transaction_id || 'N/A'}</p>
                                </div>
                              </div>
                              
                              {payment.description && (
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
                                  <p className="text-xs text-gray-600 font-semibold mb-1">Description</p>
                                  <p className="text-sm text-gray-900">{payment.description}</p>
                                </div>
                              )}
                              
                              <div className="flex justify-end space-x-3">
                                <button
                                  onClick={() => {
                                    setSelectedPayment({
                                      ...payment,
                                      patient_id: patient?.patientId || patient?.id,
                                      patient_name: `${patient?.firstName} ${patient?.lastName}`
                                    });
                                    setShowReceipt(true);
                                  }}
                                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm"
                                >
                                  📄 View Receipt
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          {activeTab === 'portfolio' && (
            <div className="max-w-5xl">
              {isEditingProfile ? (
                <ProfileEdit
                  patient={currentPatient}
                  onUpdate={(updatedPatient) => {
                    setCurrentPatient(updatedPatient);
                    setIsEditingProfile(false);
                  }}
                  onCancel={() => setIsEditingProfile(false)}
                />
              ) : (
                <div className="bg-white rounded-xl shadow-lg p-8">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900">My Profile</h3>
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                    >
                      ✏️ Edit Profile
                    </button>
                  </div>

                  {/* Profile Image and Basic Info */}
                  <div className="flex items-center space-x-6 mb-8 pb-8 border-b border-gray-200">
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-4xl font-bold">
                      {currentPatient?.profileImage ? (
                        <img src={currentPatient.profileImage} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <span>{currentPatient?.firstName?.charAt(0).toUpperCase() || 'P'}</span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-3xl font-bold text-gray-900 mb-2">
                        {currentPatient?.firstName} {currentPatient?.lastName}
                      </h4>
                      <p className="text-lg text-gray-600">Patient ID: {currentPatient?.patientId || currentPatient?.id}</p>
                      <p className="text-sm text-gray-500 mt-1">Member since {new Date().getFullYear()}</p>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="mb-8">
                    <h4 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-start space-x-3">
                        <span className="text-2xl">📧</span>
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="text-gray-900 font-medium">{currentPatient?.email || 'Not provided'}</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <span className="text-2xl">📱</span>
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <p className="text-gray-900 font-medium">{currentPatient?.phone || 'Not provided'}</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <span className="text-2xl">🎂</span>
                        <div>
                          <p className="text-sm text-gray-500">Date of Birth</p>
                          <p className="text-gray-900 font-medium">
                            {currentPatient?.dateOfBirth ? new Date(currentPatient.dateOfBirth).toLocaleDateString() : 'Not provided'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <span className="text-2xl">⚧</span>
                        <div>
                          <p className="text-sm text-gray-500">Gender</p>
                          <p className="text-gray-900 font-medium capitalize">{currentPatient?.gender || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  {currentPatient?.address && (
                    <div className="mb-8">
                      <h4 className="text-xl font-semibold text-gray-900 mb-4">Address</h4>
                      <div className="flex items-start space-x-3">
                        <span className="text-2xl">🏠</span>
                        <p className="text-gray-900">{currentPatient.address}</p>
                      </div>
                    </div>
                  )}

                  {/* Emergency Contact */}
                  {(currentPatient?.emergencyContact || currentPatient?.emergencyPhone) && (
                    <div className="mb-8">
                      <h4 className="text-xl font-semibold text-gray-900 mb-4">Emergency Contact</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {currentPatient?.emergencyContact && (
                          <div className="flex items-start space-x-3">
                            <span className="text-2xl">👤</span>
                            <div>
                              <p className="text-sm text-gray-500">Contact Name</p>
                              <p className="text-gray-900 font-medium">{currentPatient.emergencyContact}</p>
                            </div>
                          </div>
                        )}
                        {currentPatient?.emergencyPhone && (
                          <div className="flex items-start space-x-3">
                            <span className="text-2xl">📞</span>
                            <div>
                              <p className="text-sm text-gray-500">Contact Phone</p>
                              <p className="text-gray-900 font-medium">{currentPatient.emergencyPhone}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Medical Information */}
                  <div className="mb-8">
                    <h4 className="text-xl font-semibold text-gray-900 mb-4">Medical Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-start space-x-3">
                        <span className="text-2xl">🩸</span>
                        <div>
                          <p className="text-sm text-gray-500">Blood Type</p>
                          <p className="text-gray-900 font-medium">{currentPatient?.bloodType || 'Not provided'}</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <span className="text-2xl">⚠️</span>
                        <div>
                          <p className="text-sm text-gray-500">Allergies</p>
                          <p className="text-gray-900 font-medium">{currentPatient?.allergies || 'None reported'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          {activeTab === 'dashboard' && (
            <div className="max-w-6xl mx-auto">
              {/* Welcome Banner */}
              <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 rounded-2xl shadow-xl p-8 mb-8 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">Welcome back, {currentPatient?.firstName}! 👋</h2>
                    <p className="text-blue-100 text-lg">Here's your health overview today</p>
                  </div>
                  <div className="hidden md:block">
                    <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center p-4 shadow-lg">
                      <img 
                        src="/agmas-logo.png" 
                        alt="Agmas Medium Clinic" 
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = '<span class="text-6xl">🏥</span>';
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Appointments Card */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-lg p-6 border border-blue-200 hover:shadow-xl transition-all transform hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-3xl">📅</span>
                    </div>
                    <div className="text-right">
                      <p className="text-4xl font-bold text-blue-700">{appointments.length}</p>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-blue-900 mb-1">Appointments</h3>
                  <p className="text-sm text-blue-600">Upcoming visits</p>
                </div>

                {/* Queue Position Card */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl shadow-lg p-6 border border-green-200 hover:shadow-xl transition-all transform hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-3xl">🎫</span>
                    </div>
                    <div className="text-right">
                      <p className="text-4xl font-bold text-green-700">#{queueData.queueNumber}</p>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-green-900 mb-1">Queue Position</h3>
                  <p className="text-sm text-green-600">Current position</p>
                </div>

                {/* Prescriptions Card */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl shadow-lg p-6 border border-purple-200 hover:shadow-xl transition-all transform hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-3xl">💊</span>
                    </div>
                    <div className="text-right">
                      <p className="text-4xl font-bold text-purple-700">{prescriptions.length}</p>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-purple-900 mb-1">Prescriptions</h3>
                  <p className="text-sm text-purple-600">Active medications</p>
                </div>
                
                {/* Lab Tests Card */}
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl shadow-lg p-6 border border-indigo-200 hover:shadow-xl transition-all transform hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-3xl">🔬</span>
                    </div>
                    <div className="text-right">
                      <p className="text-4xl font-bold text-indigo-700">{labTests.length}</p>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-indigo-900 mb-1">Lab Tests</h3>
                  <p className="text-sm text-indigo-600">Test results</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setActiveTab('queue')}
                    className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
                  >
                    <span className="text-3xl">🚶‍♂️</span>
                    <div className="text-left">
                      <p className="font-semibold">Join Queue</p>
                      <p className="text-sm text-blue-100">Get in line to see a doctor</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab('history')}
                    className="flex items-center space-x-4 p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
                  >
                    <span className="text-3xl">📋</span>
                    <div className="text-left">
                      <p className="font-semibold">Medical History</p>
                      <p className="text-sm text-purple-100">View your records</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab('portfolio')}
                    className="flex items-center space-x-4 p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg"
                  >
                    <span className="text-3xl">👤</span>
                    <div className="text-left">
                      <p className="font-semibold">My Profile</p>
                      <p className="text-sm text-green-100">Update your information</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Health Tips */}
              <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl shadow-lg p-8 border border-teal-200">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">💡</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-teal-900 mb-2">Health Tip of the Day</h3>
                    <p className="text-teal-700 leading-relaxed">
                      Stay hydrated! Drinking 8 glasses of water daily helps maintain your body's fluid balance, 
                      improves skin health, and supports overall wellness. Remember to bring your water bottle to your appointments!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default PatientDashboard;
