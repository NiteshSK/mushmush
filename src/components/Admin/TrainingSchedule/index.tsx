"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

interface TrainingSchedule {
  id: number;
  trainingProgramId: number;
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
  instructorId?: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

interface TrainingScheduleManagementProps {
  trainingProgramId: number;
  trainingProgramName: string;
}

const TrainingScheduleManagement: React.FC<TrainingScheduleManagementProps> = ({
  trainingProgramId,
  trainingProgramName,
}) => {
  const [schedules, setSchedules] = useState<TrainingSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<TrainingSchedule | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    dayNumber: "",
    date: "",
    title: "",
    description: "",
    topics: "",
    practicalSessions: "",
    theoreticalSessions: "",
    learningObjectives: "",
    materials: "",
    instructorId: 0,
    startTime: "09:00",
    endTime: "17:00",
  });

  useEffect(() => {
    fetchSchedules();
  }, [trainingProgramId]);

  const fetchSchedules = async () => {
    try {
      const response = await fetch(`/api/admin/training-programs/${trainingProgramId}/schedules`);
      if (response.ok) {
        const data = await response.json();
        setSchedules(data);
      } else {
        toast.error("Failed to fetch schedules");
      }
    } catch (error) {
      console.error("Error fetching schedules:", error);
      toast.error("Error fetching schedules");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const payload = {
        dayNumber: parseInt(formData.dayNumber),
        date: formData.date,
        title: formData.title,
        description: formData.description,
        topics: formData.topics.split(",").map(t => t.trim()).filter(t => t),
        practicalSessions: formData.practicalSessions.split(";").map(s => {
          const parts = s.trim().split("|");
          return {
            title: parts[0]?.trim() || "",
            description: parts[1]?.trim() || "",
            duration: parts[2]?.trim() || ""
          };
        }).filter(s => s.title),
        theoreticalSessions: formData.theoreticalSessions.split(";").map(s => {
          const parts = s.trim().split("|");
          return {
            title: parts[0]?.trim() || "",
            description: parts[1]?.trim() || "",
            duration: parts[2]?.trim() || ""
          };
        }).filter(s => s.title),
        learningObjectives: formData.learningObjectives.split(",").map(o => o.trim()).filter(o => o),
        materials: formData.materials.split(",").map(m => m.trim()).filter(m => m),
        instructorId: formData.instructorId || null,
        startTime: formData.startTime,
        endTime: formData.endTime,
      };

      const url = editingSchedule
        ? `/api/admin/training-programs/${trainingProgramId}/schedules/${editingSchedule.id}`
        : `/api/admin/training-programs/${trainingProgramId}/schedules`;

      const method = editingSchedule ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success(editingSchedule ? "Schedule updated successfully" : "Schedule created successfully");
        fetchSchedules();
        setShowCreateModal(false);
        setEditingSchedule(null);
        resetForm();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to save schedule");
      }
    } catch (error) {
      console.error("Error saving schedule:", error);
      toast.error("Error saving schedule");
    }
  };

  const handleEdit = (schedule: TrainingSchedule) => {
    setEditingSchedule(schedule);
    setFormData({
      dayNumber: schedule.dayNumber.toString(),
      date: new Date(schedule.date).toISOString().split('T')[0],
      title: schedule.title,
      description: schedule.description,
      topics: schedule.topics.join(", "),
      practicalSessions: schedule.practicalSessions.map(s => 
        `${s.title}|${s.description || ""}|${s.duration || ""}`
      ).join("; "),
      theoreticalSessions: schedule.theoreticalSessions.map(s => 
        `${s.title}|${s.description || ""}|${s.duration || ""}`
      ).join("; "),
      learningObjectives: schedule.learningObjectives.join(", "),
      materials: schedule.materials.join(", "),
      instructorId: schedule.instructorId || 0,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
    });
    setShowCreateModal(true);
  };

  const handleDelete = async (scheduleId: number) => {
    if (!confirm("Are you sure you want to delete this schedule?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/training-programs/${trainingProgramId}/schedules/${scheduleId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Schedule deleted successfully");
        fetchSchedules();
      } else {
        toast.error("Failed to delete schedule");
      }
    } catch (error) {
      console.error("Error deleting schedule:", error);
      toast.error("Error deleting schedule");
    }
  };

  const resetForm = () => {
    setFormData({
      dayNumber: "",
      date: "",
      title: "",
      description: "",
      topics: "",
      practicalSessions: "",
      theoreticalSessions: "",
      learningObjectives: "",
      materials: "",
      instructorId: 0,
      startTime: "09:00",
      endTime: "17:00",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">
          Schedule for {trainingProgramName}
        </h3>
        <button
          onClick={() => {
            resetForm();
            setEditingSchedule(null);
            setShowCreateModal(true);
          }}
          className="w-full bg-blue hover:bg-blue-dark text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 border-0"
        >
          Add Schedule
        </button>
      </div>

      {schedules.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-600">No schedules found for this training program.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {schedules.map((schedule) => (
            <div key={schedule.id} className="bg-white border rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    Day {schedule.dayNumber}: {schedule.title}
                  </h4>
                  <p className="text-gray-600">
                    {formatDate(schedule.date)} • {schedule.startTime} - {schedule.endTime}
                  </p>
                  {schedule.instructor && (
                    <p className="text-sm text-gray-500">Instructor: {schedule.instructor.name}</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(schedule)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(schedule.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
              
              <p className="text-gray-700 mb-4">{schedule.description}</p>
              
              {schedule.topics.length > 0 && (
                <div className="mb-3">
                  <h5 className="font-medium text-gray-900 mb-1">Topics:</h5>
                  <div className="flex flex-wrap gap-2">
                    {schedule.topics.map((topic, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {schedule.learningObjectives.length > 0 && (
                <div className="mb-3">
                  <h5 className="font-medium text-gray-900 mb-1">Learning Objectives:</h5>
                  <ul className="list-disc list-inside text-sm text-gray-700">
                    {schedule.learningObjectives.map((objective, index) => (
                      <li key={index}>{objective}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-6">
              {editingSchedule ? "Edit Schedule" : "Add Schedule"}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Day Number *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.dayNumber}
                    onChange={(e) => setFormData({ ...formData, dayNumber: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Introduction to Mushroom Cultivation"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Detailed description of the day's activities"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instructor
                </label>
                <select
                  value={formData.instructorId}
                  onChange={(e) => setFormData({ ...formData, instructorId: parseInt(e.target.value) || 0 })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="0">Select Instructor</option>
                  <option value="1">Vikrant Rai</option>
                  <option value="2">Pravesh Rawat</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Topics (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.topics}
                  onChange={(e) => setFormData({ ...formData, topics: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Topic 1, Topic 2, Topic 3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Learning Objectives (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.learningObjectives}
                  onChange={(e) => setFormData({ ...formData, learningObjectives: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Objective 1, Objective 2, Objective 3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Practical Sessions (title|description|duration; separate with semicolons)
                </label>
                <textarea
                  value={formData.practicalSessions}
                  onChange={(e) => setFormData({ ...formData, practicalSessions: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Spawning Process|Learn substrate preparation|2 hours; Sterilization|Autoclave techniques|1 hour"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Theoretical Sessions (title|description|duration; separate with semicolons)
                </label>
                <textarea
                  value={formData.theoreticalSessions}
                  onChange={(e) => setFormData({ ...formData, theoreticalSessions: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Mushroom Biology|Understanding fungal life cycle|1 hour; Disease Management|Common pathogens|1.5 hours"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Materials (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.materials}
                  onChange={(e) => setFormData({ ...formData, materials: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Notebook, Lab coat, Safety gloves"
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingSchedule(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full bg-blue hover:bg-blue-dark text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 border-0"
                >
                  {editingSchedule ? "Update Schedule" : "Create Schedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingScheduleManagement;
