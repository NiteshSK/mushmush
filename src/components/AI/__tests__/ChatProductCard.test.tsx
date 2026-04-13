import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ChatProductCard, { ChatProduct } from '../ChatProductCard';

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

describe('ChatProductCard', () => {
  const mockOnBuy = jest.fn();

  beforeEach(() => {
    mockOnBuy.mockClear();
  });

  it('renders product title, price, and rating', () => {
    render(<ChatProductCard product={mockProduct} onBuy={mockOnBuy} />);

    expect(screen.getByText('Premium Oyster Mushroom')).toBeInTheDocument();
    expect(screen.getByText('₹350')).toBeInTheDocument();
    expect(screen.getByText('4.5')).toBeInTheDocument();
    expect(screen.getByText('200g')).toBeInTheDocument();
  });

  it('renders Buy button for in-stock products', () => {
    render(<ChatProductCard product={mockProduct} onBuy={mockOnBuy} />);

    const buyButton = screen.getByText('Buy');
    expect(buyButton).toBeInTheDocument();
  });

  it('calls onBuy with the product when Buy is clicked', () => {
    render(<ChatProductCard product={mockProduct} onBuy={mockOnBuy} />);

    fireEvent.click(screen.getByText('Buy'));
    expect(mockOnBuy).toHaveBeenCalledWith(mockProduct);
    expect(mockOnBuy).toHaveBeenCalledTimes(1);
  });

  it('shows discount info when product has a discount', () => {
    render(<ChatProductCard product={discountedProduct} onBuy={mockOnBuy} />);

    expect(screen.getByText('₹280')).toBeInTheDocument();
    expect(screen.getByText('₹350')).toBeInTheDocument();
    expect(screen.getByText('20% off')).toBeInTheDocument();
  });

  it('shows "Sold out" for out-of-stock products', () => {
    render(<ChatProductCard product={outOfStockProduct} onBuy={mockOnBuy} />);

    expect(screen.getByText('Sold out')).toBeInTheDocument();
    expect(screen.queryByText('Buy')).not.toBeInTheDocument();
  });

  it('does not call onBuy for out-of-stock products', () => {
    render(<ChatProductCard product={outOfStockProduct} onBuy={mockOnBuy} />);

    // No buy button to click
    expect(mockOnBuy).not.toHaveBeenCalled();
  });

  it('renders product image from thumbnails', () => {
    render(<ChatProductCard product={mockProduct} onBuy={mockOnBuy} />);

    const img = screen.getByAltText('Premium Oyster Mushroom');
    expect(img).toHaveAttribute('src', '/images/oyster-thumb.jpg');
  });

  it('hides rating when averageRating is 0', () => {
    const noRatingProduct = { ...mockProduct, averageRating: 0 };
    render(<ChatProductCard product={noRatingProduct} onBuy={mockOnBuy} />);

    expect(screen.queryByText('0.0')).not.toBeInTheDocument();
  });
});
