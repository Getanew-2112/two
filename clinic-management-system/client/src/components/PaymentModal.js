import React, { useState } from 'react';

const PaymentModal = ({ isOpen, onClose, patientId, amount = 500, onPaymentSuccess }) => {
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [processing, setProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, processing, success, failed
  const [errorMessage, setErrorMessage] = useState('');
  const [paymentData, setPaymentData] = useState(null);

  const handlePayment = async () => {
    setProcessing(true);
    setPaymentStatus('processing');
    setErrorMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/payments/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          payment_method: selectedMethod,
          amount: amount,
          payment_type: 'consultation'
        })
      });

      const data = await response.json();

      if (response.ok) {
        setPaymentData(data);
        
        // For digital payments, simulate payment gateway redirect
        if (selectedMethod === 'card' || selectedMethod === 'mobile') {
          // In production, redirect to payment gateway
          // window.location.href = data.payment_url;
          
          // For demo, simulate successful payment after 2 seconds
          setTimeout(async () => {
            await simulatePaymentSuccess(data.transaction_id);
          }, 2000);
        } else {
          // For cash, show success immediately (needs receptionist verification)
          setPaymentStatus('success');
          setTimeout(() => {
            if (onPaymentSuccess) {
              onPaymentSuccess(data);
            }
          }, 2000);
        }
      } else {
        setPaymentStatus('failed');
        setErrorMessage(data.message || 'Payment initiation failed');
        setProcessing(false);
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus('failed');
      setErrorMessage('Network error. Please try again.');
      setProcessing(false);
    }
  };

  const simulatePaymentSuccess = async (transactionId) => {
    try {
      // Simulate payment gateway webhook
      const response = await fetch('http://localhost:5000/api/payments/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          transaction_id: transactionId,
          status: 'success',
          amount: amount,
          payment_method: selectedMethod,
          card_last4: '1234',
          card_brand: 'Visa'
        })
      });

      if (response.ok) {
        setPaymentStatus('success');
        setProcessing(false);
        
        // Wait 2 seconds then close and trigger success callback
        setTimeout(() => {
          if (onPaymentSuccess) {
            onPaymentSuccess(paymentData);
          }
          handleClose();
        }, 2000);
      }
    } catch (error) {
      console.error('Webhook simulation error:', error);
      setPaymentStatus('failed');
      setErrorMessage('Payment verification failed');
      setProcessing(false);
    }
  };

  const handleClose = () => {
    if (!processing) {
      setSelectedMethod('card');
      setPaymentStatus('idle');
      setErrorMessage('');
      setPaymentData(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        {paymentStatus === 'success' ? (
          <div className="text-center">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl text-white">✓</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h3>
            <p className="text-gray-600 mb-2">
              {selectedMethod === 'cash' 
                ? 'Please proceed to reception for verification.'
                : 'Your payment has been confirmed.'}
            </p>
            <p className="text-sm text-gray-500">
              Transaction ID: {paymentData?.transaction_id}
            </p>
          </div>
        ) : paymentStatus === 'failed' ? (
          <div className="text-center">
            <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl text-white">✗</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h3>
            <p className="text-gray-600 mb-4">{errorMessage}</p>
            <button
              onClick={() => setPaymentStatus('idle')}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Payment Required</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-1">Consultation Fee:</p>
              <p className="text-3xl font-bold text-blue-600">ETB {amount}</p>
            </div>
            
            <p className="text-gray-600 mb-6">Select your payment method:</p>
            
            <div className="space-y-3 mb-6">
              <button
                onClick={() => setSelectedMethod('card')}
                disabled={processing}
                className={`w-full flex items-center justify-between px-6 py-4 border-2 rounded-lg transition-colors ${
                  selectedMethod === 'card'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-300'
                } ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">💳</span>
                  <span className="font-semibold text-gray-900">Credit/Debit Card</span>
                </div>
                {selectedMethod === 'card' && (
                  <span className="text-blue-600">✓</span>
                )}
              </button>
              
              <button
                onClick={() => setSelectedMethod('mobile')}
                disabled={processing}
                className={`w-full flex items-center justify-between px-6 py-4 border-2 rounded-lg transition-colors ${
                  selectedMethod === 'mobile'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 hover:border-green-300'
                } ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📱</span>
                  <span className="font-semibold text-gray-900">Mobile Money</span>
                </div>
                {selectedMethod === 'mobile' && (
                  <span className="text-green-600">✓</span>
                )}
              </button>
              
              <button
                onClick={() => setSelectedMethod('cash')}
                disabled={processing}
                className={`w-full flex items-center justify-between px-6 py-4 border-2 rounded-lg transition-colors ${
                  selectedMethod === 'cash'
                    ? 'border-yellow-500 bg-yellow-50'
                    : 'border-gray-300 hover:border-yellow-300'
                } ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">💵</span>
                  <span className="font-semibold text-gray-900">Cash at Reception</span>
                </div>
                {selectedMethod === 'cash' && (
                  <span className="text-yellow-600">✓</span>
                )}
              </button>
            </div>

            {selectedMethod === 'cash' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800">
                  <span className="font-semibold">Note:</span> Please proceed to the reception desk to complete your cash payment. 
                  The receptionist will verify your payment and add you to the queue.
                </p>
              </div>
            )}
            
            <div className="flex space-x-3">
              <button
                onClick={handleClose}
                disabled={processing}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handlePayment}
                disabled={processing}
                className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? 'Processing...' : 'Proceed to Pay'}
              </button>
            </div>
            
            {processing && paymentStatus === 'processing' && (
              <div className="mt-4 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-sm text-gray-600 mt-2">
                  {selectedMethod === 'cash' 
                    ? 'Initiating payment...'
                    : 'Processing payment...'}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
