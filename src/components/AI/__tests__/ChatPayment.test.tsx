import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'react-hot-toast';
import ChatPayment from '../ChatPayment';

// Mock react-qr-code
jest.mock('react-qr-code', () => {
  return function MockQRCode({ value }: { value: string }) {
    return <div data-testid="qr-code" data-value={value}>QR Code</div>;
  };
});

// Mock payment config
jest.mock('@/lib/payment-config', () => ({
  UPI_CONFIG: {
    vpa: 'test@upi',
    merchantName: 'Test Merchant',
    currency: 'INR',
  },
  generateUPILink: ({ amount, note }: { amount: number; note: string }) =>
    `upi://pay?pa=test@upi&am=${amount}&tn=${note}`,
}));

const defaultProps = {
  orderNumber: 'ORD-12345',
  total: 411,
  customerName: 'John Doe',
  email: 'john@test.com',
  onBack: jest.fn(),
  onPaymentComplete: jest.fn(),
};

describe('ChatPayment', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();

    // Mock clipboard
    Object.assign(navigator, {
      clipboard: { writeText: jest.fn().mockResolvedValue(undefined) },
    });
  });

  it('renders payment screen with order details', () => {
    render(<ChatPayment {...defaultProps} />);

    expect(screen.getByRole('heading', { name: 'Pay by UPI' })).toBeInTheDocument();
    expect(screen.getByText('₹411')).toBeInTheDocument();
    expect(screen.getByText('Order #ORD-12345')).toBeInTheDocument();
  });

  it('renders QR code with correct UPI link', () => {
    render(<ChatPayment {...defaultProps} />);

    const qr = screen.getByTestId('qr-code');
    expect(qr).toBeInTheDocument();
    expect(qr.getAttribute('data-value')).toContain('upi://pay');
    expect(qr.getAttribute('data-value')).toContain('411');
  });

  it('shows UPI VPA ID', () => {
    render(<ChatPayment {...defaultProps} />);

    expect(screen.getByText('test@upi')).toBeInTheDocument();
  });

  it('copies UPI ID to clipboard', async () => {
    render(<ChatPayment {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: 'Copy UPI ID' }));

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test@upi');
      expect(toast.success).toHaveBeenCalledWith('UPI ID copied!');
    });
  });

  it('renders Open UPI App link with correct href', () => {
    render(<ChatPayment {...defaultProps} />);

    const upiLink = screen.getByText('Open UPI app');
    expect(upiLink.closest('a')).toHaveAttribute('href', expect.stringContaining('upi://pay'));
  });

  it('validates transaction ID is required before submission', async () => {
    render(<ChatPayment {...defaultProps} />);

    // Submit form directly to bypass native required validation
    const form = screen.getByRole('button', { name: 'Submit payment' }).closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Please enter UPI transaction ID');
    });

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('submits payment with transaction ID', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, message: 'Payment submitted!' }),
    });

    render(<ChatPayment {...defaultProps} />);

    await userEvent.type(
      screen.getByPlaceholderText('Enter 12-digit UPI transaction ID'),
      '123456789012'
    );

    fireEvent.click(screen.getByRole('button', { name: 'Submit payment' }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/checkout/upi-payment', expect.objectContaining({
        method: 'POST',
      }));
    });

    // Verify FormData was sent correctly
    const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
    const formData = fetchCall[1].body as FormData;
    expect(formData.get('upiTransactionId')).toBe('123456789012');
    expect(formData.get('orderNumber')).toBe('ORD-12345');
    expect(formData.get('amount')).toBe('411');
    expect(formData.get('customerEmail')).toBe('john@test.com');
  });

  it('sends the payment token with the UPI payment', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, message: 'Payment submitted!' }),
    });

    render(<ChatPayment {...defaultProps} paymentToken="tok_abc" />);

    await userEvent.type(screen.getByPlaceholderText('Enter 12-digit UPI transaction ID'), '123456789012');
    fireEvent.click(screen.getByRole('button', { name: 'Submit payment' }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    const formData = (global.fetch as jest.Mock).mock.calls[0][1].body as FormData;
    expect(formData.get('paymentToken')).toBe('tok_abc');
  });

  it('describes a submitted payment as awaiting confirmation', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, message: 'Payment submitted!' }),
    });

    render(<ChatPayment {...defaultProps} />);

    await userEvent.type(screen.getByPlaceholderText('Enter 12-digit UPI transaction ID'), '123456789012');
    fireEvent.click(screen.getByRole('button', { name: 'Submit payment' }));

    expect(await screen.findByText(/We will email/)).toHaveTextContent('when the order is confirmed');
  });

  it('shows success state after payment submission', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, message: 'Payment submitted!' }),
    });

    render(<ChatPayment {...defaultProps} />);

    await userEvent.type(
      screen.getByPlaceholderText('Enter 12-digit UPI transaction ID'),
      '123456789012'
    );

    fireEvent.click(screen.getByRole('button', { name: 'Submit payment' }));

    await waitFor(() => {
      expect(screen.getByText('Payment submitted')).toBeInTheDocument();
      expect(screen.getByText('Order #ORD-12345')).toBeInTheDocument();
      expect(screen.getByText(/john@test.com/)).toBeInTheDocument();
    });
  });

  it('shows Back to Chat button on success and calls onPaymentComplete', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(<ChatPayment {...defaultProps} />);

    await userEvent.type(
      screen.getByPlaceholderText('Enter 12-digit UPI transaction ID'),
      '123456789012'
    );

    fireEvent.click(screen.getByRole('button', { name: 'Submit payment' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Back to chat' })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Back to chat' }));
    expect(defaultProps.onPaymentComplete).toHaveBeenCalled();
  });

  it('shows error on failed payment submission', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Duplicate transaction ID' }),
    });

    render(<ChatPayment {...defaultProps} />);

    await userEvent.type(
      screen.getByPlaceholderText('Enter 12-digit UPI transaction ID'),
      '123456789012'
    );

    fireEvent.click(screen.getByRole('button', { name: 'Submit payment' }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Duplicate transaction ID');
    });

    // Should not show success screen
    expect(screen.queryByText('Payment submitted')).not.toBeInTheDocument();
  });

  it('handles network errors gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<ChatPayment {...defaultProps} />);

    await userEvent.type(
      screen.getByPlaceholderText('Enter 12-digit UPI transaction ID'),
      '123456789012'
    );

    fireEvent.click(screen.getByRole('button', { name: 'Submit payment' }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Network error. Please try again.');
    });
  });

  it('calls onBack when back button is clicked', () => {
    render(<ChatPayment {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: 'Back to checkout' }));
    expect(defaultProps.onBack).toHaveBeenCalled();
  });

  it('shows security notice', () => {
    render(<ChatPayment {...defaultProps} />);

    expect(screen.getByText(/We never ask for your UPI PIN or OTP/)).toBeInTheDocument();
  });

  it('allows optional UPI ID input', async () => {
    render(<ChatPayment {...defaultProps} />);

    const upiInput = screen.getByPlaceholderText('yourname@upi');
    await userEvent.type(upiInput, 'myupi@bank');

    expect(upiInput).toHaveValue('myupi@bank');
  });

  it('rejects unsupported payment proof before uploading', () => {
    render(<ChatPayment {...defaultProps} />);
    fireEvent.change(screen.getByLabelText('UPI transaction ID'), { target: { value: '123456789012' } });
    const proof = screen.getByLabelText(/Payment screenshot/);
    const unsupported = new File(['test'], 'screenshot.gif', { type: 'image/gif' });
    fireEvent.change(proof, { target: { files: [unsupported] } });
    fireEvent.submit(proof.closest('form')!);
    expect(toast.error).toHaveBeenCalledWith('JPG, PNG or PDF, up to 2 MB.');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('allows optional screenshot upload', () => {
    render(<ChatPayment {...defaultProps} />);

    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();
    expect(fileInput).toHaveAttribute('accept', 'image/jpeg,image/png,application/pdf');
  });
});
