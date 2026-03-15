import React, { useState, useEffect } from 'react';

const PaymentVerification = ({ onVerificationComplete }) => {
  const [pendingPayments, setPendingPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(null);
  const [verificationNotes, setVerificationNotes] = useState('');

  useEffect(() => {
    fetchPendingPayments();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchPendingPayments, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchPendingPayments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/payments/pending', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPendingPayments(data.payments || []);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching pending payments:', error);
      setLoading(false);
    }
  };

  const handleVerification = async (paymentId, status) => {
    setVerifying(paymentId);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/payments/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          payment_id: paymentId,
          verification_status: status,
          notes: verificationNotes
        })
      });

      if (response.ok) {
        alert(`Payment ${status === 'confirmed' ? 'confirmed' : 'rejected'} successfully!`);
        
        // Remove from pending list
        setPendingPayments(pendingPayments.filter(p => p.id !== paymentId));
        setVerificationNotes('');
        
        if (onVerificationComplete) {
          onVerificationComplete();
        }
      } else {
        const error = await response.json();
        alert(`Verification failed: ${error.message}`);
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      alert('Failed to verify payment. Please try again.');
    } finally {
      setVerifying(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading pending payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Payment Verification</h3>
          <p className="text-sm text-gray-500">Verify cash payments from patients</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
            {pendingPayments.length} Pending
          </span>
          <button
            onClick={fetchPendingPayments}
            className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
            title="Refresh"
          >
            <span className="text-xl">🔄</span>
          </button>
        </div>
      </div>

      {pendingPayments.length === 0 ? (
        <div className="text-center py-12">
          <span className="text-6xl mb-4 block">✅</span>
          <p className="text-gray-600 text-lg">No pending payments to verify</p>
          <p className="text-sm text-gray-500 mt-2">All cash payments have been processed</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingPayments.map((payment) => (
            <div
              key={payment.id}
              className="border-2 border-yellow-200 bg-yellow-50 rounded-lg p-6"
            >
              {/* Patient Info */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center">
                    <span className="text-2xl">👤</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      {payment.first_name} {payment.last_name}
                    </h4>
                    <p className="text-sm text-gray-600">ID: {payment.patient_id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-yellow-600">ETB {payment.amount}</p>
                  <p className="text-xs text-gray-500">{payment.payment_type}</p>
                </div>
              </div>

              {/* Payment Details */}
              <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-white rounded-lg">
                <div>
                  <p className="text-xs text-gray-500">Payment Method</p>
                  <p className="text-sm font-semibold text-gray-900 capitalize">
                    💵 {payment.payment_method}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Transaction ID</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {payment.transaction_id}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Initiated At</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatDate(payment.created_at)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <span className="inline-flex px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                    Pending Verification
                  </span>
                </div>
              </div>

              {/* Verification Notes */}
              {verifying === payment.id && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Verification Notes (Optional)
                  </label>
                  <textarea
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows="2"
                    placeholder="e.g., Cash received, Receipt issued..."
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => handleVerification(payment.id, 'confirmed')}
                  disabled={verifying !== null}
                  className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  {verifying === payment.id ? (
                    <span className="flex items-center justify-center">
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                      Confirming...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <span className="mr-2">✓</span>
                      Confirm Payment
                    </span>
                  )}
                </button>
                
                <button
                  onClick={() => handleVerification(payment.id, 'rejected')}
                  disabled={verifying !== null}
                  className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  {verifying === payment.id ? (
                    'Processing...'
                  ) : (
                    <span className="flex items-center justify-center">
                      <span className="mr-2">✗</span>
                      Reject Payment
                    </span>
                  )}
                </button>
              </div>

              {/* Help Text */}
              <p className="text-xs text-gray-500 mt-3 text-center">
                Confirming will add the patient to the queue automatically
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PaymentVerification;
