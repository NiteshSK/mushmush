import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'react-hot-toast';
import AddressFormModal from '../AddressFormModal';

// Mock fetch
global.fetch = jest.fn();

jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('AddressFormModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    cleanup();
    document.body.innerHTML = '';
    // jest.clearAllMocks();
    // (global.fetch as jest.Mock).mockClear();
    // (toast.success as jest.Mock).mockClear();
    // (toast.error as jest.Mock).mockClear();
  });

  describe('Unit Tests', () => {
    it('should use the mocked toast', () => {
      toast.error('test');
      expect(toast.error).toHaveBeenCalledWith('test');
    });

    it('should not render when isOpen is false', () => {
      const { container } = render(
        <AddressFormModal
          isOpen={false}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );
      expect(container.firstChild).toBeNull();
    });

    it('should render modal when isOpen is true', () => {
      render(
        <AddressFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );
      expect(screen.getByText('Add New Address')).toBeInTheDocument();
    });

    it('should render custom title when provided', () => {
      render(
        <AddressFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          title="Edit Address"
        />
      );
      expect(screen.getByText('Edit Address')).toBeInTheDocument();
    });

    it('should render all form fields', () => {
      render(
        <AddressFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      expect(screen.getByLabelText(/Street Address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/City/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/State/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/PIN Code/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Country/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Set as default address/i)).toBeInTheDocument();
    });

    it('should call onClose when close button is clicked', () => {
      render(
        <AddressFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when Cancel button is clicked', () => {
      render(
        <AddressFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      fireEvent.click(cancelButton);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should validate form inputs', async () => {
      render(
        <AddressFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Fill other fields first
      fireEvent.change(screen.getByPlaceholderText(/House no, Building name/i), { target: { value: '123 Main St' } });
      fireEvent.change(screen.getByLabelText(/City/i), { target: { value: 'Mumbai' } });
      fireEvent.change(screen.getByLabelText(/State/i), { target: { value: 'Maharashtra' } });

      // Invalid PIN
      const zipInput = screen.getByPlaceholderText(/6-digit PIN code/i);
      fireEvent.change(zipInput, { target: { value: '12345' } });

      const submitButton = screen.getByRole('button', { name: /Add Address/i });
      fireEvent.submit(submitButton.closest('form')!);

      await waitFor(() => {
        const calls = (toast.error as jest.Mock).mock.calls;
        expect(calls.length).toBeGreaterThan(0);
        expect(calls[0][0]).toBe('PIN code must be 6 digits');
      });
    });

    it('should only allow numeric input in PIN code field', async () => {
      render(
        <AddressFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const pinInput = screen.getByPlaceholderText(/6-digit PIN code/i) as HTMLInputElement;

      await userEvent.type(pinInput, 'abc123xyz');

      // Should only contain numbers
      expect(pinInput.value).toBe('123');
    });

    it('should limit PIN code to 6 digits', async () => {
      render(
        <AddressFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const pinInput = screen.getByPlaceholderText(/6-digit PIN code/i) as HTMLInputElement;

      await userEvent.type(pinInput, '1234567890');

      expect(pinInput.value).toBe('123456');
    });

    it('should have Country field disabled with value "India"', () => {
      render(
        <AddressFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const countryInput = screen.getByDisplayValue('India') as HTMLInputElement;
      expect(countryInput).toBeDisabled();
    });

    it('should render all Indian states in dropdown', () => {
      render(
        <AddressFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const stateSelect = screen.getByLabelText(/State/i);
      const options = stateSelect.querySelectorAll('option');

      // Should have "Select State" + 36 states/UTs
      expect(options.length).toBeGreaterThan(30);
      expect(screen.getByRole('option', { name: 'Maharashtra' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Delhi' })).toBeInTheDocument();
    });
  });

  describe('Integration Tests', () => {
    it('should update input value on change', () => {
      render(
        <AddressFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const streetInput = screen.getByPlaceholderText(/House no, Building name/i) as HTMLInputElement;
      fireEvent.change(streetInput, { target: { value: 'Test Street' } });
      expect(streetInput.value).toBe('Test Street');
    });

    // Integration Tests
    it('should display error for empty fields', async () => {
      render(
        <AddressFormModal
          key="empty-fields"
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Don't fill any fields

      // Submit
      const submitButton = screen.getByRole('button', { name: /Add Address/i });
      fireEvent.submit(submitButton.closest('form')!);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Please fill in all required fields'));
      });
    });

    it('should validate form inputs', async () => {
      render(
        <AddressFormModal
          key="validate-inputs"
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Fill valid fields
      const streetInput = screen.getByLabelText(/Street Address/i);
      fireEvent.change(streetInput, { target: { value: '123 Main St' } });

      const cityInput = screen.getByLabelText(/City/i);
      fireEvent.change(cityInput, { target: { value: 'Mumbai' } });

      const stateSelect = screen.getByLabelText(/State/i);
      fireEvent.change(stateSelect, { target: { value: 'Maharashtra' } });

      // Invalid PIN
      const zipInput = screen.getByPlaceholderText(/6-digit PIN code/i);
      fireEvent.change(zipInput, { target: { value: '12345' } });

      const submitButton = screen.getByRole('button', { name: /Add Address/i });
      fireEvent.submit(submitButton.closest('form')!);

      await waitFor(() => {
        const calls = (toast.error as jest.Mock).mock.calls;
        expect(calls.length).toBeGreaterThan(0);
        expect(calls[0][0]).toBe('PIN code must be 6 digits');
      });
    });

    it('should submit form with valid data', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, address: { id: '123' } })
      });

      render(
        <AddressFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Fill form
      const streetInput = screen.getByPlaceholderText(/House no, Building name/i) as HTMLInputElement;
      fireEvent.change(streetInput, { target: { value: '123 Main St' } });
      expect(streetInput.value).toBe('123 Main St');

      const cityInput = screen.getByLabelText(/City/i) as HTMLInputElement;
      fireEvent.change(cityInput, { target: { value: 'Mumbai' } });
      expect(cityInput.value).toBe('Mumbai');

      const stateSelect = screen.getByLabelText(/State/i) as HTMLSelectElement;
      fireEvent.change(stateSelect, { target: { value: 'Maharashtra' } });
      expect(stateSelect.value).toBe('Maharashtra');

      const zipInput = screen.getByPlaceholderText(/6-digit PIN code/i) as HTMLInputElement;
      fireEvent.change(zipInput, { target: { value: '400001' } });
      expect(zipInput.value).toBe('400001');

      // Submit
      const submitButton = screen.getByRole('button', { name: /Add Address/i });
      fireEvent.submit(submitButton.closest('form')!);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/addresses', expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        }));
      });

      const fetchCall = (global.fetch as jest.Mock).mock.calls.find(call => call[0] === '/api/addresses');
      const body = JSON.parse(fetchCall[1].body);
      expect(body).toMatchObject({
        street: '123 Main St',
        city: 'Mumbai',
        state: 'Maharashtra',
        zip: '400001',
        country: 'India',
        type: 'SHIPPING',
        isDefault: false
      });

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Address added successfully!');
        expect(mockOnSuccess).toHaveBeenCalled();
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('should handle API error gracefully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Maximum 5 addresses allowed', code: 'ADDRESS_LIMIT_REACHED' })
      });

      render(
        <AddressFormModal
          key="api-error"
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Fill form
      fireEvent.change(screen.getByPlaceholderText(/House no, Building name/i), { target: { value: '123 Main St' } });
      fireEvent.change(screen.getByLabelText(/City/i), { target: { value: 'Mumbai' } });
      fireEvent.change(screen.getByLabelText(/State/i), { target: { value: 'Maharashtra' } });
      fireEvent.change(screen.getByPlaceholderText(/6-digit PIN code/i), { target: { value: '400001' } });

      // Submit
      const submitButton = screen.getByRole('button', { name: /Add Address/i });
      fireEvent.submit(submitButton.closest('form')!);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining('Maximum 5 addresses allowed'),
          expect.anything()
        );
      });

      expect(mockOnSuccess).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should handle network error', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      render(
        <AddressFormModal
          key="network-error"
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Fill form
      fireEvent.change(screen.getByPlaceholderText(/House no, Building name/i), { target: { value: '123 Main St' } });
      fireEvent.change(screen.getByLabelText(/City/i), { target: { value: 'Mumbai' } });
      fireEvent.change(screen.getByLabelText(/State/i), { target: { value: 'Maharashtra' } });
      fireEvent.change(screen.getByPlaceholderText(/6-digit PIN code/i), { target: { value: '400001' } });

      // Submit
      const submitButton = screen.getByRole('button', { name: /Add Address/i });
      fireEvent.submit(submitButton.closest('form')!);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to add address');
      });
    });



    it('should submit with isDefault checked', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      render(
        <AddressFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Fill form
      fireEvent.change(screen.getByPlaceholderText(/House no, Building name/i), { target: { value: '123 Main St' } });
      fireEvent.change(screen.getByLabelText(/City/i), { target: { value: 'Mumbai' } });
      fireEvent.change(screen.getByLabelText(/State/i), { target: { value: 'Maharashtra' } });
      fireEvent.change(screen.getByPlaceholderText(/6-digit PIN code/i), { target: { value: '400001' } });

      // Check default checkbox
      const defaultCheckbox = screen.getByLabelText(/Set as default address/i);
      fireEvent.click(defaultCheckbox);

      // Submit
      const submitButton = screen.getByRole('button', { name: /Add Address/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/addresses',
          expect.objectContaining({
            body: expect.stringContaining('"isDefault":true')
          })
        );
      });
    });

    it('should reset form after successful submission', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      const { rerender } = render(
        <AddressFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Fill form
      fireEvent.change(screen.getByPlaceholderText(/House no, Building name/i), { target: { value: '123 Main St' } });
      fireEvent.change(screen.getByLabelText(/City/i), { target: { value: 'Mumbai' } });
      fireEvent.change(screen.getByLabelText(/State/i), { target: { value: 'Maharashtra' } });
      fireEvent.change(screen.getByPlaceholderText(/6-digit PIN code/i), { target: { value: '400001' } });

      // Submit
      const submitButton = screen.getByRole('button', { name: /Add Address/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });

      // Reopen modal
      rerender(
        <AddressFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Form should be empty
      expect((screen.getByPlaceholderText(/House no, Building name/i) as HTMLInputElement).value).toBe('');
      expect((screen.getByLabelText(/City/i) as HTMLInputElement).value).toBe('');
    });

    it('should show loading state during submission', async () => {
      (global.fetch as jest.Mock).mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: async () => ({ success: true })
        }), 100))
      );

      render(
        <AddressFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Fill form
      fireEvent.change(screen.getByPlaceholderText(/House no, Building name/i), { target: { value: '123 Main St' } });
      fireEvent.change(screen.getByLabelText(/City/i), { target: { value: 'Mumbai' } });
      fireEvent.change(screen.getByLabelText(/State/i), { target: { value: 'Maharashtra' } });
      fireEvent.change(screen.getByPlaceholderText(/6-digit PIN code/i), { target: { value: '400001' } });

      // Submit
      const submitButton = screen.getByRole('button', { name: /Add Address/i });
      fireEvent.click(submitButton);

      // Should show loading text
      expect(screen.getByText('Adding...')).toBeInTheDocument();

      // Button should be disabled
      expect(submitButton).toBeDisabled();

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility Tests', () => {
    it('should have proper ARIA labels', () => {
      render(
        <AddressFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      expect(screen.getByLabelText(/Street Address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/City/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/State/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/PIN Code/i)).toBeInTheDocument();
    });

    it('should mark required fields with asterisk', () => {
      render(
        <AddressFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const requiredLabels = screen.getAllByText('*');
      expect(requiredLabels.length).toBeGreaterThan(0);
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      render(
        <AddressFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const streetInput = screen.getByPlaceholderText(/House no, Building name/i);
      streetInput.focus();
      expect(document.activeElement).toBe(streetInput);

      // Tab to next field
      await user.tab();
      const cityInput = screen.getByLabelText(/City/i);
      expect(document.activeElement).toBe(cityInput);
    });
  });
});
