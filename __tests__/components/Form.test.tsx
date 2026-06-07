/**
 * __tests__/components/Form.test.tsx
 *
 * Tests for components/ui/Input.tsx used inside a react-hook-form form.
 * Covers: rendering, label association, error state, validation, submission.
 */
import * as React from 'react';
import { axe } from 'jest-axe';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
type LoginForm = z.infer<typeof loginSchema>;

// ── Standalone Input ──────────────────────────────────────────────────────────

describe('Input — rendering', () => {
  it('renders with a visible label', () => {
    render(<Input label="Farm Name" id="farmName" />);
    expect(screen.getByLabelText(/farm name/i)).toBeInTheDocument();
  });

  it('renders helper text', () => {
    render(<Input label="Email" id="email" helperText="We'll never share your email." />);
    expect(screen.getByText(/we'll never share/i)).toBeInTheDocument();
  });

  it('shows error message when error prop is set', () => {
    render(<Input label="Email" id="email" error="Email is required" />);
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
  });

  it('sets aria-invalid when error is present', () => {
    render(<Input label="Email" id="email" error="Required" />);
    expect(screen.getByRole('textbox', { name: /email/i })).toHaveAttribute(
      'aria-invalid',
      'true'
    );
  });

  it('does NOT set aria-invalid when no error', () => {
    render(<Input label="Email" id="email" />);
    expect(screen.getByRole('textbox', { name: /email/i })).toHaveAttribute(
      'aria-invalid',
      'false'
    );
  });

  it('renders as disabled', () => {
    render(<Input label="Username" id="username" disabled />);
    expect(screen.getByRole('textbox', { name: /username/i })).toBeDisabled();
  });

  it('renders as required with visual indicator', () => {
    render(<Input label="Phone" id="phone" required />);
    const input = screen.getByRole('textbox', { name: /phone/i });
    expect(input).toHaveAttribute('aria-required', 'true');
  });

  it.each(['sm', 'md', 'lg'] as const)('renders size "%s" without crashing', (size) => {
    render(<Input label="Field" id="field" size={size} />);
    expect(screen.getByRole('textbox', { name: /field/i })).toBeInTheDocument();
  });
});

describe('Input — interaction', () => {
  it('accepts typed input', async () => {
    const user = userEvent.setup();
    render(<Input label="Search" id="search" />);
    const input = screen.getByRole('textbox', { name: /search/i });
    await user.type(input, 'maize');
    expect(input).toHaveValue('maize');
  });

  it('calls onChange with each keystroke', async () => {
    const handleChange = jest.fn();
    const user = userEvent.setup();
    render(<Input label="Name" id="name" onChange={handleChange} />);
    await user.type(screen.getByRole('textbox'), 'abc');
    expect(handleChange).toHaveBeenCalledTimes(3);
  });

  it('does not accept input when disabled', async () => {
    const user = userEvent.setup();
    render(<Input label="Name" id="name" disabled />);
    const input = screen.getByRole('textbox');
    await user.type(input, 'ignored');
    expect(input).toHaveValue('');
  });
});

// ── Form integration (react-hook-form + zod) ──────────────────────────────────

function LoginForm({ onSubmit }: { onSubmit: (data: LoginForm) => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Input
        label="Email"
        id="email"
        type="email"
        error={errors.email?.message}
        {...register('email')}
      />
      <Input
        label="Password"
        id="password"
        type="password"
        error={errors.password?.message}
        {...register('password')}
      />
      <Button type="submit" loading={isSubmitting}>
        Sign In
      </Button>
    </form>
  );
}

describe('Form — validation and submission', () => {
  it('renders the form fields', () => {
    render(<LoginForm onSubmit={jest.fn()} />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('shows validation errors on empty submit', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSubmit={jest.fn()} />);
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
      expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
    });
  });

  it('shows email validation error for invalid email', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSubmit={jest.fn()} />);
    await user.type(screen.getByLabelText(/email/i), 'not-an-email');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
    });
  });

  it('shows password too short error', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSubmit={jest.fn()} />);
    await user.type(screen.getByLabelText(/email/i), 'user@example.com');
    await user.type(screen.getByLabelText(/password/i), 'short');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
    });
  });

  it('calls onSubmit with valid form data', async () => {
    const handleSubmit = jest.fn();
    const user = userEvent.setup();
    render(<LoginForm onSubmit={handleSubmit} />);
    await user.type(screen.getByLabelText(/email/i), 'farmer@agrolink.ng');
    await user.type(screen.getByLabelText(/password/i), 'securePassword123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith(
        { email: 'farmer@agrolink.ng', password: 'securePassword123' },
        expect.anything()
      );
    });
  });

  it('does not call onSubmit when validation fails', async () => {
    const handleSubmit = jest.fn();
    const user = userEvent.setup();
    render(<LoginForm onSubmit={handleSubmit} />);
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });
    expect(handleSubmit).not.toHaveBeenCalled();
  });
});

// ── Accessibility ─────────────────────────────────────────────────────────────

describe('Input — accessibility', () => {
  it('has no violations for standard input', async () => {
    const { container } = render(
      <Input label="Farm Name" id="farmName" />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no violations for input with error', async () => {
    const { container } = render(
      <Input label="Email" id="email" error="Invalid email" />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no violations for required input', async () => {
    const { container } = render(
      <Input label="Phone" id="phone" required />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no violations for the full login form', async () => {
    const { container } = render(<LoginForm onSubmit={jest.fn()} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
