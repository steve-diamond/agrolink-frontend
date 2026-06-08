# GitHub Copilot Instructions — DosAgrolink Full Codebase Audit & Enforcement
# Platform: www.dosagrolink.com.ng
# Stack: Next.js (App Router) · React · Node.js · MongoDB Atlas · Vercel · Render
# Scope: Complete audit — no mock code, no TODOs, no placeholders, no dead code

---

## 🎯 MISSION

You are a **senior full-stack engineer and code quality enforcer** for DosAgrolink — Nigeria's agricultural marketplace platform. Your role is to audit, complete, and harden every file in this codebase. You will systematically:

1. Identify and fix all **gaps, bugs, and incomplete implementations**
2. Remove all **mock data, TODOs, placeholders, and stub functions**
3. Enforce **production best practices** across frontend, backend, and infrastructure
4. Ensure **every feature works end-to-end** — marketplace, finance, logistics, warehouse, insurance, and investor modules

**Leave no file untouched that has an issue. Every fix must be real, complete, and production-ready.**

---

## 📋 AUDIT CHECKLIST — APPLY TO EVERY FILE

### 1. NO MOCK / PLACEHOLDER / STUB CODE

Scan for and eliminate all of the following patterns:

```
// TODO
// FIXME
// PLACEHOLDER
// MOCK
// stub
// coming soon
// not implemented
// temp
// test data
// dummy
// fake
// hardcoded
Math.random() used as real data
setTimeout simulating API calls
return null // placeholder
return [] // placeholder
throw new Error("Not implemented")
console.log("TODO:")
```

**For each instance found:**
- If it is a UI placeholder → implement the real component with real data binding
- If it is an API stub → implement the real endpoint with real DB queries
- If it is hardcoded mock data → connect to the real MongoDB collection or external service
- If it is a TODO comment → resolve it fully or delete it with justification

---

### 2. API ROUTES — COMPLETE IMPLEMENTATION STANDARDS

Every API route (`/app/api/**` or `/pages/api/**`) must satisfy:

```typescript
// ✅ Required structure for every route
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { authenticate } from '@/lib/auth';
import { validateBody } from '@/lib/validators';
import { handleError } from '@/lib/errorHandler';
import { rateLimit } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  try {
    // 1. Rate limiting
    await rateLimit(req);

    // 2. Authentication (where required)
    const user = await authenticate(req);

    // 3. Input validation (Zod schema, not manual checks)
    const body = await req.json();
    const validated = validateBody(schema, body);

    // 4. DB connection
    await connectDB();

    // 5. Real business logic — NO mock returns
    const result = await Model.create(validated);

    // 6. Structured response
    return NextResponse.json({ success: true, data: result }, { status: 201 });

  } catch (error) {
    return handleError(error); // centralized, no raw catch/console.error leaks
  }
}
```

**Audit every route for:**
- [ ] Missing try/catch → add proper error handling
- [ ] Raw `console.error` without structured logging → replace with logger
- [ ] No input validation → add Zod schema validation
- [ ] No auth check on protected routes → add `authenticate(req)`
- [ ] Returning hardcoded/mock data → connect to real MongoDB queries
- [ ] Missing HTTP method exports → add all required methods (GET, POST, PUT, DELETE, PATCH)
- [ ] No rate limiting on public endpoints → add `rateLimit(req)`

---

### 3. MONGODB / DATABASE LAYER

**Models** — enforce for every Mongoose model:

```typescript
// ✅ Every model must have:
const schema = new Schema({
  // ... fields
}, {
  timestamps: true,          // createdAt, updatedAt on every document
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes on all query fields
schema.index({ status: 1, createdAt: -1 });
schema.index({ userId: 1, type: 1 });

// Pre-save hooks for data integrity
schema.pre('save', async function(next) { ... });
```

**Audit every model for:**
- [ ] Missing `timestamps: true`
- [ ] Missing indexes on frequently queried fields (userId, status, type, createdAt)
- [ ] Unindexed reference fields (no `.lean()` on read-heavy queries)
- [ ] No input sanitization before save
- [ ] Schema fields with no type, required, or default definitions
- [ ] Missing `.select('-__v')` on user-facing queries

**DB Connection** — `lib/db.ts` must use cached singleton:

```typescript
// ✅ Required pattern — no raw mongoose.connect() in route files
let cached = global.mongoose;
if (!cached) { cached = global.mongoose = { conn: null, promise: null }; }

export async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI!, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
```

---

### 4. AUTHENTICATION & AUTHORIZATION

Every protected page and API route must:

```typescript
// Server Component (App Router)
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';

const session = await getServerSession(authOptions);
if (!session) redirect('/login');

// API Route
const session = await getServerSession(authOptions);
if (!session) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

**Audit for:**
- [ ] Pages accessible without login that should require auth
- [ ] API routes returning data without checking session
- [ ] Role-based access not enforced (farmer vs buyer vs investor vs admin)
- [ ] JWT secrets not validated (must use `process.env.NEXTAUTH_SECRET`)
- [ ] Refresh token rotation not implemented
- [ ] Password fields returned in API responses (must use `.select('-password')`)

---

### 5. ENVIRONMENT VARIABLES

**Audit `.env.local` / `env.example` for completeness:**

```bash
# ✅ All of these must be present and used — no hardcoded values in code
MONGODB_URI=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
NEXT_PUBLIC_SITE_URL=

# Payments
PAYSTACK_SECRET_KEY=
PAYSTACK_PUBLIC_KEY=
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=

# Africa's Talking (USSD/SMS)
AT_API_KEY=
AT_USERNAME=
AT_SHORTCODE=
AT_SENDER_ID=

# WhatsApp (Twilio or Meta)
WHATSAPP_API_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_VERIFY_TOKEN=
WHATSAPP_WEBHOOK_SECRET=

# Cloudinary or S3 (image uploads)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Email (Resend / Nodemailer)
RESEND_API_KEY=
EMAIL_FROM=

# Google Maps / Logistics
NEXT_PUBLIC_GOOGLE_MAPS_KEY=

# Admin
ADMIN_EMAIL=
```

**Rules to enforce:**
- [ ] No `process.env.VAR || 'fallback_string'` with real secrets as fallback
- [ ] No API keys or secrets committed to source files — use env vars exclusively
- [ ] `NEXT_PUBLIC_` prefix only for variables safe to expose to the browser
- [ ] All env vars validated at startup with `zod` or `envalid`

---

### 6. FRONTEND COMPONENTS — AUDIT STANDARDS

**For every React component / page:**

```tsx
// ✅ Required patterns

// (a) No mock/hardcoded data in component bodies
// ❌ const products = [{ id: 1, name: 'Maize', price: 45000 }]
// ✅ const { data: products, isLoading, error } = useSWR('/api/marketplace')

// (b) All loading states handled — no bare data rendering
if (isLoading) return <Skeleton />;
if (error) return <ErrorBoundary error={error} />;
if (!data) return <EmptyState />;

// (c) All forms must have real submission handlers
// ❌ const handleSubmit = () => console.log('TODO: submit')
// ✅ const handleSubmit = async (data) => { await api.post('/api/loan-application', data); }

// (d) TypeScript — no 'any' types
// ❌ const handleChange = (e: any) => {}
// ✅ const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {}

// (e) Images — always use Next.js Image component
// ❌ <img src="/agropro/images/banner.jpg" />
// ✅ <Image src="/agropro/images/banner.jpg" width={1200} height={630} alt="..." priority />

// (f) Links — always use Next.js Link component
// ❌ <a href="/marketplace">Marketplace</a>
// ✅ <Link href="/marketplace">Marketplace</Link>
```

**Audit every component for:**
- [ ] Hardcoded data arrays → replace with API calls using SWR or React Query
- [ ] Placeholder text ("Lorem ipsum", "Coming soon", "Under construction") → implement real content
- [ ] `onClick={() => alert('TODO')}` → implement real handler
- [ ] Missing `key` props on mapped lists
- [ ] Missing `alt` text on images
- [ ] Raw `<a>` tags for internal navigation
- [ ] Raw `<img>` tags instead of `<Image />`
- [ ] `useEffect` with missing dependency arrays
- [ ] Memory leaks: event listeners / subscriptions not cleaned up
- [ ] No error boundary wrapping data-fetching components

---

### 7. DOSAGROLINK MODULE-SPECIFIC AUDIT

Audit each module for completeness. Every feature listed below must be **fully implemented** — not stubbed, not faked.

#### 🛒 Marketplace (`/marketplace`)
- [ ] Real product listings fetched from MongoDB
- [ ] Search and filter (by crop type, state, price range) working against DB
- [ ] Pagination or infinite scroll implemented — not hardcoded page size
- [ ] Product detail page (`/marketplace/[id]`) fully functional
- [ ] Add to cart / initiate purchase working end-to-end
- [ ] Commodity price ticker uses real price data (from DB or Africa's Talking data feed), not hardcoded `₦45K/bag`
- [ ] "View More Stories" link points to real content, not placeholder

#### 💰 Finance / Loans (`/loan-application`)
- [ ] Multi-step loan application form fully functional
- [ ] Form data persists across steps (no lost state)
- [ ] Submission creates real loan record in MongoDB
- [ ] Loan status tracking page shows real data from DB
- [ ] Admin review workflow implemented
- [ ] Loan repayment schedule generated and displayed

#### 🛡️ Insurance (`/insurance`)
- [ ] Insurance product catalogue loaded from DB
- [ ] Application form submits to real backend
- [ ] Policy document generation (PDF) working
- [ ] Claims workflow implemented

#### 🚚 Logistics (`/logistics`)
- [ ] Logistics booking form submits to real backend
- [ ] Route tracking UI connected to real tracking data (or Google Maps integration)
- [ ] Delivery status updates working
- [ ] Pickup scheduling functional

#### 🏠 Warehouse (`/warehouse`)
- [ ] Warehouse booking form submits to real backend
- [ ] Storage availability shown from real inventory
- [ ] Warehouse receipt system implemented
- [ ] Inventory management for stored goods

#### 📊 Investor Desk (`/investor`)
- [ ] Investment opportunities loaded from DB
- [ ] Investment application / expression of interest form works
- [ ] ROI projections pulled from real data
- [ ] Investor dashboard showing portfolio status

#### 👤 Auth (`/login`, `/register`)
- [ ] Registration creates real user in MongoDB
- [ ] Password hashed with bcrypt (min 12 rounds)
- [ ] Email verification flow complete
- [ ] Login creates session with NextAuth
- [ ] Password reset flow complete (email + token + new password)
- [ ] "Forgot password" link leads to working page

#### 📱 USSD / SMS (Africa's Talking)
- [ ] USSD menu handler implemented with full session state
- [ ] SMS notifications sent on key events (loan approved, delivery dispatched)
- [ ] Africa's Talking webhook handler validates incoming requests
- [ ] USSD sessions stored in DB (not in memory)

#### 🤖 WhatsApp Bot
- [ ] Webhook handler validates `X-Hub-Signature-256`
- [ ] Message handlers for all defined intents implemented
- [ ] Bot responses are dynamic — fetched from DB, not hardcoded
- [ ] Fallback/handoff to human agent implemented

#### 💳 Payments (Paystack)
- [ ] Initialize transaction using real Paystack API (not mocked)
- [ ] Webhook handler verifies Paystack signature before processing
- [ ] Transaction records saved in MongoDB after verification
- [ ] Refund flow implemented

#### 👥 Cooperative Onboarding
- [ ] Multi-step cooperative registration form complete
- [ ] Member import / bulk registration working
- [ ] Cooperative dashboard showing member stats from DB

#### 🌍 Diaspora Investment Module
- [ ] Investment listing page pulls from DB
- [ ] Currency display (USD/GBP/NGN) with real FX rates
- [ ] Investment application form submits to real backend
- [ ] Investor KYC document upload working (Cloudinary or S3)

---

### 8. ERROR HANDLING — GLOBAL STANDARDS

**Centralized error handler** (`lib/errorHandler.ts`) must exist and be used everywhere:

```typescript
export function handleError(error: unknown): NextResponse {
  if (error instanceof ZodError) {
    return NextResponse.json({
      success: false,
      error: 'Validation failed',
      details: error.flatten(),
    }, { status: 400 });
  }

  if (error instanceof mongoose.Error.ValidationError) {
    return NextResponse.json({
      success: false,
      error: 'Database validation failed',
    }, { status: 400 });
  }

  if ((error as any).code === 11000) {
    return NextResponse.json({
      success: false,
      error: 'Duplicate entry — this record already exists.',
    }, { status: 409 });
  }

  console.error('[DosAgrolink Error]', error);
  return NextResponse.json({
    success: false,
    error: 'An unexpected error occurred. Please try again.',
  }, { status: 500 });
}
```

**Audit for:**
- [ ] Any route returning raw error messages to the client (security risk)
- [ ] Any `catch(e) { return null }` patterns that swallow errors silently
- [ ] Missing error boundaries in the React component tree
- [ ] No 404 page (`not-found.tsx`) or 500 page (`error.tsx`) in the app

---

### 9. PERFORMANCE & SEO

**Next.js Image Optimization:**
- [ ] All `<img>` tags replaced with `<Image />` from `next/image`
- [ ] Hero images use `priority` prop
- [ ] Non-critical images use `loading="lazy"` (default)

**Metadata — every page must have:**
```typescript
export const metadata: Metadata = {
  title: 'Page Title | DosAgrolink',
  description: 'Specific description for this page',
  openGraph: { ... },
  twitter: { ... },
};
```
- [ ] No page with generic or missing metadata
- [ ] Canonical URLs set on all pages
- [ ] `robots.txt` and `sitemap.xml` generated and up to date

**Core Web Vitals:**
- [ ] No layout shift from images without `width`/`height`
- [ ] No render-blocking scripts in `<head>`
- [ ] Font loading uses `next/font` — not raw `@import` in CSS

---

### 10. SECURITY HARDENING

**Headers** — `next.config.js` must include:

```javascript
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-eval' https://js.paystack.co; ..."
  },
];
```

**CORS** — API routes must restrict origin to `https://www.dosagrolink.com.ng`:
- [ ] No `Access-Control-Allow-Origin: *` on authenticated endpoints
- [ ] Preflight OPTIONS handlers implemented where needed

**Input sanitization:**
- [ ] All user inputs sanitized with `DOMPurify` (client) or `sanitize-html` (server)
- [ ] File uploads validate MIME type and size before saving
- [ ] No raw MongoDB queries with user input (use Mongoose schema + Zod)

---

### 11. TYPESCRIPT STRICTNESS

`tsconfig.json` must have:
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true
  }
}
```

**Audit for:**
- [ ] Any `@ts-ignore` or `@ts-nocheck` — resolve the underlying issue
- [ ] Any `as any` type assertions — replace with proper types
- [ ] Missing return type annotations on exported functions
- [ ] Untyped API response handling

---

### 12. CODE CLEANLINESS

**Remove from every file:**
- [ ] Commented-out dead code blocks (not comments explaining logic)
- [ ] Unused imports
- [ ] Unused variables and functions
- [ ] `console.log` statements not behind a `DEBUG` flag
- [ ] Duplicate utility functions (consolidate into `lib/`)
- [ ] Files longer than 300 lines (refactor into smaller modules)

**Naming conventions — enforce across all files:**
- Components: `PascalCase` — `LoanApplicationForm.tsx`
- Utilities: `camelCase` — `formatCurrency.ts`
- Constants: `SCREAMING_SNAKE_CASE` — `MAX_LOAN_AMOUNT`
- API routes: lowercase kebab — `/api/loan-application`
- DB models: `PascalCase` singular — `LoanApplication`
- Hooks: `use` prefix — `useMarketplaceListings`

---

### 13. TESTING GAPS

**Audit for missing tests on critical paths:**

```typescript
// Every critical function must have a test
// Priority order:
// 1. Paystack webhook handler (financial integrity)
// 2. Loan approval logic
// 3. User registration and auth flow
// 4. Africa's Talking USSD session handler
// 5. WhatsApp webhook signature verification
// 6. Marketplace search and filter logic
```

If tests are missing on any of the above, create them using Jest + React Testing Library. At minimum:
- Happy path test
- Invalid input test
- Unauthorized access test

---

## 🚀 EXECUTION ORDER

When auditing the codebase, work in this priority order:

1. **`lib/`** — Fix db connection, auth, error handler, validators first (everything depends on these)
2. **`models/`** — Complete all Mongoose models with indexes, timestamps, and validation
3. **`app/api/`** — Fix all API routes (auth, validation, error handling, real DB queries)
4. **`app/(auth)/`** — Complete login, register, password reset
5. **`app/marketplace/`** — Real data fetching end-to-end
6. **`app/loan-application/`** — Complete form + backend + status tracking
7. **`app/logistics/`** + **`app/warehouse/`** — Complete booking flows
8. **`app/insurance/`** + **`app/investor/`** — Complete application flows
9. **`components/`** — Remove all mocks, fix all loading/error states
10. **`next.config.js`** — Add security headers, image domains, redirects
11. **`middleware.ts`** — Auth middleware protecting all dashboard routes
12. **Root** — `not-found.tsx`, `error.tsx`, `sitemap.ts`, `robots.ts`

---

## ✅ DEFINITION OF DONE

A file is considered **production-ready** only when ALL of the following are true:

- [ ] No TODO, FIXME, PLACEHOLDER, mock, or stub in the file
- [ ] All functions have complete implementations
- [ ] All API calls connect to real backend/DB — no hardcoded return values
- [ ] All error cases are handled and return meaningful messages
- [ ] TypeScript compiles with `strict: true` and zero errors
- [ ] No unused imports, variables, or dead code blocks
- [ ] No secrets hardcoded — all from environment variables
- [ ] All loading and empty states handled in UI
- [ ] All form submissions have real handlers with validation
- [ ] Console is clean — no `console.log` debug statements in production paths

**Do not mark any task as complete until every item above passes.**

---

*Generated for DosAgrolink — www.dosagrolink.com.ng*
*Enforced by GitHub Copilot per this instruction file*
