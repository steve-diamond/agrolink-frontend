/**
 * __tests__/accessibility/a11y.test.tsx
 *
 * Standalone accessibility audit for all key UI components using jest-axe.
 * Each describe block loads a component in a realistic state and checks for
 * zero axe violations.
 */
import * as React from 'react';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';

// ── Button variants ───────────────────────────────────────────────────────────

describe('Accessibility — Button', () => {
  const variants = ['primary', 'secondary', 'ghost', 'outline', 'danger', 'success'] as const;

  it.each(variants)('variant "%s" has no violations', async (variant) => {
    const { container } = render(<Button variant={variant}>Action</Button>);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('disabled button has no violations', async () => {
    const { container } = render(<Button disabled>Disabled</Button>);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('loading button with aria-label has no violations', async () => {
    const { container } = render(
      <Button loading aria-label="Submitting form">Submit</Button>
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('button with icon has no violations when icon is aria-hidden', async () => {
    const { container } = render(
      <Button leadingIcon={<svg aria-hidden focusable="false" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" /></svg>}>
        Add Product
      </Button>
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('icon-only button has no violations when aria-label is set', async () => {
    const { container } = render(
      <Button aria-label="Delete item">
        <svg aria-hidden focusable="false" viewBox="0 0 20 20"><path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="2"/></svg>
      </Button>
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

// ── Input variants ────────────────────────────────────────────────────────────

describe('Accessibility — Input', () => {
  it('plain input with label has no violations', async () => {
    const { container } = render(<Input label="Farm Name" id="farmName" />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('required input has no violations', async () => {
    const { container } = render(
      <Input label="Email Address" id="email" type="email" required />
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('input with error has no violations', async () => {
    const { container } = render(
      <Input
        label="Email Address"
        id="email-error"
        type="email"
        error="Please enter a valid email address"
      />
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('input with helper text has no violations', async () => {
    const { container } = render(
      <Input
        label="Phone Number"
        id="phone"
        type="tel"
        helperText="Include your country code, e.g. +234"
      />
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('disabled input has no violations', async () => {
    const { container } = render(
      <Input label="Read-only Field" id="readonly" disabled value="Fixed value" onChange={() => {}} />
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('password input has no violations', async () => {
    const { container } = render(
      <Input label="Password" id="password" type="password" />
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

// ── Form structure ────────────────────────────────────────────────────────────

describe('Accessibility — Form', () => {
  it('complete form has no violations', async () => {
    const { container } = render(
      <form noValidate aria-label="Contact form">
        <Input label="Full Name" id="fullName" required />
        <Input label="Email" id="contactEmail" type="email" required />
        <Input label="Phone" id="contactPhone" type="tel" />
        <div>
          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            name="message"
            rows={4}
            className="w-full rounded border p-2"
          />
        </div>
        <Button type="submit" variant="primary">Send Message</Button>
      </form>
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('form with validation errors has no violations', async () => {
    const { container } = render(
      <form noValidate aria-label="Registration form">
        <Input
          label="Email"
          id="regEmail"
          type="email"
          error="Email is required"
          required
        />
        <Input
          label="Password"
          id="regPassword"
          type="password"
          error="Password must be at least 8 characters"
          required
        />
        <Button type="submit">Register</Button>
      </form>
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

// ── Badge ─────────────────────────────────────────────────────────────────────

describe('Accessibility — Badge', () => {
  it('renders badge without violations', async () => {
    const { container } = render(<Badge>New</Badge>);
    expect(await axe(container)).toHaveNoViolations();
  });
});

// ── Card ──────────────────────────────────────────────────────────────────────

describe('Accessibility — Card', () => {
  it('renders card with heading without violations', async () => {
    const { container } = render(
      <Card>
        <h2>Product Summary</h2>
        <p>Premium Maize — N15,000 per bag</p>
        <Button variant="primary">Buy Now</Button>
      </Card>
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

// ── Alert ─────────────────────────────────────────────────────────────────────

describe('Accessibility — Alert', () => {
  it('renders alert without violations', async () => {
    const { container } = render(
      <Alert>Your order has been placed successfully.</Alert>
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

// ── Navigation / landmark regions ─────────────────────────────────────────────

describe('Accessibility — Page structure', () => {
  it('page with main landmark and headings has no violations', async () => {
    const { container } = render(
      <div>
        <header>
          <nav aria-label="Main navigation">
            <a href="/">Home</a>
            <a href="/marketplace">Marketplace</a>
            <a href="/dashboard">Dashboard</a>
          </nav>
        </header>
        <main>
          <h1>Farmer Dashboard</h1>
          <section aria-label="Key metrics">
            <h2>Wallet Balance</h2>
            <p>N150,500</p>
          </section>
          <section aria-label="Recent orders">
            <h2>Recent Orders</h2>
            <p>No orders yet.</p>
          </section>
        </main>
        <footer>
          <p>© 2024 DosAgrolink</p>
        </footer>
      </div>
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('data table has no violations when properly labelled', async () => {
    const { container } = render(
      <table aria-label="Recent transactions">
        <thead>
          <tr>
            <th scope="col">Order ID</th>
            <th scope="col">Status</th>
            <th scope="col">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>order-1</td>
            <td>Pending</td>
            <td>N25,000</td>
          </tr>
          <tr>
            <td>order-2</td>
            <td>Delivered</td>
            <td>N48,000</td>
          </tr>
        </tbody>
      </table>
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('modal dialog has no violations when labelled and focusable', async () => {
    const { container } = render(
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-desc"
      >
        <h2 id="dialog-title">Confirm Order</h2>
        <p id="dialog-desc">Are you sure you want to place this order?</p>
        <Button variant="primary">Confirm</Button>
        <Button variant="ghost">Cancel</Button>
      </div>
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

// ── Colour contrast requirements (verified via component props) ───────────────

describe('Accessibility — Interactive controls', () => {
  it('search input group has no violations', async () => {
    const { container } = render(
      <div role="search">
        <label htmlFor="product-search">Search products</label>
        <input
          id="product-search"
          type="search"
          name="search"
          placeholder="e.g. maize, cassava…"
          aria-label="Search products"
        />
        <button type="submit">Search</button>
      </div>
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('checkbox group has no violations', async () => {
    const { container } = render(
      <fieldset>
        <legend>Filter by category</legend>
        <label>
          <input type="checkbox" name="category" value="grains" /> Grains
        </label>
        <label>
          <input type="checkbox" name="category" value="vegetables" /> Vegetables
        </label>
        <label>
          <input type="checkbox" name="category" value="fruits" /> Fruits
        </label>
      </fieldset>
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('radio group has no violations', async () => {
    const { container } = render(
      <fieldset>
        <legend>Payment method</legend>
        <label>
          <input type="radio" name="payment" value="bank" /> Bank Transfer
        </label>
        <label>
          <input type="radio" name="payment" value="card" /> Card
        </label>
        <label>
          <input type="radio" name="payment" value="ussd" /> USSD
        </label>
      </fieldset>
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
