"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import PaymentModal from "./PaymentModal";

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
}

const TrainingPrograms = () => {
  const { data: session } = useSession();
  const [trainingPrograms, setTrainingPrograms] = useState<TrainingProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProgram, setSelectedProgram] = useState<TrainingProgram | null>(null);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingRegistration, setPendingRegistration] = useState<any>(null);

  // Fetch training programs
  useEffect(() => {
    const fetchTrainingPrograms = async () => {
      try {
        const response = await fetch("/api/training-programs");
        if (response.ok) {
          const data = await response.json();
          console.log("Fetched training programs:", data);
          setTrainingPrograms(data);
        } else {
          console.error("Failed to fetch training programs:", response.status);
          toast.error("Failed to fetch training programs");
        }
      } catch (error) {
        console.error("Error fetching training programs:", error);
        toast.error("Error fetching training programs");
      } finally {
        setLoading(false);
      }
    };

    fetchTrainingPrograms();
  }, []);

  const handleRegisterClick = (program: TrainingProgram) => {
    setSelectedProgram(program);
    setShowRegistrationModal(true);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "OYSTER":
        return "🦪";
      case "BUTTON":
        return "🍄";
      case "SHIITAKE":
        return "🍄‍🟫";
      case "GANODERMA":
        return "🍄‍🟤";
      default:
        return "🍄";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "OYSTER":
        return "bg-blue-100 text-blue-800";
      case "BUTTON":
        return "bg-green-100 text-green-800";
      case "SHIITAKE":
        return "bg-purple-100 text-purple-800";
      case "GANODERMA":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-16 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6">
            Mushroom Cultivation Training Programs
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl mb-6 md:mb-8 max-w-3xl mx-auto leading-relaxed">
            Master the art of mushroom cultivation with our comprehensive, hands-on training programs. 
            Learn from experts and start your journey in sustainable agriculture.
          </p>
          <div className="flex flex-wrap justify-center gap-6 md:gap-8 text-base md:text-lg">
            <div className="flex items-center space-x-2">
              <span className="text-green-300">✓</span>
              <span>Theory & Practical Training</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-300">✓</span>
              <span>Expert Instructors</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-300">✓</span>
              <span>Certification Provided</span>
            </div>
          </div>
        </div>
      </div>

      {/* Training Programs Grid */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">
            Choose Your Training Program
          </h2>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            We offer specialized training programs for different types of mushroom cultivation. 
            Each program includes both theoretical knowledge and hands-on practical experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 md:gap-8 max-w-6xl mx-auto">
          {trainingPrograms.map((program) => (
            <div
              key={program.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="p-6 md:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div className="flex items-center">
                    <span className="text-3xl md:text-4xl mr-3">{getTypeIcon(program.type)}</span>
                    <div>
                      <h3 className="text-xl md:text-2xl font-bold text-gray-900">{program.name}</h3>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(
                          program.type
                        )}`}
                      >
                        {program.type}
                      </span>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="text-2xl md:text-3xl font-bold text-green-600">
                      ₹{program.price.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">per participant</div>
                  </div>
                </div>

                <p className="text-gray-600 mb-6 leading-relaxed">
                  {program.description}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">Duration</div>
                    <div className="font-semibold text-gray-900">{program.duration} Days</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">Daily Hours</div>
                    <div className="font-semibold text-gray-900">{program.dailyHours}</div>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">What You'll Learn:</h4>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2 mt-0.5">•</span>
                      <span>Mushroom biology and lifecycle</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2 mt-0.5">•</span>
                      <span>Substrate preparation and sterilization</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2 mt-0.5">•</span>
                      <span>Inoculation techniques</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2 mt-0.5">•</span>
                      <span>Environmental control and monitoring</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2 mt-0.5">•</span>
                      <span>Harvesting and post-harvest handling</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2 mt-0.5">•</span>
                      <span>Business aspects and marketing</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => handleRegisterClick(program)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 border-0 shadow-sm hover:shadow-md"
                >
                  Register Now
                </button>
              </div>
            </div>
          ))}
        </div>

        {trainingPrograms.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">No training programs available at the moment.</div>
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="bg-white py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Why Choose Our Training Programs?
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="text-center p-6 rounded-lg hover:bg-gray-50 transition-colors duration-200">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👨‍🏫</span>
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2">Expert Instructors</h3>
              <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                Learn from experienced mushroom cultivation experts with years of practical knowledge.
              </p>
            </div>
            
            <div className="text-center p-6 rounded-lg hover:bg-gray-50 transition-colors duration-200">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔬</span>
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2">Hands-On Learning</h3>
              <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                Get practical experience with real mushroom cultivation setups and equipment.
              </p>
            </div>
            
            <div className="text-center p-6 rounded-lg hover:bg-gray-50 transition-colors duration-200">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📜</span>
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2">Certification</h3>
              <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                Receive official certification upon successful completion of the training program.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Modal */}
      {showRegistrationModal && selectedProgram && (
        <RegistrationModal
          program={selectedProgram}
          onClose={() => {
            setShowRegistrationModal(false);
            setSelectedProgram(null);
          }}
          user={session?.user}
          onRegistrationComplete={(registration) => {
            setPendingRegistration(registration);
            setShowPaymentModal(true);
          }}
        />
      )}

      {/* Payment Modal */}
      {showPaymentModal && pendingRegistration && (
        <PaymentModal
          registration={pendingRegistration}
          onClose={() => {
            setShowPaymentModal(false);
            setPendingRegistration(null);
          }}
          onPaymentComplete={(paymentData) => {
            toast.success('Payment submitted! Check your email for confirmation.');
            setShowPaymentModal(false);
            setPendingRegistration(null);
          }}
        />
      )}
    </div>
  );
};

// Registration Modal Component
const RegistrationModal = ({
  program,
  onClose,
  user,
  onRegistrationComplete,
}: {
  program: TrainingProgram;
  onClose: () => void;
  user: any;
  onRegistrationComplete: (registration: any) => void;
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
        onClose();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to register");
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
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 border-0 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                {loading ? "Registering..." : "Register"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TrainingPrograms;
