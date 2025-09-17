import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import ReactQRCode from 'react-qr-code';
import { upiGateway } from '@/lib/upi-gateway';
import { generateTransactionNote } from '@/lib/upi-verification';

interface AutomatedPaymentModalProps {
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

const AutomatedPaymentModal: React.FC<AutomatedPaymentModalProps> = ({
  registration,
  onClose,
  onPaymentComplete,
}) => {
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Payment Details, 2: UPI Payment, 3: Processing, 4: Confirmation
  const [paymentStatus, setPaymentStatus] = useState<any>(null);
  const [pollingActive, setPollingActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes timeout
  const [autoDetectedTxnId, setAutoDetectedTxnId] = useState<string | null>(null);
  const [manualTxnId, setManualTxnId] = useState('');
  const [showManualEntry, setShowManualEntry] = useState(false);

  // Company UPI details
  const companyUPI = {
    id: 'pravesh.rawat340-2@oksbi',
    name: 'Pravesh Rawat',
  };

  // Generate UPI link
  const upiLink = `upi://pay?pa=${companyUPI.id}&pn=${encodeURIComponent(companyUPI.name)}&am=${registration.totalAmount}&cu=INR&tn=${generateTransactionNote(registration.registrationNumber)}`;

  // Handle payment timeout
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 2 && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && step === 2) {
      handlePaymentTimeout();
    }
    return () => clearTimeout(timer);
  }, [step, timeLeft]);

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const copyUPIId = () => {
    navigator.clipboard.writeText(companyUPI.id);
    toast.success('UPI ID copied to clipboard!');
  };

  const copyUPILink = () => {
    navigator.clipboard.writeText(upiLink);
    toast.success('UPI link copied to clipboard!');
  };

  const startPaymentProcess = () => {
    setStep(2);
    setTimeLeft(300);
    startPaymentMonitoring();
  };

  const startPaymentMonitoring = () => {
    setPollingActive(true);
    setPaymentStatus({ status: 'PENDING' });

    // Simulate payment detection (in real implementation, this would use webhooks or real-time APIs)
    const monitoringInterval = setInterval(() => {
      if (!pollingActive) {
        clearInterval(monitoringInterval);
        return;
      }

      // Simulate random payment detection (replace with actual payment detection logic)
      const paymentDetected = Math.random() > 0.95; // 5% chance per check
      if (paymentDetected) {
        const mockTransactionId = generateMockTransactionId();
        setAutoDetectedTxnId(mockTransactionId);
        processDetectedPayment(mockTransactionId);
        clearInterval(monitoringInterval);
      }
    }, 3000); // Check every 3 seconds

    // Cleanup on unmount
    return () => clearInterval(monitoringInterval);
  };

  const generateMockTransactionId = () => {
    // Generate a realistic transaction ID for simulation
    const timestamp = Date.now().toString().slice(-10);
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${timestamp}${random}`;
  };

  const processDetectedPayment = async (transactionId: string) => {
    setStep(3);
    setLoading(true);
    setPaymentStatus({ status: 'PENDING', transactionId });

    try {
      // Verify the transaction using the payment verifier
      const response = await fetch('/api/quick-verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactionId,
          amount: registration.totalAmount
        }),
      });

      const verificationResult = await response.json();

      if (verificationResult.success) {
        // Submit payment to backend
        const formData = new FormData();
        formData.append('registrationId', registration.id);
        formData.append('paymentMethod', paymentMethod);
        formData.append('upiTransactionId', transactionId);
        formData.append('upiId', companyUPI.id);
        formData.append('amount', registration.totalAmount.toString());

        const response = await fetch('/api/training-payments', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const paymentData = await response.json();
          setPaymentStatus({ status: 'SUCCESS', transactionId, timestamp: new Date() });
          setStep(4);
          
          // Show success toast
          toast.success(
            `🎉 Registration Complete!\n\n` +
            `Registration Number: ${registration.registrationNumber}\n` +
            `Program: ${registration.trainingProgram.name}\n` +
            `Amount Paid: ₹${registration.totalAmount.toLocaleString()}\n` +
            `Payment Method: ${paymentMethod}\n` +
            `Transaction ID: ${transactionId}\n\n` +
            `Check your email for detailed confirmation and training timetable!`,
            {
              duration: 10000,
              style: {
                maxWidth: '600px',
                whiteSpace: 'pre-line',
                fontSize: '14px'
              }
            }
          );
          
          onPaymentComplete(paymentData);
          // Auto-close after 3 seconds and redirect
          setTimeout(() => {
            onClose();
            // Redirect to training page or dashboard after successful payment
            window.location.href = '/training';
          }, 3000);
        } else {
          const error = await response.json();
          setPaymentStatus({ 
            status: 'FAILED', 
            transactionId, 
            errorMessage: error.error || 'Payment processing failed' 
          });
          toast.error(error.error || 'Failed to process payment');
        }
      } else {
        setPaymentStatus({ 
          status: 'FAILED', 
          transactionId, 
          errorMessage: verificationResult.message 
        });
        toast.error(verificationResult.message || 'Transaction verification failed');
      }
    } catch (error) {
      setPaymentStatus({ 
        status: 'FAILED', 
        transactionId, 
        errorMessage: 'Payment processing error' 
      });
      toast.error('Error processing payment');
    } finally {
      setLoading(false);
      setPollingActive(false);
    }
  };

  const handlePaymentTimeout = () => {
    setPollingActive(false);
    setPaymentStatus({ status: 'TIMEOUT', errorMessage: 'Payment timeout' });
    toast.error('Payment session expired. Please try again.');
  };

  const resetPayment = () => {
    setStep(1);
    setPaymentStatus(null);
    setAutoDetectedTxnId(null);
    setTimeLeft(300);
    setPollingActive(false);
  };

  const getStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="text-center">
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Payment Summary</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-lg font-medium">{registration.trainingProgram.name}</p>
                <p className="text-2xl font-bold text-green-600">₹{registration.totalAmount.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Registration: {registration.registrationNumber}</p>
              </div>
            </div>
            
            <div className="mb-6">
              <h4 className="font-medium mb-3">Payment Method</h4>
              <div className="space-y-2">
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="UPI"
                    checked={paymentMethod === 'UPI'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">📱</span>
                    <div>
                      <p className="font-medium">UPI Payment</p>
                      <p className="text-sm text-gray-600">Pay using any UPI app</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <button
              onClick={startPaymentProcess}
              className="inline-flex font-medium text-white bg-blue py-3 px-7 rounded-md ease-out duration-200 hover:bg-blue-dark"
            >
              Proceed to Payment
            </button>
          </div>
        );

      case 2:
        return (
          <div className="text-center">
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-4">Scan & Pay</h3>
              
              <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300 mb-4">
                <ReactQRCode value={upiLink} size={200} className="mx-auto mb-4" />
                <p className="text-sm text-gray-600">Scan QR code with any UPI app</p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">UPI ID:</span>
                  <button onClick={copyUPIId} className="text-blue-600 hover:text-blue-800 text-sm">
                    Copy
                  </button>
                </div>
                <p className="font-mono text-sm break-all">{companyUPI.id}</p>
                
                <div className="flex justify-between items-center mb-2 mt-3">
                  <span className="font-medium">Amount:</span>
                  <span className="font-bold text-green-600">₹{registration.totalAmount.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Note:</span>
                  <span className="text-sm">{generateTransactionNote(registration.registrationNumber)}</span>
                </div>

                <div className="flex justify-between items-center mt-3">
                  <span className="font-medium">UPI Link:</span>
                  <button onClick={copyUPILink} className="text-blue-600 hover:text-blue-800 text-sm">
                    Copy Link
                  </button>
                </div>
              </div>

              <div className="bg-yellow-50 p-3 rounded-lg mb-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-yellow-800">Time Remaining:</span>
                  <span className={`font-bold ${timeLeft < 60 ? 'text-red-600' : 'text-yellow-600'}`}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  Complete your payment within 5 minutes
                </p>
              </div>

              {paymentStatus && (
                <div className="bg-blue-100 p-3 rounded-lg">
                  <p className="text-sm text-blue-800">
                    {paymentStatus.status === 'PENDING' ? '🔄 Waiting for payment...' : '🔍 Monitoring payment...'}
                  </p>
                </div>
              )}

              <button
                onClick={() => setShowManualEntry(true)}
                className="w-full bg-blue-100 text-blue-700 py-3 px-6 rounded-lg hover:bg-blue-200 font-medium"
              >
                Enter Transaction ID Manually
              </button>

              {showManualEntry && (
                <div className="mt-4">
                  <input
                    type="text"
                    value={manualTxnId}
                    onChange={(e) => setManualTxnId(e.target.value)}
                    placeholder="Enter transaction ID"
                    className="w-full p-3 rounded-lg border border-gray-300"
                  />
                  <button
                    onClick={() => processDetectedPayment(manualTxnId)}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 font-medium mt-2"
                  >
                    Verify Payment
                  </button>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={resetPayment}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-blue-100 text-blue-700 py-2 px-4 rounded-lg hover:bg-blue-200"
              >
                Back
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="text-center">
            <div className="mb-6">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold mb-2">Processing Payment</h3>
              <p className="text-gray-600">
                {autoDetectedTxnId 
                  ? `Verifying transaction: ${autoDetectedTxnId}`
                  : 'Please wait while we verify your payment...'
                }
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="text-center">
            <div className="mb-6">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-xl font-semibold mb-2 text-green-600">Payment Successful!</h3>
              <p className="text-gray-600 mb-4">
                Your registration has been confirmed.
              </p>
              
              {autoDetectedTxnId && (
                <div className="bg-green-50 p-3 rounded-lg mb-4">
                  <p className="text-sm"><strong>Transaction ID:</strong> {autoDetectedTxnId}</p>
                </div>
              )}

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  ✅ Registration confirmed<br/>
                  ✅ Payment verified<br/>
                  ✅ Confirmation email sent<br/>
                  ✅ Training timetable included
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 font-medium"
            >
              Continue
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              {step === 4 ? 'Payment Complete!' : 'Complete Payment'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
              disabled={loading || step === 3}
            >
              ×
            </button>
          </div>

          {getStepContent()}
        </div>
      </div>
    </div>
  );
};

export default AutomatedPaymentModal;
