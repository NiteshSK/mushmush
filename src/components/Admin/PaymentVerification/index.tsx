"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

interface PaymentRegistration {
  id: string;
  registrationNumber: string;
  participantName: string;
  participantEmail: string;
  participantPhone: string;
  totalAmount: number;
  paymentStatus: string;
  paymentMethod: string;
  upiTransactionId: string;
  paymentReference: string;
  paymentDate: string;
  trainingProgram: {
    name: string;
    price: number;
  };
  user: {
    name: string;
    email: string;
  } | null;
}

const PaymentVerification = () => {
  const [registrations, setRegistrations] = useState<PaymentRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("PROCESSING");
  const [selectedRegistration, setSelectedRegistration] = useState<PaymentRegistration | null>(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  useEffect(() => {
    fetchRegistrations();
  }, [selectedStatus]);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/payment-verification?status=${selectedStatus}`);
      if (response.ok) {
        const data = await response.json();
        setRegistrations(data);
      } else {
        toast.error("Failed to fetch registrations");
      }
    } catch (error) {
      toast.error("Error fetching registrations");
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (registrationId: string, action: 'approve' | 'reject', adminNotes?: string) => {
    try {
      const response = await fetch('/api/admin/payment-verification', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          registrationId,
          action,
          adminNotes
        })
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(result.message);
        fetchRegistrations(); // Refresh the list
        setShowVerificationModal(false);
        setSelectedRegistration(null);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to process verification');
      }
    } catch (error) {
      toast.error('Error processing verification');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      PENDING: "bg-yellow-100 text-yellow-800",
      PROCESSING: "bg-blue-100 text-blue-800",
      COMPLETED: "bg-green-100 text-green-800",
      FAILED: "bg-red-100 text-red-800",
      REFUNDED: "bg-gray-100 text-gray-800"
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Payment Verification</h1>
        
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="PROCESSING">Pending Verification</option>
          <option value="COMPLETED">Approved</option>
          <option value="FAILED">Rejected</option>
        </select>
      </div>

      {registrations.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No registrations found for {selectedStatus.toLowerCase()} status.</div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Participant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Program
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {registrations.map((registration) => (
                <tr key={registration.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {registration.registrationNumber}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(registration.paymentDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {registration.participantName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {registration.participantEmail}
                    </div>
                    <div className="text-sm text-gray-500">
                      {registration.participantPhone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {registration.trainingProgram.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ₹{registration.totalAmount.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div><strong>Method:</strong> {registration.paymentMethod}</div>
                      <div><strong>UPI ID:</strong> {registration.paymentReference || 'N/A'}</div>
                      <div><strong>Transaction ID:</strong> {registration.upiTransactionId}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(registration.paymentStatus)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {registration.paymentStatus === 'PROCESSING' && (
                      <div className="space-x-2">
                        <button
                          onClick={() => {
                            setSelectedRegistration(registration);
                            setShowVerificationModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Review
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Verification Modal */}
      {showVerificationModal && selectedRegistration && (
        <VerificationModal
          registration={selectedRegistration}
          onClose={() => {
            setShowVerificationModal(false);
            setSelectedRegistration(null);
          }}
          onVerify={handleVerification}
        />
      )}
    </div>
  );
};

// Verification Modal Component
const VerificationModal = ({
  registration,
  onClose,
  onVerify,
}: {
  registration: PaymentRegistration;
  onClose: () => void;
  onVerify: (registrationId: string, action: 'approve' | 'reject', adminNotes?: string) => void;
}) => {
  const [adminNotes, setAdminNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAction = async (action: 'approve' | 'reject') => {
    setLoading(true);
    try {
      await onVerify(registration.id, action, adminNotes);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Payment Verification</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Registration Details */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold mb-4">Registration Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Registration #:</strong> {registration.registrationNumber}
              </div>
              <div>
                <strong>Program:</strong> {registration.trainingProgram.name}
              </div>
              <div>
                <strong>Participant:</strong> {registration.participantName}
              </div>
              <div>
                <strong>Email:</strong> {registration.participantEmail}
              </div>
              <div>
                <strong>Phone:</strong> {registration.participantPhone}
              </div>
              <div>
                <strong>Amount:</strong> ₹{registration.totalAmount.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold mb-4">Payment Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Payment Method:</strong> {registration.paymentMethod}
              </div>
              <div>
                <strong>Payment Date:</strong> {new Date(registration.paymentDate).toLocaleString()}
              </div>
              <div>
                <strong>UPI Transaction ID:</strong> 
                <div className="font-mono bg-white p-2 rounded mt-1 break-all">
                  {registration.upiTransactionId}
                </div>
              </div>
              <div>
                <strong>UPI ID:</strong> {registration.paymentReference || 'Not provided'}
              </div>
            </div>
          </div>

          {/* Admin Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Admin Notes (Optional)
            </label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add any notes about this verification..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={() => handleAction('reject')}
              className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Reject Payment'}
            </button>
            <button
              onClick={() => handleAction('approve')}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Approve Payment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentVerification;
