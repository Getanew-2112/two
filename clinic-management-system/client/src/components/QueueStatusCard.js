import React, { useState, useEffect } from 'react';

const QueueStatusCard = ({ patientId, autoRefresh = true }) => {
  const [queueStatus, setQueueStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    if (patientId) {
      fetchQueueStatus();

      // Auto-refresh every 30 seconds if enabled
      if (autoRefresh) {
        const interval = setInterval(fetchQueueStatus, 30000);
        return () => clearInterval(interval);
      }
    }
  }, [patientId, autoRefresh]);

  const fetchQueueStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/queue`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Find current patient in queue
        const myQueue = data.find(q => q.patient_id === patientId && q.status === 'waiting');
        
        if (myQueue) {
          // Count patients ahead
          const patientsAhead = data.filter(q => 
            q.status === 'waiting' && q.queue_number < myQueue.queue_number
          ).length;

          setQueueStatus({
            queue_number: myQueue.queue_number,
            position: myQueue.queue_number,
            patients_ahead: patientsAhead,
            estimated_wait_time: myQueue.estimated_wait_time || 0,
            status: myQueue.status,
            assigned_doctor: myQueue.doctor_first_name ? {
              name: `Dr. ${myQueue.doctor_first_name} ${myQueue.doctor_last_name}`
            } : null,
            priority_level: myQueue.priority_level || 'green',
            assigned_room: myQueue.assigned_room
          });
        } else {
          setQueueStatus(null);
        }
      }
      
      setLastUpdated(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Error fetching queue status:', error);
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'red':
        return 'bg-red-100 text-red-800 border-red-500';
      case 'orange':
        return 'bg-orange-100 text-orange-800 border-orange-500';
      case 'yellow':
        return 'bg-yellow-100 text-yellow-800 border-yellow-500';
      case 'green':
      default:
        return 'bg-green-100 text-green-800 border-green-500';
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'red':
        return 'Emergency';
      case 'orange':
        return 'Very Urgent';
      case 'yellow':
        return 'Urgent';
      case 'green':
      default:
        return 'Non-Urgent';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (!queueStatus) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center py-4">
          <span className="text-4xl mb-2 block">📋</span>
          <p className="text-gray-600">You are not currently in the queue</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900">Queue Status</h3>
        {autoRefresh && lastUpdated && (
          <span className="text-xs text-gray-500">
            Updated {new Date(lastUpdated).toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Priority Badge */}
      <div className="mb-4">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border-2 ${getPriorityColor(queueStatus.priority_level)}`}>
          <span className="mr-1">
            {queueStatus.priority_level === 'red' && '🔴'}
            {queueStatus.priority_level === 'orange' && '🟠'}
            {queueStatus.priority_level === 'yellow' && '🟡'}
            {queueStatus.priority_level === 'green' && '🟢'}
          </span>
          {getPriorityLabel(queueStatus.priority_level)}
        </span>
      </div>

      {/* Queue Info Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Your Queue Number</p>
          <p className="text-3xl font-bold text-blue-600">#{queueStatus.queue_number}</p>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Patients Ahead</p>
          <p className="text-3xl font-bold text-green-600">{queueStatus.patients_ahead}</p>
        </div>
      </div>

      {/* Estimated Wait Time */}
      <div className="bg-purple-50 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Estimated Wait Time</p>
            <p className="text-2xl font-bold text-purple-600">
              {queueStatus.estimated_wait_time < 60 
                ? `${queueStatus.estimated_wait_time} min`
                : `${Math.floor(queueStatus.estimated_wait_time / 60)}h ${queueStatus.estimated_wait_time % 60}m`
              }
            </p>
          </div>
          <span className="text-4xl">⏰</span>
        </div>
      </div>

      {/* Assigned Doctor */}
      {queueStatus.assigned_doctor && (
        <div className="bg-teal-50 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">👨‍⚕️</span>
            <div>
              <p className="text-sm text-gray-600">Assigned Doctor</p>
              <p className="text-lg font-semibold text-gray-900">{queueStatus.assigned_doctor.name}</p>
            </div>
          </div>
        </div>
      )}

      {/* Assigned Room */}
      {queueStatus.assigned_room && (
        <div className="bg-yellow-50 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">🚪</span>
            <div>
              <p className="text-sm text-gray-600">Room Number</p>
              <p className="text-lg font-semibold text-gray-900">{queueStatus.assigned_room}</p>
            </div>
          </div>
        </div>
      )}

      {/* Status Message */}
      <div className="border-t border-gray-200 pt-4">
        {queueStatus.patients_ahead === 0 ? (
          <div className="bg-green-100 border border-green-300 rounded-lg p-3">
            <p className="text-green-800 font-semibold text-center">
              🎉 It's your turn! Please proceed to the consultation room.
            </p>
          </div>
        ) : queueStatus.patients_ahead <= 2 ? (
          <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3">
            <p className="text-yellow-800 font-semibold text-center">
              ⚠️ Almost your turn! Please be ready.
            </p>
          </div>
        ) : (
          <p className="text-gray-600 text-center text-sm">
            Please wait for your turn. We'll notify you when it's time.
          </p>
        )}
      </div>

      {/* Refresh Button */}
      {!autoRefresh && (
        <button
          onClick={fetchQueueStatus}
          className="w-full mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Refresh Status
        </button>
      )}
    </div>
  );
};

export default QueueStatusCard;
