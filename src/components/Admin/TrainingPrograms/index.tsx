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
  hasEarlyBirdOffer: boolean;
  earlyBirdPrice?: number;
  originalPrice?: number;
  earlyBirdEndDate?: string;
  _count: { registrations: number };
}

const inputClass =
  "rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-4 text-sm outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-forest/20";

const TrainingProgramsAdmin = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [trainingPrograms, setTrainingPrograms] = useState<TrainingProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProgram, setEditingProgram] = useState<TrainingProgram | null>(null);
  const [selectedProgramForSchedule, setSelectedProgramForSchedule] = useState<TrainingProgram | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user?.role !== "ADMIN") {
      router.push("/");
    }
  }, [session, status, router]);

  const fetchTrainingPrograms = async () => {
    try {
      const response = await fetch("/api/admin/training-programs");
      if (response.ok) {
        const data = await response.json();
        setTrainingPrograms(data);
      } else {
        toast.error("Failed to fetch training programs");
      }
    } catch {
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

  const toggleProgramStatus = async (id: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/training-programs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (response.ok) {
        toast.success(`Program ${!currentStatus ? "activated" : "deactivated"}`);
        fetchTrainingPrograms();
      } else {
        toast.error("Failed to update program status");
      }
    } catch {
      toast.error("Error updating program status");
    }
  };

  if (status === "loading" || (loading && trainingPrograms.length === 0)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-forest border-t-transparent"></div>
      </div>
    );
  }

  if (!session || session.user?.role !== "ADMIN") return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-[10px] shadow-1 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-dark mb-1">Training Programs</h1>
            <p className="text-dark-5 text-sm">Create and manage mushroom farming training programs</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 text-sm font-medium bg-forest text-white px-5 py-2.5 rounded-md hover:bg-dark transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
            Add Program
          </button>
        </div>
      </div>

      {/* Programs list */}
      {trainingPrograms.length === 0 ? (
        <div className="bg-white shadow-1 rounded-[10px] p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-forest/10 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-forest" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
          </div>
          <h2 className="font-medium text-lg text-dark mb-1">No Programs Yet</h2>
          <p className="text-dark-5 text-sm">Create your first training program to get started.</p>
        </div>
      ) : (
        <div className="bg-white rounded-[10px] shadow-1 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-1">
                <tr>
                  <th className="px-5 py-3.5 text-left text-xs font-medium text-dark-5 uppercase tracking-wider">Program</th>
                  <th className="px-5 py-3.5 text-left text-xs font-medium text-dark-5 uppercase tracking-wider">Type</th>
                  <th className="px-5 py-3.5 text-left text-xs font-medium text-dark-5 uppercase tracking-wider">Price</th>
                  <th className="px-5 py-3.5 text-left text-xs font-medium text-dark-5 uppercase tracking-wider">Early Bird</th>
                  <th className="px-5 py-3.5 text-left text-xs font-medium text-dark-5 uppercase tracking-wider">Duration</th>
                  <th className="px-5 py-3.5 text-left text-xs font-medium text-dark-5 uppercase tracking-wider">Regs</th>
                  <th className="px-5 py-3.5 text-left text-xs font-medium text-dark-5 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3.5 text-left text-xs font-medium text-dark-5 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-3">
                {trainingPrograms.map((program) => (
                  <tr key={program.id} className="hover:bg-gray-1/50">
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-dark">{program.name}</p>
                      <p className="text-xs text-dark-5">{program.dailyHours} daily</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-blue/10 text-blue">
                        {program.type}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-dark">₹{program.price.toLocaleString()}</td>
                    <td className="px-5 py-4 text-sm">
                      {program.hasEarlyBirdOffer ? (
                        <div>
                          <p className="text-forest font-medium">₹{program.earlyBirdPrice?.toLocaleString()}</p>
                          <p className="text-xs text-dark-5 line-through">₹{program.originalPrice?.toLocaleString()}</p>
                        </div>
                      ) : (
                        <span className="text-dark-5">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-sm text-dark">{program.duration} days</td>
                    <td className="px-5 py-4 text-sm text-dark">{program._count.registrations}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${program.isActive ? "bg-forest/10 text-forest" : "bg-red/10 text-red"}`}>
                        {program.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setEditingProgram(program)} className="text-xs font-medium text-forest hover:text-dark transition-colors">Edit</button>
                        <button onClick={() => setSelectedProgramForSchedule(program)} className="text-xs font-medium text-blue hover:text-dark transition-colors">Schedule</button>
                        <button
                          onClick={() => toggleProgramStatus(program.id, program.isActive)}
                          className={`text-xs font-medium transition-colors ${program.isActive ? "text-red hover:text-red-dark" : "text-forest hover:text-dark"}`}
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
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || editingProgram) && (
        <ProgramModal
          program={editingProgram}
          onClose={() => { setShowCreateModal(false); setEditingProgram(null); }}
          onSuccess={() => { setShowCreateModal(false); setEditingProgram(null); fetchTrainingPrograms(); }}
        />
      )}

      {/* Schedule Modal */}
      {selectedProgramForSchedule && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-[10px] shadow-1 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="border-b border-gray-3 py-5 px-6 flex items-center justify-between">
              <h3 className="font-medium text-xl text-dark">Schedule: {selectedProgramForSchedule.name}</h3>
              <button onClick={() => setSelectedProgramForSchedule(null)} className="text-dark-5 hover:text-dark transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6">
              <TrainingScheduleManagement trainingProgramId={selectedProgramForSchedule.id} trainingProgramName={selectedProgramForSchedule.name} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Program Modal ───────────────────────────────────────────────────────
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
    price: program?.price ?? 0,
    duration: program?.duration ?? 0,
    dailyHours: program?.dailyHours || "5-6 hours",
    type: program?.type || "OYSTER",
    hasEarlyBirdOffer: program?.hasEarlyBirdOffer || false,
    earlyBirdPrice: program?.earlyBirdPrice ?? "",
    originalPrice: program?.originalPrice ?? "",
    earlyBirdEndDate: program?.earlyBirdEndDate ? program.earlyBirdEndDate.split("T")[0] : "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = program ? `/api/admin/training-programs/${program.id}` : "/api/admin/training-programs";
      const method = program ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        toast.success(`Program ${program ? "updated" : "created"} successfully`);
        onSuccess();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to save program");
      }
    } catch {
      toast.error("Error saving program");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-[10px] shadow-1 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="border-b border-gray-3 py-5 px-5 sm:px-8 flex items-center justify-between">
          <h2 className="font-medium text-xl text-dark">{program ? "Edit Program" : "New Program"}</h2>
          <button onClick={onClose} className="text-dark-5 hover:text-dark transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-8 space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark mb-1.5">Program Name <span className="text-red">*</span></label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputClass} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark mb-1.5">Type <span className="text-red">*</span></label>
              <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className={inputClass} required>
                <option value="OYSTER">Oyster</option>
                <option value="BUTTON">Button</option>
                <option value="SHIITAKE">Shiitake</option>
                <option value="GANODERMA">Ganoderma</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1.5">Price (₹) <span className="text-red">*</span></label>
              <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })} className={inputClass} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark mb-1.5">Duration (days) <span className="text-red">*</span></label>
              <input type="number" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })} className={inputClass} required min="1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1.5">Daily Hours</label>
              <input type="text" value={formData.dailyHours} onChange={(e) => setFormData({ ...formData, dailyHours: e.target.value })} className={inputClass} placeholder="5-6 hours" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-1.5">Description <span className="text-red">*</span></label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className={`${inputClass} resize-none`} required />
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input type="checkbox" checked={formData.hasEarlyBirdOffer} onChange={(e) => setFormData({ ...formData, hasEarlyBirdOffer: e.target.checked })} className="h-4 w-4 text-forest accent-forest rounded" />
            <span className="text-sm text-dark">Enable Early Bird Offer</span>
          </label>

          {formData.hasEarlyBirdOffer && (
            <div className="bg-forest/5 border border-forest/15 rounded-[10px] p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark mb-1.5">Early Bird Price (₹)</label>
                  <input type="number" value={formData.earlyBirdPrice} onChange={(e) => setFormData({ ...formData, earlyBirdPrice: parseFloat(e.target.value) })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark mb-1.5">Original Price (₹)</label>
                  <input type="number" value={formData.originalPrice} onChange={(e) => setFormData({ ...formData, originalPrice: parseFloat(e.target.value) })} className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-1.5">Offer End Date</label>
                <input type="date" value={formData.earlyBirdEndDate} onChange={(e) => setFormData({ ...formData, earlyBirdEndDate: e.target.value })} className={inputClass} />
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 pt-3">
            <button type="submit" disabled={loading} className="flex-1 bg-forest text-white font-medium text-sm py-3 px-6 rounded-md hover:bg-dark transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
              {loading ? "Saving..." : program ? "Update Program" : "Create Program"}
            </button>
            <button type="button" onClick={onClose} className="flex-1 text-sm font-medium text-dark-5 py-3 px-6 rounded-md border border-gray-3 hover:bg-gray-1 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TrainingProgramsAdmin;
