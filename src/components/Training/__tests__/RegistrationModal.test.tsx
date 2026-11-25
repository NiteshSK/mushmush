import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'react-hot-toast';
import RegistrationModal from '../RegistrationModal';

// userEvent types each character; leave room when the machine is busy.
jest.setTimeout(20000);

// Mock utils
jest.mock('@/lib/utils', () => ({
  isEarlyBirdOfferValid: jest.fn(() => false),
  getTrainingProgramPrice: jest.fn((program) => program?.originalPrice ?? program?.price ?? 0),
}));

const mockProgram = {
  id: 1,
  name: 'Mushroom Cultivation Training',
  slug: 'mushroom-cultivation',
  description: 'Learn mushroom cultivation',
  price: 5000,
  duration: 5,
  dailyHours: '9AM - 5PM',
  type: 'IN_PERSON',
  isActive: true,
  hasEarlyBirdOffer: false,
  originalPrice: 5000,
};

const mockUser = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
};

const fillValidForm = async () => {
  await userEvent.type(screen.getByLabelText('Mobile number'), '9876543210');
  await userEvent.type(screen.getByLabelText('Street address'), '123 Main Street');
  await userEvent.type(screen.getByLabelText('City'), 'Mumbai');
  await userEvent.type(screen.getByLabelText('State'), 'Maharashtra');
  await userEvent.type(screen.getByLabelText('PIN code'), '248142');
};

describe('RegistrationModal Validation', () => {
  const mockOnClose = jest.fn();
  const mockOnRegistrationComplete = jest.fn();

  const renderModal = (user: typeof mockUser | null = mockUser, extra: Partial<React.ComponentProps<typeof RegistrationModal>> = {}) => {
    return render(
      <RegistrationModal
        program={mockProgram}
        onClose={mockOnClose}
        user={user}
        onRegistrationComplete={mockOnRegistrationComplete}
        {...extra}
      />
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the modal with program name and fee', () => {
    renderModal();
    expect(screen.getByRole('dialog', { name: /Register for Mushroom Cultivation Training/i })).toBeInTheDocument();
    expect(screen.getByText(/₹5,000 per participant/)).toBeInTheDocument();
    expect(screen.getByText(/stays pending until we verify the payment/)).toBeInTheDocument();
  });

  it('pre-fills name and email from user', () => {
    renderModal();
    expect(screen.getByLabelText('Full name')).toHaveValue('Test User');
    expect(screen.getByLabelText('Email address')).toHaveValue('test@example.com');
  });

  it('moves focus into the dialog when it opens', () => {
    renderModal();
    expect(screen.getByLabelText('Full name')).toHaveFocus();
  });

  it('shows validation errors when submitting empty form (no user)', async () => {
    renderModal(null);

    fireEvent.click(screen.getByRole('button', { name: /Continue to Payment/i }));

    await waitFor(() => {
      expect(screen.getByText('Full name is required')).toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Phone number is required')).toBeInTheDocument();
      expect(screen.getByText('Street address is required')).toBeInTheDocument();
      expect(screen.getByText('City is required')).toBeInTheDocument();
      expect(screen.getByText('State is required')).toBeInTheDocument();
      expect(screen.getByText('PIN code is required')).toBeInTheDocument();
    });

    expect(screen.getByLabelText('Full name')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('Full name')).toHaveAccessibleDescription('Full name is required');
    expect(screen.getByLabelText('Full name')).toHaveFocus();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('shows error for invalid phone number', async () => {
    renderModal();

    await userEvent.type(screen.getByPlaceholderText('10-digit mobile number'), '12345');
    fireEvent.click(screen.getByRole('button', { name: /Continue to Payment/i }));

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid 10-digit Indian mobile number')).toBeInTheDocument();
    });
  });

  it('shows error for invalid PIN code', async () => {
    renderModal();

    await userEvent.type(screen.getByLabelText('Mobile number'), '9876543210');
    await userEvent.type(screen.getByLabelText('Street address'), '123 Main Street');
    await userEvent.type(screen.getByLabelText('City'), 'Mumbai');
    await userEvent.type(screen.getByLabelText('State'), 'Maharashtra');
    await userEvent.type(screen.getByLabelText('PIN code'), '123');

    fireEvent.click(screen.getByRole('button', { name: /Continue to Payment/i }));

    await waitFor(() => {
      expect(screen.getByText('PIN code must be exactly 6 digits')).toBeInTheDocument();
    });
  });

  it('only allows digits in phone field', async () => {
    renderModal();

    const phoneInput = screen.getByLabelText('Mobile number') as HTMLInputElement;
    await userEvent.type(phoneInput, 'abc9876xyz');

    expect(phoneInput.value).toBe('9876');
  });

  it('only allows digits in PIN code field and limits to 6', async () => {
    renderModal();

    const pinInput = screen.getByLabelText('PIN code') as HTMLInputElement;
    await userEvent.type(pinInput, 'abc248142xyz99');

    expect(pinInput.value).toBe('248142');
  });

  it('clears errors when user types in errored field', async () => {
    renderModal(null);

    fireEvent.click(screen.getByRole('button', { name: /Continue to Payment/i }));

    await waitFor(() => {
      expect(screen.getByText('Full name is required')).toBeInTheDocument();
    });

    await userEvent.type(screen.getByLabelText('Full name'), 'John Doe');

    expect(screen.queryByText('Full name is required')).not.toBeInTheDocument();
  });

  it('submits form when all fields are valid', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ registrationNumber: 'REG-001' }),
    });

    renderModal();
    await fillValidForm();

    fireEvent.click(screen.getByRole('button', { name: /Continue to Payment/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/training-registrations', expect.objectContaining({
        method: 'POST',
      }));
    });

    await waitFor(() => {
      expect(mockOnRegistrationComplete).toHaveBeenCalledWith({ registrationNumber: 'REG-001' });
    });
    // The payment dialog opens next; nothing calls the registration successful or confirmed.
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('shows an existing registration inside the dialog, where toasts would be hidden', async () => {
    const onAlreadyRegistered = jest.fn();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: async () => ({ existingRegistration: { registrationNumber: 'TR-9', status: 'PENDING' } }),
    });

    renderModal(mockUser, { onAlreadyRegistered });
    await fillValidForm();
    fireEvent.click(screen.getByRole('button', { name: /Continue to Payment/i }));

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('You already have registration TR-9 for this programme.'));
    expect(onAlreadyRegistered).toHaveBeenCalled();
    expect(mockOnRegistrationComplete).not.toHaveBeenCalled();
  });

  it('shows a server error inside the dialog', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({ error: 'Failed to create registration' }) });

    renderModal();
    await fillValidForm();
    fireEvent.click(screen.getByRole('button', { name: /Continue to Payment/i }));

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Failed to create registration'));
  });

  it('shows error for short street address', async () => {
    renderModal();

    await userEvent.type(screen.getByLabelText('Mobile number'), '9876543210');
    await userEvent.type(screen.getByLabelText('Street address'), 'Hi');
    await userEvent.type(screen.getByLabelText('City'), 'Mumbai');
    await userEvent.type(screen.getByLabelText('State'), 'Maharashtra');
    await userEvent.type(screen.getByLabelText('PIN code'), '248142');

    fireEvent.click(screen.getByRole('button', { name: /Continue to Payment/i }));

    await waitFor(() => {
      expect(screen.getByText('Please enter a complete street address')).toBeInTheDocument();
    });
  });

  it('stays open under Strict Mode, whose effect re-run closes and reopens the dialog', async () => {
    const proto = HTMLDialogElement.prototype as any;
    proto.showModal = function showModal() { this.setAttribute('open', ''); };
    // Browsers fire "close" in a later task, after the effect has already reopened the dialog.
    proto.close = function close() { this.removeAttribute('open'); setTimeout(() => this.dispatchEvent(new Event('close'))); };
    try {
      render(
        <React.StrictMode>
          <RegistrationModal program={mockProgram} onClose={mockOnClose} user={mockUser} onRegistrationComplete={mockOnRegistrationComplete} />
        </React.StrictMode>
      );
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(mockOnClose).not.toHaveBeenCalled();
      expect(screen.getByRole('dialog')).toHaveAttribute('open');

      // A real native close (Chrome's repeated Escape) still updates the parent.
      screen.getByRole('dialog').removeAttribute('open');
      fireEvent(screen.getByRole('dialog', { hidden: true }), new Event('close'));
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    } finally {
      delete proto.showModal;
      delete proto.close;
    }
  });

  it('closes on Escape and returns focus to the control that opened it', () => {
    const Host = ({ open }: { open: boolean }) => (
      <>
        <button>Register</button>
        {open && <RegistrationModal program={mockProgram} onClose={mockOnClose} user={mockUser} onRegistrationComplete={mockOnRegistrationComplete} />}
      </>
    );
    const { rerender } = render(<Host open={false} />);
    screen.getByRole('button', { name: 'Register' }).focus();
    rerender(<Host open />);
    expect(screen.getByLabelText('Full name')).toHaveFocus();

    const cancel = new Event('cancel', { cancelable: true });
    fireEvent(screen.getByRole('dialog'), cancel);
    expect(cancel.defaultPrevented).toBe(true);
    expect(mockOnClose).toHaveBeenCalledTimes(1);

    rerender(<Host open={false} />);
    expect(screen.getByRole('button', { name: 'Register' })).toHaveFocus();
  });
});
