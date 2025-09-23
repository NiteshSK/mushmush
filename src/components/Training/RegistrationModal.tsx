"use client";

import React, { useState } from "react";
import { toast } from "react-hot-toast";

interface TrainingProgram {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  duration: number;
  dailyHours: string;
  type: string;
  isActive: boolean;
  
  // Early Bird Pricing Fields
  hasEarlyBirdOffer: boolean;
  earlyBirdPrice?: number;
  originalPrice?: number;
  earlyBirdEndDate?: Date;
}

interface RegistrationModalProps {
  program: TrainingProgram;
  onClose: () => void;
  user: any;
  onRegistrationComplete: (registration: any) => void;
}

const RegistrationModal: React.FC<RegistrationModalProps> = ({
  program,
  onClose,
  user,
  onRegistrationComplete,
}) => {
  const [formData, setFormData] = useState({
    participantName: user?.name || "",
    participantEmail: user?.email || "",
    participantPhone: "",
    participantAddress: {
      street: "",
      city: "",
      state: "",
      pincode: "",
    },
    preferredStartDate: "",
    specialRequirements: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/training-registrations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          trainingProgramId: program.id,
          ...formData,
          userId: user?.id || null,
        }),
      });

      if (response.ok) {
        const registration = await response.json();
        toast.success(`Registration successful! Your registration number is ${registration.registrationNumber}`);
        
        // Show payment modal after successful registration
        onRegistrationComplete(registration);
      } else {
        const error = await response.json();
        
        // Handle duplicate registration error specifically
        if (response.status === 409 && error.existingRegistration) {
          const { existingRegistration } = error;
          toast.error(
            `You are already registered for this program! Registration: ${existingRegistration.registrationNumber} (Status: ${existingRegistration.status})`,
            {
              duration: 6000, // Show longer for important information
              style: {
                maxWidth: '500px',
              }
            }
          );
        } else {
          toast.error(error.error || "Failed to register");
        }
      }
    } catch (error) {
      toast.error("Error submitting registration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Register for {program.name}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{program.name}</h3>
                <p className="text-sm text-gray-600">
                  {program.duration} days • {program.dailyHours} • ₹{program.price.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.participantName}
                  onChange={(e) => setFormData({ ...formData, participantName: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.participantEmail}
                  onChange={(e) => setFormData({ ...formData, participantEmail: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.participantPhone}
                  onChange={(e) => setFormData({ ...formData, participantPhone: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Start Date
                </label>
                <input
                  type="date"
                  value={formData.preferredStartDate}
                  onChange={(e) => setFormData({ ...formData, preferredStartDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Street Address"
                  value={formData.participantAddress.street}
                  onChange={(e) => setFormData({
                    ...formData,
                    participantAddress: { ...formData.participantAddress, street: e.target.value }
                  })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
                  <input
                    type="text"
                    placeholder="City"
                    value={formData.participantAddress.city}
                    onChange={(e) => setFormData({
                      ...formData,
                      participantAddress: { ...formData.participantAddress, city: e.target.value }
                    })}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={formData.participantAddress.state}
                    onChange={(e) => setFormData({
                      ...formData,
                      participantAddress: { ...formData.participantAddress, state: e.target.value }
                    })}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="PIN Code"
                    value={formData.participantAddress.pincode}
                    onChange={(e) => setFormData({
                      ...formData,
                      participantAddress: { ...formData.participantAddress, pincode: e.target.value }
                    })}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Requirements or Questions
              </label>
              <textarea
                value={formData.specialRequirements}
                onChange={(e) => setFormData({ ...formData, specialRequirements: e.target.value })}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Any dietary restrictions, accessibility needs, or questions..."
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue hover:bg-blue-dark text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                {loading ? "Registering..." : "Continue to Payment"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegistrationModal;
