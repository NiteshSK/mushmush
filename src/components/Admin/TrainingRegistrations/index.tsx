"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface TrainingRegistration {
  id: string;
  registrationNumber: string;
  status: string;
  participantName: string;
  participantEmail: string;
  participantPhone: string;
  participantAddress: any;
  preferredStartDate: string | null;
  specialRequirements: string | null;
  totalAmount: number;
  createdAt: string;
  trainingProgram: {
    id: number;
    name: string;
    type: string;
    duration: number;
  };
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
}

const TrainingRegistrationsAdmin = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [registrations, setRegistrations] = useState<TrainingRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("");

  // Redirect if not admin
  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user?.role !== "ADMIN") {
      router.push("/");
      return;
    }
  }, [session, status, router]);

  // Fetch registrations
  const fetchRegistrations = async () => {
    try {
      let url = "/api/admin/training-registrations";
      const params = new URLSearchParams();
      
      if (selectedStatus) params.append("status", selectedStatus);
      if (selectedProgram) params.append("trainingProgramId", selectedProgram);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
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

  useEffect(() => {
    if (session?.user?.role === "ADMIN") {
      fetchRegistrations();
    }
  }, [session, selectedStatus, selectedProgram]);

  // Update registration status
  const updateRegistrationStatus = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/training-registrations/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success("Registration status updated successfully");
        fetchRegistrations();
      } else {
        toast.error("Failed to update registration status");
      }
    } catch (error) {
      toast.error("Error updating registration status");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CONFIRMED":
        return "bg-green-100 text-green-800";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800";
      case "COMPLETED":
        return "bg-purple-100 text-purple-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
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
        <h1 className="text-3xl font-bold text-gray-900">Training Registrations</h1>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Registrations Table */}
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
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {registrations.map((registration) => (
              <tr key={registration.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {registration.registrationNumber}
                    </div>
                    {registration.preferredStartDate && (
                      <div className="text-sm text-gray-500">
                        Preferred: {new Date(registration.preferredStartDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {registration.participantName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {registration.participantEmail}
                    </div>
                    <div className="text-sm text-gray-500">
                      {registration.participantPhone}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {registration.trainingProgram.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {registration.trainingProgram.type} • {registration.trainingProgram.duration} days
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ₹{registration.totalAmount.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                      registration.status
                    )}`}
                  >
                    {registration.status.replace("_", " ")}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(registration.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <select
                    value={registration.status}
                    onChange={(e) => updateRegistrationStatus(registration.id, e.target.value)}
                    className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {registrations.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">No registrations found</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainingRegistrationsAdmin;
