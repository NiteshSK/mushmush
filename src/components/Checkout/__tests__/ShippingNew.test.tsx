import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useSession } from 'next-auth/react';
import ShippingNew from '../ShippingNew';

// Mock dependencies
jest.mock('next-auth/react');

// Mock fetch
global.fetch = jest.fn();

const mockBillingAddress = {
  id: 'billing-1',
  street: '123 Billing St',
  city: 'Mumbai',
  state: 'Maharashtra',
  zip: '400001',
  country: 'India',
  type: 'BOTH',
  isDefault: true
};

const mockAddresses = [
  {
    id: 'addr-1',
    street: '789 Shipping Ave',
    city: 'Delhi',
    state: 'Delhi',
    zip: '110001',
    country: 'India',
    type: 'SHIPPING',
    isDefault: false
  },
  {
    id: 'addr-2',
    street: '456 Park Lane',
    city: 'Bangalore',
    state: 'Karnataka',
    zip: '560001',
    country: 'India',
    type: 'BOTH',
    isDefault: false
  }
];

describe('ShippingNew', () => {
  const mockOnAddressChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('Unit Tests - Same as Billing', () => {
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

    it('should render shipping address heading', async () => {
      render(
        <ShippingNew 
          billingAddress={mockBillingAddress}
          onAddressChange={mockOnAddressChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Shipping Address')).toBeInTheDocument();
      });
    });

    it('should show "Ship to billing address" checkbox', async () => {
      render(
        <ShippingNew 
          billingAddress={mockBillingAddress}
          onAddressChange={mockOnAddressChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/Ship to billing address/i)).toBeInTheDocument();
      });
    });

    it('should have "Same as billing" checked by default', async () => {
      render(
        <ShippingNew 
          billingAddress={mockBillingAddress}
          onAddressChange={mockOnAddressChange}
        />
      );

      await waitFor(() => {
        const checkbox = screen.getByRole('checkbox', { name: /Ship to billing address/i });
        expect(checkbox).toBeChecked();
      });
    });

    it('should call onAddressChange with billing address when same as billing is checked', async () => {
      render(
        <ShippingNew 
          billingAddress={mockBillingAddress}
          onAddressChange={mockOnAddressChange}
        />
      );

      await waitFor(() => {
        expect(mockOnAddressChange).toHaveBeenCalledWith(mockBillingAddress);
      });
    });

    it('should hide address options when same as billing is checked', async () => {
      render(
        <ShippingNew 
          billingAddress={mockBillingAddress}
          onAddressChange={mockOnAddressChange}
        />
      );

      await waitFor(() => {
        expect(screen.queryByText('789 Shipping Ave')).not.toBeInTheDocument();
      });
    });

    it('should show address options when same as billing is unchecked', async () => {
      render(
        <ShippingNew 
          billingAddress={mockBillingAddress}
          onAddressChange={mockOnAddressChange}
        />
      );

      await waitFor(() => {
        const checkbox = screen.getByRole('checkbox', { name: /Ship to billing address/i });
        expect(checkbox).toBeInTheDocument();
      });

      const checkbox = screen.getByRole('checkbox', { name: /Ship to billing address/i });
      fireEvent.click(checkbox);

      await waitFor(() => {
        expect(screen.getByText('789 Shipping Ave')).toBeInTheDocument();
      });
    });

    it('should auto-select first saved address when unchecking same as billing', async () => {
      render(
        <ShippingNew 
          billingAddress={mockBillingAddress}
          onAddressChange={mockOnAddressChange}
        />
      );

      await waitFor(() => {
        const checkbox = screen.getByRole('checkbox', { name: /Ship to billing address/i });
        expect(checkbox).toBeInTheDocument();
      });

      const checkbox = screen.getByRole('checkbox', { name: /Ship to billing address/i });
      fireEvent.click(checkbox);

      await waitFor(() => {
        expect(mockOnAddressChange).toHaveBeenCalledWith(mockAddresses[0]);
      });
    });
  });

  describe('Unit Tests - Different Shipping Address', () => {
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

    it('should display saved shipping addresses', async () => {
      render(
        <ShippingNew 
          billingAddress={mockBillingAddress}
          onAddressChange={mockOnAddressChange}
        />
      );

      // Uncheck same as billing
      const checkbox = await screen.findByRole('checkbox', { name: /Ship to billing address/i });
      fireEvent.click(checkbox);

      await waitFor(() => {
        expect(screen.getByText('789 Shipping Ave')).toBeInTheDocument();
        expect(screen.getByText('456 Park Lane')).toBeInTheDocument();
      });
    });

    it('should show "Use a different address" option', async () => {
      render(
        <ShippingNew 
          billingAddress={mockBillingAddress}
          onAddressChange={mockOnAddressChange}
        />
      );

      const checkbox = await screen.findByRole('checkbox', { name: /Ship to billing address/i });
      fireEvent.click(checkbox);

      await waitFor(() => {
        expect(screen.getByText('Use a different address')).toBeInTheDocument();
      });
    });

    it('should show "Add New Address" button when less than 5 addresses', async () => {
      render(
        <ShippingNew 
          billingAddress={mockBillingAddress}
          onAddressChange={mockOnAddressChange}
        />
      );

      const checkbox = await screen.findByRole('checkbox', { name: /Ship to billing address/i });
      fireEvent.click(checkbox);

      await waitFor(() => {
        expect(screen.getByText('Add New Address')).toBeInTheDocument();
      });
    });

    it('should show address form when "Use a different address" is selected', async () => {
      render(
        <ShippingNew 
          billingAddress={mockBillingAddress}
          onAddressChange={mockOnAddressChange}
        />
      );

      const checkbox = await screen.findByRole('checkbox', { name: /Ship to billing address/i });
      fireEvent.click(checkbox);

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
      render(
        <ShippingNew 
          billingAddress={mockBillingAddress}
          onAddressChange={mockOnAddressChange}
        />
      );

      const checkbox = await screen.findByRole('checkbox', { name: /Ship to billing address/i });
      fireEvent.click(checkbox);

      await waitFor(() => {
        expect(screen.getByText('456 Park Lane')).toBeInTheDocument();
      });

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
      render(
        <ShippingNew 
          billingAddress={mockBillingAddress}
          onAddressChange={mockOnAddressChange}
        />
      );

      const checkbox = await screen.findByRole('checkbox', { name: /Ship to billing address/i });
      fireEvent.click(checkbox);

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

  describe('Unit Tests - Guest User', () => {
    beforeEach(() => {
      (useSession as jest.Mock).mockReturnValue({
        data: null,
        status: 'unauthenticated'
      });
    });

    it('should show same as billing checkbox for guest', async () => {
      render(
        <ShippingNew 
          billingAddress={mockBillingAddress}
          onAddressChange={mockOnAddressChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/Ship to billing address/i)).toBeInTheDocument();
      });
    });

    it('should show address form when guest unchecks same as billing', async () => {
      render(
        <ShippingNew 
          billingAddress={mockBillingAddress}
          onAddressChange={mockOnAddressChange}
        />
      );

      const checkbox = await screen.findByRole('checkbox', { name: /Ship to billing address/i });
      fireEvent.click(checkbox);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/House number and street name/i)).toBeInTheDocument();
      });
    });

    it('should not show save address checkbox for guest', async () => {
      render(
        <ShippingNew 
          billingAddress={mockBillingAddress}
          onAddressChange={mockOnAddressChange}
        />
      );

      const checkbox = await screen.findByRole('checkbox', { name: /Ship to billing address/i });
      fireEvent.click(checkbox);

      await waitFor(() => {
        expect(screen.queryByLabelText(/Save this address/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Unit Tests - No Saved Addresses', () => {
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

    it('should show address form when no saved addresses and unchecked', async () => {
      render(
        <ShippingNew 
          billingAddress={mockBillingAddress}
          onAddressChange={mockOnAddressChange}
        />
      );

      const checkbox = await screen.findByRole('checkbox', { name: /Ship to billing address/i });
      fireEvent.click(checkbox);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/House number and street name/i)).toBeInTheDocument();
      });
    });

    it('should show save address checkbox when no saved addresses', async () => {
      render(
        <ShippingNew 
          billingAddress={mockBillingAddress}
          onAddressChange={mockOnAddressChange}
        />
      );

      const checkbox = await screen.findByRole('checkbox', { name: /Ship to billing address/i });
      fireEvent.click(checkbox);

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

    it('should fetch addresses on mount', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ addresses: mockAddresses })
      });

      render(
        <ShippingNew 
          billingAddress={mockBillingAddress}
          onAddressChange={mockOnAddressChange}
        />
      );

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/addresses');
      });
    });

    it('should handle API error gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      render(
        <ShippingNew 
          billingAddress={mockBillingAddress}
          onAddressChange={mockOnAddressChange}
        />
      );

      // Should still render without crashing
      await waitFor(() => {
        expect(screen.getByText('Shipping Address')).toBeInTheDocument();
      });
    });

    it('should update when billing address changes', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ addresses: mockAddresses })
      });

      const { rerender } = render(
        <ShippingNew 
          billingAddress={mockBillingAddress}
          onAddressChange={mockOnAddressChange}
        />
      );

      await waitFor(() => {
        expect(mockOnAddressChange).toHaveBeenCalledWith(mockBillingAddress);
      });

      const newBillingAddress = { ...mockBillingAddress, street: '999 New St' };
      
      rerender(
        <ShippingNew 
          billingAddress={newBillingAddress}
          onAddressChange={mockOnAddressChange}
        />
      );

      await waitFor(() => {
        expect(mockOnAddressChange).toHaveBeenCalledWith(newBillingAddress);
      });
    });

    it('should open modal when "Add New Address" is clicked', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ addresses: mockAddresses })
      });

      render(
        <ShippingNew 
          billingAddress={mockBillingAddress}
          onAddressChange={mockOnAddressChange}
        />
      );

      const checkbox = await screen.findByRole('checkbox', { name: /Ship to billing address/i });
      fireEvent.click(checkbox);

      await waitFor(() => {
        expect(screen.getByText('Add New Address')).toBeInTheDocument();
      });

      const addButton = screen.getByText('Add New Address');
      fireEvent.click(addButton);

      // Modal should open
      await waitFor(() => {
        expect(screen.getAllByText('Add New Address').length).toBeGreaterThan(1);
      });
    });

    it('should validate street address', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ addresses: [] })
      });

      render(
        <ShippingNew
          billingAddress={mockBillingAddress}
          onAddressChange={mockOnAddressChange}
        />
      );

      const checkbox = await screen.findByRole('checkbox', { name: /Ship to billing address/i });
      fireEvent.click(checkbox);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/House number and street name/i)).toBeInTheDocument();
      });

      const streetInput = screen.getByPlaceholderText(/House number and street name/i);
      await userEvent.type(streetInput, 'Hi');

      await waitFor(() => {
        expect(screen.getByText(/Please enter a complete street address/i)).toBeInTheDocument();
      });
    });

    it('should validate city name', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ addresses: [] })
      });

      render(
        <ShippingNew
          billingAddress={mockBillingAddress}
          onAddressChange={mockOnAddressChange}
        />
      );

      const checkbox = await screen.findByRole('checkbox', { name: /Ship to billing address/i });
      fireEvent.click(checkbox);

      await waitFor(() => {
        expect(screen.getByLabelText(/City/i)).toBeInTheDocument();
      });

      const cityInput = screen.getByLabelText(/City/i);
      await userEvent.type(cityInput, 'City123');

      await waitFor(() => {
        expect(screen.getByText(/City contains invalid characters/i)).toBeInTheDocument();
      });
    });

    it('should validate PIN code format', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ addresses: [] })
      });

      render(
        <ShippingNew 
          billingAddress={mockBillingAddress}
          onAddressChange={mockOnAddressChange}
        />
      );

      const checkbox = await screen.findByRole('checkbox', { name: /Ship to billing address/i });
      fireEvent.click(checkbox);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/6-digit PIN code/i)).toBeInTheDocument();
      });

      const zipInput = screen.getByPlaceholderText(/6-digit PIN code/i);
      await userEvent.type(zipInput, '123');
      fireEvent.blur(zipInput);

      await waitFor(() => {
        expect(screen.getByText(/PIN code must be exactly 6 digits/i)).toBeInTheDocument();
      });
    });

    it('should only allow numeric input in PIN code', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ addresses: [] })
      });

      render(
        <ShippingNew 
          billingAddress={mockBillingAddress}
          onAddressChange={mockOnAddressChange}
        />
      );

      const checkbox = await screen.findByRole('checkbox', { name: /Ship to billing address/i });
      fireEvent.click(checkbox);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/6-digit PIN code/i)).toBeInTheDocument();
      });

      const zipInput = screen.getByPlaceholderText(/6-digit PIN code/i) as HTMLInputElement;
      await userEvent.type(zipInput, 'abc110001xyz');

      expect(zipInput.value).toBe('110001');
    });
  });

  describe('Accessibility Tests', () => {
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

    it('should have proper checkbox label', async () => {
      render(
        <ShippingNew 
          billingAddress={mockBillingAddress}
          onAddressChange={mockOnAddressChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/Ship to billing address/i)).toBeInTheDocument();
      });
    });

    it('should have proper form labels when showing address form', async () => {
      render(
        <ShippingNew 
          billingAddress={mockBillingAddress}
          onAddressChange={mockOnAddressChange}
        />
      );

      const checkbox = await screen.findByRole('checkbox', { name: /Ship to billing address/i });
      fireEvent.click(checkbox);

      await waitFor(() => {
        expect(screen.getByLabelText(/Street Address/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/City/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/State/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/PIN Code/i)).toBeInTheDocument();
      });
    });

    it('should mark required fields with asterisk', async () => {
      render(
        <ShippingNew 
          billingAddress={mockBillingAddress}
          onAddressChange={mockOnAddressChange}
        />
      );

      const checkbox = await screen.findByRole('checkbox', { name: /Ship to billing address/i });
      fireEvent.click(checkbox);

      await waitFor(() => {
        const requiredLabels = screen.getAllByText('*');
        expect(requiredLabels.length).toBeGreaterThan(0);
      });
    });

    it('should be keyboard navigable', async () => {
      render(
        <ShippingNew 
          billingAddress={mockBillingAddress}
          onAddressChange={mockOnAddressChange}
        />
      );

      const checkbox = await screen.findByRole('checkbox', { name: /Ship to billing address/i });
      checkbox.focus();
      expect(document.activeElement).toBe(checkbox);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null billing address', async () => {
      (useSession as jest.Mock).mockReturnValue({
        data: { user: { id: 'user-1', email: 'test@example.com' } },
        status: 'authenticated'
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ addresses: mockAddresses })
      });

      render(
        <ShippingNew 
          billingAddress={null}
          onAddressChange={mockOnAddressChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Shipping Address')).toBeInTheDocument();
      });
    });

    it('should handle undefined billing address', async () => {
      (useSession as jest.Mock).mockReturnValue({
        data: { user: { id: 'user-1', email: 'test@example.com' } },
        status: 'authenticated'
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ addresses: mockAddresses })
      });

      render(
        <ShippingNew 
          billingAddress={undefined}
          onAddressChange={mockOnAddressChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Shipping Address')).toBeInTheDocument();
      });
    });

    it('should handle loading state', () => {
      (useSession as jest.Mock).mockReturnValue({
        data: { user: { id: 'user-1', email: 'test@example.com' } },
        status: 'loading'
      });

      render(
        <ShippingNew 
          billingAddress={mockBillingAddress}
          onAddressChange={mockOnAddressChange}
        />
      );

      // Should show loading skeleton
      expect(screen.getByText('Shipping Address')).toBeInTheDocument();
    });
  });
});
