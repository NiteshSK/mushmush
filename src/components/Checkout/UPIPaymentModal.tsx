import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import ReactQRCode from 'react-qr-code';

interface UPIPaymentModalProps {
  orderData: {
    orderNumber: string;
    customerName: string;
    email: string;
    total: number;
  };
  onClose: () => void;
  onPaymentComplete: (paymentData: any) => void;
}

const UPIPaymentModal: React.FC<UPIPaymentModalProps> = ({
  orderData,
  onClose,
  onPaymentComplete,
}) => {
  const [upiId, setUpiId] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // Company UPI details
  const companyUPI = {
    id: 'pravesh.rawat340-2@oksbi',
    name: 'Pravesh Rawat',
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!transactionId.trim()) {
      toast.error('Please enter the UPI transaction ID');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('orderNumber', orderData.orderNumber);
      formData.append('paymentMethod', 'UPI');
      formData.append('upiTransactionId', transactionId);
      formData.append('upiId', upiId);
      formData.append('amount', orderData.total.toString());
      formData.append('customerEmail', orderData.email);
      
      if (paymentProof) {
        formData.append('paymentProof', paymentProof);
      }

      const response = await fetch('/api/checkout/upi-payment', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const paymentData = await response.json();
        toast.success(paymentData.message || 'Payment submitted successfully! Your order has been confirmed.');
        onPaymentComplete(paymentData);
        onClose();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to process payment');
      }
    } catch (error) {
      toast.error('Error processing payment');
    } finally {
      setLoading(false);
    }
  };

  const copyUPIId = () => {
    navigator.clipboard.writeText(companyUPI.id);
    toast.success('UPI ID copied to clipboard!');
  };

  const generateUPILink = () => {
    const amount = orderData.total;
    const note = `Order ${orderData.orderNumber}`;
    return `upi://pay?pa=${companyUPI.id}&pn=${encodeURIComponent(companyUPI.name)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Complete UPI Payment</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Order Summary */}
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold mb-2">Order Details</h3>
            <div className="text-sm space-y-1">
              <p><strong>Order #:</strong> {orderData.orderNumber}</p>
              <p><strong>Customer:</strong> {orderData.customerName}</p>
              <p><strong>Email:</strong> {orderData.email}</p>
              <p><strong>Amount:</strong> ₹{orderData.total.toLocaleString()}</p>
            </div>
          </div>

          {/* Payment Instructions */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center mb-2">
              <span className="text-yellow-600 mr-2">⚠️</span>
              <strong className="text-yellow-800">Important Instructions:</strong>
            </div>
            <ol className="list-decimal list-inside text-sm text-yellow-800 space-y-1">
              <li>Make payment to the UPI ID shown below</li>
              <li>Use the exact amount: ₹{orderData.total.toLocaleString()}</li>
              <li>Include your order number in payment note</li>
              <li>Save the transaction ID after successful payment</li>
              <li>Upload payment screenshot if possible</li>
            </ol>
          </div>

          {/* UPI Payment Section */}
          <div className="border rounded-lg p-6 mb-6">
            <div className="text-center">
              <h4 className="font-semibold text-lg mb-4">Pay to:</h4>
              
              <div className="bg-gray-100 rounded-lg p-4 mb-4">
                <div className="text-2xl font-bold text-blue-600 mb-2">{companyUPI.id}</div>
                <div className="text-gray-600">{companyUPI.name}</div>
                <button
                  onClick={copyUPIId}
                  className="mt-2 text-blue-600 hover:text-blue-800 text-sm underline"
                >
                  📋 Copy UPI ID
                </button>
              </div>

              <div className="space-y-3">
                <a
                  href={generateUPILink()}
                  className="block bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  📱 Pay with UPI App
                </a>
                
                <div className="text-sm text-gray-600">
                  Amount: ₹{orderData.total.toLocaleString()}<br/>
                  Note: Order {orderData.orderNumber}
                </div>
                
                {/* QR Code */}
                <div className="flex justify-center py-4">
                  <ReactQRCode value={generateUPILink()} size={200} />
                </div>
                <p className="text-xs text-gray-500">Scan QR code with any UPI app</p>
              </div>
            </div>
          </div>

          {/* Payment Details Form */}
          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your UPI ID (Optional)
              </label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="yourname@upi"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                UPI Transaction ID <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter 12-digit transaction ID"
                required
              />
              <div className="text-xs text-gray-500 mt-1">
                You'll find this in your UPI app after successful payment
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Screenshot (Optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPaymentProof(e.target.files?.[0] || null)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="text-xs text-gray-500 mt-1">
                Upload screenshot for faster verification
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-yellow-800">Security Notice</p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Please don't share your transaction ID with anyone except through this form. Our team will never ask for your UPI PIN or OTP.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue hover:bg-blue-dark text-white rounded-md disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Payment Details'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UPIPaymentModal;
