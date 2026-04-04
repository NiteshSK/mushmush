import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductInventoryTable from '../ProductInventoryTable';

// ── Mock data ──────────────────────────────────────────────

const mockProducts = [
  {
    id: 1,
    title: 'Oyster Mushroom Powder',
    price: 499,
    inStock: true,
    stockQuantity: 25,
    bulkQuantity: 2500,
    bulkDisplay: '2.50 kg',
    measurementValue: 100,
    measurementType: 'gm',
    imgs: { thumbnails: ['/images/oyster.jpg'] },
    categoryNames: ['Mushroom Powders'],
    reviewCount: 12,
    averageRating: 4.5,
    hasActiveDiscount: true,
    activeDiscountValue: 10,
  },
  {
    id: 2,
    title: "Lion's Mane Powder",
    price: 599,
    inStock: false,
    stockQuantity: 0,
    bulkQuantity: 0,
    bulkDisplay: '0 gm',
    measurementValue: 100,
    measurementType: 'gm',
    imgs: { thumbnails: ['/images/lion.jpg'] },
    categoryNames: ['Mushroom Powders'],
    reviewCount: 5,
    averageRating: 4.8,
    hasActiveDiscount: false,
    activeDiscountValue: 0,
  },
  {
    id: 3,
    title: 'Reishi Extract',
    price: 699,
    inStock: true,
    stockQuantity: 3,
    bulkQuantity: 600,
    bulkDisplay: '600 gm',
    measurementValue: 200,
    measurementType: 'gm',
    imgs: { thumbnails: ['/images/reishi.jpg'] },
    categoryNames: ['Extracts'],
    reviewCount: 8,
    averageRating: 4.2,
    hasActiveDiscount: false,
    activeDiscountValue: 0,
  },
];

// ── Mock next/image ────────────────────────────────────────

jest.mock('next/image', () => {
  return function MockImage({ src, alt, ...rest }: any) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} />;
  };
});

// ── Mock react-hot-toast ───────────────────────────────────

jest.mock('react-hot-toast', () => {
  const success = jest.fn();
  const error = jest.fn();
  const loading = jest.fn();
  const mock = Object.assign(jest.fn(), { success, error, loading });
  return { __esModule: true, default: mock, toast: mock };
});

// ── Tests ──────────────────────────────────────────────────

describe('ProductInventoryTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {})); // never resolves
    render(<ProductInventoryTable />);
    expect(screen.getByText('Loading products...')).toBeInTheDocument();
  });

  it('renders product rows after fetching', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockProducts,
    });

    render(<ProductInventoryTable />);

    await waitFor(() => {
      expect(screen.getByText('Oyster Mushroom Powder')).toBeInTheDocument();
    });

    expect(screen.getByText("Lion's Mane Powder")).toBeInTheDocument();
    expect(screen.getByText('Reishi Extract')).toBeInTheDocument();
  });

  it('displays bulk quantities with correct values', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockProducts,
    });

    render(<ProductInventoryTable />);

    await waitFor(() => {
      expect(screen.getByText('2.50 kg')).toBeInTheDocument();
    });

    expect(screen.getByText('0 gm')).toBeInTheDocument();
    expect(screen.getByText('600 gm')).toBeInTheDocument();
    // Also shows packs info
    expect(screen.getByText('25 packs of 100gm')).toBeInTheDocument();
    expect(screen.getByText('0 packs of 100gm')).toBeInTheDocument();
    expect(screen.getByText('3 packs of 200gm')).toBeInTheDocument();
  });

  it('displays "In Stock" and "Out of Stock" badges correctly', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockProducts,
    });

    render(<ProductInventoryTable />);

    await waitFor(() => {
      const inStockBadges = screen.getAllByText('In Stock');
      const outOfStockBadges = screen.getAllByText('Out of Stock');
      expect(inStockBadges).toHaveLength(2); // products 1 and 3
      expect(outOfStockBadges).toHaveLength(1); // product 2
    });
  });

  it('shows Quantity column header', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockProducts,
    });

    render(<ProductInventoryTable />);

    await waitFor(() => {
      expect(screen.getByText('Quantity')).toBeInTheDocument();
    });
  });

  it('opens quantity editor with bulk value and unit selector', async () => {
    const user = userEvent.setup();

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockProducts,
    });

    render(<ProductInventoryTable />);

    await waitFor(() => {
      expect(screen.getByText('Oyster Mushroom Powder')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByTitle('Edit quantity');
    await user.click(editButtons[0]);

    // Should show input with value in kg (2500gm = 2.5kg)
    const quantityInput = screen.getByDisplayValue('2.5');
    expect(quantityInput).toBeInTheDocument();
    expect(quantityInput).toHaveAttribute('type', 'number');
    // Unit selector should be present
    expect(screen.getByDisplayValue('kg')).toBeInTheDocument();
  });

  it('submits quantity update in base units via PATCH API', async () => {
    const user = userEvent.setup();

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => mockProducts }) // initial fetch
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) }); // PATCH

    render(<ProductInventoryTable />);

    await waitFor(() => {
      expect(screen.getByText('Oyster Mushroom Powder')).toBeInTheDocument();
    });

    // Click edit quantity
    const editButtons = screen.getAllByTitle('Edit quantity');
    await user.click(editButtons[0]);

    // Clear and type 50 kg
    const input = screen.getByDisplayValue('2.5');
    await user.clear(input);
    await user.type(input, '50');

    // Click confirm button (checkmark)
    const confirmBtn = screen.getByText('✓');
    await user.click(confirmBtn);

    await waitFor(() => {
      // 50kg = 50000gm sent as base units
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/admin/products/1',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ field: 'quantity', value: 50000 }),
        })
      );
    });
  });

  it('cancels quantity editing when cancel button is clicked', async () => {
    const user = userEvent.setup();

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockProducts,
    });

    render(<ProductInventoryTable />);

    await waitFor(() => {
      expect(screen.getByText('Oyster Mushroom Powder')).toBeInTheDocument();
    });

    // Click edit
    const editButtons = screen.getAllByTitle('Edit quantity');
    await user.click(editButtons[0]);

    // Verify input is shown
    expect(screen.getByDisplayValue('2.5')).toBeInTheDocument();

    // Click cancel
    const cancelBtn = screen.getByText('✕');
    await user.click(cancelBtn);

    // Input should be gone, original bulk display should show
    expect(screen.queryByDisplayValue('2.5')).not.toBeInTheDocument();
    expect(screen.getByText('2.50 kg')).toBeInTheDocument();
  });

  it('updates stock status to "In Stock" when bulk quantity is set above 0', async () => {
    const user = userEvent.setup();

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => mockProducts })
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    render(<ProductInventoryTable />);

    await waitFor(() => {
      expect(screen.getByText("Lion's Mane Powder")).toBeInTheDocument();
    });

    // Edit the out-of-stock product's quantity (index 1)
    const editButtons = screen.getAllByTitle('Edit quantity');
    await user.click(editButtons[1]);

    const input = screen.getByDisplayValue('0');
    await user.clear(input);
    await user.type(input, '5');

    const confirmBtns = screen.getAllByText('✓');
    await user.click(confirmBtns[0]);

    await waitFor(() => {
      // After update, the local state should reflect inStock=true
      const inStockBadges = screen.getAllByText('In Stock');
      expect(inStockBadges).toHaveLength(3); // all three now in stock
    });
  });

  it('shows empty state when no products exist', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<ProductInventoryTable />);

    await waitFor(() => {
      expect(screen.getByText('No products found')).toBeInTheDocument();
    });
  });

  it('shows error toast on fetch failure', async () => {
    const toast = require('react-hot-toast').default;

    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false });

    render(<ProductInventoryTable />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to fetch products');
    });
  });
});
