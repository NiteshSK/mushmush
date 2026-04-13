import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useSession } from 'next-auth/react';
import Login from '../Login';

describe('Checkout Login Validation', () => {
  beforeEach(() => {
    (useSession as jest.Mock).mockReturnValue({ data: null });
  });

  it('shows login dropdown when clicked', () => {
    render(<Login />);

    fireEvent.click(screen.getByText(/Click here to login/i));

    expect(screen.getByLabelText(/Username or Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
  });

  it('shows logged in state when session exists', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { name: 'John Doe', email: 'john@example.com' } },
    });

    render(<Login />);

    expect(screen.getByText(/Logged in as/i)).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('shows email validation error on blur with invalid email', async () => {
    render(<Login />);

    // Open dropdown
    fireEvent.click(screen.getByText(/Click here to login/i));

    const emailInput = screen.getByLabelText(/Username or Email/i);
    await userEvent.type(emailInput, 'notanemail');
    fireEvent.blur(emailInput);

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });
  });

  it('does not show email error on blur when field is empty', async () => {
    render(<Login />);

    fireEvent.click(screen.getByText(/Click here to login/i));

    const emailInput = screen.getByLabelText(/Username or Email/i);
    fireEvent.focus(emailInput);
    fireEvent.blur(emailInput);

    await waitFor(() => {
      expect(screen.queryByText('Please enter a valid email address')).not.toBeInTheDocument();
      expect(screen.queryByText('Email is required')).not.toBeInTheDocument();
    });
  });

  it('clears email error when user corrects the value', async () => {
    render(<Login />);

    fireEvent.click(screen.getByText(/Click here to login/i));

    const emailInput = screen.getByLabelText(/Username or Email/i);

    // Type invalid email and blur to trigger error
    await userEvent.type(emailInput, 'bad');
    fireEvent.blur(emailInput);

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });

    // Clear and type valid email
    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, 'good@example.com');

    await waitFor(() => {
      expect(screen.queryByText('Please enter a valid email address')).not.toBeInTheDocument();
    });
  });

  it('renders required markers on fields', () => {
    render(<Login />);

    fireEvent.click(screen.getByText(/Click here to login/i));

    // Check that the labels contain asterisks (required markers)
    const emailLabel = screen.getByText(/Username or Email/i);
    const passwordLabel = screen.getByText(/^Password/i);
    expect(emailLabel.closest('label')?.textContent).toContain('*');
    expect(passwordLabel.closest('label')?.textContent).toContain('*');
  });
});
