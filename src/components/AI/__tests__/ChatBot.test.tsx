import React from 'react';
import { render, screen, within, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import cartReducer from '@/redux/features/cart-slice';
import ChatBot from '../ChatBot';
import { openChat as openChatFromPage, OPEN_CHAT_EVENT } from '../open-chat';

// Mock AI SDK chat hook; tests set mockMessages to show a conversation.
const mockSendMessage = jest.fn();
let mockMessages: any[] = [];
jest.mock('@ai-sdk/react', () => ({
  useChat: () => ({
    messages: mockMessages,
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

// Mock next/navigation (override jest.setup default)
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn(), prefetch: jest.fn() }),
  usePathname: () => '/',
}));

// Mock react-markdown
jest.mock('react-markdown', () => {
  return function MockMarkdown({ children }: { children: string }) {
    return <span>{children}</span>;
  };
});

jest.mock('remark-gfm', () => () => {});

// Mock WishlistContext
jest.mock('@/app/context/WishlistContext', () => ({
  useWishlist: () => ({
    items: [],
    loading: false,
    addToWishlist: jest.fn().mockResolvedValue(true),
    removeFromWishlist: jest.fn().mockResolvedValue(true),
    isInWishlist: () => false,
    refreshWishlist: jest.fn(),
  }),
}));

// Mock react-qr-code
jest.mock('react-qr-code', () => {
  return function MockQRCode() {
    return <div data-testid="qr-code">QR</div>;
  };
});

// Override toast mock to support direct function call: toast("msg")
jest.mock('react-hot-toast', () => {
  const mockToast: any = jest.fn();
  mockToast.success = jest.fn();
  mockToast.error = jest.fn();
  mockToast.loading = jest.fn();
  return { toast: mockToast, Toaster: () => null };
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
      stockQuantity: 2,
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

const renderChat = () => {
  const store = configureStore({ reducer: { cartReducer } });
  render(<Provider store={store}><ChatBot /></Provider>);
  return store;
};
const renderNudgeChat = () => {
  const store = configureStore({ reducer: { cartReducer } });
  return render(<Provider store={store}><ChatBot /></Provider>);
};
const launcher = () => screen.getByRole('button', { name: 'Ask Kosvana' });
const openChat = () => {
  const store = renderChat();
  fireEvent.click(launcher());
  return store;
};
const signIn = () => mockUseSession.mockReturnValue({
  data: { user: { name: 'John', email: 'john@test.com' } },
  update: mockUpdateSession,
});

describe('ChatBot', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockReset();
    localStorage.clear();
    mockMessages = [];
    // Default: unauthenticated
    mockUseSession.mockReturnValue({ data: null, update: mockUpdateSession });
  });

  describe('Launcher', () => {
    it('renders a launcher named "Ask Kosvana" with no fake unread badge', () => {
      renderChat();
      expect(launcher()).toHaveAttribute('aria-haspopup', 'dialog');
      expect(launcher().textContent).toBe('Ask Kosvana');
    });

    it('opens the chat dialog and hides the launcher', () => {
      openChat();
      expect(screen.getByRole('dialog', { name: 'Ask Kosvana' })).toHaveAttribute('aria-modal', 'true');
      expect(screen.queryByRole('button', { name: 'Ask Kosvana' })).not.toBeInTheDocument();
    });

    it('hides while a pantry dialog or the bag drawer is open', async () => {
      renderChat();
      const dialog = document.createElement('dialog');
      dialog.setAttribute('open', '');
      await act(async () => { document.body.appendChild(dialog); });
      await waitFor(() => expect(screen.queryByRole('button', { name: 'Ask Kosvana' })).not.toBeInTheDocument());
      await act(async () => { dialog.remove(); });
      await waitFor(() => expect(launcher()).toBeInTheDocument());
    });
  });

  describe('Launcher on narrow screens', () => {
    const matchMedia = window.matchMedia;
    afterEach(() => { window.matchMedia = matchMedia; });

    it('hides while a page field has focus, so it cannot cover the field', () => {
      window.matchMedia = ((query: string) => ({ matches: query.includes('max-width'), media: query })) as any;
      renderChat();
      const field = document.createElement('input');
      document.body.appendChild(field);
      act(() => field.focus());
      expect(screen.queryByRole('button', { name: 'Ask Kosvana' })).not.toBeInTheDocument();
      act(() => field.blur());
      expect(launcher()).toBeInTheDocument();
      field.remove();
    });
  });

  describe('Opening from other pages', () => {
    it('opens on the kosvana:open-chat event and returns focus to the opener on close', () => {
      renderChat();
      const opener = document.createElement('button');
      opener.textContent = 'Help';
      document.body.appendChild(opener);
      opener.focus();
      act(() => openChatFromPage());
      const dialog = screen.getByRole('dialog', { name: 'Ask Kosvana' });
      expect(dialog.contains(document.activeElement)).toBe(true);
      fireEvent.click(screen.getByRole('button', { name: 'Close chat' }));
      expect(opener).toHaveFocus();
      opener.remove();
    });

    it('ignores the event detail and returns focus to the launcher when the opener is gone', () => {
      renderChat();
      const opener = document.createElement('button');
      document.body.appendChild(opener);
      opener.focus();
      act(() => { window.dispatchEvent(new CustomEvent(OPEN_CHAT_EVENT, { detail: { from: 'footer' } })); });
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      opener.remove();
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(launcher()).toHaveFocus();
    });

    it('puts a draft from another page in the message box without sending it', () => {
      renderChat();
      mockSendMessage.mockClear();
      act(() => openChatFromPage("I'm looking for cumin"));
      const dialog = screen.getByRole('dialog', { name: 'Ask Kosvana' });
      expect(within(dialog).getByDisplayValue("I'm looking for cumin")).toBeInTheDocument();
      expect(mockSendMessage).not.toHaveBeenCalled();
    });
  });

  describe('Phone nudge', () => {
    const matchMedia = window.matchMedia;
    const phone = () => {
      window.matchMedia = ((query: string) => ({ matches: query.includes('max-width'), media: query })) as any;
    };
    const nudge = () => document.querySelector('[aria-hidden="true"][data-show="true"]');
    beforeEach(() => { sessionStorage.clear(); jest.useFakeTimers(); });
    afterEach(() => { window.matchMedia = matchMedia; jest.useRealTimers(); });

    it('shows "Questions? Ask us" once per session, then collapses after about 6 seconds', () => {
      phone();
      const { unmount } = renderNudgeChat();
      expect(nudge()).toBeNull();
      act(() => { jest.advanceTimersByTime(1500); });
      expect(nudge()).toHaveTextContent('Questions? Ask us');
      expect(launcher()).toHaveAttribute('aria-label', 'Ask Kosvana');
      expect(sessionStorage.getItem('kosvana:chat-nudge')).toBe('1');
      act(() => { jest.advanceTimersByTime(6000); });
      expect(screen.queryByText('Questions? Ask us')).not.toBeInTheDocument();
      unmount();
      renderNudgeChat();
      act(() => { jest.advanceTimersByTime(8000); });
      expect(screen.queryByText('Questions? Ask us')).not.toBeInTheDocument();
    });

    it('can be dismissed, and opens the chat when tapped', () => {
      phone();
      const { unmount } = renderNudgeChat();
      act(() => { jest.advanceTimersByTime(1500); });
      fireEvent.click(screen.getByTitle('Dismiss'));
      expect(screen.queryByText('Questions? Ask us')).not.toBeInTheDocument();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      unmount();
      sessionStorage.clear();
      renderNudgeChat();
      act(() => { jest.advanceTimersByTime(1500); });
      fireEvent.click(screen.getByText('Questions? Ask us'));
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.queryByText('Questions? Ask us')).not.toBeInTheDocument();
    });

    it('does not show while the launcher is hidden, or on wider screens', () => {
      phone();
      const { unmount } = renderNudgeChat();
      const field = document.createElement('input');
      document.body.appendChild(field);
      act(() => field.focus());
      act(() => { jest.advanceTimersByTime(1500); });
      expect(screen.queryByText('Questions? Ask us')).not.toBeInTheDocument();
      field.remove();
      unmount();
      window.matchMedia = ((query: string) => ({ matches: query.includes('min-width'), media: query })) as any;
      renderNudgeChat();
      act(() => { jest.advanceTimersByTime(8000); });
      expect(screen.queryByText('Questions? Ask us')).not.toBeInTheDocument();
    });
  });

  describe('Chat Window', () => {
    it('shows Chat, Shop and Wishlist sections', () => {
      openChat();
      expect(screen.getByRole('button', { name: 'Chat' })).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByRole('button', { name: 'Shop' })).toHaveAttribute('aria-pressed', 'false');
      expect(screen.getByRole('button', { name: 'Wishlist' })).toBeInTheDocument();
    });

    it('defaults to the welcome state with delivery scope and prompts', () => {
      openChat();
      expect(screen.getByRole('heading', { name: 'Ask about the pantry' })).toBeInTheDocument();
      expect(screen.getByText(/Fresh mushrooms are sold in Dehradun only/)).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Dried mushrooms' }));
      expect(mockSendMessage).toHaveBeenCalledWith({ text: 'Show me your dried mushrooms' });
    });

    it('closes with the close button and returns focus to the launcher', () => {
      openChat();
      fireEvent.click(screen.getByRole('button', { name: 'Close chat' }));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(launcher()).toHaveFocus();
    });

    it('closes with Escape and returns focus to the launcher', () => {
      openChat();
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(launcher()).toHaveFocus();
    });

    it('keeps Tab focus inside the panel', () => {
      openChat();
      const dialog = screen.getByRole('dialog');
      const close = screen.getByRole('button', { name: 'Close chat' });
      const input = screen.getByLabelText('Message Kosvana');
      const send = screen.getByRole('button', { name: 'Send message' });
      fireEvent.change(input, { target: { value: 'hi' } }); // enables Send, the last control
      send.focus();
      fireEvent.keyDown(dialog, { key: 'Tab' });
      expect(close).toHaveFocus();
      fireEvent.keyDown(dialog, { key: 'Tab', shiftKey: true });
      expect(send).toHaveFocus();
    });

    it('sends a typed message', () => {
      openChat();
      const input = screen.getByPlaceholderText('Ask about a product or delivery');
      fireEvent.change(input, { target: { value: 'Do you have cumin?' } });
      fireEvent.click(screen.getByRole('button', { name: 'Send message' }));
      expect(mockSendMessage).toHaveBeenCalledWith({ text: 'Do you have cumin?' });
    });

    it('says that AI answers can be wrong', () => {
      openChat();
      expect(screen.getByText(/AI answers can be wrong/)).toBeInTheDocument();
    });
  });

  describe('Suggested products', () => {
    beforeEach(() => {
      mockMessages = [
        { id: 'u1', role: 'user', parts: [{ type: 'text', text: 'Show me mushrooms' }] },
        { id: 'a1', role: 'assistant', parts: [
          { type: 'tool-searchProducts', state: 'output-available', output: mockProducts.products },
          { type: 'text', text: 'Here are three mushrooms.' },
        ] },
      ];
    });

    it('shows the reply text before the product cards', () => {
      openChat();
      const text = screen.getByText('Here are three mushrooms.');
      const card = screen.getByRole('heading', { name: 'Oyster Mushroom' });
      expect(text.compareDocumentPosition(card) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it('adds a suggestion to the shared bag with its slug and stock limit', () => {
      const store = openChat();
      fireEvent.click(screen.getByRole('button', { name: 'Add Oyster Mushroom to bag' }));
      expect(store.getState().cartReducer.items[0]).toMatchObject({ id: 1, slug: 'oyster-mushroom', stockQuantity: 2, quantity: 1 });
      fireEvent.click(screen.getByRole('button', { name: 'Add one Oyster Mushroom' }));
      expect(store.getState().cartReducer.items[0].quantity).toBe(2);
      expect(screen.getByRole('button', { name: 'Add one Oyster Mushroom' })).toBeDisabled();
      expect(screen.getByText('2 items in your bag')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'View bag' })).toHaveAttribute('href', '/cart');
    });

    it('offers the Shop tab for more products', () => {
      (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => mockProducts });
      openChat();
      fireEvent.click(screen.getByRole('button', { name: 'Browse more in the Shop tab' }));
      expect(screen.getByRole('button', { name: 'Shop' })).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('Tab Navigation', () => {
    it('switches to Shop tab', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockProducts,
      });

      openChat();
      fireEvent.click(screen.getByRole('button', { name: 'Shop' }));

      await waitFor(() => {
        expect(screen.getByLabelText('Search the pantry')).toBeInTheDocument();
      });
    });

    it('fetches products when Shop tab is opened', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockProducts,
      });

      openChat();
      fireEvent.click(screen.getByRole('button', { name: 'Shop' }));

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
      fireEvent.click(screen.getByRole('button', { name: 'Shop' }));

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Oyster Mushroom' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Shiitake Dried' })).toBeInTheDocument();
      });
    });

    it('switches back to Chat tab from Shop', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockProducts,
      });

      openChat();
      fireEvent.click(screen.getByRole('button', { name: 'Shop' }));

      await waitFor(() => {
        expect(screen.getByLabelText('Search the pantry')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: 'Chat' }));

      expect(screen.getByRole('heading', { name: 'Ask about the pantry' })).toBeInTheDocument();
    });

    it('shows loading state while fetching products', () => {
      (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {})); // never resolves

      openChat();
      fireEvent.click(screen.getByRole('button', { name: 'Shop' }));

      expect(screen.getByText('Opening the pantry…')).toBeInTheDocument();
    });

    it('shows empty state when no products found', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ products: [] }),
      });

      openChat();
      fireEvent.click(screen.getByRole('button', { name: 'Shop' }));

      await waitFor(() => {
        expect(screen.getByText('No products found')).toBeInTheDocument();
      });
    });

    it('asks a signed-out shopper to sign in for the wishlist', () => {
      openChat();
      fireEvent.click(screen.getByRole('button', { name: 'Wishlist' }));
      expect(screen.getByText('Sign in to see the products you saved.')).toBeInTheDocument();
    });
  });

  describe('Shop Search', () => {
    it('searches with the query', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockProducts,
      });

      openChat();
      fireEvent.click(screen.getByRole('button', { name: 'Shop' }));

      const search = await screen.findByPlaceholderText('Cumin, walnuts, shiitake…');
      fireEvent.change(search, { target: { value: 'cumin' } });
      fireEvent.click(screen.getByRole('button', { name: 'Search' }));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/products/search?q=cumin'));
      });
    });
  });

  describe('Buy Flow Integration', () => {
    it('redirects to signin when unauthenticated user clicks Buy now', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockProducts,
      });

      openChat();
      fireEvent.click(screen.getByRole('button', { name: 'Shop' }));

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Oyster Mushroom' })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: 'Buy now Oyster Mushroom' }));

      // Should save product to localStorage immediately
      const saved = localStorage.getItem('chatbot_pending_product');
      expect(saved).toBeTruthy();
      expect(JSON.parse(saved!).title).toBe('Oyster Mushroom');

      // Redirect happens after a short delay (setTimeout)
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(
          expect.stringContaining('/auth/signin')
        );
      }, { timeout: 2000 });
    });

    it('goes straight to checkout when authenticated user clicks Buy now', async () => {
      signIn();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockProducts,
      });

      openChat();
      fireEvent.click(screen.getByRole('button', { name: 'Shop' }));

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Oyster Mushroom' })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: 'Buy now Oyster Mushroom' }));

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Checkout' })).toBeInTheDocument();
        expect(screen.getByText('Oyster Mushroom')).toBeInTheDocument();
      });
    });

    it('returns to shop when back is clicked from checkout', async () => {
      signIn();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockProducts,
      });

      openChat();
      fireEvent.click(screen.getByRole('button', { name: 'Shop' }));

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Oyster Mushroom' })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: 'Buy now Oyster Mushroom' }));

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Checkout' })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: 'Back' }));

      await waitFor(() => {
        expect(screen.getByLabelText('Search the pantry')).toBeInTheDocument();
      });
    });

    it('does not show Buy now for out-of-stock items', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockProducts,
      });

      openChat();
      fireEvent.click(screen.getByRole('button', { name: 'Shop' }));

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Out of Stock Item' })).toBeInTheDocument();
        expect(screen.getByText('Sold out')).toBeInTheDocument();
      });
      expect(screen.queryByRole('button', { name: 'Buy now Out of Stock Item' })).not.toBeInTheDocument();
    });

    it('carries the payment token from the order to the UPI payment form', async () => {
      signIn();
      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/shipping/check')) return Promise.resolve({ ok: true, json: async () => ({ deliverable: true, shippingFee: 80, estimatedDays: '3-5 days' }) });
        if (url.includes('/api/checkout/send-otp')) return Promise.resolve({ ok: true, json: async () => ({ message: 'Code sent' }) });
        if (url.includes('/api/checkout/verify-and-place-order')) return Promise.resolve({ ok: true, json: async () => ({ success: true, order: { id: 'o1', orderNumber: 'ORD-1', total: 442 }, paymentToken: 'tok_abc' }) });
        if (url.includes('/api/checkout/upi-payment')) return Promise.resolve({ ok: true, json: async () => ({ message: 'Submitted' }) });
        return Promise.resolve({ ok: true, json: async () => mockProducts });
      });

      openChat();
      fireEvent.click(screen.getByRole('button', { name: 'Shop' }));
      fireEvent.click(await screen.findByRole('button', { name: 'Buy now Oyster Mushroom' }));

      await userEvent.type(screen.getByPlaceholderText('9876543210'), '9876543210');
      await userEvent.type(screen.getByPlaceholderText('Street address'), '12 Canal Road');
      await userEvent.type(screen.getByPlaceholderText('City'), 'Dehradun');
      await userEvent.type(screen.getByPlaceholderText('State'), 'Uttarakhand');
      await userEvent.type(screen.getByPlaceholderText('Pincode'), '248001');
      await screen.findByText('Delivery ₹80');
      fireEvent.click(screen.getByRole('button', { name: 'Send verification code' }));

      await userEvent.type(await screen.findByPlaceholderText('• • • • • •'), '123456');
      fireEvent.click(screen.getByRole('button', { name: 'Verify and place order' }));

      await userEvent.type(await screen.findByPlaceholderText('Enter 12-digit UPI transaction ID'), '123456789012');
      await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Submit payment' })); });

      const upiCall = (global.fetch as jest.Mock).mock.calls.find(([url]) => url === '/api/checkout/upi-payment');
      expect((upiCall![1].body as FormData).get('paymentToken')).toBe('tok_abc');
    });
  });
});
