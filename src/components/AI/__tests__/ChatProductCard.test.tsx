import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import cartReducer from '@/redux/features/cart-slice';
import ChatProductCard, { ChatProduct } from '../ChatProductCard';

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

const mockProduct: ChatProduct = {
  id: 1,
  title: 'Premium Oyster Mushroom',
  slug: 'premium-oyster-mushroom',
  price: 350,
  discountedPrice: null,
  discountPercentage: 0,
  hasDiscount: false,
  inStock: true,
  imgs: { thumbnails: ['/images/oyster-thumb.jpg'], previews: ['/images/oyster.jpg'] },
  averageRating: 4.5,
  reviewCount: 12,
  measurementValue: 200,
  measurementType: 'g',
};

const discountedProduct: ChatProduct = {
  ...mockProduct,
  id: 2,
  title: 'Shiitake Mushroom Dried',
  discountedPrice: 280,
  discountPercentage: 20,
  hasDiscount: true,
};

const outOfStockProduct: ChatProduct = {
  ...mockProduct,
  id: 3,
  title: 'Reishi Extract Powder',
  inStock: false,
};

const renderCard = (product: ChatProduct, onBuy: jest.Mock) => {
  const store = configureStore({ reducer: { cartReducer } });
  const view = render(<Provider store={store}><ChatProductCard product={product} onBuy={onBuy} /></Provider>);
  return { store, ...view };
};

describe('ChatProductCard', () => {
  const mockOnBuy = jest.fn();

  beforeEach(() => {
    mockOnBuy.mockClear();
  });

  it('renders product title, price, and rating', () => {
    renderCard(mockProduct, mockOnBuy);

    expect(screen.getByRole('heading', { name: 'Premium Oyster Mushroom' })).toBeInTheDocument();
    expect(screen.getByText('₹350')).toBeInTheDocument();
    expect(screen.getByText('4.5')).toBeInTheDocument();
    expect(screen.getByText('200 g')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Premium Oyster Mushroom' })).toHaveAttribute('href', '/shop-details/premium-oyster-mushroom');
  });

  it('renders Add to bag and Buy now for in-stock products', () => {
    renderCard(mockProduct, mockOnBuy);

    expect(screen.getByRole('button', { name: 'Add Premium Oyster Mushroom to bag' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Buy now Premium Oyster Mushroom' })).toBeInTheDocument();
  });

  it('adds a bag line with slug and stock limit, then caps the stepper at stock', () => {
    const { store } = renderCard({ ...mockProduct, stockQuantity: 2 }, mockOnBuy);

    fireEvent.click(screen.getByRole('button', { name: 'Add Premium Oyster Mushroom to bag' }));
    expect(store.getState().cartReducer.items[0]).toMatchObject({
      id: 1, slug: 'premium-oyster-mushroom', stockQuantity: 2, quantity: 1, price: 350,
    });
    fireEvent.click(screen.getByRole('button', { name: 'Add one Premium Oyster Mushroom' }));
    expect(store.getState().cartReducer.items[0].quantity).toBe(2);
    expect(screen.getByRole('button', { name: 'Add one Premium Oyster Mushroom' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Remove one Premium Oyster Mushroom' }));
    fireEvent.click(screen.getByRole('button', { name: 'Remove one Premium Oyster Mushroom' }));
    expect(store.getState().cartReducer.items).toHaveLength(0);
  });

  it('keeps the discounted price on the bag line', () => {
    const { store } = renderCard(discountedProduct, mockOnBuy);

    fireEvent.click(screen.getByRole('button', { name: 'Add Shiitake Mushroom Dried to bag' }));
    expect(store.getState().cartReducer.items[0]).toMatchObject({ price: 350, discountedPrice: 280 });
  });

  it('calls onBuy with the product when Buy now is clicked', () => {
    renderCard(mockProduct, mockOnBuy);

    fireEvent.click(screen.getByRole('button', { name: 'Buy now Premium Oyster Mushroom' }));
    expect(mockOnBuy).toHaveBeenCalledWith(mockProduct);
    expect(mockOnBuy).toHaveBeenCalledTimes(1);
  });

  it('shows discount info when product has a discount', () => {
    renderCard(discountedProduct, mockOnBuy);

    expect(screen.getByText('₹280')).toBeInTheDocument();
    expect(screen.getByText('₹350')).toBeInTheDocument();
    expect(screen.getByText('20% off')).toBeInTheDocument();
  });

  it('shows "Sold out" for out-of-stock products', () => {
    renderCard(outOfStockProduct, mockOnBuy);

    expect(screen.getByRole('button', { name: 'Reishi Extract Powder sold out' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: /Buy now/ })).not.toBeInTheDocument();
  });

  it('does not call onBuy for out-of-stock products', () => {
    renderCard(outOfStockProduct, mockOnBuy);

    // No buy button to click
    expect(mockOnBuy).not.toHaveBeenCalled();
  });

  it('renders product image from thumbnails', () => {
    const { container } = renderCard(mockProduct, mockOnBuy);

    // The title names the product, so the photo is decorative.
    expect(container.querySelector('img')).toHaveAttribute('src', '/images/oyster-thumb.jpg');
    expect(container.querySelector('img')).toHaveAttribute('alt', '');
  });

  it('hides rating when averageRating is 0', () => {
    const noRatingProduct = { ...mockProduct, averageRating: 0 };
    renderCard(noRatingProduct, mockOnBuy);

    expect(screen.queryByText('0.0')).not.toBeInTheDocument();
  });
});
