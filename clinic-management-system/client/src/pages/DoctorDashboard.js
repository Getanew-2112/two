import React, { useState, useEffect } from 'react';

const API = 'http://localhost:5000/api';

/* ─────────────────────────────────────────
   Shared helpers
───────────────────────────────────────── */
const statusBadge = (status) => {
  const map = {
    waiting: 'bg-amber-100 text-amber-800 border border-amber-200',
    in_consultation: 'bg-blue-100 text-blue-800 border border-blue-200',
    completed: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    cancelled: 'bg-red-100 text-red-800 border border-red-200',
    scheduled: 'bg-violet-100 text-violet-800 border border-violet-200',
    confirmed: 'bg-teal-100 text-teal-800 border border-teal-200',
    in_progress: 'bg-sky-100 text-sky-800 border border-sky-200',
    active: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    dispensed: 'bg-gray-100 text-gray-700 border border-gray-200',
  };
  return map[status] || 'bg-gray-100 text-gray-700 border border-gray-200';
};

const triageColor = (cat) => ({
  red: 'bg-red-100 text-red-800 border border-red-200',
  orange: 'bg-orange-100 text-orange-800 border border-orange-200',
  yellow: 'bg-amber-100 text-amber-800 border border-amber-200',
  green: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
}[cat] || 'bg-gray-100 text-gray-700');

const EmptyState = ({ icon, text }) => (
  <div className="flex flex-col items-center justify-center py-16 text-gray-400">
    <span className="text-6xl mb-4">{icon}</span>
    <p className="text-lg font-medium">{text}</p>
  </div>
);

const SectionCard = ({ children, className = '' }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 ${className}`}>{children}</div>
);

/* ─────────────────────────────────────────
   Patient History Tab
───────────────────────────────────────── */
const PatientHistoryTab = ({ patients, headers, showNotification }) => {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyTab, setHistoryTab] = useState('triage');
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [recordForm, setRecordForm] = useState({
    visit_date: new Date().toISOString().split('T')[0],
    chief_complaint: '', diagnosis: '', treatment_plan: '', notes: ''
  });

  const loadSummary = async (patientId) => {
    setLoadingHistory(true); setSummary(null);
    try {
      const res = await fetch(`${API}/medical-records/summary/${patientId}`, { headers: headers() });
      if (res.ok) setSummary(await res.json());
      else showNotification('Failed to load patient history', 'error');
    } catch { showNotification('Error loading patient history', 'error'); }
    finally { setLoadingHistory(false); }
  };

  const handlePatientChange = (e) => {
    const p = patients.find(pt => pt.id === e.target.value);
    setSelectedPatient(p || null); setHistoryTab('triage'); setSummary(null);
    if (p) loadSummary(p.id);
  };

  const handleAddRecord = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/medical-records`, {
        method: 'POST', headers: headers(),
        body: JSON.stringify({ patient_id: selectedPatient.id, ...recordForm })
      });
      if (res.ok) {
        showNotification('Medical record added');
        setShowAddRecord(false);
        setRecordForm({ visit_date: new Date().toISOString().split('T')[0], chief_complaint: '', diagnosis: '', treatment_plan: '', notes: '' });
        loadSummary(selectedPatient.id);
      } else { const e = await res.json(); showNotification(e.message || 'Failed', 'error'); }
    } catch { showNotification('Error adding record', 'error'); }
  };

  const subTabs = [
    { key: 'triage', icon: '🩺', label: 'Triage', count: summary?.triage_records?.length },
    { key: 'records', icon: '📋', label: 'Medical Records', count: summary?.medical_records?.length },
    { key: 'prescriptions', icon: '💊', label: 'Prescriptions', count: summary?.active_prescriptions?.length },
    { key: 'labs', icon: '🔬', label: 'Lab Tests', count: summary?.recent_lab_tests?.length },
    { key: 'appointments', icon: '📅', label: 'Appointments', count: summary?.appointment_history?.length },
  ];

  return (
    <div className="space-y-6">
      {/* Search card */}
      <SectionCard className="p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-lg">🗂️</div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Patient History</h3>
            <p className="text-sm text-gray-500">Full medical history per patient</p>
          </div>
        </div>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Select Patient</label>
            <select value={selectedPatient?.id || ''} onChange={handlePatientChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-400 focus:border-transparent bg-gray-50 text-gray-800">
              <option value="">Search and choose a patient...</option>
              {patients.map(p => <option key={p.id} value={p.id}>{p.patient_id} — {p.first_name} {p.last_name}</option>)}
            </select>
          </div>
          {selectedPatient && (
            <button onClick={() => setShowAddRecord(true)}
              className="px-5 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl hover:from-violet-600 hover:to-purple-700 transition-all font-semibold shadow-md whitespace-nowrap">
              + Add Record
            </button>
          )}
        </div>

        {summary?.patient && (
          <div className="mt-5 p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl border border-violet-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {summary.patient.first_name?.charAt(0)}{summary.patient.last_name?.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-gray-900 text-lg">{summary.patient.first_name} {summary.patient.last_name}</p>
                <p className="text-sm text-violet-600 font-medium">{summary.patient.patient_id}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              {[
                { label: 'Date of Birth', value: summary.patient.date_of_birth ? new Date(summary.patient.date_of_birth).toLocaleDateString() : '—' },
                { label: 'Gender', value: summary.patient.gender || '—' },
                { label: 'Phone', value: summary.patient.phone || '—' },
                { label: 'Blood Type', value: summary.patient.blood_type || '—' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white rounded-lg p-2 border border-violet-100">
                  <p className="text-xs text-gray-400 font-medium">{label}</p>
                  <p className="font-semibold text-gray-800 capitalize">{value}</p>
                </div>
              ))}
            </div>
            {summary.patient.allergies && (
              <div className="mt-3 flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                <span className="text-red-500">⚠️</span>
                <span className="text-sm font-semibold text-red-700">Allergies: {summary.patient.allergies}</span>
              </div>
            )}
          </div>
        )}
      </SectionCard>

      {loadingHistory && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-500 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 font-medium">Loading patient history...</p>
        </div>
      )}

      {summary && (
        <SectionCard className="overflow-hidden">
          <div className="flex border-b border-gray-100 overflow-x-auto bg-gray-50">
            {subTabs.map(t => (
              <button key={t.key} onClick={() => setHistoryTab(t.key)}
                className={`flex items-center gap-2 px-5 py-4 text-sm font-medium whitespace-nowrap transition-all ${
                  historyTab === t.key
                    ? 'border-b-2 border-violet-500 text-violet-700 bg-white'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-white'
                }`}>
                <span>{t.icon}</span> {t.label}
                {t.count !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${historyTab === t.key ? 'bg-violet-100 text-violet-700' : 'bg-gray-200 text-gray-600'}`}>{t.count}</span>
                )}
              </button>
            ))}
          </div>

          <div className="p-6">
            {historyTab === 'triage' && (
              summary.triage_records.length === 0 ? <EmptyState icon="🩺" text="No triage records found" /> :
              <div className="space-y-4">
                {summary.triage_records.map(r => (
                  <div key={r.id} className="border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow bg-gradient-to-r from-gray-50 to-white">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="font-bold text-gray-900">{new Date(r.created_at).toLocaleString()}</p>
                        <p className="text-sm text-gray-500">Assessed by {r.nurse_first_name} {r.nurse_last_name}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${triageColor(r.triage_category)}`}>{r.triage_category} Priority</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      {[
                        { label: '🩸 Blood Pressure', value: `${r.blood_pressure_systolic}/${r.blood_pressure_diastolic}`, unit: 'mmHg', bg: 'bg-blue-50 border-blue-100' },
                        { label: '❤️ Heart Rate', value: r.heart_rate, unit: 'bpm', bg: 'bg-red-50 border-red-100' },
                        { label: '🌡️ Temperature', value: r.temperature, unit: '°C', bg: 'bg-orange-50 border-orange-100' },
                        { label: '⚖️ Weight', value: r.weight, unit: 'kg', bg: 'bg-purple-50 border-purple-100' },
                      ].map(v => (
                        <div key={v.label} className={`rounded-xl p-3 border ${v.bg}`}>
                          <p className="text-xs text-gray-500 mb-1">{v.label}</p>
                          <p className="text-xl font-bold text-gray-900">{v.value}</p>
                          <p className="text-xs text-gray-400">{v.unit}</p>
                        </div>
                      ))}
                    </div>
                    {r.chief_complaint && <p className="text-sm text-gray-700 bg-white border border-gray-100 rounded-lg px-3 py-2"><span className="font-semibold">Complaint:</span> {r.chief_complaint}</p>}
                    {r.notes && <p className="text-sm text-gray-600 mt-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2"><span className="font-semibold">Notes:</span> {r.notes}</p>}
                  </div>
                ))}
              </div>
            )}

            {historyTab === 'records' && (
              summary.medical_records.length === 0 ? <EmptyState icon="📋" text="No medical records found" /> :
              <div className="space-y-4">
                {summary.medical_records.map(r => (
                  <div key={r.id} className="border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center text-white text-sm font-bold">
                        {new Date(r.visit_date).getDate()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">Visit — {new Date(r.visit_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        <p className="text-sm text-gray-500">Dr. {r.doctor_first_name} {r.doctor_last_name}</p>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-3">
                      {r.chief_complaint && <div className="bg-amber-50 border border-amber-100 rounded-lg p-3"><p className="text-xs font-bold text-amber-700 mb-1">COMPLAINT</p><p className="text-sm text-gray-800">{r.chief_complaint}</p></div>}
                      {r.diagnosis && <div className="bg-blue-50 border border-blue-100 rounded-lg p-3"><p className="text-xs font-bold text-blue-700 mb-1">DIAGNOSIS</p><p className="text-sm text-gray-800">{r.diagnosis}</p></div>}
                      {r.treatment_plan && <div className="bg-green-50 border border-green-100 rounded-lg p-3"><p className="text-xs font-bold text-green-700 mb-1">TREATMENT</p><p className="text-sm text-gray-800">{r.treatment_plan}</p></div>}
                    </div>
                    {r.notes && <p className="mt-3 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2"><span className="font-semibold">Notes:</span> {r.notes}</p>}
                  </div>
                ))}
              </div>
            )}

            {historyTab === 'prescriptions' && (
              summary.active_prescriptions.length === 0 ? <EmptyState icon="💊" text="No active prescriptions" /> :
              <div className="grid md:grid-cols-2 gap-4">
                {summary.active_prescriptions.map(rx => (
                  <div key={rx.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow bg-gradient-to-br from-green-50 to-emerald-50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">💊</span>
                        <p className="font-bold text-gray-900">{rx.medication_name}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusBadge(rx.status)}`}>{rx.status}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-white rounded-lg p-2 border border-green-100"><p className="text-xs text-gray-400">Dosage</p><p className="font-semibold">{rx.dosage}</p></div>
                      <div className="bg-white rounded-lg p-2 border border-green-100"><p className="text-xs text-gray-400">Frequency</p><p className="font-semibold">{rx.frequency}</p></div>
                      <div className="bg-white rounded-lg p-2 border border-green-100"><p className="text-xs text-gray-400">Duration</p><p className="font-semibold">{rx.duration}</p></div>
                      <div className="bg-white rounded-lg p-2 border border-green-100"><p className="text-xs text-gray-400">Issued</p><p className="font-semibold">{new Date(rx.issued_at).toLocaleDateString()}</p></div>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">By Dr. {rx.doctor_first_name} {rx.doctor_last_name}</p>
                  </div>
                ))}
              </div>
            )}

            {historyTab === 'labs' && (
              summary.recent_lab_tests.length === 0 ? <EmptyState icon="🔬" text="No lab tests found" /> :
              <div className="grid md:grid-cols-2 gap-4">
                {summary.recent_lab_tests.map(t => (
                  <div key={t.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow bg-gradient-to-br from-blue-50 to-sky-50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">🔬</span>
                        <div>
                          <p className="font-bold text-gray-900">{t.test_name}</p>
                          <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700 font-medium capitalize">{t.test_type}</span>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusBadge(t.status)}`}>{t.status}</span>
                    </div>
                    <p className="text-xs text-gray-500">Ordered by Dr. {t.doctor_first_name} {t.doctor_last_name} · {new Date(t.requested_at).toLocaleDateString()}</p>
                    {t.result && <div className="mt-2 bg-white border border-blue-100 rounded-lg p-2"><p className="text-xs font-bold text-blue-700 mb-1">RESULT</p><p className="text-sm">{t.result}</p></div>}
                  </div>
                ))}
              </div>
            )}

            {historyTab === 'appointments' && (
              summary.appointment_history.length === 0 ? <EmptyState icon="📅" text="No appointment history" /> :
              <div className="space-y-3">
                {summary.appointment_history.map(a => (
                  <div key={a.id} className="flex items-center gap-4 border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 bg-gradient-to-br from-violet-400 to-purple-500 rounded-xl flex flex-col items-center justify-center text-white flex-shrink-0">
                      <p className="text-xs font-medium">{new Date(a.appointment_date).toLocaleString('default', { month: 'short' })}</p>
                      <p className="text-xl font-bold leading-none">{new Date(a.appointment_date).getDate()}</p>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900">{a.appointment_time}</p>
                        <span className="px-2 py-0.5 text-xs rounded-full bg-violet-100 text-violet-700 font-medium capitalize">{a.appointment_type}</span>
                        <span className={`px-2 py-0.5 text-xs rounded-full font-medium capitalize ${statusBadge(a.status)}`}>{a.status}</span>
                      </div>
                      <p className="text-sm text-gray-500">Dr. {a.doctor_first_name} {a.doctor_last_name}</p>
                      {a.notes && <p className="text-xs text-gray-400 mt-1">{a.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </SectionCard>
      )}

      {showAddRecord && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center text-white">📋</div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Add Medical Record</h3>
                <p className="text-sm text-gray-500">{selectedPatient?.first_name} {selectedPatient?.last_name}</p>
              </div>
            </div>
            <form onSubmit={handleAddRecord} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Visit Date *</label>
                <input type="date" value={recordForm.visit_date} onChange={e => setRecordForm({...recordForm, visit_date: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-400 bg-gray-50" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Chief Complaint *</label>
                <input type="text" value={recordForm.chief_complaint} onChange={e => setRecordForm({...recordForm, chief_complaint: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-400 bg-gray-50" placeholder="Main reason for visit" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Diagnosis</label>
                <textarea value={recordForm.diagnosis} onChange={e => setRecordForm({...recordForm, diagnosis: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-400 bg-gray-50" rows="3" placeholder="Diagnosis details..." />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Treatment Plan</label>
                <textarea value={recordForm.treatment_plan} onChange={e => setRecordForm({...recordForm, treatment_plan: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-400 bg-gray-50" rows="3" placeholder="Treatment plan..." />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Notes</label>
                <textarea value={recordForm.notes} onChange={e => setRecordForm({...recordForm, notes: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-400 bg-gray-50" rows="2" placeholder="Additional notes..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl hover:from-violet-600 hover:to-purple-700 font-semibold shadow-md transition-all">Save Record</button>
                <button type="button" onClick={() => setShowAddRecord(false)} className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────
   Main DoctorDashboard
───────────────────────────────────────── */
const DoctorDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [queueData, setQueueData] = useState([]);
  const [allQueue, setAllQueue] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({ patientsInQueue: 0, todaysAppointments: 0 });
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showLabTestModal, setShowLabTestModal] = useState(false);
  const [prescriptions, setPrescriptions] = useState([]);
  const [labTests, setLabTests] = useState([]);
  const [notification, setNotification] = useState(null);
  const [editingPortfolio, setEditingPortfolio] = useState(false);
  const [portfolioForm, setPortfolioForm] = useState({
    firstName: user?.firstName || '', lastName: user?.lastName || '',
    email: user?.email || '', specialization: 'General Physician', phone: user?.phone || '',
  });
  const [prescriptionForm, setPrescriptionForm] = useState({ medication_name: '', dosage: '', frequency: '', duration: '', instructions: '' });
  const [labTestForm, setLabTestForm] = useState({ test_type: 'hematology', test_name: '', notes: '' });

  const commonLabTests = {
    hematology: ['Complete Blood Count (CBC)', 'Blood Typing', 'ESR'],
    chemistry: ['Comprehensive Metabolic Panel', 'Liver Function Tests', 'Kidney Function Tests', 'Lipid Profile', 'Blood Glucose', 'HbA1c'],
    microbiology: ['Blood Culture', 'Urine Culture', 'Wound Culture', 'Stool Culture'],
    immunology: ['HIV Test', 'Hepatitis B Surface Antigen', 'Hepatitis C Antibody', 'VDRL/RPR'],
    urinalysis: ['Urine Analysis', 'Urine Pregnancy Test'],
    parasitology: ['Stool Ova & Parasites', 'Blood Parasite Smear']
  };

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const token = () => localStorage.getItem('token');
  const headers = () => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${token()}` });

  useEffect(() => { fetchDashboardData(); }, []);
  useEffect(() => {
    if (activeTab === 'pharmacy') fetchPrescriptions();
    else if (activeTab === 'laboratory') fetchLabTests();
    else if (activeTab === 'queue') fetchAllQueue();
  }, [activeTab]);

  const fetchDashboardData = async () => {
    try {
      const [queueRes, patientsRes, apptRes] = await Promise.all([
        fetch(`${API}/queue`, { headers: headers() }),
        fetch(`${API}/patients?limit=1000`, { headers: headers() }),
        fetch(`${API}/appointments/today`, { headers: headers() }),
      ]);
      if (queueRes.ok) {
        const data = await queueRes.json();
        const waiting = data.filter(q => q.status === 'waiting');
        setQueueData(waiting.slice(0, 5));
        setStats(prev => ({ ...prev, patientsInQueue: waiting.length }));
      }
      if (patientsRes.ok) {
        const data = await patientsRes.json();
        setPatients(Array.isArray(data) ? data : (data.patients || []));
      }
      if (apptRes.ok) {
        const data = await apptRes.json();
        setAppointments(data);
        setStats(prev => ({ ...prev, todaysAppointments: data.length }));
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchAllQueue = async () => {
    try {
      const res = await fetch(`${API}/queue`, { headers: headers() });
      if (res.ok) setAllQueue(await res.json());
    } catch (err) { console.error(err); }
  };

  const fetchPrescriptions = async () => {
    try {
      const res = await fetch(`${API}/prescriptions`, { headers: headers() });
      if (res.ok) setPrescriptions(await res.json());
    } catch (err) { console.error(err); }
  };

  const fetchLabTests = async () => {
    try {
      const res = await fetch(`${API}/lab-tests`, { headers: headers() });
      if (res.ok) setLabTests(await res.json());
    } catch (err) { console.error(err); }
  };

  const handleCallNext = async () => {
    try {
      const res = await fetch(`${API}/queue/call-next`, {
        method: 'POST', headers: headers(),
        body: JSON.stringify({ doctor_id: user?.id, room_number: 'Room 101' })
      });
      if (res.ok) {
        const data = await res.json();
        showNotification(`Called: ${data.patient?.patient_first_name} ${data.patient?.patient_last_name}`);
        fetchDashboardData();
        if (activeTab === 'queue') fetchAllQueue();
      } else {
        const err = await res.json();
        showNotification(err.message || 'No patients in queue', 'error');
      }
    } catch { showNotification('Failed to call next patient', 'error'); }
  };

  const handleCompleteConsultation = async (queueId) => {
    try {
      const res = await fetch(`${API}/queue/${queueId}`, {
        method: 'PUT', headers: headers(), body: JSON.stringify({ status: 'completed' })
      });
      if (res.ok) { showNotification('Consultation completed'); fetchAllQueue(); fetchDashboardData(); }
    } catch { showNotification('Failed to update status', 'error'); }
  };

  const handleCreatePrescription = async (e) => {
    e.preventDefault();
    if (!selectedPatient) { showNotification('Please select a patient', 'error'); return; }
    try {
      const res = await fetch(`${API}/prescriptions`, {
        method: 'POST', headers: headers(),
        body: JSON.stringify({ patient_id: selectedPatient.id, ...prescriptionForm })
      });
      if (res.ok) {
        showNotification('Prescription created');
        setShowPrescriptionModal(false);
        setPrescriptionForm({ medication_name: '', dosage: '', frequency: '', duration: '', instructions: '' });
        setSelectedPatient(null); fetchPrescriptions();
      } else { const err = await res.json(); showNotification(err.message || 'Failed', 'error'); }
    } catch { showNotification('Failed to create prescription', 'error'); }
  };

  const handleCreateLabTest = async (e) => {
    e.preventDefault();
    if (!selectedPatient) { showNotification('Please select a patient', 'error'); return; }
    try {
      const res = await fetch(`${API}/lab-tests`, {
        method: 'POST', headers: headers(),
        body: JSON.stringify({ patient_id: selectedPatient.id, ...labTestForm })
      });
      if (res.ok) {
        showNotification('Lab test ordered');
        setShowLabTestModal(false);
        setLabTestForm({ test_type: 'hematology', test_name: '', notes: '' });
        setSelectedPatient(null); fetchLabTests();
      } else { const err = await res.json(); showNotification(err.message || 'Failed', 'error'); }
    } catch { showNotification('Failed to order lab test', 'error'); }
  };

  const handleSavePortfolio = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/users/${user?.id}`, {
        method: 'PUT', headers: headers(),
        body: JSON.stringify({ firstName: portfolioForm.firstName, lastName: portfolioForm.lastName, phone: portfolioForm.phone })
      });
      if (res.ok) { showNotification('Profile updated'); setEditingPortfolio(false); }
      else { const err = await res.json(); showNotification(err.message || 'Failed', 'error'); }
    } catch { showNotification('Failed to update profile', 'error'); }
  };

  const navItems = [
    { key: 'dashboard', icon: '📊', label: 'Dashboard', color: 'from-blue-500 to-cyan-500' },
    { key: 'queue', icon: '📋', label: 'Appointment/Queue', color: 'from-amber-500 to-orange-500' },
    { key: 'laboratory', icon: '🔬', label: 'Laboratory', color: 'from-sky-500 to-blue-600' },
    { key: 'pharmacy', icon: '💊', label: 'Pharmacy', color: 'from-emerald-500 to-green-600' },
    { key: 'patientHistory', icon: '🗂️', label: 'Patient History', color: 'from-violet-500 to-purple-600' },
    { key: 'portfolio', icon: '👤', label: 'Portfolio', color: 'from-rose-500 to-pink-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl text-white font-semibold transition-all animate-pulse ${
          notification.type === 'error' ? 'bg-gradient-to-r from-red-500 to-rose-600' : 'bg-gradient-to-r from-emerald-500 to-green-600'
        }`}>
          <span>{notification.type === 'error' ? '❌' : '✅'}</span>
          {notification.msg}
        </div>
      )}

      {/* ── Sidebar ── */}
      <div className="w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white min-h-screen flex flex-col shadow-2xl">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-xl">🏥</span>
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-tight">Patient</p>
              <p className="text-slate-400 text-sm">Management</p>
            </div>
          </div>
        </div>

        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center gap-3 bg-slate-700/50 rounded-xl p-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-white font-semibold text-sm truncate">Dr. {user?.firstName} {user?.lastName}</p>
              <p className="text-slate-400 text-xs">General Physician</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => (
            <button key={item.key} onClick={() => setActiveTab(item.key)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all text-sm font-medium ${
                activeTab === item.key
                  ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/60'
              }`}>
              <span className="text-base">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <button onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-red-500/20 transition-all text-sm font-medium">
            <span>🚪</span> Logout
          </button>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
          <div className="px-8 py-4 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {navItems.find(n => n.key === activeTab)?.icon} {navItems.find(n => n.key === activeTab)?.label}
              </h2>
              <p className="text-sm text-gray-400">Last updated: {new Date().toLocaleTimeString()}</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={fetchDashboardData} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all" title="Refresh">🔄</button>
              <button onClick={onLogout} className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl hover:from-red-600 hover:to-rose-700 transition-all font-semibold text-sm shadow-md">
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-auto">

          {/* ══ DASHBOARD ══ */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Welcome Banner */}
              <div className="relative bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 rounded-2xl p-8 text-white overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4"></div>
                <div className="absolute bottom-0 left-1/3 w-40 h-40 bg-white/5 rounded-full translate-y-1/2"></div>
                <div className="relative flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium mb-1">Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}</p>
                    <h1 className="text-3xl font-bold mb-2">Dr. {user?.firstName} {user?.lastName} 👋</h1>
                    <p className="text-blue-100">Have a wonderful day caring for your patients!</p>
                  </div>
                  <div className="text-7xl opacity-80">👨‍⚕️</div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[
                  { label: 'Patients in Queue', value: stats.patientsInQueue, icon: '👥', color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50', text: 'text-blue-600' },
                  { label: "Today's Appointments", value: stats.todaysAppointments, icon: '📅', color: 'from-emerald-500 to-green-500', bg: 'bg-emerald-50', text: 'text-emerald-600' },
                  { label: 'Total Patients', value: patients.length, icon: '🏥', color: 'from-violet-500 to-purple-500', bg: 'bg-violet-50', text: 'text-violet-600' },
                ].map(s => (
                  <SectionCard key={s.label} className="p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 font-medium mb-1">{s.label}</p>
                        <p className="text-4xl font-bold text-gray-900">{s.value}</p>
                      </div>
                      <div className={`w-14 h-14 bg-gradient-to-br ${s.color} rounded-2xl flex items-center justify-center text-2xl shadow-lg`}>
                        {s.icon}
                      </div>
                    </div>
                  </SectionCard>
                ))}
              </div>

              {/* Queue */}
              <SectionCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Current Patient Queue</h3>
                    <p className="text-sm text-gray-400">Next patients waiting for consultation</p>
                  </div>
                  <button onClick={handleCallNext}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 font-semibold shadow-md transition-all text-sm">
                    📢 Call Next Patient
                  </button>
                </div>
                {loading ? (
                  <div className="flex flex-col items-center py-12">
                    <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mb-3"></div>
                    <p className="text-gray-400">Loading queue...</p>
                  </div>
                ) : queueData.length === 0 ? (
                  <EmptyState icon="📋" text="No patients in queue" />
                ) : (
                  <div className="space-y-3">
                    {queueData.map((patient, index) => (
                      <div key={patient.id} className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                        index === 0 ? 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200 shadow-sm' : 'bg-gray-50 border-gray-100'
                      }`}>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md ${
                          index === 0 ? 'bg-gradient-to-br from-blue-500 to-cyan-500' : 'bg-gradient-to-br from-gray-400 to-gray-500'
                        }`}>{patient.queue_number}</div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{patient.patient_first_name} {patient.patient_last_name}</p>
                          <p className="text-sm text-gray-500">{patient.patient_id}</p>
                        </div>
                        {index === 0 && <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full text-xs font-bold shadow">NEXT</span>}
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>
            </div>
          )}

          {/* ══ QUEUE TAB ══ */}
          {activeTab === 'queue' && (
            <div className="space-y-6">
              <SectionCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center text-white text-lg">📅</div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Today's Appointments</h3>
                      <p className="text-sm text-gray-400">{appointments.length} scheduled today</p>
                    </div>
                  </div>
                  <button onClick={fetchDashboardData} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all text-sm font-medium">🔄 Refresh</button>
                </div>
                {appointments.length === 0 ? <EmptyState icon="📅" text="No appointments today" /> : (
                  <div className="space-y-3">
                    {appointments.map(appt => (
                      <div key={appt.id} className="flex items-center gap-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-xl hover:shadow-md transition-all">
                        <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex flex-col items-center justify-center text-white flex-shrink-0 shadow-md">
                          <p className="text-xs font-medium leading-none">{appt.appointment_time?.split(':')[0]}</p>
                          <p className="text-lg font-bold leading-none">{appt.appointment_time?.split(':')[1]}</p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900">{appt.patient_first_name} {appt.patient_last_name}</p>
                          <p className="text-sm text-gray-500">{appt.patient_id}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="px-2 py-1 text-xs rounded-full bg-violet-100 text-violet-700 font-medium capitalize">{appt.appointment_type}</span>
                          <span className={`px-2 py-1 text-xs rounded-full font-medium capitalize ${statusBadge(appt.status)}`}>{appt.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>

              <SectionCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center text-white text-lg">🏥</div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Patient Queue</h3>
                      <p className="text-sm text-gray-400">{allQueue.length} patients</p>
                    </div>
                  </div>
                  <button onClick={handleCallNext}
                    className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 font-semibold shadow-md transition-all text-sm">
                    📢 Call Next
                  </button>
                </div>
                {allQueue.length === 0 ? <EmptyState icon="🏥" text="Queue is empty" /> : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="bg-gray-50 rounded-xl">
                          {['#', 'Patient', 'Phone', 'Status', 'Room', 'Action'].map(h => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide first:rounded-l-xl last:rounded-r-xl">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {allQueue.map(q => (
                          <tr key={q.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-xl flex items-center justify-center text-sm font-bold shadow">{q.queue_number}</div>
                            </td>
                            <td className="px-4 py-3">
                              <p className="font-semibold text-gray-900 text-sm">{q.patient_first_name} {q.patient_last_name}</p>
                              <p className="text-xs text-gray-400">{q.patient_id}</p>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">{q.patient_phone || '—'}</td>
                            <td className="px-4 py-3"><span className={`px-2 py-1 text-xs rounded-full font-medium capitalize ${statusBadge(q.status)}`}>{q.status?.replace('_', ' ')}</span></td>
                            <td className="px-4 py-3 text-sm text-gray-500">{q.assigned_room || '—'}</td>
                            <td className="px-4 py-3">
                              {q.status === 'in_consultation' && (
                                <button onClick={() => handleCompleteConsultation(q.id)}
                                  className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs rounded-lg hover:from-emerald-600 hover:to-green-600 font-semibold shadow transition-all">
                                  ✓ Complete
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </SectionCard>
            </div>
          )}

          {/* ══ LABORATORY ══ */}
          {activeTab === 'laboratory' && (
            <SectionCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-lg">🔬</div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Laboratory Orders</h3>
                    <p className="text-sm text-gray-400">{labTests.length} tests ordered</p>
                  </div>
                </div>
                <button onClick={() => setShowLabTestModal(true)}
                  className="px-5 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl hover:from-sky-600 hover:to-blue-700 font-semibold shadow-md transition-all text-sm">
                  + Order Lab Test
                </button>
              </div>
              {labTests.length === 0 ? <EmptyState icon="🔬" text="No lab tests ordered yet" /> : (
                <div className="grid md:grid-cols-2 gap-4">
                  {labTests.map(test => (
                    <div key={test.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-all bg-gradient-to-br from-sky-50 to-blue-50">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-bold text-gray-900">{test.test_name}</p>
                          <p className="text-sm text-gray-500">{test.patient_first_name} {test.patient_last_name} · {test.patient_id}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full font-bold capitalize ${statusBadge(test.status)}`}>{test.status}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 text-xs rounded-full bg-sky-100 text-sky-700 font-medium capitalize">{test.test_type}</span>
                        <span className="text-xs text-gray-400">{new Date(test.requested_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          )}

          {/* ══ PHARMACY ══ */}
          {activeTab === 'pharmacy' && (
            <SectionCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center text-white text-lg">💊</div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Prescriptions</h3>
                    <p className="text-sm text-gray-400">{prescriptions.length} prescriptions issued</p>
                  </div>
                </div>
                <button onClick={() => setShowPrescriptionModal(true)}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:from-emerald-600 hover:to-green-700 font-semibold shadow-md transition-all text-sm">
                  + Create Prescription
                </button>
              </div>
              {prescriptions.length === 0 ? <EmptyState icon="💊" text="No prescriptions created yet" /> : (
                <div className="grid md:grid-cols-2 gap-4">
                  {prescriptions.map(rx => (
                    <div key={rx.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-all bg-gradient-to-br from-emerald-50 to-green-50">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-bold text-gray-900">{rx.medication_name}</p>
                          <p className="text-sm text-gray-500">{rx.patient_first_name} {rx.patient_last_name}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full font-bold capitalize ${statusBadge(rx.status)}`}>{rx.status}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="bg-white rounded-lg p-2 border border-emerald-100 text-center"><p className="text-gray-400">Dosage</p><p className="font-bold text-gray-800">{rx.dosage}</p></div>
                        <div className="bg-white rounded-lg p-2 border border-emerald-100 text-center"><p className="text-gray-400">Frequency</p><p className="font-bold text-gray-800">{rx.frequency}</p></div>
                        <div className="bg-white rounded-lg p-2 border border-emerald-100 text-center"><p className="text-gray-400">Duration</p><p className="font-bold text-gray-800">{rx.duration}</p></div>
                      </div>
                      <p className="mt-2 text-xs text-gray-400">{new Date(rx.issued_at).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          )}

          {/* ══ PATIENT HISTORY ══ */}
          {activeTab === 'patientHistory' && (
            <PatientHistoryTab patients={patients} headers={headers} showNotification={showNotification} />
          )}

          {/* ══ PORTFOLIO ══ */}
          {activeTab === 'portfolio' && (
            <div className="max-w-2xl space-y-6">
              <SectionCard className="overflow-hidden">
                <div className="h-28 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400"></div>
                <div className="px-8 pb-8">
                  <div className="flex items-end gap-4 -mt-10 mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-rose-400 to-pink-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-xl border-4 border-white">
                      {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                    </div>
                    <div className="pb-1">
                      <h3 className="text-xl font-bold text-gray-900">Dr. {user?.firstName} {user?.lastName}</h3>
                      <p className="text-gray-500 text-sm">{portfolioForm.specialization}</p>
                    </div>
                    {!editingPortfolio && (
                      <button onClick={() => setEditingPortfolio(true)}
                        className="ml-auto px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl hover:from-rose-600 hover:to-pink-700 font-semibold text-sm shadow-md transition-all">
                        ✏️ Edit Profile
                      </button>
                    )}
                  </div>

                  {editingPortfolio ? (
                    <form onSubmit={handleSavePortfolio} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">First Name</label>
                          <input type="text" value={portfolioForm.firstName} onChange={e => setPortfolioForm({...portfolioForm, firstName: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-400 bg-gray-50" required />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Last Name</label>
                          <input type="text" value={portfolioForm.lastName} onChange={e => setPortfolioForm({...portfolioForm, lastName: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-400 bg-gray-50" required />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Phone</label>
                        <input type="text" value={portfolioForm.phone} onChange={e => setPortfolioForm({...portfolioForm, phone: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-400 bg-gray-50" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Specialization</label>
                        <input type="text" value={portfolioForm.specialization} onChange={e => setPortfolioForm({...portfolioForm, specialization: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-400 bg-gray-50" />
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl hover:from-rose-600 hover:to-pink-700 font-semibold shadow-md transition-all">Save Changes</button>
                        <button type="button" onClick={() => setEditingPortfolio(false)} className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all">Cancel</button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-3">
                      {[
                        { icon: '📧', label: 'Email', value: user?.email },
                        { icon: '📱', label: 'Phone', value: user?.phone || portfolioForm.phone || 'Not set' },
                        { icon: '🏥', label: 'Role', value: 'Doctor' },
                        { icon: '🩺', label: 'Specialization', value: portfolioForm.specialization },
                      ].map(({ icon, label, value }) => (
                        <div key={label} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                          <span className="text-xl">{icon}</span>
                          <div>
                            <p className="text-xs text-gray-400 font-medium">{label}</p>
                            <p className="font-semibold text-gray-800">{value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </SectionCard>
            </div>
          )}
        </main>
      </div>

      {/* ══ PRESCRIPTION MODAL ══ */}
      {showPrescriptionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center text-white text-lg">💊</div>
              <h3 className="text-xl font-bold text-gray-900">Create Prescription</h3>
            </div>
            <form onSubmit={handleCreatePrescription} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Select Patient *</label>
                <select value={selectedPatient?.id || ''} onChange={e => setSelectedPatient(patients.find(p => p.id === e.target.value) || null)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-400 bg-gray-50" required>
                  <option value="">Choose a patient...</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.patient_id} — {p.first_name} {p.last_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Medication Name *</label>
                <input type="text" value={prescriptionForm.medication_name} onChange={e => setPrescriptionForm({...prescriptionForm, medication_name: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-400 bg-gray-50" placeholder="e.g., Paracetamol" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Dosage *</label>
                  <input type="text" value={prescriptionForm.dosage} onChange={e => setPrescriptionForm({...prescriptionForm, dosage: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-400 bg-gray-50" placeholder="e.g., 500mg" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Frequency *</label>
                  <input type="text" value={prescriptionForm.frequency} onChange={e => setPrescriptionForm({...prescriptionForm, frequency: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-400 bg-gray-50" placeholder="e.g., 3x daily" required />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Duration *</label>
                <input type="text" value={prescriptionForm.duration} onChange={e => setPrescriptionForm({...prescriptionForm, duration: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-400 bg-gray-50" placeholder="e.g., 5 days" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Instructions</label>
                <textarea value={prescriptionForm.instructions} onChange={e => setPrescriptionForm({...prescriptionForm, instructions: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-400 bg-gray-50" rows="3" placeholder="Additional instructions..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:from-emerald-600 hover:to-green-700 font-semibold shadow-md transition-all">Create Prescription</button>
                <button type="button" onClick={() => { setShowPrescriptionModal(false); setSelectedPatient(null); setPrescriptionForm({ medication_name: '', dosage: '', frequency: '', duration: '', instructions: '' }); }} className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ LAB TEST MODAL ══ */}
      {showLabTestModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-lg">🔬</div>
              <h3 className="text-xl font-bold text-gray-900">Order Lab Test</h3>
            </div>
            <form onSubmit={handleCreateLabTest} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Select Patient *</label>
                <select value={selectedPatient?.id || ''} onChange={e => setSelectedPatient(patients.find(p => p.id === e.target.value) || null)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-400 bg-gray-50" required>
                  <option value="">Choose a patient...</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.patient_id} — {p.first_name} {p.last_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Test Type *</label>
                <select value={labTestForm.test_type} onChange={e => setLabTestForm({...labTestForm, test_type: e.target.value, test_name: ''})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-400 bg-gray-50" required>
                  {Object.keys(commonLabTests).map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Test Name *</label>
                <select value={labTestForm.test_name} onChange={e => setLabTestForm({...labTestForm, test_name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-400 bg-gray-50" required>
                  <option value="">Choose a test...</option>
                  {commonLabTests[labTestForm.test_type]?.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Notes</label>
                <textarea value={labTestForm.notes} onChange={e => setLabTestForm({...labTestForm, notes: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-400 bg-gray-50" rows="3" placeholder="Special instructions..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl hover:from-sky-600 hover:to-blue-700 font-semibold shadow-md transition-all">Order Lab Test</button>
                <button type="button" onClick={() => { setShowLabTestModal(false); setSelectedPatient(null); setLabTestForm({ test_type: 'hematology', test_name: '', notes: '' }); }} className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
