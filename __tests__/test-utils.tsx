/**
 * __tests__/test-utils.tsx
 *
 * Custom render function and shared helpers for all tests.
 * Wraps components with all necessary providers so individual tests don't
 * need to repeat boilerplate.
 */
import * as React from 'react';
import {
  render,
  type RenderOptions,
  type RenderResult,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/ui/Toast';

// ── Re-export everything from testing-library so tests import from one place ──
export * from '@testing-library/react';
export { userEvent };

// ── Mock router context ───────────────────────────────────────────────────────

export const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  pathname: '/',
  query: {},
  asPath: '/',
  route: '/',
  params: {},
  searchParams: new URLSearchParams(),
};

// ── Mock user data ────────────────────────────────────────────────────────────

export const mockFarmerUser = {
  _id: 'user-farmer-1',
  name: 'Emeka Okafor',
  email: 'emeka@farm.ng',
  role: 'farmer' as const,
  phone: '+2348012345678',
};

export const mockBuyerUser = {
  _id: 'user-buyer-1',
  name: 'Fatima Bello',
  email: 'fatima@trade.ng',
  role: 'buyer' as const,
  phone: '+2348087654321',
};

export const mockAdminUser = {
  _id: 'user-admin-1',
  name: 'Admin User',
  email: 'admin@agrolink.ng',
  role: 'admin' as const,
  phone: '+2348099999999',
};

// ── Test QueryClient factory ──────────────────────────────────────────────────

/** Creates a QueryClient optimised for tests: no retries, instant stale time. */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

// ── AllProviders wrapper ──────────────────────────────────────────────────────

interface AllProvidersProps {
  children: React.ReactNode;
  queryClient?: QueryClient;
}

function AllProviders({ children, queryClient }: AllProvidersProps) {
  const client = queryClient ?? createTestQueryClient();
  return (
    <QueryClientProvider client={client}>
      <ToastProvider>
        {children}
      </ToastProvider>
    </QueryClientProvider>
  );
}

// ── Custom render ─────────────────────────────────────────────────────────────

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
}

/**
 * Render a component inside all application providers.
 * Returns the standard testing-library result plus a `user` instance
 * pre-configured for event simulation.
 */
export function renderWithProviders(
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
): RenderResult & { user: ReturnType<typeof userEvent.setup> } {
  const { queryClient, ...renderOptions } = options;

  const user = userEvent.setup();

  const result = render(ui, {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <AllProviders queryClient={queryClient}>{children}</AllProviders>
    ),
    ...renderOptions,
  });

  return { ...result, user };
}

// ── Convenience aliases ───────────────────────────────────────────────────────

/** Short-hand: find a button by accessible name. */
export const findButton = (name: string | RegExp) =>
  screen.findByRole('button', { name });

/** Short-hand: get a button by accessible name. */
export const getButton = (name: string | RegExp) =>
  screen.getByRole('button', { name });

/** Short-hand: find a text field by label. */
export const findInput = (label: string | RegExp) =>
  screen.findByLabelText(label);

/** Short-hand: wait for a loading spinner to disappear. */
export const waitForLoadingToFinish = () =>
  waitFor(() => {
    const spinners = screen.queryAllByRole('status');
    expect(spinners).toHaveLength(0);
  });

/** Short-hand: get by test id scoped to an element. */
export const withinTestId = (testId: string) =>
  within(screen.getByTestId(testId));
