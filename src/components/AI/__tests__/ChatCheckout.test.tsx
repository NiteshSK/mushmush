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

const lowStockProduct: ChatProduct = {
  ...mockProduct,
  stockQuantity: 3,
};

const mockShippingResponse = {
  deliverable: true,
  shippingFee: 80,
  zoneName: 'North India',
  estimatedDays: '3-5 days',
  freeShipping: false,
  freeAbove: 1999,
  message: 'Delivery: ₹80. Free on orders above ₹1999!',
};

const mockFreeShippingResponse = {
  ...mockShippingResponse,
  shippingFee: 0,
  freeShipping: true,
  message: 'Free Delivery applied!',
};

const mockNotDeliverableResponse = {
  deliverable: false,
  message: 'Sorry, we do not deliver to this pincode yet.',
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

  // Helper: mock shipping API response then fill pincode to trigger the check
  const mockShippingAndFillPincode = async (shippingData = mockShippingResponse) => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => shippingData,
    });
    await userEvent.type(screen.getByPlaceholderText('Pincode'), '248001');
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/shipping/check?pincode=248001')
      );
    });
  };

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

    it('shows "Enter pincode" for shipping until pincode is checked', () => {
      renderCheckout();

      expect(screen.getByText('Enter PIN code')).toBeInTheDocument();
    });

    it('shows "Check Delivery First" button until shipping is checked', () => {
      renderCheckout();

      expect(screen.getByText('Enter a PIN code we deliver to')).toBeInTheDocument();
    });

    it('quotes the selected product once before sending an OTP', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ deliverable: false, message: 'Fresh mushrooms deliver only to approved Dehradun PINs.' }),
      });
      renderCheckout();
      fireEvent.change(screen.getByLabelText('PIN code'), { target: { value: '110001' } });
      expect(await screen.findByText('Fresh mushrooms deliver only to approved Dehradun PINs.')).toBeInTheDocument();
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith('/api/shipping/check?pincode=110001&subtotal=350&productId=1');
      expect(screen.getByRole('button', { name: 'Enter a PIN code we deliver to' })).toBeDisabled();
    });

    it('shows shipping fee after pincode check', async () => {
      renderCheckout();
      await mockShippingAndFillPincode();

      await waitFor(() => {
        // Shipping fee appears in the delivery status and price breakdown
        const matches = screen.getAllByText('₹80');
        expect(matches.length).toBeGreaterThanOrEqual(1);
      });
    });

    it('shows not deliverable message for unsupported pincode', async () => {
      renderCheckout();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockNotDeliverableResponse,
      });

      await userEvent.type(screen.getByPlaceholderText('Pincode'), '999999');

      await waitFor(() => {
        expect(screen.getByText(/do not deliver|don't deliver/)).toBeInTheDocument();
      });
    });

    it('shows free shipping when applicable', async () => {
      renderCheckout();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockFreeShippingResponse,
      });

      await userEvent.type(screen.getByPlaceholderText('Pincode'), '248001');

      await waitFor(() => {
        expect(screen.getByText('Free delivery')).toBeInTheDocument();
      });
    });

    it('calls onBack when back button is clicked', () => {
      renderCheckout();

      fireEvent.click(screen.getByRole('button', { name: 'Back' }));
      expect(mockOnBack).toHaveBeenCalled();
    });

    it('shows quantity controls and updates total', () => {
      renderCheckout();

      const plusButton = screen.getByRole('button', { name: 'Add one' });
      fireEvent.click(plusButton);

      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('prevents quantity from going below 1', () => {
      renderCheckout();

      const minusButton = screen.getByRole('button', { name: 'Remove one' });
      fireEvent.click(minusButton);
      fireEvent.click(minusButton);

      expect(screen.getByRole('group', { name: 'Quantity of Premium Oyster Mushroom' })).toHaveTextContent('1');
      expect(minusButton).toBeDisabled();
    });

    it('prevents quantity from exceeding stock limit', () => {
      render(
        <ChatCheckout
          product={lowStockProduct}
          onBack={mockOnBack}
          onProceedToPayment={mockOnProceedToPayment}
        />
      );

      const plusButton = screen.getByRole('button', { name: 'Add one' });
      // Stock is 3, start at 1, click + twice to reach 3
      fireEvent.click(plusButton); // 2
      fireEvent.click(plusButton); // 3
      fireEvent.click(plusButton); // should stay at 3
      fireEvent.click(plusButton); // should stay at 3

      expect(screen.getByText('3')).toBeInTheDocument();
      // + button should be disabled at max
      expect(plusButton).toBeDisabled();
    });

    it('shows low stock warning when stock is 10 or less', () => {
      render(
        <ChatCheckout
          product={lowStockProduct}
          onBack={mockOnBack}
          onProceedToPayment={mockOnProceedToPayment}
        />
      );

      expect(screen.getByText('Only 3 left')).toBeInTheDocument();
    });

    it('validates required fields before sending OTP', async () => {
      renderCheckout();

      const form = screen.getByText('Enter a PIN code we deliver to').closest('form')!;
      fireEvent.submit(form);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Please enter your name');
      });

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('validates delivery availability before submission', async () => {
      renderCheckout();

      await userEvent.type(screen.getByPlaceholderText('John Doe'), 'John Doe');
      await userEvent.type(screen.getByPlaceholderText('you@email.com'), 'john@test.com');
      await userEvent.type(screen.getByPlaceholderText('9876543210'), '9876543210');
      await userEvent.type(screen.getByPlaceholderText('Street address'), '123 Main St');
      await userEvent.type(screen.getByPlaceholderText('City'), 'Mumbai');
      await userEvent.type(screen.getByPlaceholderText('State'), 'Maharashtra');
      await userEvent.type(screen.getByPlaceholderText('Pincode'), '123');

      const form = screen.getByPlaceholderText('John Doe').closest('form')!;
      fireEvent.submit(form);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Please enter a valid 6-digit pincode');
      });
    });

    it('sends OTP on valid form submission with shipping checked', async () => {
      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (typeof url === 'string' && url.includes('/api/shipping/check'))
          return Promise.resolve({ ok: true, json: async () => mockShippingResponse });
        if (typeof url === 'string' && url.includes('/api/checkout/send-otp'))
          return Promise.resolve({ ok: true, json: async () => ({ success: true, message: 'OTP sent!' }) });
        return Promise.resolve({ ok: true, json: async () => ({}) });
      });

      renderCheckout();

      await userEvent.type(screen.getByPlaceholderText('John Doe'), 'John Doe');
      await userEvent.type(screen.getByPlaceholderText('you@email.com'), 'john@test.com');
      await userEvent.type(screen.getByPlaceholderText('9876543210'), '9876543210');
      await userEvent.type(screen.getByPlaceholderText('Street address'), '123 Main St');
      await userEvent.type(screen.getByPlaceholderText('City'), 'Dehradun');
      await userEvent.type(screen.getByPlaceholderText('State'), 'Uttarakhand');
      await userEvent.type(screen.getByPlaceholderText('Pincode'), '248001');

      await waitFor(() => {
        expect(screen.getAllByText('₹80').length).toBeGreaterThanOrEqual(1);
      });

      fireEvent.click(screen.getByRole('button', { name: 'Send verification code' }));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/checkout/send-otp', expect.objectContaining({
          method: 'POST',
        }));
      });
    });
  });

  describe('OTP Step', () => {
    // Use mockImplementation so shipping re-checks don't consume mocks
    const fillAndSubmitDetails = async () => {
      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (typeof url === 'string' && url.includes('/api/shipping/check'))
          return Promise.resolve({ ok: true, json: async () => mockShippingResponse });
        if (typeof url === 'string' && url.includes('/api/checkout/send-otp'))
          return Promise.resolve({ ok: true, json: async () => ({ success: true, message: 'OTP sent!' }) });
        return Promise.resolve({ ok: true, json: async () => ({}) });
      });

      renderCheckout();

      await userEvent.type(screen.getByPlaceholderText('John Doe'), 'John Doe');
      await userEvent.type(screen.getByPlaceholderText('you@email.com'), 'john@test.com');
      await userEvent.type(screen.getByPlaceholderText('9876543210'), '9876543210');
      await userEvent.type(screen.getByPlaceholderText('Street address'), '123 Main St');
      await userEvent.type(screen.getByPlaceholderText('City'), 'Dehradun');
      await userEvent.type(screen.getByPlaceholderText('State'), 'Uttarakhand');
      await userEvent.type(screen.getByPlaceholderText('Pincode'), '248001');

      await waitFor(() => {
        expect(screen.getAllByText('₹80').length).toBeGreaterThanOrEqual(1);
      });

      fireEvent.click(screen.getByRole('button', { name: 'Send verification code' }));

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Enter your code' })).toBeInTheDocument();
      });
    };

    it('passes the payment token from the order response to payment', async () => {
      await fillAndSubmitDetails();

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (typeof url === 'string' && url.includes('/api/shipping/check'))
          return Promise.resolve({ ok: true, json: async () => mockShippingResponse });
        if (typeof url === 'string' && url.includes('/api/checkout/verify-and-place-order'))
          return Promise.resolve({ ok: true, status: 200, json: async () => ({ success: true, order: { id: 'order-9', orderNumber: 'ORD-9', total: 442 }, paymentToken: 'tok_123' }) });
        return Promise.resolve({ ok: true, json: async () => ({}) });
      });

      await userEvent.type(screen.getByPlaceholderText('• • • • • •'), '123456');
      fireEvent.click(screen.getByRole('button', { name: 'Verify and place order' }));

      await waitFor(() => {
        expect(mockOnProceedToPayment).toHaveBeenCalledWith(expect.objectContaining({ orderNumber: 'ORD-9', paymentToken: 'tok_123' }));
      });
    });

    it('keeps the code on a price change and places the order for the new total', async () => {
      await fillAndSubmitDetails();

      const orderBodies: any[] = [];
      (global.fetch as jest.Mock).mockImplementation((url: string, init?: RequestInit) => {
        if (typeof url === 'string' && url.includes('/api/shipping/check'))
          return Promise.resolve({ ok: true, json: async () => mockShippingResponse });
        if (typeof url === 'string' && url.includes('/api/checkout/verify-and-place-order')) {
          orderBodies.push(JSON.parse(String(init?.body)));
          return orderBodies.length === 1
            ? Promise.resolve({ ok: false, status: 409, json: async () => ({ code: 'TOTAL_MISMATCH', pricing: { total: 455 } }) })
            : Promise.resolve({ ok: true, status: 200, json: async () => ({ success: true, order: { id: 'order-2', orderNumber: 'ORD-2', total: 455 }, paymentToken: 'tok_2' }) });
        }
        return Promise.resolve({ ok: true, json: async () => ({}) });
      });

      const otpInput = screen.getByPlaceholderText('• • • • • •');
      await userEvent.type(otpInput, '123456');
      fireEvent.click(screen.getByRole('button', { name: 'Verify and place order' }));

      expect(await screen.findByRole('alert')).toHaveTextContent('The price changed while you were checking out. The total is now ₹455.00');
      expect(otpInput).toHaveValue('123456');
      expect(mockOnProceedToPayment).not.toHaveBeenCalled();

      fireEvent.click(screen.getByRole('button', { name: 'Place order for ₹455.00' }));

      await waitFor(() => {
        expect(mockOnProceedToPayment).toHaveBeenCalledWith(expect.objectContaining({ total: 455, paymentToken: 'tok_2' }));
      });
      expect(orderBodies[1]).toMatchObject({ otp: '123456', total: 455 });
    });

    it('transitions to OTP step after successful OTP send', async () => {
      await fillAndSubmitDetails();

      expect(screen.getByText(/We sent a verification code/)).toBeInTheDocument();
      expect(screen.getByText('john@test.com')).toBeInTheDocument();
    });

    it('validates OTP before submission', async () => {
      await fillAndSubmitDetails();

      const form = screen.getByRole('button', { name: 'Verify and place order' }).closest('form')!;
      fireEvent.submit(form);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Please enter a valid OTP');
      });
    });

    it('places order on valid OTP and calls onProceedToPayment', async () => {
      await fillAndSubmitDetails();

      // Override mock for order placement
      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (typeof url === 'string' && url.includes('/api/shipping/check'))
          return Promise.resolve({ ok: true, json: async () => mockShippingResponse });
        if (typeof url === 'string' && url.includes('/api/checkout/verify-and-place-order'))
          return Promise.resolve({ ok: true, json: async () => ({ success: true, order: { id: 'order-123', orderNumber: 'ORD-123', total: 442 } }) });
        return Promise.resolve({ ok: true, json: async () => ({}) });
      });

      const otpInput = screen.getByPlaceholderText('• • • • • •');
      await userEvent.type(otpInput, '123456');

      fireEvent.click(screen.getByRole('button', { name: 'Verify and place order' }));

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
            total: 442,
            customerName: 'John Doe',
            email: 'john@test.com',
          })
        );
      });
    });

    it('shows error on failed order placement', async () => {
      await fillAndSubmitDetails();

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (typeof url === 'string' && url.includes('/api/shipping/check'))
          return Promise.resolve({ ok: true, json: async () => mockShippingResponse });
        if (typeof url === 'string' && url.includes('/api/checkout/verify-and-place-order'))
          return Promise.resolve({ ok: false, json: async () => ({ error: 'Invalid OTP' }) });
        return Promise.resolve({ ok: true, json: async () => ({}) });
      });

      const otpInput = screen.getByPlaceholderText('• • • • • •');
      await userEvent.type(otpInput, '999999');

      fireEvent.click(screen.getByRole('button', { name: 'Verify and place order' }));

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
});
