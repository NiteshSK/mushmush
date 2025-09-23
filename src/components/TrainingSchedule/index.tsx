"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PaymentModal from "@/components/Training/PaymentModal";

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

interface TrainingSchedule {
  id: number;
  dayNumber: number;
  date: string;
  title: string;
  description: string;
  topics: string[];
  practicalSessions: any[];
  theoreticalSessions: any[];
  learningObjectives: string[];
  materials: string[];
  instructor?: {
    id: number;
    name: string;
    email: string;
    phone: string;
    bio: string;
    expertise: string;
    experience: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
  startTime: string;
  endTime: string;
}

interface TrainingScheduleProps {
  programSlug: string;
}

const TrainingSchedule: React.FC<TrainingScheduleProps> = ({ programSlug }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [program, setProgram] = useState<TrainingProgram | null>(null);
  const [schedules, setSchedules] = useState<TrainingSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingRegistration, setPendingRegistration] = useState<any>(null);
  const [registrationForm, setRegistrationForm] = useState({
    participantName: "",
    participantEmail: "",
    participantPhone: "",
    participantAddress: "",
    preferredStartDate: "",
    specialRequirements: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProgramAndSchedule = async () => {
      try {
        // First fetch the program details
        const programResponse = await fetch(`/api/training-programs/${programSlug}`);
        if (programResponse.ok) {
          const programData = await programResponse.json();
          setProgram(programData);

          // Then fetch the schedule using the program ID
          const scheduleResponse = await fetch(`/api/training-programs/${programData.id}/schedule`);
          if (scheduleResponse.ok) {
            const scheduleData = await scheduleResponse.json();
            setSchedules(scheduleData);
          }
        } else {
          toast.error("Training program not found");
        }
      } catch (error) {
        console.error("Error fetching training schedule:", error);
        toast.error("Failed to load training schedule");
      } finally {
        setLoading(false);
      }
    };

    fetchProgramAndSchedule();
  }, [programSlug]);

  const handleRegisterClick = () => {
    if (!session) {
      toast.error("Please login to register for the training program");
      router.push("/auth/signin");
      return;
    }
    setShowRegistrationModal(true);
  };

  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!program) {
      toast.error("Program information not available");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/training-registrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trainingProgramId: program.id,
          participantName: registrationForm.participantName,
          participantEmail: registrationForm.participantEmail,
          participantPhone: registrationForm.participantPhone,
          participantAddress: registrationForm.participantAddress,
          preferredStartDate: registrationForm.preferredStartDate || null,
          specialRequirements: registrationForm.specialRequirements || null,
          userId: session?.user?.id || null,
        }),
      });

      if (response.ok) {
        const registrationData = await response.json();
        setPendingRegistration(registrationData);
        setShowRegistrationModal(false);
        setShowPaymentModal(true);
        
        // Reset form
        setRegistrationForm({
          participantName: "",
          participantEmail: "",
          participantPhone: "",
          participantAddress: "",
          preferredStartDate: "",
          specialRequirements: "",
        });
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create registration');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Error creating registration');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Training Program Not Found</h2>
        <p className="text-gray-600 mb-6">The training program you're looking for doesn't exist.</p>
        <Link href="/training" className="text-blue-600 hover:text-blue-800 underline">
          Back to Training Programs
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4">
            <span className="text-4xl mr-3">{getTypeIcon(program.type)}</span>
            <h1 className="text-4xl md:text-5xl font-bold">{program.name}</h1>
          </div>
          <p className="text-xl mb-6">Detailed Training Schedule</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <span className="bg-white/20 px-4 py-2 rounded-full">
              💰 ₹{program.price.toLocaleString()}
            </span>
            <span className="bg-white/20 px-4 py-2 rounded-full">
              📅 {program.duration} Days
            </span>
            <span className="bg-white/20 px-4 py-2 rounded-full">
              ⏰ {program.dailyHours} Daily
            </span>
          </div>
        </div>
      </div>

      {/* Program Overview */}
      <div className="container mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Program Overview</h2>
          <p className="text-gray-700 text-lg leading-relaxed">{program.description}</p>
        </div>

        {/* Quick Enroll CTA */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow-md p-6 mb-8 border border-green-200">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to Start Your Journey?</h3>
              <p className="text-gray-600">Join this comprehensive training program and become an expert in mushroom cultivation.</p>
            </div>
            <button
              onClick={handleRegisterClick}
              disabled={schedules.length === 0}
              className={`px-8 py-3 text-lg font-bold rounded-lg transition-all duration-300 whitespace-nowrap ${
                schedules.length === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-black transform hover:scale-105 shadow-lg"
              }`}
            >
              {schedules.length === 0 ? "Schedule Not Available" : "🚀 Enroll Now"}
            </button>
          </div>
        </div>

        {/* Schedule Section - Timetable Style */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Training Schedule</h2>
          
          {schedules.length === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
              <h3 className="text-xl font-semibold text-yellow-800 mb-2">Schedule Not Available</h3>
              <p className="text-yellow-700 mb-4">
                The detailed schedule for this training program is not yet available. 
                Please check back later or contact us for more information.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Timetable Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 font-semibold text-sm">
                  <div className="md:col-span-1 text-center">Day</div>
                  <div className="md:col-span-2">Date & Title</div>
                  <div className="md:col-span-1">Time</div>
                  <div className="md:col-span-1">Instructor</div>
                  <div className="md:col-span-1 text-center">Sessions</div>
                </div>
              </div>
              
              {/* Timetable Body */}
              <div className="divide-y divide-gray-200">
                {schedules.map((schedule, index) => (
                  <div key={schedule.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <div className="p-4">
                      {/* Main Row - Desktop */}
                      <div className="hidden md:grid md:grid-cols-6 gap-4 items-center">
                        {/* Day Number */}
                        <div className="text-center">
                          <div className="bg-indigo-100 text-indigo-800 rounded-full w-12 h-12 flex items-center justify-center font-bold mx-auto text-lg">
                            {schedule.dayNumber}
                          </div>
                        </div>
                        
                        {/* Date & Title */}
                        <div className="md:col-span-2">
                          <div className="text-sm font-medium text-gray-900 mb-1">
                            {new Date(schedule.date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                            <span className="text-gray-500 ml-2">
                              ({new Date(schedule.date).toLocaleDateString('en-US', { weekday: 'short' })})
                            </span>
                          </div>
                          <div className="font-medium text-gray-900">{schedule.title}</div>
                        </div>
                        
                        {/* Time */}
                        <div className="text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <span className="text-lg">🕐</span>
                            <div>
                              <div className="font-medium text-gray-900">
                                {schedule.startTime}
                              </div>
                              <div className="text-xs text-gray-500">
                                to {schedule.endTime}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Instructor */}
                        <div className="text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <span className="text-lg">👨‍🏫</span>
                            <div className="font-medium text-gray-900">
                              {schedule.instructor?.name || 'TBA'}
                            </div>
                          </div>
                        </div>
                        
                        {/* Sessions Count */}
                        <div className="text-center">
                          <div className="flex justify-center space-x-3">
                            <div className="text-center">
                              <div className="text-lg font-bold text-green-600">
                                {schedule.practicalSessions?.length || 0}
                              </div>
                              <div className="text-xs text-gray-500">Practical</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-blue-600">
                                {schedule.theoreticalSessions?.length || 0}
                              </div>
                              <div className="text-xs text-gray-500">Theory</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Mobile Layout */}
                      <div className="md:hidden space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="bg-indigo-100 text-indigo-800 rounded-full w-10 h-10 flex items-center justify-center font-bold">
                              {schedule.dayNumber}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{schedule.title}</div>
                              <div className="text-sm text-gray-600">
                                {new Date(schedule.date).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-gray-900">{schedule.startTime}</div>
                            <div className="text-xs text-gray-500">{schedule.endTime}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <span>👨‍🏫</span>
                            <span className="text-gray-700">{schedule.instructor?.name || 'TBA'}</span>
                          </div>
                          <div className="flex space-x-3">
                            <span className="text-green-600 font-medium">
                              {schedule.practicalSessions?.length || 0} Practical
                            </span>
                            <span className="text-blue-600 font-medium">
                              {schedule.theoreticalSessions?.length || 0} Theory
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Expandable Details */}
                    <div className="bg-gray-50 border-t border-gray-200 px-4 py-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Topics */}
                        {schedule.topics && schedule.topics.length > 0 && (
                          <div className="bg-white p-3 rounded-lg border">
                            <h4 className="font-semibold text-gray-900 mb-2 text-sm flex items-center">
                              <span className="mr-2">📋</span> Key Topics
                            </h4>
                            <ul className="text-xs text-gray-700 space-y-1">
                              {schedule.topics.slice(0, 4).map((topic, idx) => (
                                <li key={idx} className="flex items-start">
                                  <span className="text-indigo-500 mr-1">•</span>
                                  <span>{topic}</span>
                                </li>
                              ))}
                              {schedule.topics.length > 4 && (
                                <li className="text-indigo-600 font-medium">
                                  +{schedule.topics.length - 4} more topics
                                </li>
                              )}
                            </ul>
                          </div>
                        )}
                        
                        {/* Materials */}
                        {schedule.materials && schedule.materials.length > 0 && (
                          <div className="bg-white p-3 rounded-lg border">
                            <h4 className="font-semibold text-gray-900 mb-2 text-sm flex items-center">
                              <span className="mr-2">🛠️</span> Materials
                            </h4>
                            <ul className="text-xs text-gray-700 space-y-1">
                              {schedule.materials.slice(0, 4).map((material, idx) => (
                                <li key={idx} className="flex items-start">
                                  <span className="text-green-500 mr-1">•</span>
                                  <span>{material}</span>
                                </li>
                              ))}
                              {schedule.materials.length > 4 && (
                                <li className="text-green-600 font-medium">
                                  +{schedule.materials.length - 4} more items
                                </li>
                              )}
                            </ul>
                          </div>
                        )}
                        
                        {/* Learning Objectives */}
                        {schedule.learningObjectives && schedule.learningObjectives.length > 0 && (
                          <div className="bg-white p-3 rounded-lg border">
                            <h4 className="font-semibold text-gray-900 mb-2 text-sm flex items-center">
                              <span className="mr-2">🎯</span> Learning Goals
                            </h4>
                            <ul className="text-xs text-gray-700 space-y-1">
                              {schedule.learningObjectives.slice(0, 3).map((objective, idx) => (
                                <li key={idx} className="flex items-start">
                                  <span className="text-purple-500 mr-1">•</span>
                                  <span>{objective}</span>
                                </li>
                              ))}
                              {schedule.learningObjectives.length > 3 && (
                                <li className="text-purple-600 font-medium">
                                  +{schedule.learningObjectives.length - 3} more goals
                                </li>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Timetable Footer */}
              <div className="bg-gray-100 px-6 py-4 border-t border-gray-200">
                <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-600 space-y-2 md:space-y-0">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                      Practical Sessions
                    </span>
                    <span className="flex items-center">
                      <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                      Theory Sessions
                    </span>
                  </div>
                  <div className="font-medium">
                    Total Duration: {program.duration} days • {program.dailyHours} daily
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Post-Schedule Enroll CTA */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow-md p-6 mb-8 border border-blue-200">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Ready to Transform Your Career?</h3>
            <p className="text-gray-600 mb-4 max-w-2xl mx-auto">
              You've reviewed the comprehensive training schedule. Now take the next step in your mushroom cultivation journey with expert guidance and hands-on experience.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
              <div className="flex items-center gap-2 text-green-600 font-semibold">
                <span className="text-2xl">💰</span>
                <span>Investment: ₹{program?.price?.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 text-blue-600 font-semibold">
                <span className="text-2xl">📅</span>
                <span>Duration: {program?.duration} Days</span>
              </div>
              <div className="flex items-center gap-2 text-purple-600 font-semibold">
                <span className="text-2xl">🎯</span>
                <span>Expert-Led Training</span>
              </div>
            </div>
            <button
              onClick={handleRegisterClick}
              disabled={schedules.length === 0}
              className={`px-10 py-4 text-xl font-bold rounded-lg transition-all duration-300 shadow-lg ${
                schedules.length === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white transform hover:scale-105 hover:shadow-xl"
              }`}
            >
              {schedules.length === 0 ? "Schedule Not Available" : "🚀 Enroll Now - Start Your Journey"}
            </button>
          </div>
        </div>

        {/* Registration CTA */}
        <div className="text-center">
          <button
            onClick={handleRegisterClick}
            disabled={schedules.length === 0}
            className={`px-12 py-5 text-xl font-bold rounded-lg transition-all duration-300 shadow-lg ${
              schedules.length === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white transform hover:scale-105 hover:shadow-xl"
            }`}
          >
            {schedules.length === 0 ? "Schedule Not Available" : "🚀 Enroll Now"}
          </button>
          <p className="mt-4 text-gray-600">
            <Link href="/training" className="text-blue-600 hover:text-blue-800 underline">
              ← Back to All Training Programs
            </Link>
          </p>
        </div>
      </div>

      {/* Registration Modal */}
      {showRegistrationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Register for {program?.name}</h2>
                <button
                  onClick={() => {
                    setShowRegistrationModal(false);
                    setRegistrationForm({
                      participantName: "",
                      participantEmail: "",
                      participantPhone: "",
                      participantAddress: "",
                      preferredStartDate: "",
                      specialRequirements: "",
                    });
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  &times;
                </button>
              </div>

              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Program Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Program:</span>
                    <span className="ml-2 font-medium">{program?.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Duration:</span>
                    <span className="ml-2 font-medium">{program?.duration} days</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Price:</span>
                    <span className="ml-2 font-medium text-green-600">₹{program?.price?.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Daily Hours:</span>
                    <span className="ml-2 font-medium">{program?.dailyHours}</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleRegistrationSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={registrationForm.participantName}
                      onChange={(e) => setRegistrationForm({ ...registrationForm, participantName: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={registrationForm.participantEmail}
                      onChange={(e) => setRegistrationForm({ ...registrationForm, participantEmail: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={registrationForm.participantPhone}
                      onChange={(e) => setRegistrationForm({ ...registrationForm, participantPhone: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preferred Start Date
                    </label>
                    <input
                      type="date"
                      value={registrationForm.preferredStartDate}
                      onChange={(e) => setRegistrationForm({ ...registrationForm, preferredStartDate: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address *
                  </label>
                  <textarea
                    required
                    value={registrationForm.participantAddress}
                    onChange={(e) => setRegistrationForm({ ...registrationForm, participantAddress: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Enter your complete address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Special Requirements (Optional)
                  </label>
                  <textarea
                    value={registrationForm.specialRequirements}
                    onChange={(e) => setRegistrationForm({ ...registrationForm, specialRequirements: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    placeholder="Any special requirements or dietary restrictions"
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowRegistrationModal(false);
                      setRegistrationForm({
                        participantName: "",
                        participantEmail: "",
                        participantPhone: "",
                        participantAddress: "",
                        preferredStartDate: "",
                        specialRequirements: "",
                      });
                    }}
                    className="px-6 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Creating Registration..." : "Continue to Payment"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
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
            setShowPaymentModal(false);
            setPendingRegistration(null);
            setShowRegistrationModal(false);
            toast.success("Registration submitted successfully! We will verify your payment and confirm your registration.");
          }}
        />
      )}
    </div>
  );
};

export default TrainingSchedule;
