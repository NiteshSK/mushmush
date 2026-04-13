import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ContactPage from '../page';

// Mock Breadcrumb
jest.mock('@/components/Common/Breadcrumb', () => {
  return function MockBreadcrumb() {
    return <div data-testid="breadcrumb" />;
  };
});

describe('ContactPage Validation', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  const getFormField = (id: string) => screen.getByRole(
    id === 'message' ? 'textbox' : (id === 'phone' ? 'textbox' : 'textbox'),
    // Use getElementById for precision since labels conflict with sidebar text
  );

  const nameInput = () => screen.getByPlaceholderText('Your name');
  const emailInput = () => screen.getByPlaceholderText('you@example.com');
  const phoneInput = () => screen.getByPlaceholderText('+91 XXXXX XXXXX');
  const subjectInput = () => screen.getByPlaceholderText("What's this about?");
  const messageInput = () => screen.getByPlaceholderText('Tell us more...');

  it('renders all form fields', () => {
    render(<ContactPage />);
    expect(nameInput()).toBeInTheDocument();
    expect(emailInput()).toBeInTheDocument();
    expect(phoneInput()).toBeInTheDocument();
    expect(subjectInput()).toBeInTheDocument();
    expect(messageInput()).toBeInTheDocument();
  });

  it('shows validation errors when submitting empty form', async () => {
    render(<ContactPage />);

    const submitButton = screen.getByRole('button', { name: /Send Message/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Subject is required')).toBeInTheDocument();
      expect(screen.getByText('Message is required')).toBeInTheDocument();
    });

    // fetch should NOT be called
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('shows error for invalid email', async () => {
    render(<ContactPage />);

    fireEvent.change(nameInput(), { target: { value: 'John Doe' } });
    fireEvent.change(emailInput(), { target: { value: 'user@domain' } });
    fireEvent.change(subjectInput(), { target: { value: 'Test' } });
    fireEvent.change(messageInput(), { target: { value: 'Hello there' } });

    const submitButton = screen.getByRole('button', { name: /Send Message/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('shows error for invalid phone number', async () => {
    render(<ContactPage />);

    await userEvent.type(nameInput(), 'John Doe');
    await userEvent.type(emailInput(), 'john@example.com');
    await userEvent.type(phoneInput(), '12345');
    await userEvent.type(subjectInput(), 'Test');
    await userEvent.type(messageInput(), 'Hello there');

    const submitButton = screen.getByRole('button', { name: /Send Message/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid 10-digit Indian mobile number')).toBeInTheDocument();
    });

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('shows error for invalid name', async () => {
    render(<ContactPage />);

    await userEvent.type(nameInput(), 'A');
    await userEvent.type(emailInput(), 'john@example.com');
    await userEvent.type(subjectInput(), 'Test');
    await userEvent.type(messageInput(), 'Hello there');

    const submitButton = screen.getByRole('button', { name: /Send Message/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Name must be at least 2 characters')).toBeInTheDocument();
    });
  });

  it('clears error when user types in errored field', async () => {
    render(<ContactPage />);

    // Submit empty to trigger errors
    fireEvent.click(screen.getByRole('button', { name: /Send Message/i }));

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
    });

    // Type in the name field
    await userEvent.type(nameInput(), 'Jo');

    // Error should be cleared
    expect(screen.queryByText('Name is required')).not.toBeInTheDocument();
  });

  it('submits form when all fields are valid', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(<ContactPage />);

    await userEvent.type(nameInput(), 'John Doe');
    await userEvent.type(emailInput(), 'john@example.com');
    await userEvent.type(phoneInput(), '9876543210');
    await userEvent.type(subjectInput(), 'Inquiry');
    await userEvent.type(messageInput(), 'Hello, I have a question.');

    fireEvent.click(screen.getByRole('button', { name: /Send Message/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/contact', expect.objectContaining({
        method: 'POST',
      }));
    });

    await waitFor(() => {
      expect(screen.getByText(/Message sent successfully/i)).toBeInTheDocument();
    });
  });

  it('allows submission with empty optional phone field', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(<ContactPage />);

    await userEvent.type(nameInput(), 'John Doe');
    await userEvent.type(emailInput(), 'john@example.com');
    await userEvent.type(subjectInput(), 'Inquiry');
    await userEvent.type(messageInput(), 'Hello there');

    fireEvent.click(screen.getByRole('button', { name: /Send Message/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });
});
