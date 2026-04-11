# CRM Ship Pump Repair - Claude Guidelines

## Project Overview
CRM for a ship pump repair business. Greek UI (ελληνικά) with English technical terms.
Target users: 2-3 staff, web + tablet. Scale goal: ~6000 offers over 10 years.

## Tech Stack
- **Framework**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS 3 + shadcn/ui (manual components — do NOT use the shadcn CLI)
- **Database**: Supabase (PostgreSQL) via Prisma 5
- **Forms**: React Hook Form 7 + Zod 4
- **Email**: Resend
- **Data fetching**: TanStack Query v5

## Critical: DATABASE_URL Override
The machine has a system env var `DATABASE_URL` that conflicts with `.env`.
**Always use `dotenv.config({ override: true })`** in any file that reads env vars for Prisma (e.g., seed scripts, `src/lib/prisma.ts`).

## Project Structure
```
src/
  app/
    (dashboard)/        # Main app — sidebar layout
      customers/        # Customer pages
      offers/           # Offer pages
      settings/         # Settings pages
    api/
      customers/        # Customer REST routes
      offers/           # Offer REST routes
      settings/         # Settings REST routes
  components/
    ui/                 # shadcn/ui components (manual)
    customers/          # Customer-specific components
    offers/             # Offer-specific components
    shared/             # Shared components
  lib/
    prisma.ts           # Prisma singleton (with dotenv override)
    validations/        # Zod schemas
prisma/
  schema.prisma         # DB schema
  seed.ts               # Seed script
```

## Database
- **Supabase** project ref: `zqxlsppslmhjfpldcxyj`
- **Prisma 5** — do NOT upgrade to v7 (breaking config changes)
- Uses pooler URL: `aws-1-eu-west-1.pooler.supabase.com:5432`
- Scripts: `npm run db:generate`, `npm run db:push`, `npm run db:seed`, `npm run db:studio`

## Key Models
- `Customer` — company or individual, with VAT/tax info
- `Offer` — quote with line items, totals, status, T&C clauses
- `OfferLineItem` — description, qty, unit, unit price, discount, line total
- `TermsClauseTemplate` — reusable T&C clauses (8 seeded)
- `OfferSelectedClause` — snapshot of T&C clauses selected per offer
- `OfferNumberSequence` — per-year auto-increment (seeded for 2026)
- `AppSettings` — key/value store for company info

## Conventions
- UI text in Greek; keep technical terms (e.g., field names, enums) in English
- Use `cuid()` for all IDs
- API routes follow REST: `GET /api/customers`, `POST /api/customers`, `GET /api/customers/[id]`, etc.
- Decimal fields use `@db.Decimal(12,2)` for money, `@db.Decimal(5,2)` for rates/percentages
- shadcn components live in `src/components/ui/` — add manually, not via CLI
- Do not add error handling for impossible cases; validate only at API boundaries

## Pending Features
- [ ] Offers CRUD (with line items + totals)
- [ ] T&C checkbox system
- [ ] PDF generation
- [ ] Email sending (Resend)
- [ ] Auth (Supabase Auth or NextAuth)
- [ ] Fix colors inside Settings section
- [ ] Security & auth tests
- [ ] Functional end-to-end tests (run before final presentation)
