"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import TrainingScheduleManagement from "../TrainingSchedule";

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
  createdAt: string;
  updatedAt: string;
  
  // Early Bird Pricing Fields
  hasEarlyBirdOffer: boolean;
  earlyBirdPrice?: number;
  originalPrice?: number;
  earlyBirdEndDate?: string;
  
  _count: {
    registrations: number;
  };
}

const TrainingProgramsAdmin = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [trainingPrograms, setTrainingPrograms] = useState<TrainingProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProgram, setEditingProgram] = useState<TrainingProgram | null>(null);
  const [selectedProgramForSchedule, setSelectedProgramForSchedule] = useState<TrainingProgram | null>(null);

  // Redirect if not admin
  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user?.role !== "ADMIN") {
      router.push("/");
      return;
    }
  }, [session, status, router]);

  // Fetch training programs
  const fetchTrainingPrograms = async () => {
    try {
      const response = await fetch("/api/admin/training-programs");
      if (response.ok) {
        const data = await response.json();
        console.log("Admin fetched training programs:", data);
        setTrainingPrograms(data);
      } else {
        console.error("Admin failed to fetch training programs:", response.status);
        toast.error("Failed to fetch training programs");
      }
    } catch (error) {
      console.error("Admin error fetching training programs:", error);
      toast.error("Error fetching training programs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.role === "ADMIN") {
      fetchTrainingPrograms();
    }
  }, [session]);

  // Toggle program active status
  const toggleProgramStatus = async (id: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/training-programs/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        toast.success(`Program ${!currentStatus ? "activated" : "deactivated"} successfully`);
        fetchTrainingPrograms();
      } else {
        toast.error("Failed to update program status");
      }
    } catch (error) {
      toast.error("Error updating program status");
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session || session.user?.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Training Programs Management</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full bg-blue hover:bg-blue-dark text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 border-0"
        >
          Add New Program
        </button>
      </div>

      {/* Training Programs Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Program
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Regular Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Early Bird Offer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Registrations
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
            {trainingPrograms.map((program) => (
              <tr key={program.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{program.name}</div>
                    <div className="text-sm text-gray-500">{program.dailyHours} daily</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {program.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ₹{program.price.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {program.hasEarlyBirdOffer ? (
                    <div>
                      <div className="text-green-600 font-medium">
                        ₹{program.earlyBirdPrice?.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 line-through">
                        ₹{program.originalPrice?.toLocaleString()}
                      </div>
                      <div className="text-xs text-red-600">
                        Save ₹{((program.originalPrice || 0) - (program.earlyBirdPrice || 0)).toLocaleString()}
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-400">No Offer</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {program.duration} days
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {program._count.registrations}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      program.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {program.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingProgram(program)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setSelectedProgramForSchedule(program)}
                      className="text-purple-600 hover:text-purple-900"
                    >
                      Schedule
                    </button>
                    <button
                      onClick={() => toggleProgramStatus(program.id, program.isActive)}
                      className={`${
                        program.isActive
                          ? "text-red-600 hover:text-red-900"
                          : "text-green-600 hover:text-green-900"
                      }`}
                    >
                      {program.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingProgram) && (
        <ProgramModal
          program={editingProgram}
          onClose={() => {
            setShowCreateModal(false);
            setEditingProgram(null);
          }}
          onSuccess={() => {
            setShowCreateModal(false);
            setEditingProgram(null);
            fetchTrainingPrograms();
          }}
        />
      )}

      {/* Schedule Management Modal */}
      {selectedProgramForSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">
                Manage Schedule: {selectedProgramForSchedule.name}
              </h3>
              <button
                onClick={() => setSelectedProgramForSchedule(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <TrainingScheduleManagement
              trainingProgramId={selectedProgramForSchedule.id}
              trainingProgramName={selectedProgramForSchedule.name}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Program Modal Component
const ProgramModal = ({
  program,
  onClose,
  onSuccess,
}: {
  program: TrainingProgram | null;
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const [formData, setFormData] = useState({
    name: program?.name || "",
    description: program?.description || "",
    price: program?.price ?? 0, // Use nullish coalescing to ensure 0 instead of undefined/null
    duration: program?.duration ?? 0,
    dailyHours: program?.dailyHours || "5-6 hours",
    type: program?.type || "OYSTER",
    hasEarlyBirdOffer: program?.hasEarlyBirdOffer || false,
    earlyBirdPrice: program?.earlyBirdPrice ?? "",
    originalPrice: program?.originalPrice ?? "",
    earlyBirdEndDate: program?.earlyBirdEndDate ? program.earlyBirdEndDate.split('T')[0] : "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = program
        ? `/api/admin/training-programs/${program.id}`
        : "/api/admin/training-programs";
      const method = program ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(`Program ${program ? "updated" : "created"} successfully`);
        onSuccess();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to save program");
      }
    } catch (error) {
      toast.error("Error saving program");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">
          {program ? "Edit Program" : "Create New Program"}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Program Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="OYSTER">Oyster</option>
              <option value="BUTTON">Button</option>
              <option value="SHIITAKE">Shiitake</option>
              <option value="GANODERMA">Ganoderma</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price (₹)
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (days)
            </label>
            <input
              type="number"
              value={formData.duration}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                setFormData({ ...formData, duration: isNaN(value) ? 0 : value });
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Daily Hours
            </label>
            <input
              type="text"
              value={formData.dailyHours}
              onChange={(e) => setFormData({ ...formData, dailyHours: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 5-6 hours"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Has Early Bird Offer
            </label>
            <input
              type="checkbox"
              checked={formData.hasEarlyBirdOffer}
              onChange={(e) => setFormData({ ...formData, hasEarlyBirdOffer: e.target.checked })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {formData.hasEarlyBirdOffer && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Early Bird Price (₹)
              </label>
              <input
                type="number"
                value={formData.earlyBirdPrice}
                onChange={(e) => setFormData({ ...formData, earlyBirdPrice: parseFloat(e.target.value) })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {formData.hasEarlyBirdOffer && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Original Price (₹)
              </label>
              <input
                type="number"
                value={formData.originalPrice}
                onChange={(e) => setFormData({ ...formData, originalPrice: parseFloat(e.target.value) })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {formData.hasEarlyBirdOffer && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Early Bird End Date
              </label>
              <input
                type="date"
                value={formData.earlyBirdEndDate}
                onChange={(e) => setFormData({ ...formData, earlyBirdEndDate: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue hover:bg-blue-dark text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 border-0"
            >
              {loading ? "Saving..." : program ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TrainingProgramsAdmin;
