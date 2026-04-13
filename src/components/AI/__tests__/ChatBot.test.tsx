import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ChatBot from '../ChatBot';

// Mock AI SDK chat hook
const mockSendMessage = jest.fn();
jest.mock('@ai-sdk/react', () => ({
  useChat: () => ({
    messages: [],
    sendMessage: mockSendMessage,
    status: 'ready',
    error: null,
  }),
}));

jest.mock('ai', () => ({
  DefaultChatTransport: jest.fn(),
}));

// Mock next-auth/react — default: not authenticated
const mockUseSession = jest.fn();
const mockUpdateSession = jest.fn();
jest.mock('next-auth/react', () => ({
  useSession: () => mockUseSession(),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

// Mock react-markdown
jest.mock('react-markdown', () => {
  return function MockMarkdown({ children }: { children: string }) {
    return <span>{children}</span>;
  };
});

jest.mock('remark-gfm', () => () => {});

// Mock react-qr-code
jest.mock('react-qr-code', () => {
  return function MockQRCode() {
    return <div data-testid="qr-code">QR</div>;
  };
});

// Mock payment config
jest.mock('@/lib/payment-config', () => ({
  UPI_CONFIG: { vpa: 'test@upi', merchantName: 'Test', currency: 'INR' },
  generateUPILink: () => 'upi://pay?pa=test@upi',
}));

const mockProducts = {
  products: [
    {
      id: 1,
      title: 'Oyster Mushroom',
      slug: 'oyster-mushroom',
      price: 350,
      discountedPrice: null,
      discountPercentage: 0,
      hasDiscount: false,
      inStock: true,
      imgs: { thumbnails: ['/img.jpg'], previews: [] },
      averageRating: 4.0,
      reviewCount: 5,
      measurementValue: 200,
      measurementType: 'g',
    },
    {
      id: 2,
      title: 'Shiitake Dried',
      slug: 'shiitake-dried',
      price: 500,
      discountedPrice: 400,
      discountPercentage: 20,
      hasDiscount: true,
      inStock: true,
      imgs: { thumbnails: ['/img2.jpg'], previews: [] },
      averageRating: 4.8,
      reviewCount: 10,
      measurementValue: 100,
      measurementType: 'g',
    },
    {
      id: 3,
      title: 'Out of Stock Item',
      slug: 'out-of-stock',
      price: 200,
      discountedPrice: null,
      discountPercentage: 0,
      hasDiscount: false,
      inStock: false,
      imgs: { thumbnails: [], previews: [] },
      averageRating: 0,
      reviewCount: 0,
      measurementValue: 100,
      measurementType: 'g',
    },
  ],
};

// Mock scrollIntoView (not available in jsdom)
Element.prototype.scrollIntoView = jest.fn();

describe('ChatBot', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
    // Default: unauthenticated
    mockUseSession.mockReturnValue({ data: null, update: mockUpdateSession });
  });

  describe('Floating Button', () => {
    it('renders the floating chat button', () => {
      render(<ChatBot />);
      // Chat button should be visible
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('opens chat window when floating button is clicked', () => {
      render(<ChatBot />);
      fireEvent.click(screen.getByRole('button'));

      expect(screen.getByText('Shop & Chat')).toBeInTheDocument();
      expect(screen.getAllByText('Kosvana').length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Chat Window', () => {
    const openChat = () => {
      render(<ChatBot />);
      fireEvent.click(screen.getByRole('button'));
    };

    it('shows Chat and Shop tabs', () => {
      openChat();

      expect(screen.getByText('Chat')).toBeInTheDocument();
      expect(screen.getByText('Shop')).toBeInTheDocument();
    });

    it('defaults to Chat view with welcome message', () => {
      openChat();

      expect(screen.getByText(/I'm your Kosvana guide/)).toBeInTheDocument();
      expect(screen.getByText(/Browse & Buy Products/)).toBeInTheDocument();
    });

    it('closes chat when X button is clicked', () => {
      openChat();

      // Find close button in header
      const closeButtons = screen.getAllByRole('button');
      const closeButton = closeButtons.find(btn => {
        const svg = btn.querySelector('svg');
        return svg && btn.closest('.bg-forest');
      });

      if (closeButton) fireEvent.click(closeButton);

      // Chat window should be closed, floating button visible
      expect(screen.queryByText('Kosvana')).not.toBeInTheDocument();
    });

    it('has chat input field', () => {
      openChat();

      expect(screen.getByPlaceholderText('Search products or ask anything...')).toBeInTheDocument();
    });

    it('shows footer', () => {
      openChat();

      expect(screen.getByText('Powered by Kosvana AI')).toBeInTheDocument();
    });
  });

  describe('Tab Navigation', () => {
    const openChat = () => {
      render(<ChatBot />);
      fireEvent.click(screen.getByRole('button'));
    };

    it('switches to Shop tab', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockProducts,
      });

      openChat();
      fireEvent.click(screen.getByText('Shop'));

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search products...')).toBeInTheDocument();
      });
    });

    it('fetches products when Shop tab is opened', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockProducts,
      });

      openChat();
      fireEvent.click(screen.getByText('Shop'));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/products'));
      });
    });

    it('displays products in Shop view', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockProducts,
      });

      openChat();
      fireEvent.click(screen.getByText('Shop'));

      await waitFor(() => {
        expect(screen.getByText('Oyster Mushroom')).toBeInTheDocument();
        expect(screen.getByText('Shiitake Dried')).toBeInTheDocument();
      });
    });

    it('switches back to Chat tab from Shop', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockProducts,
      });

      openChat();
      fireEvent.click(screen.getByText('Shop'));

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search products...')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Chat'));

      expect(screen.getByText(/I'm your Kosvana guide/)).toBeInTheDocument();
    });

    it('shows loading state while fetching products', () => {
      (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {})); // never resolves

      render(<ChatBot />);
      fireEvent.click(screen.getByRole('button'));
      fireEvent.click(screen.getByText('Shop'));

      expect(screen.getByText('Loading products...')).toBeInTheDocument();
    });

    it('shows empty state when no products found', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ products: [] }),
      });

      render(<ChatBot />);
      fireEvent.click(screen.getByRole('button'));
      fireEvent.click(screen.getByText('Shop'));

      await waitFor(() => {
        expect(screen.getByText('No products found')).toBeInTheDocument();
      });
    });
  });

  describe('Shop Search', () => {
    it('has search input in Shop view', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockProducts,
      });

      render(<ChatBot />);
      fireEvent.click(screen.getByRole('button'));
      fireEvent.click(screen.getByText('Shop'));

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search products...')).toBeInTheDocument();
      });
    });
  });

  describe('Buy Flow Integration', () => {
    it('shows auth screen when unauthenticated user clicks Buy', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockProducts,
      });

      render(<ChatBot />);
      fireEvent.click(screen.getByRole('button'));
      fireEvent.click(screen.getByText('Shop'));

      await waitFor(() => {
        expect(screen.getByText('Oyster Mushroom')).toBeInTheDocument();
      });

      const buyButtons = screen.getAllByText('Buy');
      fireEvent.click(buyButtons[0]);

      // Should show auth view, not checkout
      await waitFor(() => {
        expect(screen.getByText('Sign In to Continue')).toBeInTheDocument();
      });

      // Tab bar should be hidden in auth view
      expect(screen.queryByText('Chat')).not.toBeInTheDocument();
    });

    it('goes straight to checkout when authenticated user clicks Buy', async () => {
      // Mock authenticated session
      mockUseSession.mockReturnValue({
        data: { user: { name: 'John', email: 'john@test.com' } },
        update: mockUpdateSession,
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockProducts,
      });

      render(<ChatBot />);
      fireEvent.click(screen.getByRole('button'));
      fireEvent.click(screen.getByText('Shop'));

      await waitFor(() => {
        expect(screen.getByText('Oyster Mushroom')).toBeInTheDocument();
      });

      const buyButtons = screen.getAllByText('Buy');
      fireEvent.click(buyButtons[0]);

      // Should show checkout directly
      await waitFor(() => {
        expect(screen.getByText('Checkout')).toBeInTheDocument();
        expect(screen.getByText('Oyster Mushroom')).toBeInTheDocument();
      });
    });

    it('returns to shop when back is clicked from checkout', async () => {
      // Must be authenticated to reach checkout
      mockUseSession.mockReturnValue({
        data: { user: { name: 'John', email: 'john@test.com' } },
        update: mockUpdateSession,
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockProducts,
      });

      render(<ChatBot />);
      // Open chat
      fireEvent.click(screen.getByRole('button'));
      // Go to shop
      fireEvent.click(screen.getByText('Shop'));

      await waitFor(() => {
        expect(screen.getByText('Oyster Mushroom')).toBeInTheDocument();
      });

      const buyButtons = screen.getAllByText('Buy');
      fireEvent.click(buyButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Checkout')).toBeInTheDocument();
      });

      // The checkout header has a back arrow button - it's after the close X button
      // Buttons order: [close X, back arrow, quantity -, quantity +, submit]
      // Find the button within the checkout border-b area
      const allButtons = screen.getAllByRole('button');
      // The back button is the second button (index 1) - after the X close
      fireEvent.click(allButtons[1]);

      // Should return to shop view which has the search bar
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search products...')).toBeInTheDocument();
      });
    });

    it('does not show Buy button for out-of-stock items', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockProducts,
      });

      render(<ChatBot />);
      fireEvent.click(screen.getByRole('button'));
      fireEvent.click(screen.getByText('Shop'));

      await waitFor(() => {
        expect(screen.getByText('Out of Stock Item')).toBeInTheDocument();
        expect(screen.getByText('Sold out')).toBeInTheDocument();
      });
    });
  });
});
