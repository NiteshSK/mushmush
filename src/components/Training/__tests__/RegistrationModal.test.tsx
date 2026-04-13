import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'react-hot-toast';
import RegistrationModal from '../RegistrationModal';

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

describe('RegistrationModal Validation', () => {
  const mockOnClose = jest.fn();
  const mockOnRegistrationComplete = jest.fn();

  const renderModal = (user = mockUser) => {
    return render(
      <RegistrationModal
        program={mockProgram}
        onClose={mockOnClose}
        user={user}
        onRegistrationComplete={mockOnRegistrationComplete}
      />
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the modal with program name', () => {
    renderModal();
    expect(screen.getByText(/Register for Mushroom Cultivation Training/i)).toBeInTheDocument();
  });

  it('pre-fills name and email from user', () => {
    renderModal();
    const nameInput = screen.getByDisplayValue('Test User');
    const emailInput = screen.getByDisplayValue('test@example.com');
    expect(nameInput).toBeInTheDocument();
    expect(emailInput).toBeInTheDocument();
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

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('shows error for invalid phone number', async () => {
    renderModal();

    const phoneInput = screen.getByPlaceholderText('10-digit mobile number');
    await userEvent.type(phoneInput, '12345');

    fireEvent.click(screen.getByRole('button', { name: /Continue to Payment/i }));

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid 10-digit Indian mobile number')).toBeInTheDocument();
    });
  });

  it('shows error for invalid PIN code', async () => {
    renderModal();

    // Fill required fields
    const phoneInput = screen.getByPlaceholderText('10-digit mobile number');
    await userEvent.type(phoneInput, '9876543210');
    await userEvent.type(screen.getByPlaceholderText('Street Address'), '123 Main Street');
    await userEvent.type(screen.getByPlaceholderText('City'), 'Mumbai');
    await userEvent.type(screen.getByPlaceholderText('State'), 'Maharashtra');
    await userEvent.type(screen.getByPlaceholderText('PIN Code'), '123');

    fireEvent.click(screen.getByRole('button', { name: /Continue to Payment/i }));

    await waitFor(() => {
      expect(screen.getByText('PIN code must be exactly 6 digits')).toBeInTheDocument();
    });
  });

  it('only allows digits in phone field', async () => {
    renderModal();

    const phoneInput = screen.getByPlaceholderText('10-digit mobile number') as HTMLInputElement;
    await userEvent.type(phoneInput, 'abc9876xyz');

    expect(phoneInput.value).toBe('9876');
  });

  it('only allows digits in PIN code field and limits to 6', async () => {
    renderModal();

    const pinInput = screen.getByPlaceholderText('PIN Code') as HTMLInputElement;
    await userEvent.type(pinInput, 'abc248142xyz99');

    expect(pinInput.value).toBe('248142');
  });

  it('clears errors when user types in errored field', async () => {
    renderModal(null);

    // Submit to trigger errors
    fireEvent.click(screen.getByRole('button', { name: /Continue to Payment/i }));

    await waitFor(() => {
      expect(screen.getByText('Full name is required')).toBeInTheDocument();
    });

    // Type in the name field
    const nameInputs = screen.getAllByRole('textbox');
    await userEvent.type(nameInputs[0], 'John Doe');

    expect(screen.queryByText('Full name is required')).not.toBeInTheDocument();
  });

  it('submits form when all fields are valid', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ registrationNumber: 'REG-001' }),
    });

    renderModal();

    const phoneInput = screen.getByPlaceholderText('10-digit mobile number');
    await userEvent.type(phoneInput, '9876543210');
    await userEvent.type(screen.getByPlaceholderText('Street Address'), '123 Main Street');
    await userEvent.type(screen.getByPlaceholderText('City'), 'Mumbai');
    await userEvent.type(screen.getByPlaceholderText('State'), 'Maharashtra');
    await userEvent.type(screen.getByPlaceholderText('PIN Code'), '248142');

    fireEvent.click(screen.getByRole('button', { name: /Continue to Payment/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/training-registrations', expect.objectContaining({
        method: 'POST',
      }));
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('REG-001'));
      expect(mockOnRegistrationComplete).toHaveBeenCalled();
    });
  });

  it('shows error for short street address', async () => {
    renderModal();

    const phoneInput = screen.getByPlaceholderText('10-digit mobile number');
    await userEvent.type(phoneInput, '9876543210');
    await userEvent.type(screen.getByPlaceholderText('Street Address'), 'Hi');
    await userEvent.type(screen.getByPlaceholderText('City'), 'Mumbai');
    await userEvent.type(screen.getByPlaceholderText('State'), 'Maharashtra');
    await userEvent.type(screen.getByPlaceholderText('PIN Code'), '248142');

    fireEvent.click(screen.getByRole('button', { name: /Continue to Payment/i }));

    await waitFor(() => {
      expect(screen.getByText('Please enter a complete street address')).toBeInTheDocument();
    });
  });
});
