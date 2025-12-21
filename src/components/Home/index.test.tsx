import { render, screen } from '@testing-library/react';
import Home from './index';

// Mock child components to avoid complex dependency issues during integration testing
jest.mock('./Hero', () => () => <div data-testid="hero">Hero Component</div>);
jest.mock('./Categories', () => () => <div data-testid="categories">Categories Component</div>);
jest.mock('./NewArrivals', () => () => <div data-testid="new-arrivals">New Arrivals Component</div>);
jest.mock('./PromoBanner', () => () => <div data-testid="promo-banner">Promo Banner Component</div>);
jest.mock('./BestSeller', () => () => <div data-testid="best-seller">Best Seller Component</div>);
jest.mock('./Countdown', () => () => <div data-testid="countdown">Countdown Component</div>);
jest.mock('../Common/Newsletter', () => () => <div data-testid="newsletter">Newsletter Component</div>);
jest.mock('./RecentlyViewed', () => () => <div data-testid="recently-viewed">Recently Viewed Component</div>);
jest.mock('./WishlistSection', () => () => <div data-testid="wishlist-section">Wishlist Section Component</div>);
jest.mock('./FAQ', () => () => <div data-testid="faq">FAQ Component</div>);

describe('Home Page Integration', () => {
    it('renders all main sections', () => {
        render(<Home />);

        expect(screen.getByTestId('hero')).toBeInTheDocument();
        expect(screen.getByTestId('promo-banner')).toBeInTheDocument();
        expect(screen.getByTestId('best-seller')).toBeInTheDocument();
        expect(screen.getByTestId('categories')).toBeInTheDocument();
        expect(screen.getByTestId('recently-viewed')).toBeInTheDocument();
        expect(screen.getByTestId('wishlist-section')).toBeInTheDocument();
        expect(screen.getByTestId('faq')).toBeInTheDocument();
        expect(screen.getByTestId('newsletter')).toBeInTheDocument();
    });
});
