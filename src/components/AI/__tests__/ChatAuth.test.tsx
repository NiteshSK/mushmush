import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { signIn } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import ChatAuth from '../ChatAuth';

const defaultProps = {
  onBack: jest.fn(),
  onAuthSuccess: jest.fn(),
};

describe('ChatAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('Sign In Mode', () => {
    it('renders sign in form by default', () => {
      render(<ChatAuth {...defaultProps} />);

      expect(screen.getByText('Sign In to Continue')).toBeInTheDocument();
      expect(screen.getByText('Continue with Google')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
      expect(screen.getByText('Sign In')).toBeInTheDocument();
    });

    it('shows info banner', () => {
      render(<ChatAuth {...defaultProps} />);

      expect(screen.getByText(/Sign in or create an account/)).toBeInTheDocument();
    });

    it('validates empty fields on submit', async () => {
      render(<ChatAuth {...defaultProps} />);

      const form = screen.getByText('Sign In').closest('form')!;
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument();
        expect(screen.getByText('Password is required')).toBeInTheDocument();
      });
    });

    it('calls signIn with credentials on valid submit', async () => {
      (signIn as jest.Mock).mockResolvedValueOnce({ ok: true });

      render(<ChatAuth {...defaultProps} />);

      await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'test@test.com');
      await userEvent.type(screen.getByPlaceholderText('Enter your password'), 'password123');

      fireEvent.click(screen.getByText('Sign In'));

      await waitFor(() => {
        expect(signIn).toHaveBeenCalledWith('credentials', {
          email: 'test@test.com',
          password: 'password123',
          redirect: false,
        });
      });
    });

    it('calls onAuthSuccess after successful sign in', async () => {
      (signIn as jest.Mock).mockResolvedValueOnce({ ok: true });

      render(<ChatAuth {...defaultProps} />);

      await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'test@test.com');
      await userEvent.type(screen.getByPlaceholderText('Enter your password'), 'password123');

      fireEvent.click(screen.getByText('Sign In'));

      await waitFor(() => {
        expect(defaultProps.onAuthSuccess).toHaveBeenCalled();
      });
    });

    it('shows error on failed sign in', async () => {
      (signIn as jest.Mock).mockResolvedValueOnce({ ok: false });

      render(<ChatAuth {...defaultProps} />);

      await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'test@test.com');
      await userEvent.type(screen.getByPlaceholderText('Enter your password'), 'wrongpass');

      fireEvent.click(screen.getByText('Sign In'));

      await waitFor(() => {
        expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
      });

      expect(defaultProps.onAuthSuccess).not.toHaveBeenCalled();
    });

    it('toggles password visibility', () => {
      render(<ChatAuth {...defaultProps} />);

      const passwordInput = screen.getByPlaceholderText('Enter your password');
      expect(passwordInput).toHaveAttribute('type', 'password');

      // Click eye button to show password
      const toggleButtons = screen.getAllByRole('button');
      const eyeButton = toggleButtons.find(btn => {
        const parent = btn.closest('.relative');
        return parent?.contains(passwordInput);
      });
      if (eyeButton) fireEvent.click(eyeButton);

      expect(passwordInput).toHaveAttribute('type', 'text');
    });

    it('calls onBack when back button is clicked', () => {
      render(<ChatAuth {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      fireEvent.click(buttons[0]); // back arrow
      expect(defaultProps.onBack).toHaveBeenCalled();
    });

    it('calls Google signIn when Google button is clicked', () => {
      render(<ChatAuth {...defaultProps} />);

      fireEvent.click(screen.getByText('Continue with Google'));

      expect(signIn).toHaveBeenCalledWith('google', expect.objectContaining({
        callbackUrl: expect.any(String),
      }));
    });
  });

  describe('Switch to Sign Up', () => {
    it('switches to sign up mode', () => {
      render(<ChatAuth {...defaultProps} />);

      fireEvent.click(screen.getByText('Sign Up'));

      expect(screen.getByPlaceholderText('John Doe')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Min 8 characters')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Confirm your password')).toBeInTheDocument();
    });

    it('switches back to sign in from sign up', () => {
      render(<ChatAuth {...defaultProps} />);

      fireEvent.click(screen.getByText('Sign Up'));
      expect(screen.getByPlaceholderText('John Doe')).toBeInTheDocument();

      // "Sign In" link at the bottom
      const signInLinks = screen.getAllByText('Sign In');
      fireEvent.click(signInLinks[signInLinks.length - 1]);
      expect(screen.getByText('Sign In to Continue')).toBeInTheDocument();
    });
  });

  describe('Sign Up Mode', () => {
    const goToSignUp = () => {
      render(<ChatAuth {...defaultProps} />);
      fireEvent.click(screen.getByText('Sign Up'));
    };

    it('validates required fields', async () => {
      goToSignUp();

      const form = screen.getByPlaceholderText('John Doe').closest('form')!;
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText('Name is required')).toBeInTheDocument();
      });
    });

    it('validates password length', async () => {
      goToSignUp();

      await userEvent.type(screen.getByPlaceholderText('John Doe'), 'John');
      await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'john@test.com');
      await userEvent.type(screen.getByPlaceholderText('Min 8 characters'), 'short');
      await userEvent.type(screen.getByPlaceholderText('Confirm your password'), 'short');

      const form = screen.getByPlaceholderText('John Doe').closest('form')!;
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText('Min 8 characters')).toBeInTheDocument();
      });
    });

    it('validates password match', async () => {
      goToSignUp();

      await userEvent.type(screen.getByPlaceholderText('John Doe'), 'John');
      await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'john@test.com');
      await userEvent.type(screen.getByPlaceholderText('Min 8 characters'), 'password123');
      await userEvent.type(screen.getByPlaceholderText('Confirm your password'), 'different');

      const form = screen.getByPlaceholderText('John Doe').closest('form')!;
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText("Passwords don't match")).toBeInTheDocument();
      });
    });

    it('sends OTP on valid signup form', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      goToSignUp();

      await userEvent.type(screen.getByPlaceholderText('John Doe'), 'John Doe');
      await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'john@test.com');
      await userEvent.type(screen.getByPlaceholderText('Min 8 characters'), 'password123');
      await userEvent.type(screen.getByPlaceholderText('Confirm your password'), 'password123');

      const form = screen.getByPlaceholderText('John Doe').closest('form')!;
      fireEvent.submit(form);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/auth/send-signup-otp', expect.objectContaining({
          method: 'POST',
        }));
      });

      // Should transition to OTP view
      await waitFor(() => {
        expect(screen.getByText('Verify Email')).toBeInTheDocument();
      });
    });
  });

  describe('OTP Verification', () => {
    const goToOTP = async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      render(<ChatAuth {...defaultProps} />);
      fireEvent.click(screen.getByText('Sign Up'));

      await userEvent.type(screen.getByPlaceholderText('John Doe'), 'John Doe');
      await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'john@test.com');
      await userEvent.type(screen.getByPlaceholderText('Min 8 characters'), 'password123');
      await userEvent.type(screen.getByPlaceholderText('Confirm your password'), 'password123');

      const form = screen.getByPlaceholderText('John Doe').closest('form')!;
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText('Verify Email')).toBeInTheDocument();
      });
    };

    it('shows OTP sent confirmation', async () => {
      await goToOTP();

      expect(screen.getByText(/OTP sent to/)).toBeInTheDocument();
      expect(screen.getByText('john@test.com')).toBeInTheDocument();
    });

    it('validates OTP length', async () => {
      await goToOTP();

      const form = screen.getByText('Verify & Create Account').closest('form')!;
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText('Enter the 6-digit OTP')).toBeInTheDocument();
      });
    });

    it('calls register and auto-signs in on valid OTP', async () => {
      await goToOTP();

      // Mock register success
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      // Mock auto sign-in success
      (signIn as jest.Mock).mockResolvedValueOnce({ ok: true });

      await userEvent.type(screen.getByPlaceholderText('• • • • • •'), '123456');

      fireEvent.click(screen.getByText('Verify & Create Account'));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/auth/register', expect.objectContaining({
          method: 'POST',
        }));
      });

      await waitFor(() => {
        expect(defaultProps.onAuthSuccess).toHaveBeenCalled();
      });
    });

    it('allows going back to signup form', async () => {
      await goToOTP();

      fireEvent.click(screen.getByText('Back'));

      await waitFor(() => {
        // Sign up form has the name input
        expect(screen.getByPlaceholderText('John Doe')).toBeInTheDocument();
      });
    });
  });
});
