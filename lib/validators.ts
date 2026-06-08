import { ZodSchema, ZodError, z } from 'zod';

/**
 * Validates data against a Zod schema.
 * Throws a ZodError if validation fails (caught by handleError).
 */
export function validateBody<T>(schema: ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

// ─── Reusable schema primitives ────────────────────────────────────────────

export const Schemas = {
  // Auth
  register: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Invalid email address').toLowerCase(),
    password: z.string().min(8, 'Password must be at least 8 characters').max(100),
    role: z.enum(['farmer', 'buyer', 'cooperative', 'logistics', 'warehouse', 'investor', 'supplier', 'agent']).default('buyer'),
    phone: z.string().regex(/^\+?[0-9\s\-()]{7,20}$/, 'Invalid phone number').optional(),
    organizationName: z.string().max(200).optional(),
    inviteCode: z.string().optional(),
  }),

  login: z.object({
    email: z.string().email('Invalid email address').toLowerCase(),
    password: z.string().min(1, 'Password is required'),
  }),

  forgotPassword: z.object({
    email: z.string().email('Invalid email address').toLowerCase(),
  }),

  resetPassword: z.object({
    token: z.string().min(1),
    password: z.string().min(8, 'Password must be at least 8 characters'),
  }),

  // OTP
  sendOtp: z.object({
    phone: z.string().regex(/^\+?[0-9]{10,15}$/, 'Invalid phone number'),
  }),

  verifyOtp: z.object({
    phone: z.string().regex(/^\+?[0-9]{10,15}$/, 'Invalid phone number'),
    otp: z.string().length(6, 'OTP must be 6 digits'),
  }),

  // Marketplace / Products
  createProduct: z.object({
    name: z.string().min(2).max(200),
    description: z.string().max(2000).optional(),
    price: z.number().positive('Price must be positive'),
    quantity: z.number().int().nonnegative(),
    unit: z.string().max(50).optional(),
    category: z.string().max(100).optional(),
    location: z.string().max(200).optional(),
    imageUrl: z.string().url().optional(),
  }),

  // Orders
  createOrder: z.object({
    products: z.array(z.object({
      productId: z.string().min(1),
      quantity: z.number().int().positive(),
    })).min(1, 'Order must have at least one product'),
  }),

  // Payment
  initializePayment: z.object({
    orderId: z.string().min(1),
    email: z.string().email(),
    callback_url: z.string().url().optional(),
  }),

  verifyPayment: z.object({
    reference: z.string().min(1),
  }),

  // Loan
  loanApplication: z.object({
    amount: z.number().positive().max(10_000_000),
    purpose: z.string().min(10).max(1000),
    repaymentMonths: z.number().int().min(1).max(36),
    farmSize: z.number().positive().optional(),
    cropType: z.string().max(100).optional(),
    collateral: z.string().max(500).optional(),
  }),

  // Insurance
  insuranceApplication: z.object({
    planId: z.string().min(1),
    farmSize: z.number().positive(),
    cropType: z.string().min(1),
    location: z.string().min(1),
    season: z.string().min(1),
    coverageAmount: z.number().positive(),
  }),

  // Logistics
  logisticsBooking: z.object({
    origin: z.string().min(2).max(200),
    destination: z.string().min(2).max(200),
    commodity: z.string().min(1).max(100),
    weightKg: z.number().positive(),
    pickupDate: z.string().datetime(),
    contactPhone: z.string().regex(/^\+?[0-9]{10,15}$/),
  }),

  // Warehouse
  warehouseBooking: z.object({
    warehouseId: z.string().optional(),
    commodity: z.string().min(1).max(100),
    quantityKg: z.number().positive(),
    durationDays: z.number().int().positive(),
    deliveryDate: z.string().datetime(),
  }),

  // Pagination
  pagination: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
} as const;

export type RegisterInput = z.infer<typeof Schemas.register>;
export type LoginInput = z.infer<typeof Schemas.login>;
export type CreateProductInput = z.infer<typeof Schemas.createProduct>;
export type CreateOrderInput = z.infer<typeof Schemas.createOrder>;
export type LoanApplicationInput = z.infer<typeof Schemas.loanApplication>;
export { ZodError };
