"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import Breadcrumb from "@/components/Common/Breadcrumb";
import AutomatedPaymentModal from "./AutomatedPaymentModal";

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
    window.location.href = `/training/${program.slug}/schedule`;
  };

  const handleCheckScheduleClick = (program: TrainingProgram) => {
    window.location.href = `/training/${program.slug}/schedule`;
  };

  const handleRegisterNowClick = async (program: TrainingProgram) => {
    if (!session) {
      // Redirect to login page if user is not authenticated
      window.location.href = `/auth/signin?callbackUrl=${encodeURIComponent(window.location.pathname)}`;
      return;
    }

    try {
      // Check if user is already registered for this program
      const checkResponse = await fetch(`/api/training-registrations/check?programId=${program.id}`);
      
      if (checkResponse.ok) {
        const checkData = await checkResponse.json();
        
        if (checkData.isRegistered) {
          // User is already registered, show existing registration details
          const registration = checkData.registration;
          toast.error(
            `You are already registered for ${registration.programName}!\n\n` +
            `Registration Number: ${registration.registrationNumber}\n` +
            `Status: ${registration.status}\n` +
            `Payment Status: ${registration.paymentStatus}`,
            {
              duration: 8000,
              style: {
                maxWidth: '500px',
                whiteSpace: 'pre-line'
              }
            }
          );
          return;
        }
      }
    } catch (error) {
      console.error('Error checking registration status:', error);
      // If check fails, continue with registration flow
      toast.error('Could not verify registration status. Continuing with registration...');
    }
    
    // User is not registered or check failed, proceed with registration
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
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "BUTTON":
        return "bg-green-50 text-green-700 border-green-200";
      case "SHIITAKE":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "GANODERMA":
        return "bg-orange-50 text-orange-700 border-orange-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getCardColor = (type: string) => {
    switch (type) {
      case "OYSTER":
        return "bg-blue-25 border-blue-100";
      case "BUTTON":
        return "bg-green-25 border-green-100";
      case "SHIITAKE":
        return "bg-purple-25 border-purple-100";
      case "GANODERMA":
        return "bg-orange-25 border-orange-100";
      default:
        return "bg-gray-25 border-gray-100";
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
    <>
      <Breadcrumb title={"Training Programs"} pages={["training"]} />

      {/* Hero Section */}
      <section className="relative py-16 sm:py-24 bg-gradient-to-b from-[#E9E6F4] to-white overflow-hidden">
        {/* Full section festive background elements - z-index below content */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          {/* Effect 1: Sparkle Dots across the whole section */}
          {[...Array(50)].map((_, i) => (
            <div
              key={`training-sparkle-dots-${i}`}
              className="absolute w-2 h-2 rounded-full bg-red-400 animate-section-sparkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
                backgroundColor: ['#f87171', '#fbbf24', '#a78bfa', '#60a5fa'][Math.floor(Math.random() * 4)],
              }}
            />
          ))}
          {/* Soft pulse overlay for the entire section */}
          <div className="absolute inset-0 bg-purple-200/10 animate-pulse-soft"></div>

          {/* Mushroom "Confetti" falling for the entire section */}
          {[...Array(40)].map((_, i) => (
            <div
              key={`training-falling-mushroom-${i}`}
              className="absolute text-2xl animate-mushroom-fall z-0"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-${Math.random() * 30}%`,
                animationDelay: `${Math.random() * 7}s`,
                animationDuration: `${10 + Math.random() * 8}s`,
                transform: `rotate(${Math.random() * 360}deg) scale(${0.8 + Math.random() * 0.4})`,
                opacity: 0.7 + Math.random() * 0.3,
              }}
            >
              🍄
            </div>
          ))}
        </div>

        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0 relative z-10">
          <div className="text-center">
            <h1 className="font-bold text-4xl sm:text-5xl xl:text-6xl text-dark mb-6 animate-text-breathe">
              Mushroom Cultivation Training Programs
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto animate-text-glow">
              Master the art of mushroom cultivation with our comprehensive, hands-on training programs. 
              Learn from experts and start your journey in sustainable agriculture.
            </p>
          </div>
        </div>
      </section>

      {/* Training Programs Section */}
      <section className="relative py-20 bg-gradient-to-b from-[#E9E6F4] to-[#f3f4f6] overflow-hidden">
        {/* Full section festive background elements - z-index below content */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          {/* Effect 1: Sparkle Dots across the whole section */}
          {[...Array(40)].map((_, i) => (
            <div
              key={`programs-sparkle-dots-${i}`}
              className="absolute w-2 h-2 rounded-full bg-red-400 animate-section-sparkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
                backgroundColor: ['#f87171', '#fbbf24', '#a78bfa', '#60a5fa'][Math.floor(Math.random() * 4)],
              }}
            />
          ))}
          {/* Soft pulse overlay for the entire section */}
          <div className="absolute inset-0 bg-purple-200/10 animate-pulse-soft"></div>

          {/* Mushroom "Confetti" falling for the entire section */}
          {[...Array(30)].map((_, i) => (
            <div
              key={`programs-falling-mushroom-${i}`}
              className="absolute text-2xl animate-mushroom-fall z-0"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-${Math.random() * 30}%`,
                animationDelay: `${Math.random() * 7}s`,
                animationDuration: `${10 + Math.random() * 8}s`,
                transform: `rotate(${Math.random() * 360}deg) scale(${0.8 + Math.random() * 0.4})`,
                opacity: 0.7 + Math.random() * 0.3,
              }}
            >
              🍄
            </div>
          ))}
        </div>

        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0 relative z-10">
          <div className="text-center mb-12">
            <h2 className="font-bold text-3xl sm:text-4xl text-dark mb-4 animate-text-breathe">
              Choose Your Training Program
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto animate-text-glow">
              We offer specialized training programs for different types of mushroom cultivation. 
              Each program includes both theoretical knowledge and hands-on practical experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {trainingPrograms.map((program) => (
              <div
                key={program.id}
                className={`rounded-xl border-2 ${getCardColor(program.type)} overflow-hidden hover:shadow-lg transition-all duration-300`}
              >
                <div className="p-6 md:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div className="flex items-center">
                      <span className="text-3xl md:text-4xl mr-3">{getTypeIcon(program.type)}</span>
                      <div>
                        <h3 className="text-xl md:text-2xl font-bold text-gray-900">{program.name}</h3>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getTypeColor(
                            program.type
                          )}`}
                        >
                          {program.type}
                        </span>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      {program.hasEarlyBirdOffer && (
                        <div className="mb-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
                            🎟️ Early Bird Offer
                          </span>
                        </div>
                      )}
                      
                      {program.hasEarlyBirdOffer && program.originalPrice && program.earlyBirdPrice ? (
                        <div className="flex flex-col sm:items-end">
                          {/* Strikethrough Original Price */}
                          <div className="text-lg md:text-xl text-gray-400 line-through">
                            ₹{program.originalPrice.toLocaleString()}
                          </div>
                          {/* Early Bird Price */}
                          <div className="text-2xl md:text-3xl font-bold text-green-600">
                            ₹{program.earlyBirdPrice.toLocaleString()}
                          </div>
                          {/* Savings Badge */}
                          <div className="text-sm font-medium text-red-600">
                            SAVE ₹{(program.originalPrice - program.earlyBirdPrice).toLocaleString()}
                          </div>
                        </div>
                      ) : (
                        <div className="text-2xl md:text-3xl font-bold text-green-600">
                          ₹{program.price.toLocaleString()}
                        </div>
                      )}
                      <div className="text-sm text-gray-500">per participant</div>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {program.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className={`p-4 rounded-lg ${getCardColor(program.type)}`}>
                      <div className="text-sm text-gray-500 mb-1">Duration</div>
                      <div className="font-semibold text-gray-900">{program.duration} Days</div>
                    </div>
                    <div className={`p-4 rounded-lg ${getCardColor(program.type)}`}>
                      <div className="text-sm text-gray-500 mb-1">Daily Hours</div>
                      <div className="font-semibold text-gray-900">{program.dailyHours}</div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => handleCheckScheduleClick(program)}
                      className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-colors duration-200 border-2 ${
                        program.type === "OYSTER" ? "bg-white text-blue-600 border-blue-200 hover:bg-blue-50" :
                        program.type === "BUTTON" ? "bg-white text-green-600 border-green-200 hover:bg-green-50" :
                        program.type === "SHIITAKE" ? "bg-white text-purple-600 border-purple-200 hover:bg-purple-50" :
                        program.type === "GANODERMA" ? "bg-white text-orange-600 border-orange-200 hover:bg-orange-50" :
                        "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      Check Schedule
                    </button>
                    <button
                      onClick={() => handleRegisterNowClick(program)}
                      className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-colors duration-200 border-2 ${
                        program.type === "OYSTER" ? "bg-white text-blue-600 border-blue-200 hover:bg-blue-50" :
                        program.type === "BUTTON" ? "bg-white text-green-600 border-green-200 hover:bg-green-50" :
                        program.type === "SHIITAKE" ? "bg-white text-purple-600 border-purple-200 hover:bg-purple-50" :
                        program.type === "GANODERMA" ? "bg-white text-orange-600 border-orange-200 hover:bg-orange-50" :
                        "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      Enroll Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
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
            setShowRegistrationModal(false);
            setSelectedProgram(null);
          }}
        />
      )}

      {showPaymentModal && pendingRegistration && (
        <AutomatedPaymentModal
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
    </>
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

export default TrainingPrograms;