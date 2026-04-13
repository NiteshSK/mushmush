import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'react-hot-toast';
import ChatCheckout from '../ChatCheckout';
import type { ChatProduct } from '../ChatProductCard';

const mockProduct: ChatProduct = {
  id: 1,
  title: 'Premium Oyster Mushroom',
  slug: 'premium-oyster-mushroom',
  price: 350,
  discountedPrice: null,
  discountPercentage: 0,
  hasDiscount: false,
  inStock: true,
  imgs: { thumbnails: ['/images/oyster-thumb.jpg'], previews: [] },
  averageRating: 4.5,
  reviewCount: 12,
  measurementValue: 200,
  measurementType: 'g',
};

const discountedProduct: ChatProduct = {
  ...mockProduct,
  discountedPrice: 280,
  discountPercentage: 20,
  hasDiscount: true,
};

describe('ChatCheckout', () => {
  const mockOnBack = jest.fn();
  const mockOnProceedToPayment = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  const renderCheckout = (product = mockProduct) =>
    render(
      <ChatCheckout
        product={product}
        onBack={mockOnBack}
        onProceedToPayment={mockOnProceedToPayment}
      />
    );

  describe('Details Step', () => {
    it('renders the checkout form with product summary', () => {
      renderCheckout();

      expect(screen.getByText('Checkout')).toBeInTheDocument();
      expect(screen.getByText('Premium Oyster Mushroom')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('John Doe')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('you@email.com')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('9876543210')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Street address')).toBeInTheDocument();
    });

    it('shows correct price for non-discounted product', () => {
      renderCheckout();

      // Subtotal row in price breakdown
      const allPrices = screen.getAllByText('₹350');
      expect(allPrices.length).toBeGreaterThanOrEqual(1);
    });

    it('shows discounted price for discounted product', () => {
      renderCheckout(discountedProduct);

      // Should show discounted price in summary
      const allPrices = screen.getAllByText('₹280');
      expect(allPrices.length).toBeGreaterThanOrEqual(1);
    });

    it('calls onBack when back button is clicked', () => {
      renderCheckout();

      const backButton = screen.getByRole('button', { name: '' });
      // The first button is the back arrow
      const buttons = screen.getAllByRole('button');
      fireEvent.click(buttons[0]); // back button
      expect(mockOnBack).toHaveBeenCalled();
    });

    it('shows quantity controls and updates total', () => {
      renderCheckout();

      const plusButton = screen.getByText('+');
      fireEvent.click(plusButton);

      // Qty should now be 2
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('prevents quantity from going below 1', () => {
      renderCheckout();

      const minusButton = screen.getByText('-');
      fireEvent.click(minusButton);
      fireEvent.click(minusButton);

      // Should still show 1
      expect(screen.getByText('Qty: 1')).toBeInTheDocument();
    });

    it('validates required fields before sending OTP', async () => {
      renderCheckout();

      // Submit the form directly (bypassing native required validation)
      const form = screen.getByText('Continue & Verify').closest('form')!;
      fireEvent.submit(form);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Please enter your name');
      });

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('validates email format', async () => {
      renderCheckout();

      await userEvent.type(screen.getByPlaceholderText('John Doe'), 'John Doe');
      await userEvent.type(screen.getByPlaceholderText('you@email.com'), 'invalid-email');

      const form = screen.getByText('Continue & Verify').closest('form')!;
      fireEvent.submit(form);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Please enter a valid email');
      });
    });

    it('validates phone number (Indian 10-digit)', async () => {
      renderCheckout();

      await userEvent.type(screen.getByPlaceholderText('John Doe'), 'John Doe');
      await userEvent.type(screen.getByPlaceholderText('you@email.com'), 'john@test.com');
      await userEvent.type(screen.getByPlaceholderText('9876543210'), '12345');

      const form = screen.getByText('Continue & Verify').closest('form')!;
      fireEvent.submit(form);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Please enter a valid 10-digit phone number');
      });
    });

    it('validates pincode (6-digit)', async () => {
      renderCheckout();

      await userEvent.type(screen.getByPlaceholderText('John Doe'), 'John Doe');
      await userEvent.type(screen.getByPlaceholderText('you@email.com'), 'john@test.com');
      await userEvent.type(screen.getByPlaceholderText('9876543210'), '9876543210');
      await userEvent.type(screen.getByPlaceholderText('Street address'), '123 Main St');
      await userEvent.type(screen.getByPlaceholderText('City'), 'Mumbai');
      await userEvent.type(screen.getByPlaceholderText('State'), 'Maharashtra');
      await userEvent.type(screen.getByPlaceholderText('Pincode'), '123');

      fireEvent.click(screen.getByText('Continue & Verify'));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Please enter a valid 6-digit pincode');
      });
    });

    it('sends OTP on valid form submission', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: 'OTP sent!' }),
      });

      renderCheckout();

      await userEvent.type(screen.getByPlaceholderText('John Doe'), 'John Doe');
      await userEvent.type(screen.getByPlaceholderText('you@email.com'), 'john@test.com');
      await userEvent.type(screen.getByPlaceholderText('9876543210'), '9876543210');
      await userEvent.type(screen.getByPlaceholderText('Street address'), '123 Main St');
      await userEvent.type(screen.getByPlaceholderText('City'), 'Mumbai');
      await userEvent.type(screen.getByPlaceholderText('State'), 'Maharashtra');
      await userEvent.type(screen.getByPlaceholderText('Pincode'), '400001');

      fireEvent.click(screen.getByText('Continue & Verify'));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/checkout/send-otp', expect.objectContaining({
          method: 'POST',
        }));
      });
    });
  });

  describe('OTP Step', () => {
    const fillAndSubmitDetails = async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: 'OTP sent!' }),
      });

      renderCheckout();

      await userEvent.type(screen.getByPlaceholderText('John Doe'), 'John Doe');
      await userEvent.type(screen.getByPlaceholderText('you@email.com'), 'john@test.com');
      await userEvent.type(screen.getByPlaceholderText('9876543210'), '9876543210');
      await userEvent.type(screen.getByPlaceholderText('Street address'), '123 Main St');
      await userEvent.type(screen.getByPlaceholderText('City'), 'Mumbai');
      await userEvent.type(screen.getByPlaceholderText('State'), 'Maharashtra');
      await userEvent.type(screen.getByPlaceholderText('Pincode'), '400001');

      fireEvent.click(screen.getByText('Continue & Verify'));

      await waitFor(() => {
        expect(screen.getByText('Verify OTP')).toBeInTheDocument();
      });
    };

    it('transitions to OTP step after successful OTP send', async () => {
      await fillAndSubmitDetails();

      expect(screen.getByText(/We sent a verification code/)).toBeInTheDocument();
      expect(screen.getByText('john@test.com')).toBeInTheDocument();
    });

    it('validates OTP before submission', async () => {
      await fillAndSubmitDetails();

      // Submit form directly to bypass native required validation
      const form = screen.getByText('Verify & Place Order').closest('form')!;
      fireEvent.submit(form);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Please enter a valid OTP');
      });
    });

    it('places order on valid OTP and calls onProceedToPayment', async () => {
      await fillAndSubmitDetails();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          order: { id: 'order-123', orderNumber: 'ORD-123', total: 411 },
        }),
      });

      const otpInput = screen.getByPlaceholderText('• • • • • •');
      await userEvent.type(otpInput, '123456');

      fireEvent.click(screen.getByText('Verify & Place Order'));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/checkout/verify-and-place-order', expect.objectContaining({
          method: 'POST',
        }));
      });

      await waitFor(() => {
        expect(mockOnProceedToPayment).toHaveBeenCalledWith(
          expect.objectContaining({
            orderNumber: 'ORD-123',
            orderId: 'order-123',
            total: 411,
            customerName: 'John Doe',
            email: 'john@test.com',
          })
        );
      });
    });

    it('shows error on failed order placement', async () => {
      await fillAndSubmitDetails();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Invalid OTP' }),
      });

      const otpInput = screen.getByPlaceholderText('• • • • • •');
      await userEvent.type(otpInput, '999999');

      fireEvent.click(screen.getByText('Verify & Place Order'));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Invalid OTP');
      });

      expect(mockOnProceedToPayment).not.toHaveBeenCalled();
    });

    it('allows going back to change details', async () => {
      await fillAndSubmitDetails();

      fireEvent.click(screen.getByText('Change details'));

      await waitFor(() => {
        expect(screen.getByText('Checkout')).toBeInTheDocument();
        expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
      });
    });

    it('only allows numeric OTP input', async () => {
      await fillAndSubmitDetails();

      const otpInput = screen.getByPlaceholderText('• • • • • •');
      await userEvent.type(otpInput, 'abc123def');

      expect(otpInput).toHaveValue('123');
    });
  });

  describe('Price Calculation', () => {
    it('calculates correct total with convenience fee and free shipping above 499', () => {
      renderCheckout();

      // Product price 350 + convenience 12 + shipping 49 = 411
      expect(screen.getByText('₹49')).toBeInTheDocument();
      expect(screen.getByText('₹12')).toBeInTheDocument();
      expect(screen.getByText('₹411')).toBeInTheDocument();
    });

    it('gives free shipping when subtotal is 499 or more', () => {
      renderCheckout();

      // Increase quantity to 2 (700 > 499)
      const plusButton = screen.getByText('+');
      fireEvent.click(plusButton);

      expect(screen.getByText('Free')).toBeInTheDocument();
    });
  });
});
