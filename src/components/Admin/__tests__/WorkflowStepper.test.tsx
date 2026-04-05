import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  WorkflowStepper,
  ConfirmStatusModal,
  StatusIcon,
} from "../WorkflowStepper";

const PIPELINE = ["PENDING", "CONFIRMED", "PROCESSING", "COMPLETED"] as const;

const STATUS_META = {
  PENDING:    { label: "Pending",    icon: "clock",   bgLight: "bg-gray-2" },
  CONFIRMED:  { label: "Confirmed",  icon: "check",   bgLight: "bg-blue/10" },
  PROCESSING: { label: "Processing", icon: "package", bgLight: "bg-yellow-50" },
  COMPLETED:  { label: "Completed",  icon: "star",    bgLight: "bg-green-50" },
  CANCELLED:  { label: "Cancelled",  icon: "x",       bgLight: "bg-red-50" },
};

describe("StatusIcon", () => {
  it("renders clock icon", () => {
    const { container } = render(<StatusIcon name="clock" size={16} />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders check icon", () => {
    const { container } = render(<StatusIcon name="check" />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("returns null for unknown icon", () => {
    const { container } = render(<StatusIcon name="nonexistent" />);
    expect(container.querySelector("svg")).toBeNull();
  });
});

describe("WorkflowStepper", () => {
  const mockAdvance = jest.fn();
  const mockCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all pipeline steps", () => {
    render(
      <WorkflowStepper
        pipeline={PIPELINE}
        statusMeta={STATUS_META}
        currentStatus="PENDING"
        onAdvance={mockAdvance}
        onCancel={mockCancel}
      />
    );
    expect(screen.getByText("Pending")).toBeInTheDocument();
    expect(screen.getByText("Confirmed")).toBeInTheDocument();
    expect(screen.getByText("Processing")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
    expect(screen.getByText("Cancelled")).toBeInTheDocument();
  });

  it("shows advance button with next status label", () => {
    render(
      <WorkflowStepper
        pipeline={PIPELINE}
        statusMeta={STATUS_META}
        currentStatus="PENDING"
        onAdvance={mockAdvance}
        onCancel={mockCancel}
      />
    );
    expect(screen.getByText("Move to Confirmed")).toBeInTheDocument();
  });

  it("calls onAdvance when advance button clicked", () => {
    render(
      <WorkflowStepper
        pipeline={PIPELINE}
        statusMeta={STATUS_META}
        currentStatus="PENDING"
        onAdvance={mockAdvance}
        onCancel={mockCancel}
      />
    );
    fireEvent.click(screen.getByText("Move to Confirmed"));
    expect(mockAdvance).toHaveBeenCalledWith("CONFIRMED");
  });

  it("calls onCancel when cancel button clicked", () => {
    render(
      <WorkflowStepper
        pipeline={PIPELINE}
        statusMeta={STATUS_META}
        currentStatus="CONFIRMED"
        onAdvance={mockAdvance}
        onCancel={mockCancel}
      />
    );
    fireEvent.click(screen.getByText("Cancel"));
    expect(mockCancel).toHaveBeenCalled();
  });

  it("hides action buttons when completed", () => {
    render(
      <WorkflowStepper
        pipeline={PIPELINE}
        statusMeta={STATUS_META}
        currentStatus="COMPLETED"
        onAdvance={mockAdvance}
        onCancel={mockCancel}
        completedMessage="All done!"
      />
    );
    expect(screen.queryByText(/Move to/)).toBeNull();
    expect(screen.getByText("All done!")).toBeInTheDocument();
  });

  it("hides action buttons when cancelled", () => {
    render(
      <WorkflowStepper
        pipeline={PIPELINE}
        statusMeta={STATUS_META}
        currentStatus="CANCELLED"
        onAdvance={mockAdvance}
        onCancel={mockCancel}
        cancelledMessage="Order cancelled."
      />
    );
    expect(screen.queryByText(/Move to/)).toBeNull();
    expect(screen.getByText("Order cancelled.")).toBeInTheDocument();
  });

  it("does not show advance button on last step", () => {
    render(
      <WorkflowStepper
        pipeline={PIPELINE}
        statusMeta={STATUS_META}
        currentStatus="COMPLETED"
        onAdvance={mockAdvance}
        onCancel={mockCancel}
      />
    );
    expect(screen.queryByText(/Move to/)).toBeNull();
  });
});

describe("ConfirmStatusModal", () => {
  const mockConfirm = jest.fn();
  const mockClose = jest.fn();

  it("does not render when isOpen is false", () => {
    const { container } = render(
      <ConfirmStatusModal
        isOpen={false}
        title="Order #123"
        subtitle="Test"
        targetStatus="CONFIRMED"
        statusMeta={STATUS_META}
        onConfirm={mockConfirm}
        onClose={mockClose}
        loading={false}
      />
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders title and subtitle when open", () => {
    render(
      <ConfirmStatusModal
        isOpen={true}
        title="Order #123"
        subtitle="John — ₹500"
        targetStatus="CONFIRMED"
        statusMeta={STATUS_META}
        onConfirm={mockConfirm}
        onClose={mockClose}
        loading={false}
      />
    );
    expect(screen.getByText("Order #123")).toBeInTheDocument();
    expect(screen.getByText("John — ₹500")).toBeInTheDocument();
  });

  it("shows custom warning message", () => {
    render(
      <ConfirmStatusModal
        isOpen={true}
        title="Test"
        subtitle="Test"
        targetStatus="CONFIRMED"
        statusMeta={STATUS_META}
        warnings={{ CONFIRMED: "Payment will be verified." }}
        onConfirm={mockConfirm}
        onClose={mockClose}
        loading={false}
      />
    );
    expect(screen.getByText("Payment will be verified.")).toBeInTheDocument();
  });

  it("calls onConfirm when confirm button clicked", () => {
    render(
      <ConfirmStatusModal
        isOpen={true}
        title="Test"
        subtitle="Test"
        targetStatus="PROCESSING"
        statusMeta={STATUS_META}
        onConfirm={mockConfirm}
        onClose={mockClose}
        loading={false}
      />
    );
    fireEvent.click(screen.getByText("Yes, Processing"));
    expect(mockConfirm).toHaveBeenCalled();
  });

  it("calls onClose when Go Back clicked", () => {
    render(
      <ConfirmStatusModal
        isOpen={true}
        title="Test"
        subtitle="Test"
        targetStatus="CONFIRMED"
        statusMeta={STATUS_META}
        onConfirm={mockConfirm}
        onClose={mockClose}
        loading={false}
      />
    );
    fireEvent.click(screen.getByText("Go Back"));
    expect(mockClose).toHaveBeenCalled();
  });

  it("disables confirm button when confirmDisabled is true", () => {
    render(
      <ConfirmStatusModal
        isOpen={true}
        title="Test"
        subtitle="Test"
        targetStatus="CONFIRMED"
        statusMeta={STATUS_META}
        onConfirm={mockConfirm}
        onClose={mockClose}
        loading={false}
        confirmDisabled={true}
      />
    );
    const confirmBtn = screen.getByText("Yes, Confirmed");
    expect(confirmBtn).toBeDisabled();
  });

  it("shows cancel-specific styling for CANCELLED target", () => {
    render(
      <ConfirmStatusModal
        isOpen={true}
        title="Test"
        subtitle="Test"
        targetStatus="CANCELLED"
        statusMeta={STATUS_META}
        onConfirm={mockConfirm}
        onClose={mockClose}
        loading={false}
      />
    );
    expect(screen.getByText("Yes, Cancel")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("shows loading state", () => {
    render(
      <ConfirmStatusModal
        isOpen={true}
        title="Test"
        subtitle="Test"
        targetStatus="CONFIRMED"
        statusMeta={STATUS_META}
        onConfirm={mockConfirm}
        onClose={mockClose}
        loading={true}
      />
    );
    expect(screen.getByText("Updating...")).toBeInTheDocument();
  });

  it("renders children content", () => {
    render(
      <ConfirmStatusModal
        isOpen={true}
        title="Test"
        subtitle="Test"
        targetStatus="CONFIRMED"
        statusMeta={STATUS_META}
        onConfirm={mockConfirm}
        onClose={mockClose}
        loading={false}
      >
        <div data-testid="custom-form">Custom verification form</div>
      </ConfirmStatusModal>
    );
    expect(screen.getByTestId("custom-form")).toBeInTheDocument();
  });
});
