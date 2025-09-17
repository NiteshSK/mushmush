"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

        {/* Registration CTA */}
        <div className="text-center">
          <button
            onClick={handleRegisterClick}
            disabled={schedules.length === 0}
            className={`px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-300 ${
              schedules.length === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white transform hover:scale-105"
            }`}
          >
            {schedules.length === 0 ? "Schedule Not Available" : "Register for This Program"}
          </button>
          <p className="mt-4 text-gray-600">
            <Link href="/training" className="text-blue-600 hover:text-blue-800 underline">
              ← Back to All Training Programs
            </Link>
          </p>
        </div>
      </div>

      {/* Registration Modal (placeholder - will be implemented later) */}
      {showRegistrationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-4">Registration</h3>
            <p className="text-gray-600 mb-6">
              Registration functionality will be implemented. For now, please contact us directly to register.
            </p>
            <button
              onClick={() => setShowRegistrationModal(false)}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingSchedule;
