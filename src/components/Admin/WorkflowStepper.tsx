"use client";
import React, { useState } from "react";

// ─── Status Icon ─────────────────────────────────────────────────────────
export const StatusIcon = ({
  name,
  size = 14,
}: {
  name: string;
  size?: number;
}) => {
  const props = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (name) {
    case "clock":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      );
    case "check":
      return (
        <svg {...props}>
          <path d="M20 6L9 17l-5-5" />
        </svg>
      );
    case "package":
      return (
        <svg {...props}>
          <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
          <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" />
        </svg>
      );
    case "truck":
      return (
        <svg {...props}>
          <rect x="1" y="3" width="15" height="13" />
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
      );
    case "home":
      return (
        <svg {...props}>
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    case "star":
      return (
        <svg {...props}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );
    case "x":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      );
    case "play":
      return (
        <svg {...props}>
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
      );
    case "user":
      return (
        <svg {...props}>
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    case "dollar":
      return (
        <svg {...props}>
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
        </svg>
      );
    case "award":
      return (
        <svg {...props}>
          <circle cx="12" cy="8" r="7" />
          <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
        </svg>
      );
    default:
      return null;
  }
};

// ─── Types ───────────────────────────────────────────────────────────────
export interface PipelineStep {
  value: string;
  label: string;
  icon: string;
}

export interface StatusMeta {
  label: string;
  icon: string;
  bgLight: string;
}

// ─── Workflow Stepper ────────────────────────────────────────────────────
export const WorkflowStepper = ({
  pipeline,
  statusMeta,
  currentStatus,
  onAdvance,
  onCancel,
  completedMessage,
  cancelledMessage,
}: {
  pipeline: readonly string[];
  statusMeta: Record<string, StatusMeta>;
  currentStatus: string;
  onAdvance: (nextStatus: string) => void;
  onCancel: () => void;
  completedMessage?: string;
  cancelledMessage?: string;
}) => {
  const isCancelled = currentStatus === "CANCELLED";
  const lastStep = pipeline[pipeline.length - 1];
  const isCompleted = currentStatus === lastStep;
  const currentIdx = isCancelled
    ? -1
    : pipeline.indexOf(currentStatus);
  const nextStatus =
    !isCancelled &&
    !isCompleted &&
    currentIdx >= 0 &&
    currentIdx < pipeline.length - 1
      ? pipeline[currentIdx + 1]
      : null;

  return (
    <div className="space-y-3">
      {/* Pipeline */}
      <div className="flex items-center gap-0">
        {pipeline.map((step, idx) => {
          const isPast = !isCancelled && idx < currentIdx;
          const isCurrent = !isCancelled && idx === currentIdx;
          const meta = statusMeta[step];
          const isLastStep = idx === pipeline.length - 1;

          const circleClass = isCancelled
            ? "bg-gray-3"
            : isPast
            ? "bg-forest"
            : isCurrent && isCompleted
            ? "bg-[#2D5016] ring-4 ring-forest/20"
            : isCurrent
            ? "bg-[#F59E0B] ring-4 ring-[#FEF3C7]"
            : "bg-gray-3";

          const labelClass = isCancelled
            ? "text-dark-5"
            : isPast
            ? "text-forest"
            : isCurrent && isCompleted
            ? "text-[#2D5016] font-semibold"
            : isCurrent
            ? "text-[#D97706] font-semibold"
            : "text-dark-5";

          return (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center relative">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-white transition-colors ${circleClass}`}
                >
                  {!isCancelled && (isPast || (isCurrent && isCompleted)) ? (
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  ) : (
                    <StatusIcon name={meta?.icon || "clock"} size={12} />
                  )}
                </div>
                <span
                  className={`text-[9px] font-medium mt-1 whitespace-nowrap ${labelClass}`}
                >
                  {meta?.label || step}
                </span>
              </div>

              {!isLastStep && (
                <div
                  className={`flex-1 h-0.5 min-w-[12px] mx-0.5 mt-[-14px] rounded-full ${
                    !isCancelled && idx < currentIdx ? "bg-forest" : "bg-gray-3"
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}

        {/* Cancelled node */}
        <div
          className={`flex-1 h-0.5 min-w-[12px] mx-0.5 mt-[-14px] rounded-full ${
            isCancelled ? "bg-red" : isCompleted ? "bg-forest" : "bg-gray-3"
          }`}
        />
        <div className="flex flex-col items-center relative">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-white transition-colors ${
              isCancelled ? "bg-red ring-4 ring-red/20" : "bg-gray-3"
            }`}
          >
            <StatusIcon name="x" size={12} />
          </div>
          <span
            className={`text-[9px] font-medium mt-1 whitespace-nowrap ${
              isCancelled ? "text-red font-semibold" : "text-dark-5"
            }`}
          >
            Cancelled
          </span>
        </div>
      </div>

      {/* Completed message */}
      {isCompleted && completedMessage && (
        <div className="flex items-center gap-2 bg-forest/5 border border-forest/15 rounded-lg px-3 py-2.5">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#2D5016"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
            <path d="M22 4L12 14.01l-3-3" />
          </svg>
          <p className="text-xs text-[#2D5016] font-medium">
            {completedMessage}
          </p>
        </div>
      )}

      {/* Cancelled message */}
      {isCancelled && cancelledMessage && (
        <div className="flex items-center gap-2 bg-red/5 border border-red/15 rounded-lg px-3 py-2.5">
          <StatusIcon name="x" size={14} />
          <p className="text-xs text-red font-medium">{cancelledMessage}</p>
        </div>
      )}

      {/* Action buttons */}
      {!isCancelled && !isCompleted && (
        <div className="flex items-center gap-2">
          {nextStatus && (
            <button
              onClick={() => onAdvance(nextStatus)}
              className="inline-flex items-center gap-1.5 text-xs font-medium bg-forest text-white px-3 py-1.5 rounded-md hover:bg-dark transition-colors"
            >
              <StatusIcon
                name={statusMeta[nextStatus]?.icon || "check"}
                size={12}
              />
              Move to {statusMeta[nextStatus]?.label || nextStatus}
            </button>
          )}
          <button
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-red bg-red/5 px-3 py-1.5 rounded-md hover:bg-red/10 transition-colors"
          >
            <StatusIcon name="x" size={12} />
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Confirm Modal ───────────────────────────────────────────────────────
export const ConfirmStatusModal = ({
  isOpen,
  title,
  subtitle,
  targetStatus,
  statusMeta,
  warnings,
  onConfirm,
  onClose,
  loading,
  children,
  confirmDisabled,
}: {
  isOpen: boolean;
  title: string;
  subtitle: string;
  targetStatus: string;
  statusMeta: Record<string, StatusMeta>;
  warnings?: Record<string, string>;
  onConfirm: () => void;
  onClose: () => void;
  loading: boolean;
  /** Extra form content rendered above the action buttons */
  children?: React.ReactNode;
  /** Disable confirm button (e.g. if required fields not filled) */
  confirmDisabled?: boolean;
}) => {
  if (!isOpen) return null;

  const meta = statusMeta[targetStatus] || { label: targetStatus, icon: "check" };
  const isCancelling = targetStatus === "CANCELLED";
  const warning =
    warnings?.[targetStatus] ||
    "Are you sure you want to change the status?";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-[10px] shadow-1 max-w-md w-full">
        <div className="border-b border-gray-3 py-5 px-6 flex items-center justify-between">
          <h3 className="font-medium text-lg text-dark">
            Confirm Status Change
          </h3>
          <button
            onClick={onClose}
            className="text-dark-5 hover:text-dark transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isCancelling
                  ? "bg-red/10 text-red"
                  : "bg-forest/10 text-forest"
              }`}
            >
              <StatusIcon name={meta.icon} size={20} />
            </div>
            <div>
              <p className="font-medium text-dark">
                {isCancelling ? "Cancel" : `Move to ${meta.label}`}
              </p>
              <p className="text-sm text-dark-5">{title}</p>
            </div>
          </div>

          <p className="text-sm text-dark-5 mb-2">{subtitle}</p>

          <div
            className={`text-sm p-3 rounded-lg ${
              isCancelling
                ? "bg-red/5 border border-red/15 text-red"
                : "bg-forest/5 border border-forest/15 text-forest"
            }`}
          >
            {warning}
          </div>

          {children && <div className="mt-4">{children}</div>}

          <div className="flex gap-3 mt-5">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 text-sm font-medium text-dark-5 py-2.5 px-6 rounded-full border border-gray-3 hover:bg-gray-1 transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={onConfirm}
              disabled={loading || confirmDisabled}
              className={`flex-1 text-sm font-medium text-white py-2.5 px-6 rounded-full transition-colors disabled:opacity-50 ${
                isCancelling
                  ? "bg-red hover:bg-red-dark"
                  : "bg-forest hover:bg-dark"
              }`}
            >
              {loading
                ? "Updating..."
                : isCancelling
                ? "Yes, Cancel"
                : `Yes, ${meta.label}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
