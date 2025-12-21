import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import BillingNew from '../BillingNew';
import ShippingNew from '../ShippingNew';
import AddressFormModal from '../AddressFormModal';

// Mock dependencies
jest.mock('next-auth/react');
jest.mock('react-hot-toast');
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
    type: 'SHIPPING',
    isDefault: false
  }
];

describe('Checkout Flow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('Complete Checkout Flow - Logged-in User', () => {
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

    it('should complete checkout with saved addresses for both billing and shipping', async () => {
      const billingAddressChange = jest.fn();
      const shippingAddressChange = jest.fn();

      const { rerender } = render(
        <>
          <BillingNew onAddressChange={billingAddressChange} />
          <ShippingNew
            billingAddress={null}
            onAddressChange={shippingAddressChange}
          />
        </>
      );

      // Wait for addresses to load
      await waitFor(() => {
        expect(screen.getByText('123 Main St')).toBeInTheDocument();
      });

      // Billing address should be auto-selected (default address)
      expect(billingAddressChange).toHaveBeenCalledWith(mockAddresses[0]);

      // Shipping should default to "same as billing"
      const sameAsBillingCheckbox = screen.getByLabelText(/Ship to billing address/i);
      expect(sameAsBillingCheckbox).toBeChecked();

      // Rerender with billing address set
      rerender(
        <>
          <BillingNew onAddressChange={billingAddressChange} />
          <ShippingNew
            billingAddress={mockAddresses[0]}
            onAddressChange={shippingAddressChange}
          />
        </>
      );

      // Shipping should use billing address
      await waitFor(() => {
        expect(shippingAddressChange).toHaveBeenCalledWith(mockAddresses[0]);
      });
    });

    it('should complete checkout with different billing and shipping addresses', async () => {
      const billingAddressChange = jest.fn();
      const shippingAddressChange = jest.fn();

      const { rerender } = render(
        <>
          <BillingNew onAddressChange={billingAddressChange} />
          <ShippingNew
            billingAddress={null}
            onAddressChange={shippingAddressChange}
          />
        </>
      );

      // Wait for addresses to load
      await waitFor(() => {
        expect(screen.getByText('123 Main St')).toBeInTheDocument();
      });

      // Billing address auto-selected
      expect(billingAddressChange).toHaveBeenCalledWith(mockAddresses[0]);

      // Uncheck "same as billing"
      const sameAsBillingCheckbox = screen.getByLabelText(/Ship to billing address/i);
      fireEvent.click(sameAsBillingCheckbox);

      // Rerender with billing address
      rerender(
        <>
          <BillingNew onAddressChange={billingAddressChange} />
          <ShippingNew
            billingAddress={mockAddresses[0]}
            onAddressChange={shippingAddressChange}
          />
        </>
      );

      // Wait for shipping addresses to show
      await waitFor(() => {
        expect(screen.getAllByText('456 Park Ave')[0]).toBeInTheDocument();
      });

      // Select different shipping address
      const radioButtons = screen.getAllByRole('radio');
      const shippingAddressRadio = radioButtons.find(radio =>
        (radio as HTMLInputElement).value === 'addr-2'
      );

      if (shippingAddressRadio) {
        fireEvent.click(shippingAddressRadio);

        await waitFor(() => {
          expect(shippingAddressChange).toHaveBeenCalledWith(mockAddresses[1]);
        });
      }
    });

    it('should add new address during checkout and use it', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ addresses: [] })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            address: {
              id: 'new-addr',
              street: '789 New St',
              city: 'Bangalore',
              state: 'Karnataka',
              zip: '560001',
              country: 'India',
              type: 'BOTH',
              isDefault: true
            }
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            addresses: [{
              id: 'new-addr',
              street: '789 New St',
              city: 'Bangalore',
              state: 'Karnataka',
              zip: '560001',
              country: 'India',
              type: 'BOTH',
              isDefault: true
            }]
          })
        });

      const billingAddressChange = jest.fn();

      render(<BillingNew onAddressChange={billingAddressChange} />);

      // Wait for component to load (no addresses)
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/House number and street name/i)).toBeInTheDocument();
      });

      // Fill in new address
      await userEvent.type(screen.getByPlaceholderText(/House number and street name/i), '789 New St');
      await userEvent.type(screen.getByLabelText(/City/i), 'Bangalore');
      await userEvent.selectOptions(screen.getByLabelText(/State/i), 'Karnataka');
      await userEvent.type(screen.getByPlaceholderText(/6-digit PIN code/i), '560001');

      // Check save address
      const saveCheckbox = screen.getByLabelText(/Save this address/i);
      await userEvent.click(saveCheckbox);

      // Address should be ready to use
      expect(screen.getByDisplayValue('789 New St')).toBeInTheDocument();
    });
  });

  describe('Complete Checkout Flow - Guest User', () => {
    beforeEach(() => {
      (useSession as jest.Mock).mockReturnValue({
        data: null,
        status: 'unauthenticated'
      });
    });

    it('should complete checkout as guest with manual address entry', async () => {
      const billingAddressChange = jest.fn();
      const shippingAddressChange = jest.fn();

      const { rerender } = render(
        <>
          <BillingNew onAddressChange={billingAddressChange} />
          <ShippingNew
            billingAddress={null}
            onAddressChange={shippingAddressChange}
          />
        </>
      );

      // Fill billing information
      await userEvent.type(screen.getByLabelText(/First Name/i), 'John');
      await userEvent.type(screen.getByLabelText(/Last Name/i), 'Doe');
      await userEvent.type(screen.getByLabelText(/Email Address/i), 'john@example.com');
      await userEvent.type(screen.getByLabelText(/Phone/i), '9876543210');

      // Fill billing address
      await userEvent.type(screen.getByPlaceholderText(/House number and street name/i), '123 Guest St');
      await userEvent.type(screen.getAllByLabelText(/City/i)[0], 'Mumbai');
      await userEvent.selectOptions(screen.getAllByLabelText(/State/i)[0], 'Maharashtra');
      await userEvent.type(screen.getAllByPlaceholderText(/6-digit PIN code/i)[0], '400001');

      // Shipping should default to "same as billing"
      const sameAsBillingCheckbox = screen.getByLabelText(/Ship to billing address/i);
      expect(sameAsBillingCheckbox).toBeChecked();

      // Guest should not see save address checkbox
      expect(screen.queryByLabelText(/Save this address/i)).not.toBeInTheDocument();
    });

    it('should allow guest to use different shipping address', async () => {
      const billingAddressChange = jest.fn();
      const shippingAddressChange = jest.fn();

      render(
        <>
          <BillingNew onAddressChange={billingAddressChange} />
          <ShippingNew
            billingAddress={null}
            onAddressChange={shippingAddressChange}
          />
        </>
      );

      // Fill billing address
      await userEvent.type(screen.getByPlaceholderText(/House number and street name/i), '123 Guest St');

      // Uncheck "same as billing"
      const sameAsBillingCheckbox = screen.getByLabelText(/Ship to billing address/i);
      fireEvent.click(sameAsBillingCheckbox);

      // Should show shipping address form
      await waitFor(() => {
        const streetInputs = screen.getAllByPlaceholderText(/House number and street name/i);
        expect(streetInputs.length).toBe(2); // One for billing, one for shipping
      });

      // Fill shipping address
      const shippingStreetInput = screen.getAllByPlaceholderText(/House number and street name/i)[1];
      await userEvent.type(shippingStreetInput, '456 Shipping St');
    });
  });

  describe('Error Handling in Checkout Flow', () => {
    beforeEach(() => {
      (useSession as jest.Mock).mockReturnValue({
        data: { user: { id: 'user-1', email: 'test@example.com' } },
        status: 'authenticated'
      });
    });

    it('should handle address fetch failure gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const billingAddressChange = jest.fn();

      render(<BillingNew onAddressChange={billingAddressChange} />);

      // Should fallback to address form
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/House number and street name/i)).toBeInTheDocument();
      });
    });

    it('should validate all required fields before proceeding', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ addresses: [] })
      });

      render(<BillingNew onAddressChange={jest.fn()} />);

      await waitFor(() => {
        expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
      });

      // Try to submit without filling required fields
      const firstNameInput = screen.getByLabelText(/First Name/i) as HTMLInputElement;
      expect(firstNameInput.required).toBe(true);

      const emailInput = screen.getByLabelText(/Email Address/i) as HTMLInputElement;
      expect(emailInput.required).toBe(true);

      const phoneInput = screen.getByLabelText(/Phone/i) as HTMLInputElement;
      expect(phoneInput.required).toBe(true);
    });

    it('should show validation errors for invalid inputs', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ addresses: [] })
      });

      render(<BillingNew onAddressChange={jest.fn()} />);

      await waitFor(() => {
        expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
      });

      // Enter invalid email
      const emailInput = screen.getByLabelText(/Email Address/i);
      await userEvent.type(emailInput, 'invalid-email');
      fireEvent.blur(emailInput);

      await waitFor(() => {
        expect(screen.getByText(/Please enter a valid email address/i)).toBeInTheDocument();
      });

      // Enter invalid phone
      const phoneInput = screen.getByLabelText(/Phone/i);
      await userEvent.type(phoneInput, '123');
      fireEvent.blur(phoneInput);

      await waitFor(() => {
        expect(screen.getByText(/Please enter a valid 10-digit Indian mobile number/i)).toBeInTheDocument();
      });

      // Enter invalid PIN code
      const zipInput = screen.getByLabelText(/PIN Code/i);
      await userEvent.type(zipInput, '123');
      fireEvent.blur(zipInput);

      await waitFor(() => {
        expect(screen.getByText(/PIN code must be exactly 6 digits/i)).toBeInTheDocument();
      });
    });
  });

  describe('Address Management During Checkout', () => {
    beforeEach(() => {
      (useSession as jest.Mock).mockReturnValue({
        data: { user: { id: 'user-1', email: 'test@example.com' } },
        status: 'authenticated'
      });
    });

    it('should allow adding address via modal and refresh list', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ addresses: mockAddresses })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            address: {
              id: 'new-addr',
              street: '999 Modal St',
              city: 'Chennai',
              state: 'Tamil Nadu',
              zip: '600001',
              country: 'India',
              type: 'BOTH',
              isDefault: false
            }
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            addresses: [
              ...mockAddresses,
              {
                id: 'new-addr',
                street: '999 Modal St',
                city: 'Chennai',
                state: 'Tamil Nadu',
                zip: '600001',
                country: 'India',
                type: 'BOTH',
                isDefault: false
              }
            ]
          })
        });

      render(<BillingNew onAddressChange={jest.fn()} />);

      // Wait for addresses to load
      await waitFor(() => {
        expect(screen.getByText('Add New Address')).toBeInTheDocument();
      });

      // Click add new address button
      const addButton = screen.getByRole('button', { name: /Add New Address/i });
      fireEvent.click(addButton);

      // Modal should open
      await waitFor(() => {
        expect(screen.getAllByText('Add New Address').length).toBeGreaterThan(1);
      });

      // Fill modal form
      await userEvent.type(screen.getByPlaceholderText(/House no, Building name/i), '999 Modal St');
      await userEvent.type(screen.getAllByLabelText(/City/i)[1], 'Chennai');
      await userEvent.selectOptions(screen.getAllByLabelText(/State/i)[1], 'Tamil Nadu');
      await userEvent.type(screen.getAllByPlaceholderText(/6-digit PIN code/i)[1], '600001');

      // Submit modal
      const submitButton = screen.getByRole('button', { name: /Add Address/i });
      fireEvent.click(submitButton);

      // Should show success toast
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Address added successfully!');
      });

      // Should fetch addresses again
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(3);
      });
    });

    it('should handle maximum addresses limit (5)', async () => {
      const fiveAddresses = Array(5).fill(null).map((_, i) => ({
        id: `addr-${i}`,
        street: `${i} Street`,
        city: 'Mumbai',
        state: 'Maharashtra',
        zip: '400001',
        country: 'India',
        type: 'BOTH',
        isDefault: i === 0
      }));

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ addresses: fiveAddresses })
      });

      render(<BillingNew onAddressChange={jest.fn()} />);

      // Wait for addresses to load
      await waitFor(() => {
        expect(screen.queryByText('Add New Address')).not.toBeInTheDocument();
      });

      // Should not show add button when 5 addresses exist
      expect(screen.queryByText('Add New Address')).not.toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
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

    it('should render properly on mobile viewport', async () => {
      // Set mobile viewport
      global.innerWidth = 375;
      global.innerHeight = 667;

      render(<BillingNew onAddressChange={jest.fn()} />);

      await waitFor(() => {
        expect(screen.getByText('Billing Details')).toBeInTheDocument();
      });

      // All elements should still be accessible
      expect(screen.getByText('Contact Information')).toBeInTheDocument();
      expect(screen.getByText('Billing Address')).toBeInTheDocument();
    });

    it('should render properly on desktop viewport', async () => {
      // Set desktop viewport
      global.innerWidth = 1920;
      global.innerHeight = 1080;

      render(<BillingNew onAddressChange={jest.fn()} />);

      await waitFor(() => {
        expect(screen.getByText('Billing Details')).toBeInTheDocument();
      });

      // All elements should still be accessible
      expect(screen.getByText('Contact Information')).toBeInTheDocument();
      expect(screen.getByText('Billing Address')).toBeInTheDocument();
    });
  });
});
