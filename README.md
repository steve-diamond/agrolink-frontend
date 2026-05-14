# DOS AgroLink Nigeria

**A complete agricultural operating ecosystem connecting farmers, buyers, cooperatives, and service providers across Nigeria.**

AgroLink digitises the entire agricultural value chain — from produce listing and smart pricing through to logistics, warehousing, credit, and investment — on a single platform accessible via web and mobile.

---

## Table of Contents

- [Platform Overview](#platform-overview)
- [Core Capabilities](#core-capabilities)
- [User Roles](#user-roles)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Frontend Setup](#frontend-setup)
  - [Backend Setup](#backend-setup)
  - [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [API Overview](#api-overview)
- [Deployment](#deployment)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Platform Overview

DOS AgroLink Nigeria solves real farmer problems:

- Sell produce directly and get fairer prices
- Access trusted buyers and transparent demand signals
- Receive digital payments and build a verifiable transaction history
- Apply for micro-loans assessed against data-backed farm scores
- Move produce quickly through a coordinated logistics network
- Reduce spoilage with structured, receipt-ready warehouse storage
- Make better decisions with AI-assisted crop price intelligence and agronomic advisory

---

## Core Capabilities

| # | Capability | Status |
|---|-----------|--------|
| 1 | **Smart Produce Marketplace** — direct farmer-to-buyer product listings and order fulfilment | ✅ Live |
| 2 | **AI Crop Price Intelligence** — recommended selling price, best location signal, demand trend | ✅ Live |
| 3 | **Cooperative Digital Wallet** — secure payouts, transaction history, Paystack/Flutterwave rails | ✅ Live |
| 4 | **Farmer Micro-Loan System** — application, cooperative scoring, admin review, repayment tracking | ✅ Live |
| 5 | **Logistics & Transport Network** — dispatch lifecycle from pickup through to delivered or cancelled | ✅ Live |
| 6 | **Warehouse & Storage Booking** — capacity-aware booking, inventory release, receipt records | ✅ Live |
| 7 | **Agricultural Knowledge & Advisory Hub** — crop guides, fertiliser tips, pest alerts, weather warnings | ✅ Live |
| 8 | **Produce Grading System** — grade assignment with standards enforcement | ✅ Live |
| 9 | **Equipment Listing & Hire** — list and discover farm equipment available for hire | ✅ Live |
| 10 | **Cooperative Management** — cooperative registration and member management | ✅ Live |
| 11 | **Insurance Portal** — crop/asset insurance application and status tracking | ✅ Live |
| 12 | **Investor Portal** — investment opportunities, returns dashboard | ✅ Live |
| 13 | **Admin Dashboard** — platform-wide oversight, approvals, analytics | ✅ Live |
| 14 | **Push Notifications** — in-app notification centre with background worker | ✅ Live |

---

## User Roles

| Role | Key Permissions |
|------|----------------|
| **Farmer** | List products, manage orders, view price intelligence, apply for loans, book warehouse, request logistics, receive payments |
| **Buyer** | Browse marketplace, place orders, track fulfilment, make payments |
| **Cooperative** | Manage members, aggregate produce, access group credit scores |
| **Logistics Partner** | Accept dispatch requests, update transit status |
| **Warehouse Manager** | Manage storage capacity, confirm bookings, release inventory |
| **Investor** | Browse investment opportunities, monitor portfolio returns |
| **Admin** | Approve users/products/loans, manage platform settings, view analytics |

---

## Tech Stack

### Frontend

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| UI | React 18, Tailwind CSS, Bootstrap 5 |
| Icons | React Icons, Heroicons |
| State | Zustand |
| Data fetching | SWR, Axios |
| Forms | React Hook Form + Zod |
| Charts | Chart.js / React-Chartjs-2, Recharts |
| Auth | NextAuth.js v4 + JWT |
| Speech | React Speech Recognition |
| Notifications | Africa's Talking SMS gateway |

### Backend

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js |
| Framework | Express 5 |
| Database | MongoDB via Mongoose |
| Auth | JWT + bcryptjs |
| Queue | Bull (Redis-backed) |
| Cache | ioredis |
| Security | Helmet, CORS, express-rate-limit |
| Metrics | prom-client (Prometheus-compatible) |
| Process Manager | PM2 |
| Containerisation | Docker / Docker Compose |

---

## Repository Structure

```
agrolink/
├── app/                    # Next.js App Router pages and layouts
│   ├── (auth)/             # Login / register routes
│   ├── (dashboard)/        # Main dashboard shell
│   ├── admin/              # Admin panel
│   ├── farmer/             # Farmer-specific pages
│   ├── investor/           # Investor portal
│   ├── marketplace/        # Product listings and orders
│   ├── loan-application/   # Loan application flow
│   ├── logistics/          # Logistics requests and tracking
│   ├── warehouse/          # Warehouse booking
│   ├── grading/            # Produce grading
│   ├── insurance/          # Insurance portal
│   ├── cooperatives/       # Cooperative management
│   ├── prices/             # Crop price intelligence
│   ├── notifications/      # Notification centre
│   └── ...
├── backend/                # Node.js / Express API server
│   ├── controllers/        # Route handler logic
│   ├── models/             # Mongoose schemas
│   ├── routes/             # Express route definitions
│   ├── middleware/         # Auth, validation, rate limiting
│   ├── services/           # Business logic layer
│   ├── workers/            # Background queue workers
│   ├── scripts/            # Admin utilities and smoke tests
│   └── server.js           # Entry point (Node cluster)
├── components/             # Shared React components
├── lib/                    # Frontend utilities (API client, auth helpers)
├── services/               # Frontend service layer
├── store/                  # Zustand stores
├── types/                  # TypeScript type definitions
├── public/                 # Static assets
├── docs/                   # Extended documentation
└── docker-compose.yml      # Full-stack local orchestration
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9
- MongoDB instance (local or Atlas)
- Redis instance (required for Bull queue and rate-limit-redis)

### Frontend Setup

```bash
# Clone the repository
git clone https://github.com/steve-diamond/agrolink-frontend.git
cd agrolink-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The web app will be available at `http://localhost:3000`.

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Start the API server
npm run dev
```

The API server defaults to `http://localhost:5000`.

To start the notification background worker separately:

```bash
npm run worker:notifications
```

### Environment Variables

Create a `.env.local` file in the project root for the frontend:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_ENV=development
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

Create a `.env` file inside `backend/`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/agrolink
JWT_SECRET=your_jwt_secret
REDIS_URL=redis://localhost:6379
PAYSTACK_SECRET_KEY=your_paystack_key
FLUTTERWAVE_SECRET_KEY=your_flutterwave_key
AFRICAS_TALKING_API_KEY=your_at_key
AFRICAS_TALKING_USERNAME=sandbox
```

> **Never commit `.env` or `.env.local` files. Add them to `.gitignore`.**

### Docker (full stack)

```bash
docker-compose up --build
```

This spins up the frontend, backend, MongoDB, and Redis containers together.

---

## Available Scripts

### Frontend (project root)

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Next.js dev server with hot reload |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

### Backend (`backend/`)

| Script | Description |
|--------|-------------|
| `npm run dev` | Start API server (Node) |
| `npm run worker:notifications` | Start notification queue worker |
| `npm run admin:reset` | Reset admin credentials |
| `npm run smoke:payment` | Run payment smoke test |
| `npm run load:test` | Run k6 load test against API |

---

## API Overview

Base path: `/api/v1`

| Domain | Key Endpoints |
|--------|--------------|
| Auth | `POST /auth/register`, `POST /auth/login` |
| Products | `GET /products`, `POST /products`, `PUT /products/:id` |
| Orders | `POST /orders`, `GET /orders` |
| Wallet | `GET /wallet/balance`, `GET /wallet/transactions`, `POST /wallet/withdraw` |
| Loans | `POST /loans`, `GET /loans/me`, `PATCH /loans/:id/repay` |
| Logistics | `POST /logistics`, `GET /logistics/me`, `PATCH /logistics/:id/status` |
| Warehouses | `GET /warehouses`, `POST /warehouses/bookings`, `PATCH /warehouses/bookings/:id/release` |
| Price Intel | `GET /intelligence/prices?crop=maize&location=kaduna` |
| Advisory | `GET /advisory/feed?crop=rice&region=north-central` |
| Notifications | `GET /notifications`, `POST /notifications/send` |

Full endpoint reference: [`docs/api-endpoints.md`](docs/api-endpoints.md)

---

## Deployment

### Frontend — Vercel

The frontend deploys automatically from the `main` branch via Vercel.

- Build command: `npm run build`
- Output directory: `.next`
- Set all `NEXT_PUBLIC_*` and `NEXTAUTH_*` variables in the Vercel dashboard.

### Backend — Docker / PM2

```bash
# Production with PM2
cd backend
npx pm2 start ecosystem.config.js

# Or with Docker
docker-compose -f backend/docker-compose.yml up -d
```

> Avoid enabling PM2 cluster mode when `server.js` already uses Node's built-in `cluster` module — this double-multiplies workers and can exhaust CPU/memory.

---

## Roadmap

**Q2 2026**
- [ ] Automated loan risk scoring engine
- [ ] External market price feed integration
- [ ] Logistics SLA KPIs (pickup time, transit time, completion rate)

**Q3 2026**
- [ ] Native mobile app launch (iOS / Android)
- [ ] Advanced analytics dashboard
- [ ] Warehouse cold-chain and expiry alerting
- [ ] Expanded advisory coverage by crop and state

---

## Contributing

1. Fork the repository and create a feature branch from `main`.
2. Write clear, scoped commits.
3. Run `npm run lint` and `npm run build` before opening a pull request.
4. Open a PR with a description of changes and any relevant issue numbers.

---

## License

© 2026 DOS AgroLink Nigeria. All rights reserved.
