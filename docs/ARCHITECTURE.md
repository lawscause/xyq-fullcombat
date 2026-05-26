# XYQ Full Combat — Architecture Document

## Overview

A private community platform for a Xing Yi Quan martial arts school. Designed to support in-person training relationships through digital continuity — weekly practice material, seminar archives, event coordination, and long-term knowledge preservation.

---

## 1. Application Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Vercel (Frontend)                      │
│  ┌─────────────────────────────────────────────────────┐ │
│  │              Next.js App Router                       │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────────────┐ │ │
│  │  │  Public  │ │ Members  │ │   Admin/Instructor   │ │ │
│  │  │  Pages   │ │  Portal  │ │     Dashboard        │ │ │
│  │  └──────────┘ └──────────┘ └──────────────────────┘ │ │
│  │  ┌──────────────────────────────────────────────────┐│ │
│  │  │         Middleware (Auth + RBAC)                  ││ │
│  │  └──────────────────────────────────────────────────┘│ │
│  └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   Supabase   │ │    Stripe    │ │  Cloudflare  │
│  Auth + DB   │ │  Payments    │ │   Stream     │
│  + Storage   │ │  + Webhooks  │ │   (Video)    │
└──────────────┘ └──────────────┘ └──────────────┘
```

### Key Principles
- Server Components by default, Client Components only for interactivity
- Edge middleware for auth verification and role gating
- API routes for webhooks and server-side mutations
- Streaming SSR for fast initial loads on mobile

---

## 2. Folder Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (public)/                 # Public routes (no auth)
│   │   ├── page.tsx              # Landing page
│   │   ├── about/
│   │   ├── instructors/
│   │   ├── schedule/
│   │   └── contact/
│   ├── (auth)/                   # Auth routes
│   │   ├── login/
│   │   ├── register/
│   │   └── callback/
│   ├── (member)/                 # Authenticated member routes
│   │   ├── dashboard/
│   │   ├── lessons/
│   │   ├── seminars/
│   │   ├── practice/
│   │   ├── events/
│   │   ├── notes/
│   │   ├── search/
│   │   └── account/
│   ├── (admin)/                  # Admin/Instructor routes
│   │   ├── admin/
│   │   └── instructor/
│   ├── api/                      # API routes
│   │   ├── webhooks/
│   │   │   └── stripe/
│   │   ├── media/
│   │   └── search/
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                       # shadcn/ui primitives
│   ├── layout/                   # Shell, nav, footer
│   ├── lessons/                  # Lesson-specific components
│   ├── seminars/                 # Seminar components
│   ├── events/                   # Event components
│   ├── media/                    # Video player, PDF viewer
│   ├── practice/                 # Weekly practice components
│   └── shared/                   # Cross-cutting components
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Browser client
│   │   ├── server.ts             # Server client
│   │   ├── admin.ts              # Service role client
│   │   └── middleware.ts         # Auth middleware helper
│   ├── stripe/
│   │   ├── client.ts
│   │   ├── webhooks.ts
│   │   └── plans.ts
│   ├── media/
│   │   ├── cloudflare-stream.ts
│   │   └── signed-urls.ts
│   ├── utils/
│   │   ├── cn.ts
│   │   ├── dates.ts
│   │   └── formatting.ts
│   └── constants/
│       ├── roles.ts
│       ├── categories.ts
│       └── routes.ts
├── hooks/                        # Custom React hooks
│   ├── use-auth.ts
│   ├── use-membership.ts
│   └── use-media-player.ts
├── types/
│   ├── database.ts               # Generated from Supabase
│   ├── api.ts
│   └── domain.ts
├── styles/
│   └── tokens.css                # Design tokens
└── middleware.ts                  # Edge middleware
```

---

## 3. Database Schema

### Entity Relationship Overview

```
users ─────────┬──── memberships ──── payments
               │
               ├──── user_roles
               │
               ├──── bookmarks
               │
               ├──── notes
               │
               └──── comments
                        │
lessons ────────────────┤
    │                   │
    ├── lesson_tags     │
    │                   │
    ├── transcripts     │
    │                   │
    └── lesson_media    │
                        │
seminars ───────────────┤
    │                   │
    ├── seminar_recordings
    │
    └── seminar_registrations
                        │
events ─────────────────┘
    │
    └── event_registrations

instructors ──── lesson_instructors
              └── seminar_instructors

tags ──── lesson_tags
       └── seminar_tags

categories ──── lessons
```

### Core Tables

- **profiles** — extends Supabase auth.users
- **roles** — enum: visitor, trial, member, instructor, admin
- **user_roles** — junction for multi-role support
- **memberships** — subscription state, tier, dates
- **payments** — Stripe payment records
- **lessons** — core content unit
- **lesson_media** — video, PDF, audio, image attachments
- **transcripts** — searchable text content
- **categories** — hierarchical lesson organization
- **tags** — flexible tagging system
- **seminars** — event-based content collections
- **seminar_recordings** — archived media
- **seminar_registrations** — attendance tracking
- **events** — calendar entries
- **event_registrations** — RSVP/payment tracking
- **comments** — threaded discussion on lessons/seminars
- **notes** — private user notes on any content
- **bookmarks** — saved content references
- **instructors** — instructor profiles and bios
- **practice_posts** — weekly practice feed entries
- **announcements** — community announcements

---

## 4. Authentication Architecture

```
Browser → Supabase Auth (PKCE flow)
       → Session cookie (httpOnly)
       → Edge Middleware validates session
       → Server Components read session
       → RLS policies enforce data access
```

### Flow
1. User authenticates via Supabase Auth (email/password or magic link)
2. Session stored as httpOnly cookie
3. Edge middleware checks session on every request
4. Protected routes redirect unauthenticated users
5. Server components pass session to Supabase client
6. RLS policies enforce row-level access based on user role

### Session Strategy
- Short-lived access tokens (1 hour)
- Refresh tokens with rotation
- Middleware handles token refresh transparently

---

## 5. RBAC Design

### Role Hierarchy
```
admin > instructor > member > trial > visitor
```

### Permission Matrix

| Resource          | Visitor | Trial  | Member | Instructor | Admin |
|-------------------|---------|--------|--------|------------|-------|
| Public pages      | ✓       | ✓      | ✓      | ✓          | ✓     |
| Beginner lessons  | —       | ✓      | ✓      | ✓          | ✓     |
| Full library      | —       | —      | ✓      | ✓          | ✓     |
| Seminar archive   | —       | —      | ✓      | ✓          | ✓     |
| Comments          | —       | —      | ✓      | ✓          | ✓     |
| Private notes     | —       | ✓      | ✓      | ✓          | ✓     |
| Upload content    | —       | —      | —      | ✓          | ✓     |
| Manage events     | —       | —      | —      | ✓          | ✓     |
| Moderate          | —       | —      | —      | ✓          | ✓     |
| Billing/Users     | —       | —      | —      | —          | ✓     |

### Implementation
- Roles stored in `user_roles` table
- Middleware checks role for route groups
- RLS policies reference role via `auth.jwt()` claims
- Custom claims set via Supabase hook on login

---

## 6. API / Data Flow

### Server Actions (preferred for mutations)
- Create/update lessons
- Post comments
- Save notes/bookmarks
- Register for events

### API Routes (for external integrations)
- `POST /api/webhooks/stripe` — payment events
- `GET /api/media/signed-url` — authenticated media access
- `GET /api/search` — full-text search endpoint

### Data Fetching Pattern
```
Server Component
  → createServerClient(cookies)
  → supabase.from('lessons').select(...)
  → RLS filters automatically
  → Render with data
```

---

## 7. Stripe Integration

### Architecture
```
User → Checkout Session → Stripe
Stripe → Webhook → /api/webhooks/stripe
Webhook → Update memberships table
Membership status → RLS policies → Content access
```

### Subscription Tiers
- **Trial** — free, limited content, 14 days
- **Monthly** — full access, recurring
- **Annual** — full access, discounted

### One-Time Payments
- Seminar registration
- Workshop fees
- Guest instructor events

### Webhook Events Handled
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

### Grace Period
- 7-day grace on failed payments
- Membership status: active → grace → expired
- Expired members retain notes/bookmarks but lose content access

---

## 8. Component Architecture

### Design System Layers
```
shadcn/ui primitives
  → Custom themed components
    → Feature-specific compositions
      → Page layouts
```

### Key Components
- `VideoPlayer` — Cloudflare Stream embed with controls
- `LessonCard` — compact lesson preview
- `PracticePost` — weekly drill/recap card
- `EventCard` — upcoming event with registration
- `NoteEditor` — markdown-capable private notes
- `SearchBar` — global search with filters
- `CategoryNav` — lesson library navigation
- `MembershipBadge` — role/tier indicator

### Animation Philosophy
- Framer Motion for page transitions only
- Subtle fade/slide on route changes
- No decorative animations
- Reduced motion respected via `prefers-reduced-motion`

---

## 9. Mobile-First UI

### Priorities
- Thumb-friendly tap targets (44px minimum)
- Bottom navigation on mobile
- Swipe gestures for lesson navigation
- Offline-capable lesson bookmarks (future)
- Fast video load with adaptive bitrate

### Breakpoints
- Mobile: 0–640px (primary design target)
- Tablet: 641–1024px
- Desktop: 1025px+

### Park/Outdoor Considerations
- High contrast mode support
- Large readable text defaults
- Minimal chrome around video player
- Quick-access to current week's practice

---

## 10. Admin Dashboard

### Sections
- **Users** — list, search, role management, membership status
- **Content** — lessons, seminars, practice posts CRUD
- **Events** — create, manage, attendance
- **Billing** — subscription overview, payment history
- **Moderation** — flagged comments, user reports
- **Analytics** — engagement metrics (non-invasive)

### Instructor Dashboard
- Upload/manage own content
- View event registrations
- Moderate discussions on own content
- Create practice posts

---

## 11. Event/Seminar Workflow

### Event Lifecycle
```
Create Event → Publish → Open Registration
  → Collect Payment (if paid)
  → Manage Waitlist
  → Send Reminders
  → Mark Attendance
  → Archive Recordings
```

### Seminar Archive Structure
```
Seminar
  ├── Overview (description, instructor, date)
  ├── Recordings (multiple segments)
  ├── Notes/Handouts (PDFs, diagrams)
  ├── Q&A Summary
  └── Related Lessons (cross-references)
```

---

## 12. Video/Media Architecture

### Cloudflare Stream Integration
```
Instructor uploads → Cloudflare Stream API
  → Processing/encoding
  → Signed URL generation (time-limited)
  → HLS playback in custom player
```

### Security Layers
1. Authenticated routes (middleware)
2. Signed URLs with expiration (4 hours)
3. Domain restriction on embeds
4. Future: visible watermarking with user ID

### Supported Media Types
- Video: HLS via Cloudflare Stream
- Audio: Supabase Storage with signed URLs
- PDFs: Supabase Storage with signed URLs
- Images: Supabase Storage / Next.js Image optimization

---

## 13. Security Recommendations

### Authentication
- PKCE flow (no implicit grants)
- httpOnly cookies for session
- CSRF protection via SameSite cookies
- Rate limiting on auth endpoints

### Data Access
- RLS on every table (no exceptions)
- Service role key only in server-side code
- Never expose Supabase service key to client

### Media
- Signed URLs with short TTL
- Domain-locked video embeds
- No direct storage bucket access

### Infrastructure
- Environment variables via Vercel
- Separate staging/production Supabase projects
- Webhook signature verification (Stripe)
- Content Security Policy headers

---

## 14. MVP Implementation Roadmap

### Phase 1 — Foundation (Weeks 1–3)
- [ ] Project scaffold + deployment pipeline
- [ ] Supabase schema + RLS policies
- [ ] Authentication flow
- [ ] Role system
- [ ] Public pages (landing, about, schedule)
- [ ] Basic member dashboard

### Phase 2 — Content (Weeks 4–6)
- [ ] Lesson library (CRUD + display)
- [ ] Category navigation
- [ ] Video player integration
- [ ] PDF/media attachments
- [ ] Bookmarks

### Phase 3 — Community (Weeks 7–8)
- [ ] Weekly practice feed
- [ ] Comments system
- [ ] Private notes
- [ ] Announcements

### Phase 4 — Commerce (Weeks 9–10)
- [ ] Stripe subscription integration
- [ ] Membership gating
- [ ] Payment webhooks
- [ ] Account/billing page

### Phase 5 — Events (Weeks 11–12)
- [ ] Event system
- [ ] Seminar registration + payment
- [ ] Seminar archive
- [ ] Calendar view

### Phase 6 — Polish (Weeks 13–14)
- [ ] Search implementation
- [ ] Admin dashboard
- [ ] Mobile optimization pass
- [ ] Performance audit
- [ ] Security audit

---

## 15. Future Enhancements

- Offline mode (PWA) for park access
- AI-powered transcript search
- Practice streak tracking (non-gamified, personal)
- Instructor scheduling tools
- Multi-language support (Chinese terminology)
- Video watermarking
- Mobile app (React Native)
- Curriculum progression tracking
- Guest instructor portal
- Community Q&A (structured, not forum-style)

---

## 16. Production Deployment

### Environments
- **Development** — local Next.js + Supabase CLI
- **Staging** — Vercel preview + Supabase staging project
- **Production** — Vercel production + Supabase production project

### CI/CD
- GitHub Actions for lint/type-check/test
- Vercel auto-deploy on push to main
- Supabase migrations via CLI in CI

### Monitoring
- Vercel Analytics (Web Vitals)
- Supabase Dashboard (DB metrics)
- Stripe Dashboard (payment health)
- Error tracking (Sentry recommended)
