import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'react-hot-toast';
import AddressFormModal from '../AddressFormModal';

// Mock dependencies
jest.mock('react-hot-toast');

// Mock fetch
global.fetch = jest.fn();

describe('AddressFormModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('Unit Tests', () => {
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

    it('should validate PIN code format', async () => {
      render(
        <AddressFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const pinInput = screen.getByPlaceholderText(/6-digit PIN code/i);
      
      // Type invalid PIN
      await userEvent.type(pinInput, '12345');
      
      const submitButton = screen.getByRole('button', { name: /Add Address/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('PIN code must be 6 digits');
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
      await userEvent.type(screen.getByPlaceholderText(/House no, Building name/i), '123 Main St');
      await userEvent.type(screen.getByLabelText(/City/i), 'Mumbai');
      await userEvent.selectOptions(screen.getByLabelText(/State/i), 'Maharashtra');
      await userEvent.type(screen.getByPlaceholderText(/6-digit PIN code/i), '400001');

      // Submit
      const submitButton = screen.getByRole('button', { name: /Add Address/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            street: '123 Main St',
            city: 'Mumbai',
            state: 'Maharashtra',
            zip: '400001',
            country: 'India',
            type: 'BOTH',
            isDefault: false
          })
        });
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
        json: async () => ({ error: 'Maximum 5 addresses allowed' })
      });

      render(
        <AddressFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Fill form
      await userEvent.type(screen.getByPlaceholderText(/House no, Building name/i), '123 Main St');
      await userEvent.type(screen.getByLabelText(/City/i), 'Mumbai');
      await userEvent.selectOptions(screen.getByLabelText(/State/i), 'Maharashtra');
      await userEvent.type(screen.getByPlaceholderText(/6-digit PIN code/i), '400001');

      // Submit
      const submitButton = screen.getByRole('button', { name: /Add Address/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Maximum 5 addresses allowed');
      });

      expect(mockOnSuccess).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should handle network error', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      render(
        <AddressFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Fill form
      await userEvent.type(screen.getByPlaceholderText(/House no, Building name/i), '123 Main St');
      await userEvent.type(screen.getByLabelText(/City/i), 'Mumbai');
      await userEvent.selectOptions(screen.getByLabelText(/State/i), 'Maharashtra');
      await userEvent.type(screen.getByPlaceholderText(/6-digit PIN code/i), '400001');

      // Submit
      const submitButton = screen.getByRole('button', { name: /Add Address/i });
      fireEvent.click(submitButton);

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
      await userEvent.type(screen.getByPlaceholderText(/House no, Building name/i), '123 Main St');
      await userEvent.type(screen.getByLabelText(/City/i), 'Mumbai');
      await userEvent.selectOptions(screen.getByLabelText(/State/i), 'Maharashtra');
      await userEvent.type(screen.getByPlaceholderText(/6-digit PIN code/i), '400001');
      
      // Check default checkbox
      const defaultCheckbox = screen.getByLabelText(/Set as default address/i);
      await userEvent.click(defaultCheckbox);

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
      await userEvent.type(screen.getByPlaceholderText(/House no, Building name/i), '123 Main St');
      await userEvent.type(screen.getByLabelText(/City/i), 'Mumbai');
      await userEvent.selectOptions(screen.getByLabelText(/State/i), 'Maharashtra');
      await userEvent.type(screen.getByPlaceholderText(/6-digit PIN code/i), '400001');

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
      await userEvent.type(screen.getByPlaceholderText(/House no, Building name/i), '123 Main St');
      await userEvent.type(screen.getByLabelText(/City/i), 'Mumbai');
      await userEvent.selectOptions(screen.getByLabelText(/State/i), 'Maharashtra');
      await userEvent.type(screen.getByPlaceholderText(/6-digit PIN code/i), '400001');

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
      await userEvent.tab();
      const cityInput = screen.getByLabelText(/City/i);
      expect(document.activeElement).toBe(cityInput);
    });
  });
});
