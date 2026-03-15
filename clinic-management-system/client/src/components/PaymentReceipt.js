import React, { useState, useEffect } from 'react';

const PaymentReceipt = ({ isOpen, onClose, payment }) => {
  if (!isOpen || !payment) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Create a printable version
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payment Receipt - ${payment.receipt_number}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            .receipt { max-width: 600px; margin: 0 auto; border: 2px solid #333; padding: 30px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
            .header h1 { margin: 0; color: #2563eb; }
            .header p { margin: 5px 0; color: #666; }
            .receipt-info { margin: 20px 0; }
            .receipt-info table { width: 100%; }
            .receipt-info td { padding: 8px 0; }
            .receipt-info td:first-child { font-weight: bold; width: 40%; }
            .amount-section { background: #f3f4f6; padding: 20px; margin: 20px 0; text-align: center; }
            .amount-section .amount { font-size: 32px; font-weight: bold; color: #2563eb; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #333; }
            .status { display: inline-block; padding: 5px 15px; border-radius: 20px; font-weight: bold; }
            .status-completed { background: #dcfce7; color: #166534; }
            .status-pending { background: #fef3c7; color: #92400e; }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <h1>🏥 Clinic Management System</h1>
              <p>Payment Receipt</p>
            </div>
            
            <div class="receipt-info">
              <table>
                <tr>
                  <td>Receipt Number:</td>
                  <td><strong>${payment.receipt_number}</strong></td>
                </tr>
                <tr>
                  <td>Patient ID:</td>
                  <td>${payment.patient_id}</td>
                </tr>
                <tr>
                  <td>Patient Name:</td>
                  <td>${payment.patient_name || 'N/A'}</td>
                </tr>
                <tr>
                  <td>Payment Date:</td>
                  <td>${new Date(payment.payment_date).toLocaleString()}</td>
                </tr>
                <tr>
                  <td>Payment Method:</td>
                  <td style="text-transform: capitalize;">${payment.payment_method}</td>
                </tr>
                <tr>
                  <td>Status:</td>
                  <td><span class="status status-${payment.status}">${payment.status.toUpperCase()}</span></td>
                </tr>
              </table>
            </div>
            
            <div class="amount-section">
              <p style="margin: 0; color: #666;">Total Amount Paid</p>
              <div class="amount">${payment.amount} ETB</div>
            </div>
            
            ${payment.description ? `
              <div style="margin: 20px 0;">
                <strong>Description:</strong>
                <p style="margin: 5px 0;">${payment.description}</p>
              </div>
            ` : ''}
            
            <div class="footer">
              <p><strong>Thank you for your payment!</strong></p>
              <p style="color: #666; font-size: 12px;">This is a computer-generated receipt and does not require a signature.</p>
              <p style="color: #666; font-size: 12px;">Generated on: ${new Date().toLocaleString()}</p>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Payment Receipt</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {/* Receipt Content */}
        <div className="p-8">
          {/* Receipt Header */}
          <div className="text-center mb-8 pb-6 border-b-2 border-gray-300">
            <div className="text-4xl mb-2">🏥</div>
            <h3 className="text-2xl font-bold text-gray-900">Clinic Management System</h3>
            <p className="text-gray-600">Official Payment Receipt</p>
          </div>

          {/* Receipt Details */}
          <div className="space-y-4 mb-6">
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="font-semibold text-gray-700">Receipt Number:</span>
              <span className="text-gray-900 font-mono">{payment.receipt_number}</span>
            </div>
            
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="font-semibold text-gray-700">Patient ID:</span>
              <span className="text-gray-900">{payment.patient_id}</span>
            </div>
            
            {payment.patient_name && (
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="font-semibold text-gray-700">Patient Name:</span>
                <span className="text-gray-900">{payment.patient_name}</span>
              </div>
            )}
            
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="font-semibold text-gray-700">Payment Date:</span>
              <span className="text-gray-900">{new Date(payment.payment_date).toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="font-semibold text-gray-700">Payment Method:</span>
              <span className="text-gray-900 capitalize">{payment.payment_method}</span>
            </div>
            
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="font-semibold text-gray-700">Status:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {payment.status.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Amount Section */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 mb-6 text-center">
            <p className="text-gray-600 mb-2">Total Amount Paid</p>
            <p className="text-4xl font-bold text-blue-600">{payment.amount} ETB</p>
          </div>

          {/* Description */}
          {payment.description && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="font-semibold text-gray-700 mb-2">Description:</p>
              <p className="text-gray-900">{payment.description}</p>
            </div>
          )}

          {/* Footer */}
          <div className="text-center pt-6 border-t-2 border-gray-300">
            <p className="font-semibold text-gray-900 mb-2">Thank you for your payment!</p>
            <p className="text-sm text-gray-600">This is a computer-generated receipt and does not require a signature.</p>
            <p className="text-xs text-gray-500 mt-2">Generated on: {new Date().toLocaleString()}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-gray-50 px-8 py-4 rounded-b-xl flex justify-end space-x-4">
          <button
            onClick={handleDownload}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            🖨️ Print Receipt
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentReceipt;
