import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import ReactQRCode from 'react-qr-code';

interface PaymentModalProps {
  registration: {
    id: string;
    registrationNumber: string;
    participantName: string;
    totalAmount: number;
    trainingProgram: {
      name: string;
    };
  };
  onClose: () => void;
  onPaymentComplete: (paymentData: any) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  registration,
  onClose,
  onPaymentComplete,
}) => {
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [upiId, setUpiId] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Payment Details, 2: UPI Payment, 3: Confirmation

  // Company UPI details (you should replace with actual details)
  const companyUPI = {
    id: 'pravesh.rawat340-2@oksbi', // Replace with your actual UPI ID
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
      formData.append('registrationId', registration.id);
      formData.append('paymentMethod', paymentMethod);
      formData.append('upiTransactionId', transactionId);
      formData.append('upiId', upiId);
      formData.append('amount', registration.totalAmount.toString());
      
      if (paymentProof) {
        formData.append('paymentProof', paymentProof);
      }

      const response = await fetch('/api/training-payments', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const paymentData = await response.json();
        toast.success(paymentData.message || 'Payment submitted successfully! Your registration has been confirmed.');
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
    const amount = registration.totalAmount;
    const note = `Training Registration ${registration.registrationNumber}`;
    return `upi://pay?pa=${companyUPI.id}&pn=${encodeURIComponent(companyUPI.name)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Complete Payment</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Registration Summary */}
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold mb-2">Registration Details</h3>
            <div className="text-sm space-y-1">
              <p><strong>Registration #:</strong> {registration.registrationNumber}</p>
              <p><strong>Program:</strong> {registration.trainingProgram.name}</p>
              <p><strong>Participant:</strong> {registration.participantName}</p>
              <p><strong>Amount:</strong> ₹{registration.totalAmount.toLocaleString()}</p>
            </div>
          </div>

          {step === 1 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
              <div className="space-y-4">
                <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="upi"
                      name="paymentMethod"
                      value="UPI"
                      checked={paymentMethod === 'UPI'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <label htmlFor="upi" className="flex items-center cursor-pointer">
                      <span className="text-2xl mr-2">📱</span>
                      <div>
                        <div className="font-semibold">UPI Payment</div>
                        <div className="text-sm text-gray-600">Pay using any UPI app (GPay, PhonePe, Paytm, etc.)</div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setStep(2)}
                  className="inline-flex font-medium text-white bg-blue py-3 px-7 rounded-md ease-out duration-200 hover:bg-blue-dark"
                >
                  Proceed to Payment
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">UPI Payment Instructions</h3>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-center mb-2">
                  <span className="text-yellow-600 mr-2">⚠️</span>
                  <strong className="text-yellow-800">Important Instructions:</strong>
                </div>
                <ol className="list-decimal list-inside text-sm text-yellow-800 space-y-1">
                  <li>Make payment to the UPI ID shown below</li>
                  <li>Use the exact amount: ₹{registration.totalAmount.toLocaleString()}</li>
                  <li>Include your registration number in payment note</li>
                  <li>Save the transaction ID after successful payment</li>
                  <li>Upload payment screenshot if possible</li>
                </ol>
              </div>

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
                      Amount: ₹{registration.totalAmount.toLocaleString()}<br/>
                      Note: Training Registration {registration.registrationNumber}
                    </div>
                    <ReactQRCode value={generateUPILink()} size={200} />
                  </div>
                </div>
              </div>

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
                    UPI Transaction ID *
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

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-6 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Back
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
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
