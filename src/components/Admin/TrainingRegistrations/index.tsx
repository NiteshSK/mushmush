"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  WorkflowStepper,
  ConfirmStatusModal,
  StatusIcon,
  type StatusMeta,
} from "@/components/Admin/WorkflowStepper";

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
  user: { id: string; name: string; email: string } | null;
}

const REG_PIPELINE = [
  "PENDING",
  "PAYMENT_RECEIVED",
  "CONFIRMED",
  "IN_PROGRESS",
  "COMPLETED",
] as const;

const REG_STATUS_META: Record<string, StatusMeta & { color: string }> = {
  PENDING:          { label: "Pending",          icon: "clock",   bgLight: "bg-gray-2 text-dark-5",        color: "text-dark-5" },
  PAYMENT_RECEIVED: { label: "Payment Received", icon: "dollar",  bgLight: "bg-blue/10 text-blue",          color: "text-blue" },
  CONFIRMED:        { label: "Confirmed",        icon: "check",   bgLight: "bg-forest/10 text-forest",      color: "text-forest" },
  IN_PROGRESS:      { label: "In Progress",      icon: "play",    bgLight: "bg-[#FEF3C7] text-[#D97706]",   color: "text-[#D97706]" },
  COMPLETED:        { label: "Completed",        icon: "award",   bgLight: "bg-forest/10 text-forest",      color: "text-forest" },
  CANCELLED:        { label: "Cancelled",        icon: "x",       bgLight: "bg-red/10 text-red",             color: "text-red" },
};

const REG_WARNINGS: Record<string, string> = {
  PAYMENT_RECEIVED: "This marks that payment has been submitted by the participant.",
  CONFIRMED: "This confirms you have verified the payment and the participant is enrolled.",
  IN_PROGRESS: "This marks the training as actively ongoing for this participant.",
  COMPLETED: "This marks the training as completed. A certificate can now be issued.",
  CANCELLED: "This will cancel the registration. The participant will be notified.",
};

// ─── Registration Row ────────────────────────────────────────────────────
const RegistrationRow = ({
  registration,
  onStatusChange,
}: {
  registration: TrainingRegistration;
  onStatusChange: () => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState("");
  const [verificationChecked, setVerificationChecked] = useState(false);

  const isPaymentVerification = confirmTarget === "CONFIRMED" && registration.status === "PAYMENT_RECEIVED";

  const handleConfirm = async () => {
    if (!confirmTarget) return;
    if (isPaymentVerification && !verificationChecked) return;
    setUpdating(true);
    try {
      const response = await fetch(
        `/api/admin/training-registrations/${registration.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: confirmTarget, verificationNotes: isPaymentVerification ? verificationNotes : undefined }),
        }
      );
      if (response.ok) {
        toast.success(
          `Registration moved to ${REG_STATUS_META[confirmTarget]?.label}`
        );
        onStatusChange();
      } else {
        toast.error("Failed to update registration status");
      }
    } catch {
      toast.error("Error updating registration status");
    } finally {
      setUpdating(false);
      setConfirmTarget(null);
      setVerificationNotes("");
      setVerificationChecked(false);
    }
  };

  const meta = REG_STATUS_META[registration.status] || REG_STATUS_META.PENDING;

  return (
    <>
      <div className="bg-white shadow-1 rounded-[10px] overflow-hidden">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full text-left px-4 sm:px-6 py-4 flex items-center gap-4 hover:bg-gray-1/50 transition-colors"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="font-medium text-dark text-sm">
                #{registration.registrationNumber}
              </p>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${meta.bgLight}`}
              >
                <StatusIcon name={meta.icon} size={10} />
                {meta.label}
              </span>
            </div>
            <p className="text-xs text-dark-5">
              {registration.participantName} &middot;{" "}
              {registration.trainingProgram.name} &middot;{" "}
              {new Date(registration.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="hidden sm:block text-right mr-2">
            <p className="text-sm font-medium text-dark">
              ₹{registration.totalAmount.toLocaleString()}
            </p>
            <p className="text-xs text-dark-5">
              {registration.trainingProgram.duration} days
            </p>
          </div>
          <svg
            className={`w-4 h-4 text-dark-5 transition-transform ${expanded ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>

        {expanded && (
          <div className="border-t border-gray-3 px-4 sm:px-6 py-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Participant & Program */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-dark-5 mb-2">
                    Participant
                  </h4>
                  <p className="text-sm text-dark font-medium">
                    {registration.participantName}
                  </p>
                  <p className="text-sm text-dark-5">
                    {registration.participantEmail}
                  </p>
                  <p className="text-sm text-dark-5">
                    {registration.participantPhone}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-dark-5 mb-2">
                    Program
                  </h4>
                  <p className="text-sm text-dark font-medium">
                    {registration.trainingProgram.name}
                  </p>
                  <p className="text-sm text-dark-5">
                    {registration.trainingProgram.type} &middot;{" "}
                    {registration.trainingProgram.duration} days
                  </p>
                  {registration.preferredStartDate && (
                    <p className="text-sm text-dark-5">
                      Preferred start:{" "}
                      {new Date(
                        registration.preferredStartDate
                      ).toLocaleDateString("en-IN")}
                    </p>
                  )}
                  {registration.specialRequirements && (
                    <p className="text-sm text-dark-5 mt-1">
                      Notes: {registration.specialRequirements}
                    </p>
                  )}
                </div>

                <div className="bg-gray-1 rounded-lg p-3 text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-dark-5">Total Amount</span>
                    <span className="text-dark font-medium">
                      ₹{registration.totalAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark-5">Registered</span>
                    <span className="text-dark">
                      {new Date(registration.createdAt).toLocaleDateString(
                        "en-IN",
                        { day: "numeric", month: "long", year: "numeric" }
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Workflow */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-dark-5 mb-3">
                  Registration Workflow
                </h4>
                <WorkflowStepper
                  pipeline={REG_PIPELINE}
                  statusMeta={REG_STATUS_META}
                  currentStatus={registration.status}
                  onAdvance={(next) => setConfirmTarget(next)}
                  onCancel={() => setConfirmTarget("CANCELLED")}
                  completedMessage="Training completed successfully! Certificate can now be issued to the participant."
                  cancelledMessage="This registration has been cancelled."
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <ConfirmStatusModal
        isOpen={!!confirmTarget}
        title={`Registration #${registration.registrationNumber}`}
        subtitle={`${registration.participantName} — ₹${registration.totalAmount.toLocaleString()}`}
        targetStatus={confirmTarget || ""}
        statusMeta={REG_STATUS_META}
        warnings={REG_WARNINGS}
        onConfirm={handleConfirm}
        onClose={() => { setConfirmTarget(null); setVerificationNotes(""); setVerificationChecked(false); }}
        loading={updating}
        confirmDisabled={isPaymentVerification && !verificationChecked}
      >
        {isPaymentVerification && (
          <div className="space-y-3">
            <div className="bg-gray-1 rounded-lg p-3 text-sm space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-dark-5 mb-2">Payment Details to Verify</p>
              <div className="flex justify-between">
                <span className="text-dark-5">Amount</span>
                <span className="text-dark font-medium">₹{registration.totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-5">Program</span>
                <span className="text-dark">{registration.trainingProgram.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-5">Participant</span>
                <span className="text-dark">{registration.participantName}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-1.5">Verification Notes (optional)</label>
              <textarea
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                placeholder="e.g. Verified via bank statement, UPI ref matched..."
                rows={2}
                className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2 px-3 text-sm outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-forest/20 resize-none"
              />
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer select-none bg-[#FEF3C7] border border-[#F59E0B]/20 rounded-lg p-3">
              <input
                type="checkbox"
                checked={verificationChecked}
                onChange={(e) => setVerificationChecked(e.target.checked)}
                className="h-4 w-4 mt-0.5 accent-forest rounded flex-shrink-0"
              />
              <span className="text-xs text-[#92400E] leading-relaxed">
                I have verified this payment and confirm the amount of <strong>₹{registration.totalAmount.toLocaleString()}</strong> has been received for the training program.
              </span>
            </label>
          </div>
        )}
      </ConfirmStatusModal>
    </>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────
const TrainingRegistrationsAdmin = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [registrations, setRegistrations] = useState<TrainingRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("");

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user?.role !== "ADMIN") {
      router.push("/");
    }
  }, [session, status, router]);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedStatus) params.append("status", selectedStatus);
      const url = `/api/admin/training-registrations${params.toString() ? `?${params}` : ""}`;

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setRegistrations(data);
      } else {
        toast.error("Failed to fetch registrations");
      }
    } catch {
      toast.error("Error fetching registrations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.role === "ADMIN") {
      fetchRegistrations();
    }
  }, [session, selectedStatus]);

  if (status === "loading" || (loading && registrations.length === 0)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-forest border-t-transparent"></div>
      </div>
    );
  }

  if (!session || session.user?.role !== "ADMIN") return null;

  const statusCounts = registrations.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-[10px] shadow-1 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-dark mb-1">
              Training Registrations
            </h1>
            <p className="text-dark-5 text-sm">
              Manage participant registrations and track progress
            </p>
          </div>
          <button
            onClick={fetchRegistrations}
            className="inline-flex items-center gap-2 text-sm font-medium bg-forest text-white px-5 py-2.5 rounded-md hover:bg-dark transition-colors"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M23 4v6h-6" />
              <path d="M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedStatus("")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
            !selectedStatus
              ? "bg-forest text-white"
              : "bg-white shadow-1 text-dark-5 hover:text-dark"
          }`}
        >
          All
        </button>
        {Object.keys(REG_STATUS_META).map((s) => (
          <button
            key={s}
            onClick={() => setSelectedStatus(s)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
              selectedStatus === s
                ? "bg-forest text-white"
                : "bg-white shadow-1 text-dark-5 hover:text-dark"
            }`}
          >
            {REG_STATUS_META[s].label}
            {(statusCounts[s] || 0) > 0 && (
              <span className="ml-1.5 opacity-60">({statusCounts[s]})</span>
            )}
          </button>
        ))}
      </div>

      {/* Registrations */}
      {registrations.length === 0 ? (
        <div className="bg-white shadow-1 rounded-[10px] p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-forest/10 rounded-full flex items-center justify-center">
            <StatusIcon name="user" size={28} />
          </div>
          <h2 className="font-medium text-lg text-dark mb-1">
            No Registrations Found
          </h2>
          <p className="text-dark-5 text-sm">
            {selectedStatus
              ? `No registrations with status "${REG_STATUS_META[selectedStatus]?.label}"`
              : "No training registrations yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {registrations.map((reg) => (
            <RegistrationRow
              key={reg.id}
              registration={reg}
              onStatusChange={fetchRegistrations}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TrainingRegistrationsAdmin;
