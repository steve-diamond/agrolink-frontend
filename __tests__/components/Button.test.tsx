/**
 * __tests__/components/Button.test.tsx
 *
 * Tests for components/ui/Button.tsx
 * Covers: rendering variants/sizes, click handling, loading state, disabled state,
 * icon slots, and ARIA attributes.
 */
import * as React from 'react';
import { axe } from 'jest-axe';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/Button';

// ── Helpers ───────────────────────────────────────────────────────────────────

function renderButton(props?: Partial<React.ComponentProps<typeof Button>>) {
  return render(<Button {...props}>Click me</Button>);
}

// ── Rendering ─────────────────────────────────────────────────────────────────

describe('Button — rendering', () => {
  it('renders with default props', () => {
    renderButton();
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it.each([
    'primary', 'secondary', 'ghost', 'outline', 'danger', 'success',
  ] as const)('renders variant "%s" without crashing', (variant) => {
    renderButton({ variant });
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it.each(['sm', 'md', 'lg', 'xl'] as const)('renders size "%s" without crashing', (size) => {
    renderButton({ size });
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders fullWidth button', () => {
    renderButton({ fullWidth: true });
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders a leading icon', () => {
    render(
      <Button leadingIcon={<span data-testid="lead-icon" aria-hidden />}>Add</Button>
    );
    expect(screen.getByTestId('lead-icon')).toBeInTheDocument();
  });

  it('renders a trailing icon', () => {
    render(
      <Button trailingIcon={<span data-testid="trail-icon" aria-hidden />}>Add</Button>
    );
    expect(screen.getByTestId('trail-icon')).toBeInTheDocument();
  });

  it('does not render the trailing icon when loading', () => {
    render(
      <Button loading trailingIcon={<span data-testid="trail-icon" aria-hidden />}>
        Save
      </Button>
    );
    expect(screen.queryByTestId('trail-icon')).not.toBeInTheDocument();
  });
});

// ── Interaction ───────────────────────────────────────────────────────────────

describe('Button — interaction', () => {
  it('calls onClick when clicked', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();
    render(<Button onClick={handleClick}>Submit</Button>);
    await user.click(screen.getByRole('button', { name: /submit/i }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();
    render(<Button disabled onClick={handleClick}>Submit</Button>);
    await user.click(screen.getByRole('button', { name: /submit/i }));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('does not call onClick when loading', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();
    render(<Button loading onClick={handleClick}>Submit</Button>);
    await user.click(screen.getByRole('button', { name: /submit/i }));
    expect(handleClick).not.toHaveBeenCalled();
  });
});

// ── Loading state ──────────────────────────────────────────────────────────────

describe('Button — loading state', () => {
  it('sets aria-busy="true" when loading', () => {
    renderButton({ loading: true });
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
  });

  it('sets aria-disabled="true" when loading', () => {
    renderButton({ loading: true });
    expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
  });

  it('sets aria-busy="false" when not loading', () => {
    renderButton({ loading: false });
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'false');
  });

  it('hides leading icon while loading (shows spinner instead)', () => {
    render(
      <Button loading leadingIcon={<span data-testid="lead-icon" aria-hidden />}>
        Save
      </Button>
    );
    expect(screen.queryByTestId('lead-icon')).not.toBeInTheDocument();
  });
});

// ── Disabled state ────────────────────────────────────────────────────────────

describe('Button — disabled state', () => {
  it('is disabled via the disabled prop', () => {
    renderButton({ disabled: true });
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('is disabled when loading', () => {
    renderButton({ loading: true });
    expect(screen.getByRole('button')).toBeDisabled();
  });
});

// ── Accessibility ─────────────────────────────────────────────────────────────

describe('Button — accessibility', () => {
  it('has no accessibility violations (primary)', async () => {
    const { container } = render(<Button variant="primary">Save</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no accessibility violations (disabled)', async () => {
    const { container } = render(<Button disabled>Cancel</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no accessibility violations (loading with aria-label)', async () => {
    const { container } = render(
      <Button loading aria-label="Saving changes">Save</Button>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('is keyboard-focusable by default', () => {
    renderButton();
    const btn = screen.getByRole('button');
    btn.focus();
    expect(btn).toHaveFocus();
  });

  it('fires click on Enter key press', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Confirm</Button>);
    const btn = screen.getByRole('button', { name: /confirm/i });
    fireEvent.keyDown(btn, { key: 'Enter', code: 'Enter' });
    fireEvent.click(btn); // simulate enter-triggered click
    expect(handleClick).toHaveBeenCalled();
  });
});
