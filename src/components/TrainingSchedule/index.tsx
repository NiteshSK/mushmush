"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PaymentModal from "@/components/Training/PaymentModal";
import RegistrationModal from "@/components/Training/RegistrationModal";
import { getTrainingProgramPrice, isEarlyBirdOfferValid } from "@/lib/utils";

interface TrainingProgram {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  duration: number;
  dailyHours: string;
  type: string;
  hasEarlyBirdOffer: boolean;
  earlyBirdPrice?: number;
  originalPrice?: number;
  earlyBirdEndDate?: string | Date;
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
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set());
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const fetchProgramAndSchedule = async () => {
      try {
        const programResponse = await fetch(`/api/training-programs/${programSlug}`);
        if (programResponse.ok) {
          const programData = await programResponse.json();
          setProgram(programData);

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

  const toggleDay = (dayId: number) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(dayId)) {
      newExpanded.delete(dayId);
    } else {
      newExpanded.add(dayId);
    }
    setExpandedDays(newExpanded);
  };

  const toggleSection = (sectionKey: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const handleRegistrationSubmit = async (registration: any) => {
    setPendingRegistration(registration);
    setShowRegistrationModal(false);
    setShowPaymentModal(true);
  };

  const handleRegisterClick = () => {
    if (!session) {
      toast.error("Please login to register for the training program");
      router.push("/auth/signin");
      return;
    }
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

  const currentPrice = getTrainingProgramPrice(program);
  const earlyBirdValid = isEarlyBirdOfferValid(program);

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-green-50 py-40">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 text-black py-16 shadow-2xl">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4">
            <span className="text-5xl mr-3 animate-bounce">{getTypeIcon(program.type)}</span>
            <h1 className="text-4xl md:text-6xl font-extrabold drop-shadow-lg">{program.name}</h1>
          </div>
          <p className="text-2xl mb-8 font-semibold">📚 Comprehensive Training Schedule</p>
          <div className="flex flex-wrap justify-center gap-4 text-base">
            <span className="bg-white/30 backdrop-blur-sm px-6 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition-transform">
              💰 ₹{currentPrice.toLocaleString()}
              {earlyBirdValid && (
                <span className="ml-2 line-through text-sm opacity-75">
                  ₹{(program.originalPrice || program.price).toLocaleString()}
                </span>
              )}
            </span>
            <span className="bg-white/30 backdrop-blur-sm px-6 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition-transform">
              📅 {program.duration} Days
            </span>
            <span className="bg-white/30 backdrop-blur-sm px-6 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition-transform">
              ⏰ {program.dailyHours} Daily
            </span>
          </div>
        </div>
      </div>

      {/* Program Overview */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl border-2 border-blue-200 p-8 mb-8 hover:shadow-2xl transition-shadow">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="text-4xl mr-3">📖</span>
            Program Overview
          </h2>
          <p className="text-gray-700 text-lg leading-relaxed">{program.description}</p>
        </div>

        {/* Quick Enroll CTA */}
        <div className="bg-gradient-to-r from-green-100 via-blue-100 to-purple-100 rounded-2xl shadow-xl p-8 mb-8 border-2 border-green-300 hover:shadow-2xl transition-all">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center md:justify-start">
                <span className="text-3xl mr-2">🚀</span>
                Ready to Start Your Journey?
              </h3>
              <p className="text-gray-700 text-lg">Join this comprehensive training program and become an expert in mushroom cultivation.</p>
            </div>
            <button
              onClick={handleRegisterClick}
              disabled={schedules.length === 0}
              className={`px-8 py-3 text-lg font-bold rounded-lg transition-all duration-300 whitespace-nowrap ${schedules.length === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue hover:bg-blue-dark text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                }`}
            >
              {schedules.length === 0 ? "Schedule Not Available" : "🚀 Enroll Now"}
            </button>
          </div>
        </div>

        {/* Schedule Section */}
        <div className="mb-8">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-3 flex items-center justify-center">
              <span className="text-5xl mr-3">📅</span>
              Training Schedule
            </h2>
            <p className="text-gray-600 text-lg">Click on any day to view detailed information</p>
          </div>

          {schedules.length === 0 ? (
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-8 text-center shadow-lg">
              <span className="text-6xl mb-4 block">⚠️</span>
              <h3 className="text-2xl font-bold text-yellow-800 mb-2">Schedule Not Available</h3>
              <p className="text-yellow-700 text-lg">
                The detailed schedule for this training program is not yet available.
                Please check back later or contact us for more information.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {schedules.map((schedule) => {
                const isExpanded = expandedDays.has(schedule.id);
                const topicsKey = `${schedule.id}-topics`;
                const materialsKey = `${schedule.id}-materials`;
                const objectivesKey = `${schedule.id}-objectives`;

                return (
                  <div
                    key={schedule.id}
                    className={`bg-white rounded-2xl shadow-lg border-2 overflow-hidden transition-all duration-300 ${isExpanded
                        ? 'border-blue-500 shadow-2xl'
                        : 'border-gray-200 hover:border-blue-300 hover:shadow-xl'
                      }`}
                  >
                    {/* Day Header */}
                    <div
                      className="cursor-pointer"
                      onClick={() => toggleDay(schedule.id)}
                    >
                      {/* Desktop Layout */}
                      <div className="hidden md:block">
                        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-black p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-6">
                              <div className="bg-white text-indigo-600 rounded-2xl w-20 h-20 flex flex-col items-center justify-center font-bold shadow-lg">
                                <span className="text-xs uppercase">Day</span>
                                <span className="text-3xl">{schedule.dayNumber}</span>
                              </div>

                              <div>
                                <h3 className="text-2xl font-bold mb-2">{schedule.title}</h3>
                                <div className="flex items-center space-x-4 text-sm">
                                  <span className="flex items-center">
                                    <span className="mr-2">📅</span>
                                    {new Date(schedule.date).toLocaleDateString('en-US', {
                                      month: 'long',
                                      day: 'numeric',
                                      year: 'numeric',
                                      weekday: 'long'
                                    })}
                                  </span>
                                  <span className="flex items-center">
                                    <span className="mr-2">🕐</span>
                                    {schedule.startTime} - {schedule.endTime}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-6">
                              <div className="text-right">
                                <div className="text-xs uppercase opacity-75 mb-1">Instructor</div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-2xl">👨‍🏫</span>
                                  <span className="font-bold text-lg">{schedule.instructor?.name || 'TBA'}</span>
                                </div>
                              </div>

                              <div className="flex space-x-4">
                                <div className="bg-green-500 rounded-xl px-4 py-2 text-center shadow-lg">
                                  <div className="text-2xl font-bold">{schedule.practicalSessions?.length || 0}</div>
                                  <div className="text-xs uppercase">Practical</div>
                                </div>
                                <div className="bg-blue-500 rounded-xl px-4 py-2 text-center shadow-lg">
                                  <div className="text-2xl font-bold">{schedule.theoreticalSessions?.length || 0}</div>
                                  <div className="text-xs uppercase">Theory</div>
                                </div>
                              </div>

                              <div className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Mobile Layout */}
                      <div className="md:hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-black p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="bg-white text-indigo-600 rounded-xl w-16 h-16 flex flex-col items-center justify-center font-bold shadow-lg">
                              <span className="text-xs">Day</span>
                              <span className="text-2xl">{schedule.dayNumber}</span>
                            </div>
                            <div>
                              <h3 className="text-xl font-bold mb-1">{schedule.title}</h3>
                              <div className="text-sm opacity-90">
                                {new Date(schedule.date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </div>
                            </div>
                          </div>
                          <div className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm mb-4">
                          <span className="flex items-center">
                            <span className="mr-1">🕐</span>
                            {schedule.startTime} - {schedule.endTime}
                          </span>
                          <span className="flex items-center">
                            <span className="mr-1">👨‍🏫</span>
                            {schedule.instructor?.name || 'TBA'}
                          </span>
                        </div>

                        <div className="flex space-x-3">
                          <div className="bg-green-500 rounded-lg px-3 py-2 text-center flex-1 shadow-lg">
                            <div className="text-xl font-bold">{schedule.practicalSessions?.length || 0}</div>
                            <div className="text-xs">Practical</div>
                          </div>
                          <div className="bg-blue-500 rounded-lg px-3 py-2 text-center flex-1 shadow-lg">
                            <div className="text-xl font-bold">{schedule.theoreticalSessions?.length || 0}</div>
                            <div className="text-xs">Theory</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expandable Details */}
                    {isExpanded && (
                      <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 border-t-4 border-indigo-500">
                        {schedule.description && (
                          <div className="mb-6 bg-white rounded-xl p-6 shadow-md border-l-4 border-purple-500">
                            <h4 className="font-bold text-gray-900 mb-3 text-xl flex items-center">
                              <span className="text-2xl mr-2">📝</span>
                              Description
                            </h4>
                            <p className="text-gray-700 text-base leading-relaxed">{schedule.description}</p>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Topics */}
                          {schedule.topics && schedule.topics.length > 0 && (
                            <div className="bg-white rounded-xl shadow-lg border-2 border-indigo-300 overflow-hidden hover:shadow-xl transition-shadow">
                              <div
                                className="bg-gradient-to-r from-indigo-500 to-purple-500 text-black p-4 cursor-pointer flex items-center justify-between"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleSection(topicsKey);
                                }}
                              >
                                <h4 className="font-bold text-lg flex items-center">
                                  <span className="text-2xl mr-2">📋</span>
                                  Key Topics ({schedule.topics.length})
                                </h4>
                                <svg
                                  className={`w-5 h-5 transform transition-transform ${expandedSections[topicsKey] ? 'rotate-180' : ''}`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                              <div className="p-4">
                                <ul className="space-y-2">
                                  {schedule.topics.slice(0, expandedSections[topicsKey] ? undefined : 3).map((topic, idx) => (
                                    <li key={idx} className="flex items-start text-gray-700">
                                      <span className="text-indigo-500 mr-2 font-bold text-lg">✓</span>
                                      <span className="text-sm">{topic}</span>
                                    </li>
                                  ))}
                                </ul>
                                {schedule.topics.length > 3 && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleSection(topicsKey);
                                    }}
                                    className="mt-3 text-indigo-600 hover:text-indigo-800 font-semibold text-sm flex items-center w-full justify-center bg-indigo-50 hover:bg-indigo-100 py-2 rounded-lg transition-colors"
                                  >
                                    {expandedSections[topicsKey] ? (
                                      <>
                                        <span className="mr-1">Show less</span>
                                        <svg className="w-4 h-4 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                      </>
                                    ) : (
                                      <>
                                        <span className="mr-1">Show {schedule.topics.length - 3} more</span>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                      </>
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Materials */}
                          {schedule.materials && schedule.materials.length > 0 && (
                            <div className="bg-white rounded-xl shadow-lg border-2 border-green-300 overflow-hidden hover:shadow-xl transition-shadow">
                              <div
                                className="bg-gradient-to-r from-green-500 to-emerald-500 text-black p-4 cursor-pointer flex items-center justify-between"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleSection(materialsKey);
                                }}
                              >
                                <h4 className="font-bold text-lg flex items-center">
                                  <span className="text-2xl mr-2">🛠️</span>
                                  Materials ({schedule.materials.length})
                                </h4>
                                <svg
                                  className={`w-5 h-5 transform transition-transform ${expandedSections[materialsKey] ? 'rotate-180' : ''}`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                              <div className="p-4">
                                <ul className="space-y-2">
                                  {schedule.materials.slice(0, expandedSections[materialsKey] ? undefined : 3).map((material, idx) => (
                                    <li key={idx} className="flex items-start text-gray-700">
                                      <span className="text-green-500 mr-2 font-bold text-lg">✓</span>
                                      <span className="text-sm">{material}</span>
                                    </li>
                                  ))}
                                </ul>
                                {schedule.materials.length > 3 && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleSection(materialsKey);
                                    }}
                                    className="mt-3 text-green-600 hover:text-green-800 font-semibold text-sm flex items-center w-full justify-center bg-green-50 hover:bg-green-100 py-2 rounded-lg transition-colors"
                                  >
                                    {expandedSections[materialsKey] ? (
                                      <>
                                        <span className="mr-1">Show less</span>
                                        <svg className="w-4 h-4 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                      </>
                                    ) : (
                                      <>
                                        <span className="mr-1">Show {schedule.materials.length - 3} more</span>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                      </>
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Learning Objectives */}
                          {schedule.learningObjectives && schedule.learningObjectives.length > 0 && (
                            <div className="bg-white rounded-xl shadow-lg border-2 border-purple-300 overflow-hidden hover:shadow-xl transition-shadow">
                              <div
                                className="bg-gradient-to-r from-purple-500 to-pink-500 text-black p-4 cursor-pointer flex items-center justify-between"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleSection(objectivesKey);
                                }}
                              >
                                <h4 className="font-bold text-lg flex items-center">
                                  <span className="text-2xl mr-2">🎯</span>
                                  Learning Goals ({schedule.learningObjectives.length})
                                </h4>
                                <svg
                                  className={`w-5 h-5 transform transition-transform ${expandedSections[objectivesKey] ? 'rotate-180' : ''}`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                              <div className="p-4">
                                <ul className="space-y-2">
                                  {schedule.learningObjectives.slice(0, expandedSections[objectivesKey] ? undefined : 3).map((objective, idx) => (
                                    <li key={idx} className="flex items-start text-gray-700">
                                      <span className="text-purple-500 mr-2 font-bold text-lg">✓</span>
                                      <span className="text-sm">{objective}</span>
                                    </li>
                                  ))}
                                </ul>
                                {schedule.learningObjectives.length > 3 && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleSection(objectivesKey);
                                    }}
                                    className="mt-3 text-purple-600 hover:text-purple-800 font-semibold text-sm flex items-center w-full justify-center bg-purple-50 hover:bg-purple-100 py-2 rounded-lg transition-colors"
                                  >
                                    {expandedSections[objectivesKey] ? (
                                      <>
                                        <span className="mr-1">Show less</span>
                                        <svg className="w-4 h-4 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                      </>
                                    ) : (
                                      <>
                                        <span className="mr-1">Show {schedule.learningObjectives.length - 3} more</span>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                      </>
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Post-Schedule Enroll CTA */}
        <div className="bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 rounded-2xl shadow-xl p-8 mb-8 border-2 border-blue-300 hover:shadow-2xl transition-all">
          <div className="text-center">
            <h3 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center">
              <span className="text-4xl mr-3">🎓</span>
              Ready to Transform Your Career?
            </h3>
            <p className="text-gray-700 text-lg mb-6 max-w-2xl mx-auto">
              You've reviewed the comprehensive training schedule. Now take the next step in your mushroom cultivation journey with expert guidance and hands-on experience.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-6">
              <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-xl shadow-md">
                <span className="text-3xl">💰</span>
                <div className="text-left">
                  <div className="text-xs text-gray-500 uppercase">Investment</div>
                  <div className="font-bold text-green-600 text-xl">
                    ₹{currentPrice.toLocaleString()}
                    {earlyBirdValid && (
                      <span className="ml-2 line-through text-sm opacity-75 text-gray-500">
                        ₹{(program.originalPrice || program.price).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-xl shadow-md">
                <span className="text-3xl">📅</span>
                <div className="text-left">
                  <div className="text-xs text-gray-500 uppercase">Duration</div>
                  <div className="font-bold text-blue-600 text-xl">{program?.duration} Days</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-xl shadow-md">
                <span className="text-3xl">🎯</span>
                <div className="text-left">
                  <div className="text-xs text-gray-500 uppercase">Training</div>
                  <div className="font-bold text-purple-600 text-xl">Expert-Led</div>
                </div>
              </div>
            </div>
            <button
              onClick={handleRegisterClick}
              disabled={schedules.length === 0}
              className={`px-8 py-3 text-lg font-bold rounded-lg transition-all duration-300 whitespace-nowrap ${schedules.length === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue hover:bg-blue-dark text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                }`}
            >
              {schedules.length === 0 ? "Schedule Not Available" : "🚀 🚀 Enroll Now - Start Your Journey"}
            </button>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center">
          <p className="mt-4 text-gray-600 text-lg">
            <Link href="/training" className="text-blue-600 hover:text-blue-800 underline font-semibold">
              ← Back to All Training Programs
            </Link>
          </p>
        </div>
      </div>

      {/* Modals */}
      {showRegistrationModal && (
        <RegistrationModal
          program={program}
          onClose={() => setShowRegistrationModal(false)}
          user={session?.user}
          onRegistrationComplete={handleRegistrationSubmit}
        />
      )}

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