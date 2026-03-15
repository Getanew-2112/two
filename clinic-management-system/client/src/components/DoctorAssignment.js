import React, { useState, useEffect } from 'react';

const DoctorAssignment = ({ triageId, currentDoctor, onAssignmentChange }) => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(currentDoctor?.id || '');
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAvailableDoctors();
  }, []);

  useEffect(() => {
    if (currentDoctor) {
      setSelectedDoctor(currentDoctor.id);
    }
  }, [currentDoctor]);

  const fetchAvailableDoctors = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/triage/available-doctors', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDoctors(data.doctors || []);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignment = async () => {
    if (!selectedDoctor) {
      alert('Please select a doctor');
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/triage/assign-doctor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          triage_id: triageId,
          doctor_id: selectedDoctor,
          assignment_notes: assignmentNotes
        })
      });

      if (response.ok) {
        const data = await response.json();
        alert('Doctor assigned successfully!');
        
        if (onAssignmentChange) {
          onAssignmentChange(data.assigned_doctor);
        }
        
        setAssignmentNotes('');
      } else {
        const error = await response.json();
        alert(`Failed to assign doctor: ${error.message}`);
      }
    } catch (error) {
      console.error('Error assigning doctor:', error);
      alert('Failed to assign doctor. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const selectedDoctorInfo = doctors.find(d => d.id === selectedDoctor);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h4 className="text-lg font-semibold text-gray-900 mb-4">Doctor Assignment</h4>

      {loading ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-sm text-gray-600 mt-2">Loading doctors...</p>
        </div>
      ) : (
        <>
          {/* Current Assignment Display */}
          {currentDoctor && (
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 mb-4">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">👨‍⚕️</span>
                <div>
                  <p className="text-xs text-teal-600 font-semibold">Currently Assigned</p>
                  <p className="text-sm font-semibold text-gray-900">{currentDoctor.name}</p>
                </div>
              </div>
            </div>
          )}

          {/* Doctor Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Doctor *
            </label>
            <select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={saving}
            >
              <option value="">-- Select a doctor --</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  Dr. {doctor.first_name} {doctor.last_name}
                </option>
              ))}
            </select>
          </div>

          {/* Selected Doctor Info */}
          {selectedDoctorInfo && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="flex items-start space-x-2">
                <span className="text-xl">ℹ️</span>
                <div>
                  <p className="text-xs text-blue-600 font-semibold">Selected Doctor</p>
                  <p className="text-sm font-semibold text-gray-900">
                    Dr. {selectedDoctorInfo.first_name} {selectedDoctorInfo.last_name}
                  </p>
                  {selectedDoctorInfo.email && (
                    <p className="text-xs text-gray-600">{selectedDoctorInfo.email}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Assignment Notes */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assignment Notes (Optional)
            </label>
            <textarea
              value={assignmentNotes}
              onChange={(e) => setAssignmentNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="e.g., Patient requires specialist consultation, specific symptoms..."
              disabled={saving}
            />
          </div>

          {/* Action Button */}
          <button
            onClick={handleAssignment}
            disabled={!selectedDoctor || saving}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                Assigning...
              </span>
            ) : currentDoctor ? (
              'Update Assignment'
            ) : (
              'Assign Doctor'
            )}
          </button>

          {/* Help Text */}
          <p className="text-xs text-gray-500 mt-2 text-center">
            The patient and doctor will be notified of this assignment
          </p>
        </>
      )}
    </div>
  );
};

export default DoctorAssignment;
