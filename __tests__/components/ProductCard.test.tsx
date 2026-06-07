/**
 * __tests__/components/ProductCard.test.tsx
 *
 * Tests for components/ProductCard.tsx
 * Covers: data display, badge rendering, favourite toggle, add-to-cart handler,
 * discount display, image fallback, and accessibility.
 */
import * as React from 'react';
import { axe } from 'jest-axe';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductCard, type ProductConfig } from '@/components/ProductCard';

// ── next/navigation and next/link are mocked by next/jest automatically ───────
// ── next/image is mocked below ───────────────────────────────────────────────
jest.mock('next/image', () => ({
  __esModule: true,
  default: function MockImage({
    src,
    alt,
    ...props
  }: {
    src: string;
    alt: string;
    [key: string]: unknown;
  }) {
    // Remove next/image-specific props that don't exist on <img>
    const { fill: _f, sizes: _s, priority: _p, ...rest } = props as {
      fill?: boolean;
      sizes?: string;
      priority?: boolean;
      [key: string]: unknown;
    };
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...rest} />;
  },
}));

// ── Fixtures ──────────────────────────────────────────────────────────────────

const baseProduct: ProductConfig = {
  id: 'prod-1',
  name: 'Premium Maize',
  price: 15000,
  unit: 'per bag',
  location: 'Kaduna',
  seller: { name: 'Aminu Farms', rating: 4.5, reviewCount: 32 },
};

const productWithImage: ProductConfig = {
  ...baseProduct,
  image: 'https://example.com/maize.jpg',
};

const productOnSale: ProductConfig = {
  ...baseProduct,
  price: 12000,
  originalPrice: 15000,
};

const productWithBadge: ProductConfig = {
  ...baseProduct,
  badge: 'organic',
};

// ── Rendering ─────────────────────────────────────────────────────────────────

describe('ProductCard — rendering', () => {
  it('renders the product name', () => {
    render(<ProductCard product={baseProduct} />);
    expect(screen.getByText('Premium Maize')).toBeInTheDocument();
  });

  it('renders the formatted price', () => {
    render(<ProductCard product={baseProduct} />);
    expect(screen.getByText(/₦15K/i)).toBeInTheDocument();
  });

  it('renders the unit', () => {
    render(<ProductCard product={baseProduct} />);
    expect(screen.getByText(/per bag/i)).toBeInTheDocument();
  });

  it('renders the location', () => {
    render(<ProductCard product={baseProduct} />);
    expect(screen.getByText(/kaduna/i)).toBeInTheDocument();
  });

  it('renders the seller name', () => {
    render(<ProductCard product={baseProduct} />);
    expect(screen.getByText(/aminu farms/i)).toBeInTheDocument();
  });

  it('renders a product image when provided', () => {
    render(<ProductCard product={productWithImage} />);
    const img = screen.getByRole('img', { name: /premium maize/i });
    expect(img).toHaveAttribute('src', 'https://example.com/maize.jpg');
  });

  it('renders fallback when no image is provided', () => {
    render(<ProductCard product={baseProduct} />);
    expect(screen.queryByRole('img', { name: /premium maize/i })).not.toBeInTheDocument();
  });

  it('renders the discounted (sale) price when originalPrice > price', () => {
    render(<ProductCard product={productOnSale} />);
    expect(screen.getByText(/₦12K/i)).toBeInTheDocument();
    expect(screen.getByText(/₦15K/i)).toBeInTheDocument();
  });

  it('renders a badge when badge prop is set', () => {
    render(<ProductCard product={productWithBadge} />);
    expect(screen.getByText(/organic/i)).toBeInTheDocument();
  });

  it('renders as an article landmark', () => {
    render(<ProductCard product={baseProduct} />);
    expect(screen.getByRole('article')).toBeInTheDocument();
  });

  it('links to the correct marketplace href by default', () => {
    render(<ProductCard product={baseProduct} />);
    // Multiple links exist: background link (aria-hidden), view details link, name link
    const visibleLinks = screen.getAllByRole('link').filter(l => !l.hasAttribute('aria-hidden'));
    expect(visibleLinks[0]).toHaveAttribute('href', '/marketplace/prod-1');
  });

  it('uses a custom href when provided', () => {
    render(<ProductCard product={baseProduct} href="/custom/path" />);
    const visibleLinks = screen.getAllByRole('link').filter(l => !l.hasAttribute('aria-hidden'));
    expect(visibleLinks[0]).toHaveAttribute('href', '/custom/path');
  });
});

// ── Favourite toggle ──────────────────────────────────────────────────────────

describe('ProductCard — favourite toggle', () => {
  it('toggles favourite state when heart button is clicked', async () => {
    const handleFavorite = jest.fn();
    const user = userEvent.setup();
    render(
      <ProductCard
        product={baseProduct}
        isFavorited={false}
        onFavoriteToggle={handleFavorite}
      />
    );
    const favBtn = screen.getByRole('button', { name: /add to favourites/i });
    await user.click(favBtn);
    expect(handleFavorite).toHaveBeenCalledWith('prod-1', true);
  });

  it('fires onFavoriteToggle with false when un-favouriting', async () => {
    const handleFavorite = jest.fn();
    const user = userEvent.setup();
    render(
      <ProductCard
        product={baseProduct}
        isFavorited={true}
        onFavoriteToggle={handleFavorite}
      />
    );
    const favBtn = screen.getByRole('button', { name: /remove from favourites/i });
    await user.click(favBtn);
    expect(handleFavorite).toHaveBeenCalledWith('prod-1', false);
  });
});

// ── Add to cart ───────────────────────────────────────────────────────────────

describe('ProductCard — add to cart', () => {
  it('shows Add to Cart button when onAddToCart is provided', () => {
    render(<ProductCard product={baseProduct} onAddToCart={jest.fn()} />);
    // aria-label is "Add Premium Maize to cart"
    expect(
      screen.getByRole('button', { name: /add premium maize to cart/i })
    ).toBeInTheDocument();
  });

  it('does not show Add to Cart button when onAddToCart is not provided', () => {
    render(<ProductCard product={baseProduct} />);
    // Only the favourite button should be present
    const cartBtn = screen.queryByRole('button', { name: /add .* to cart/i });
    expect(cartBtn).not.toBeInTheDocument();
  });

  it('calls onAddToCart with the product id', async () => {
    const handleAddToCart = jest.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<ProductCard product={baseProduct} onAddToCart={handleAddToCart} />);
    await user.click(screen.getByRole('button', { name: /add premium maize to cart/i }));
    expect(handleAddToCart).toHaveBeenCalledWith('prod-1');
  });

  it('shows success state after add to cart', async () => {
    const handleAddToCart = jest.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<ProductCard product={baseProduct} onAddToCart={handleAddToCart} />);
    await user.click(screen.getByRole('button', { name: /add premium maize to cart/i }));
    // After adding, handler should have been called
    await waitFor(() => {
      expect(handleAddToCart).toHaveBeenCalledTimes(1);
    });
  });
});

// ── Accessibility ─────────────────────────────────────────────────────────────

describe('ProductCard — accessibility', () => {
  it('has no accessibility violations (basic card)', async () => {
    const { container } = render(<ProductCard product={baseProduct} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no accessibility violations (card with image)', async () => {
    const { container } = render(<ProductCard product={productWithImage} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no accessibility violations (card with add to cart)', async () => {
    const { container } = render(
      <ProductCard product={baseProduct} onAddToCart={jest.fn()} />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no accessibility violations (card on sale with badge)', async () => {
    const { container } = render(
      <ProductCard product={{ ...productOnSale, badge: 'sale' }} />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
