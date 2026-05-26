# XYQ Full Combat

Private training platform for the XYQ Full Combat Xing Yi Quan community. Supports in-person training relationships through weekly practice material, seminar archives, event coordination, and long-term knowledge preservation.

## Tech Stack

- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Supabase (Auth, Postgres, Storage, RLS)
- **Payments:** Stripe (subscriptions + one-time)
- **Video:** Cloudflare Stream (signed URLs)
- **Deployment:** Vercel + Supabase Cloud

## Getting Started

### Prerequisites

- Node.js 20+
- Supabase CLI (`npm install -g supabase`)
- Stripe CLI (for webhook testing)

### Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local
# Fill in your Supabase, Stripe, and Cloudflare credentials

# Start Supabase locally
supabase start

# Run migrations
supabase db push

# Start development server
npm run dev
```

### Environment Variables

See `.env.local.example` for required variables.

## Project Structure

```
src/
├── app/              # Next.js App Router (route groups)
│   ├── (public)/     # Public pages (landing, about, schedule)
│   ├── (auth)/       # Login, register, callback
│   ├── (member)/     # Authenticated member area
│   ├── (admin)/      # Admin/instructor dashboard
│   └── api/          # API routes (webhooks, media)
├── components/       # React components by domain
├── lib/              # Utilities, clients, constants
├── hooks/            # Custom React hooks
└── types/            # TypeScript type definitions

supabase/
└── migrations/       # Database migrations
```

## Architecture

See `docs/ARCHITECTURE.md` for full system design, database schema, RBAC model, and deployment strategy.

## Key Features

- Role-based access (visitor → trial → member → instructor → admin)
- Lesson library organized by category (Five Elements, Forms, Applications, etc.)
- Weekly practice feed with class recaps and drills
- Seminar archive with recordings and materials
- Event system with registration and payment
- Private notes and bookmarks
- Full-text search across content and transcripts
- Authenticated video streaming via signed URLs
- Stripe subscription management with grace periods

## Development

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint
npm run type-check   # TypeScript check
npm run db:generate-types  # Regenerate DB types from Supabase
```

## Deployment

- Frontend deploys to Vercel on push to `main`
- Database migrations run via Supabase CLI in CI
- Stripe webhooks point to `/api/webhooks/stripe`
