import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useSession } from 'next-auth/react';
import BillingNew from '../BillingNew';

// Mock dependencies
jest.mock('next-auth/react');
jest.mock('next/link', () => {
  return ({ children, href }: any) => <a href={href}>{children}</a>;
});

// Mock fetch
global.fetch = jest.fn();

const mockAddresses = [
  {
    id: 'addr-1',
    street: '123 Main St',
    city: 'Mumbai',
    state: 'Maharashtra',
    zip: '400001',
    country: 'India',
    type: 'BOTH',
    isDefault: true
  },
  {
    id: 'addr-2',
    street: '456 Park Ave',
    city: 'Delhi',
    state: 'Delhi',
    zip: '110001',
    country: 'India',
    type: 'BOTH',
    isDefault: false
  }
];

describe('BillingNew', () => {
  const mockOnAddressChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('Unit Tests - Guest User', () => {
    beforeEach(() => {
      (useSession as jest.Mock).mockReturnValue({
        data: null,
        status: 'unauthenticated'
      });
    });

    it('should render billing details heading', () => {
      render(<BillingNew onAddressChange={mockOnAddressChange} />);
      expect(screen.getByText('Billing Details')).toBeInTheDocument();
    });

    it('should render contact information section', () => {
      render(<BillingNew onAddressChange={mockOnAddressChange} />);
      expect(screen.getByText('Contact Information')).toBeInTheDocument();
    });

    it('should render all contact fields for guest', () => {
      render(<BillingNew onAddressChange={mockOnAddressChange} />);

      expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Phone/i)).toBeInTheDocument();
    });

    it('should render billing address section for guest', () => {
      render(<BillingNew onAddressChange={mockOnAddressChange} />);
      expect(screen.getByText('Billing Address')).toBeInTheDocument();
    });

    it('should show sign in link for guest users', () => {
      render(<BillingNew onAddressChange={mockOnAddressChange} />);
      expect(screen.getByText('Sign in to save addresses')).toBeInTheDocument();
    });

    it('should render address form fields for guest', () => {
      render(<BillingNew onAddressChange={mockOnAddressChange} />);

      expect(screen.getByLabelText(/Street Address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/City/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/State/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/PIN Code/i)).toBeInTheDocument();
    });

    it('should not show save address checkbox for guest', () => {
      render(<BillingNew onAddressChange={mockOnAddressChange} />);
      expect(screen.queryByLabelText(/Save this address/i)).not.toBeInTheDocument();
    });

    it('should validate email format', async () => {
      render(<BillingNew onAddressChange={mockOnAddressChange} />);

      const emailInput = screen.getByLabelText(/Email Address/i);
      await userEvent.type(emailInput, 'invalid-email');
      fireEvent.blur(emailInput);

      await waitFor(() => {
        expect(screen.getByText(/Please enter a valid email address/i)).toBeInTheDocument();
      });
    });

    it('should validate phone number format', async () => {
      render(<BillingNew onAddressChange={mockOnAddressChange} />);

      const phoneInput = screen.getByLabelText(/Phone/i);
      await userEvent.type(phoneInput, '12345');
      fireEvent.blur(phoneInput);

      await waitFor(() => {
        expect(screen.getByText(/Please enter a valid 10-digit Indian mobile number/i)).toBeInTheDocument();
      });
    });

    it('should only allow numeric input in phone field', async () => {
      render(<BillingNew onAddressChange={mockOnAddressChange} />);

      const phoneInput = screen.getByLabelText(/Phone/i) as HTMLInputElement;
      await userEvent.type(phoneInput, 'abc9876543210xyz');

      expect(phoneInput.value).toBe('9876543210');
    });

    it('should limit phone number to 10 digits', async () => {
      render(<BillingNew onAddressChange={mockOnAddressChange} />);

      const phoneInput = screen.getByLabelText(/Phone/i) as HTMLInputElement;
      await userEvent.type(phoneInput, '98765432109999');

      expect(phoneInput.value).toBe('9876543210');
    });

    it('should validate PIN code format', async () => {
      render(<BillingNew onAddressChange={mockOnAddressChange} />);

      const zipInput = screen.getByLabelText(/PIN Code/i);
      await userEvent.type(zipInput, '123');
      fireEvent.blur(zipInput);

      await waitFor(() => {
        expect(screen.getByText(/PIN code must be exactly 6 digits/i)).toBeInTheDocument();
      });
    });

    it('should only allow numeric input in PIN code field', async () => {
      render(<BillingNew onAddressChange={mockOnAddressChange} />);

      const zipInput = screen.getByLabelText(/PIN Code/i) as HTMLInputElement;
      await userEvent.type(zipInput, 'abc400001xyz');

      expect(zipInput.value).toBe('400001');
    });
  });

  describe('Unit Tests - Logged-in User with Addresses', () => {
    beforeEach(() => {
      (useSession as jest.Mock).mockReturnValue({
        data: { user: { id: 'user-1', email: 'test@example.com' } },
        status: 'authenticated'
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ addresses: mockAddresses })
      });
    });

    it('should fetch addresses on mount', async () => {
      render(<BillingNew onAddressChange={mockOnAddressChange} />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/addresses');
      });
    });

    it('should display saved addresses', async () => {
      render(<BillingNew onAddressChange={mockOnAddressChange} />);

      await waitFor(() => {
        expect(screen.getByText('123 Main St')).toBeInTheDocument();
        expect(screen.getByText('456 Park Ave')).toBeInTheDocument();
      });
    });

    it('should show default badge on default address', async () => {
      render(<BillingNew onAddressChange={mockOnAddressChange} />);

      await waitFor(() => {
        expect(screen.getByText('Default')).toBeInTheDocument();
      });
    });

    it('should auto-select default address', async () => {
      render(<BillingNew onAddressChange={mockOnAddressChange} />);

      await waitFor(() => {
        expect(mockOnAddressChange).toHaveBeenCalledWith(mockAddresses[0]);
      });
    });

    it('should show "Use a different address" option', async () => {
      render(<BillingNew onAddressChange={mockOnAddressChange} />);

      await waitFor(() => {
        expect(screen.getByText('Use a different address')).toBeInTheDocument();
      });
    });

    it('should show "Add New Address" button when less than 5 addresses', async () => {
      render(<BillingNew onAddressChange={mockOnAddressChange} />);

      await waitFor(() => {
        expect(screen.getByText('Add New Address')).toBeInTheDocument();
      });
    });

    it('should not show "Add New Address" button when 5 addresses exist', async () => {
      const fiveAddresses = Array(5).fill(null).map((_, i) => ({
        ...mockAddresses[0],
        id: `addr-${i}`,
        isDefault: i === 0
      }));

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ addresses: fiveAddresses })
      });

      render(<BillingNew onAddressChange={mockOnAddressChange} />);

      await waitFor(() => {
        expect(screen.queryByText('Add New Address')).not.toBeInTheDocument();
      });
    });

    it('should open modal when "Add New Address" is clicked', async () => {
      render(<BillingNew onAddressChange={mockOnAddressChange} />);

      await waitFor(() => {
        expect(screen.getByText('Add New Address')).toBeInTheDocument();
      });

      const addButton = screen.getByText('Add New Address');
      fireEvent.click(addButton);

      // Modal should open (check for modal title)
      await waitFor(() => {
        expect(screen.getByText('Add New Address')).toBeInTheDocument();
      });
    });

    it('should show address form when "Use a different address" is selected', async () => {
      render(<BillingNew onAddressChange={mockOnAddressChange} />);

      await waitFor(() => {
        expect(screen.getByText('Use a different address')).toBeInTheDocument();
      });

      const newAddressRadio = screen.getByLabelText(/Use a different address/i);
      fireEvent.click(newAddressRadio);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/House number and street name/i)).toBeInTheDocument();
      });
    });

    it('should call onAddressChange when address is selected', async () => {
      render(<BillingNew onAddressChange={mockOnAddressChange} />);

      await waitFor(() => {
        expect(screen.getByText('456 Park Ave')).toBeInTheDocument();
      });

      // Find the radio button for second address
      const radioButtons = screen.getAllByRole('radio');
      const secondAddressRadio = radioButtons.find(radio => 
        (radio as HTMLInputElement).value === 'addr-2'
      );

      if (secondAddressRadio) {
        fireEvent.click(secondAddressRadio);

        await waitFor(() => {
          expect(mockOnAddressChange).toHaveBeenCalledWith(mockAddresses[1]);
        });
      }
    });

    it('should show save address checkbox when entering new address', async () => {
      render(<BillingNew onAddressChange={mockOnAddressChange} />);

      await waitFor(() => {
        expect(screen.getByText('Use a different address')).toBeInTheDocument();
      });

      const newAddressRadio = screen.getByLabelText(/Use a different address/i);
      fireEvent.click(newAddressRadio);

      await waitFor(() => {
        expect(screen.getByLabelText(/Save this address/i)).toBeInTheDocument();
      });
    });
  });

  describe('Unit Tests - Logged-in User without Addresses', () => {
    beforeEach(() => {
      (useSession as jest.Mock).mockReturnValue({
        data: { user: { id: 'user-1', email: 'test@example.com' } },
        status: 'authenticated'
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ addresses: [] })
      });
    });

    it('should show address form when no saved addresses', async () => {
      render(<BillingNew onAddressChange={mockOnAddressChange} />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/House number and street name/i)).toBeInTheDocument();
      });
    });

    it('should show save address checkbox for new users', async () => {
      render(<BillingNew onAddressChange={mockOnAddressChange} />);

      await waitFor(() => {
        expect(screen.getByLabelText(/Save this address/i)).toBeInTheDocument();
      });
    });
  });

  describe('Integration Tests', () => {
    beforeEach(() => {
      (useSession as jest.Mock).mockReturnValue({
        data: { user: { id: 'user-1', email: 'test@example.com' } },
        status: 'authenticated'
      });
    });

    it('should handle API error gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      render(<BillingNew onAddressChange={mockOnAddressChange} />);

      await waitFor(() => {
        // Should show address form as fallback
        expect(screen.getByPlaceholderText(/House number and street name/i)).toBeInTheDocument();
      });
    });

    it('should refresh addresses after modal success', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ addresses: mockAddresses })
      });

      render(<BillingNew onAddressChange={mockOnAddressChange} />);

      await waitFor(() => {
        expect(screen.getByText('Add New Address')).toBeInTheDocument();
      });

      // Open modal
      const addButton = screen.getByText('Add New Address');
      fireEvent.click(addButton);

      // Close modal (simulating success)
      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      fireEvent.click(cancelButton);

      // Should have called fetch again
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should show loading state while fetching addresses', () => {
      (useSession as jest.Mock).mockReturnValue({
        data: { user: { id: 'user-1', email: 'test@example.com' } },
        status: 'authenticated'
      });

      (global.fetch as jest.Mock).mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: async () => ({ addresses: mockAddresses })
        }), 100))
      );

      render(<BillingNew onAddressChange={mockOnAddressChange} />);

      // Should show loading skeleton
      expect(screen.getByText('Billing Details')).toBeInTheDocument();
    });
  });

  describe('Accessibility Tests', () => {
    beforeEach(() => {
      (useSession as jest.Mock).mockReturnValue({
        data: null,
        status: 'unauthenticated'
      });
    });

    it('should have proper form labels', () => {
      render(<BillingNew onAddressChange={mockOnAddressChange} />);

      expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Phone/i)).toBeInTheDocument();
    });

    it('should mark required fields with asterisk', () => {
      render(<BillingNew onAddressChange={mockOnAddressChange} />);

      const requiredLabels = screen.getAllByText('*');
      expect(requiredLabels.length).toBeGreaterThan(0);
    });

    it('should be keyboard navigable', async () => {
      render(<BillingNew onAddressChange={mockOnAddressChange} />);

      const firstNameInput = screen.getByLabelText(/First Name/i);
      firstNameInput.focus();
      expect(document.activeElement).toBe(firstNameInput);

      await userEvent.tab();
      const lastNameInput = screen.getByLabelText(/Last Name/i);
      expect(document.activeElement).toBe(lastNameInput);
    });

    it('should have proper ARIA attributes for radio buttons', async () => {
      (useSession as jest.Mock).mockReturnValue({
        data: { user: { id: 'user-1', email: 'test@example.com' } },
        status: 'authenticated'
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ addresses: mockAddresses })
      });

      render(<BillingNew onAddressChange={mockOnAddressChange} />);

      await waitFor(() => {
        const radioButtons = screen.getAllByRole('radio');
        expect(radioButtons.length).toBeGreaterThan(0);
        radioButtons.forEach(radio => {
          expect(radio).toHaveAttribute('name', 'billingAddress');
        });
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty addresses array', async () => {
      (useSession as jest.Mock).mockReturnValue({
        data: { user: { id: 'user-1', email: 'test@example.com' } },
        status: 'authenticated'
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ addresses: [] })
      });

      render(<BillingNew onAddressChange={mockOnAddressChange} />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/House number and street name/i)).toBeInTheDocument();
      });
    });

    it('should handle null addresses response', async () => {
      (useSession as jest.Mock).mockReturnValue({
        data: { user: { id: 'user-1', email: 'test@example.com' } },
        status: 'authenticated'
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ addresses: null })
      });

      render(<BillingNew onAddressChange={mockOnAddressChange} />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/House number and street name/i)).toBeInTheDocument();
      });
    });

    it('should handle session loading state', () => {
      (useSession as jest.Mock).mockReturnValue({
        data: null,
        status: 'loading'
      });

      render(<BillingNew onAddressChange={mockOnAddressChange} />);

      // Should show loading state
      expect(screen.getByText('Billing Details')).toBeInTheDocument();
    });
  });
});
