# CRM Ship Pump Repair — Developer Guide

> **Current state as of February 2026.**
> This document reflects the actual codebase, not the original plan.
> For the original specification see `01-specification.md`.

---

## Table of Contents

1. [Tech Stack](#1-tech-stack)
2. [Environment Setup](#2-environment-setup)
3. [Project Structure](#3-project-structure)
4. [Database Schema](#4-database-schema)
5. [API Reference](#5-api-reference)
6. [Settings System](#6-settings-system)
7. [UI Patterns & Conventions](#7-ui-patterns--conventions)
8. [Key Files Reference](#8-key-files-reference)
9. [Current Progress](#9-current-progress)
10. [Known Gotchas](#10-known-gotchas)

---

## 1. Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | ^16 |
| Language | TypeScript | ^5.9 |
| Styling | Tailwind CSS | ^3.4 |
| Components | shadcn/ui (manual, no CLI) | — |
| Forms | React Hook Form | ^7.71 |
| Validation | Zod | ^4.3 |
| ORM | Prisma | **5.x** (NOT 7 — breaking changes) |
| Database | PostgreSQL via Supabase | — |
| Email | Resend | ^6.9 |
| Server State | TanStack React Query | ^5.90 |
| Icons | Lucide React | ^0.563 |

---

## 2. Environment Setup

### Required `.env` file

```env
# Supabase pooler (for app queries)
DATABASE_URL="postgresql://postgres.zqxlsppslmhjfpldcxyj:[PASSWORD]@aws-1-eu-west-1.pooler.supabase.com:5432/postgres?pgbouncer=true"

# Direct connection (for migrations/schema push)
DIRECT_URL="postgresql://postgres.zqxlsppslmhjfpldcxyj:[PASSWORD]@db.zqxlsppslmhjfpldcxyj.supabase.co:5432/postgres"

# Resend email API key
RESEND_API_KEY="re_..."

# Company name shown in sidebar
NEXT_PUBLIC_COMPANY_NAME="Ship Pump Repair"
```

> **CRITICAL:** This machine has a system-level `DATABASE_URL` env var pointing to a local MySQL instance.
> It overrides `.env` unless you use `dotenv.config({ override: true })`.
> This is already applied in `src/lib/prisma.ts` and `prisma/seed.ts`. **Do not remove it.**

### Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to DB (no migration file)
npm run db:studio    # Open Prisma Studio GUI
npm run db:seed      # Seed initial data (8 T&C templates + 2026 sequence)
```

---

## 3. Project Structure

```
src/
├── app/
│   ├── (dashboard)/              # All authenticated pages (sidebar layout)
│   │   ├── layout.tsx            # Sidebar + MobileNav wrapper
│   │   ├── customers/
│   │   │   ├── page.tsx          # Customer list
│   │   │   ├── new/page.tsx      # Create customer form
│   │   │   └── [id]/
│   │   │       ├── page.tsx      # Customer detail
│   │   │       └── edit/page.tsx # Edit customer form
│   │   ├── offers/
│   │   │   ├── page.tsx          # Offers list
│   │   │   ├── new/page.tsx      # Create offer form
│   │   │   └── [id]/
│   │   │       ├── page.tsx      # Offer detail
│   │   │       └── edit/page.tsx # Edit offer form
│   │   └── settings/
│   │       ├── page.tsx          # Settings hub (navigation cards)
│   │       ├── company/page.tsx  # Company info
│   │       ├── offers/page.tsx   # Offer defaults
│   │       ├── terms/page.tsx    # T&C templates CRUD
│   │       └── email/page.tsx    # Email templates
│   └── api/
│       ├── customers/
│       │   ├── route.ts          # GET list, POST create
│       │   └── [id]/route.ts     # GET one, PUT update, DELETE
│       ├── offers/
│       │   ├── route.ts          # GET list, POST create
│       │   └── [id]/
│       │       ├── route.ts      # GET one, PUT update, DELETE
│       │       └── status/route.ts # PATCH status only
│       └── settings/
│           ├── route.ts          # GET all, PUT bulk upsert
│           └── terms/
│               ├── route.ts      # GET list, POST create
│               └── [id]/route.ts # PUT update, DELETE
├── components/
│   ├── ui/                       # shadcn/ui primitives
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   └── textarea.tsx
│   ├── shared/
│   │   ├── Sidebar.tsx           # Desktop navigation
│   │   ├── MobileNav.tsx         # Mobile bottom bar
│   │   └── PageHeader.tsx        # Page title + back button + action
│   └── customers/                # Customer-specific components
├── lib/
│   ├── prisma.ts                 # Prisma client singleton (with dotenv override)
│   ├── utils.ts                  # cn(), getCustomerDisplayName(), getStatusColor()
│   └── validations/
│       ├── customer.ts           # Zod schema for customer
│       └── offer.ts              # Zod schema for offer
└── prisma/
    ├── schema.prisma             # Database schema
    └── seed.ts                   # Initial data (T&C templates + sequence)
```

---

## 4. Database Schema

### Entity Relationship Diagram

```
┌───────────────────┐
│     customers     │
│───────────────────│
│ id (PK)           │
│ customer_type     │ ◄── 'company' | 'individual'
│ company_name      │
│ first_name        │
│ last_name         │
│ vat_number (UQ)   │
│ tax_office        │
│ phone             │
│ email             │
│ address           │
│ city              │
│ postal_code       │
│ notes             │
│ created_at        │
│ updated_at        │
└────────┬──────────┘
         │ 1
         │
         │ N
┌────────▼──────────┐          ┌──────────────────────┐
│      offers       │          │    offer_line_items   │
│───────────────────│ 1      N │──────────────────────│
│ id (PK)           │──────────► id (PK)               │
│ offer_number (UQ) │          │ offer_id (FK)         │
│ customer_id (FK)  │          │ sort_order            │
│ title             │          │ description           │
│ object_description│          │ quantity              │
│ work_report       │          │ unit                  │
│ status            │          │ unit_price            │
│ subtotal          │          │ discount_percent      │
│ vat_rate          │          │ line_total            │
│ vat_amount        │          │ created_at            │
│ total             │          └──────────────────────┘
│ terms_text        │
│ offer_date        │          ┌──────────────────────┐
│ valid_until       │          │ offer_selected_clauses│
│ created_at        │ 1      N │──────────────────────│
│ updated_at        │──────────► id (PK)               │
└───────────────────┘          │ offer_id (FK)         │
                               │ clause_template_id(FK)│
                               │ sort_order            │
                               │ clause_text_snapshot  │ ◄── immutable copy
                               └──────────┬───────────┘
                                          │ N
                                          │
                                          │ 1
                               ┌──────────▼───────────┐
                               │ terms_clause_templates│
                               │──────────────────────│
                               │ id (PK)               │
                               │ title                 │
                               │ clause_text           │
                               │ sort_order            │
                               │ is_active             │
                               │ is_default            │
                               │ created_at            │
                               │ updated_at            │
                               └──────────────────────┘

┌──────────────────────────┐   ┌──────────────────────┐
│       app_settings       │   │ offer_number_sequence │
│──────────────────────────│   │──────────────────────│
│ id = "default" (PK)      │   │ year (PK)             │
│ key (UQ)                 │   │ last_number           │
│ value                    │   └──────────────────────┘
└──────────────────────────┘
```

### Offer Number Generation

Format: `{PREFIX}{SEP}{YYYY}{SEP}{NNNN}`
- Default: `PRF-2026-0001`
- Sequence resets per year via `offer_number_sequence` table
- Configurable prefix/separator via `app_settings`

### T&C Snapshot Pattern

When a clause is selected for an offer, `clause_text_snapshot` stores a copy of the text at that moment. If the template is later edited, existing offers retain their original wording.

---

## 5. API Reference

### Customers

| Method | Endpoint | Body / Query | Returns |
|---|---|---|---|
| `GET` | `/api/customers` | `?search=&type=all|company|individual&page=1&pageSize=20&sortBy=createdAt&sortOrder=desc` | `{ data, total, page, pageSize }` |
| `GET` | `/api/customers/:id` | — | `{ data: Customer }` |
| `POST` | `/api/customers` | Customer object | `{ data: Customer }` 201 |
| `PUT` | `/api/customers/:id` | Partial customer | `{ data: Customer }` |
| `DELETE` | `/api/customers/:id` | — | `{ success: true }` or 409 if has offers |

### Offers

| Method | Endpoint | Body / Query | Returns |
|---|---|---|---|
| `GET` | `/api/offers` | `?search=&status=&customerId=&page=1&pageSize=20` | `{ data, total, page, pageSize }` |
| `GET` | `/api/offers/:id` | — | `{ data: Offer + lineItems + clauses }` |
| `POST` | `/api/offers` | Offer object | `{ data: Offer }` 201 |
| `PUT` | `/api/offers/:id` | Partial offer | `{ data: Offer }` |
| `DELETE` | `/api/offers/:id` | — | `{ success: true }` |
| `PATCH` | `/api/offers/:id/status` | `{ status }` | `{ data: Offer }` |

### Settings

| Method | Endpoint | Body | Returns |
|---|---|---|---|
| `GET` | `/api/settings` | — | `{ data: { key: value, ... } }` |
| `PUT` | `/api/settings` | `{ key: value, ... }` | `{ success: true }` |
| `GET` | `/api/settings/terms` | — | `{ data: TermsClause[] }` |
| `POST` | `/api/settings/terms` | `{ title, clauseText, isDefault }` | `{ data: TermsClause }` 201 |
| `PUT` | `/api/settings/terms/:id` | `{ title?, clauseText?, isDefault?, isActive?, sortOrder? }` | `{ data: TermsClause }` |
| `DELETE` | `/api/settings/terms/:id` | — | `{ success: true }` or 409 if used in offers |

### Common Error Shape

```json
{ "error": "Μήνυμα σφάλματος στα ελληνικά" }
{ "error": "Σφάλμα validation", "details": { "field": ["message"] } }
```

---

## 6. Settings System

All scalar settings are stored as key-value pairs in `app_settings`.

### Company Info Keys

| Key | Description | Used In |
|---|---|---|
| `company_name` | Trading name | PDF header, Sidebar |
| `company_legal_name` | Legal entity name | PDF header |
| `company_vat_number` | ΑΦΜ | PDF header |
| `company_tax_office` | ΔΟΥ | PDF header |
| `company_address` | Street address | PDF header |
| `company_city` | City | PDF header |
| `company_postal_code` | Postal code | PDF header |
| `company_phone` | Phone | PDF header, Email |
| `company_email` | Email | PDF header |
| `company_website` | Website | PDF header |
| `company_iban` | Bank IBAN | PDF footer |
| `company_bank_name` | Bank name | PDF footer |

### Offer Defaults Keys

| Key | Default | Description |
|---|---|---|
| `default_vat_rate` | `24` | Pre-filled VAT % on new offers |
| `default_validity_days` | `30` | Days added to today for valid_until |
| `offer_number_prefix` | `PRF` | Prefix for offer numbers |
| `offer_number_separator` | `-` | Separator (PRF**-**2026**-**0001) |
| `default_payment_terms` | `""` | Pre-filled payment terms text |
| `default_delivery_terms` | `""` | Pre-filled delivery terms text |
| `default_currency` | `EUR` | Currency symbol/code |

### Email Template Keys

| Key | Description |
|---|---|
| `email_from_name` | Sender display name in Resend |
| `email_reply_to` | Reply-To header |
| `email_subject_template` | Subject with `{{variables}}` |
| `email_body_template` | Body text with `{{variables}}` |
| `email_signature` | Appended to every email |

**Available template variables:**
`{{offer_number}}`, `{{customer_name}}`, `{{company_name}}`, `{{offer_date}}`, `{{total}}`

### How Settings Are Read/Written

```typescript
// Read all settings
const res = await fetch('/api/settings')
const { data } = await res.json()
// data = { company_name: "...", default_vat_rate: "24", ... }

// Write settings (bulk upsert)
await fetch('/api/settings', {
  method: 'PUT',
  body: JSON.stringify({ default_vat_rate: '24', company_name: 'Acme' })
})
```

---

## 7. UI Patterns & Conventions

### Language

All UI text is in **Greek**. Technical field names (VAT, IBAN, PDF, etc.) remain in English.

### Page Structure

Every page follows this layout:

```tsx
<div>
  <PageHeader title="..." description="..." backHref="/..." action={{ label: "...", href: "..." }} />
  {/* content */}
</div>
```

### Data Fetching Pattern

Pages are `"use client"` and fetch on mount via `useEffect`:

```tsx
"use client"
const [data, setData] = useState([])
const [loading, setLoading] = useState(true)

useEffect(() => { fetchData() }, [deps])

async function fetchData() {
  setLoading(true)
  const res = await fetch('/api/...')
  const json = await res.json()
  setData(json.data)
  setLoading(false)
}
```

### Form Save Pattern

Settings pages use a simple save button (no auto-save):

```tsx
const [saving, setSaving] = useState(false)
const [saved, setSaved] = useState(false)

async function handleSave() {
  setSaving(true)
  await fetch('/api/settings', { method: 'PUT', body: JSON.stringify(values) })
  setSaving(false)
  setSaved(true)
}

// Button text cycles: "Αποθήκευση" → "Αποθήκευση..." → "Αποθηκεύτηκε ✓"
```

### Status Colors

Use `getStatusColor(status)` from `src/lib/utils.ts`:

| Status | Color |
|---|---|
| `draft` | gray |
| `sent` | blue |
| `accepted` | green |
| `rejected` | red |
| `expired` | orange |

### Component Conventions

- **No shadcn CLI** — components are added manually to `src/components/ui/`
- `cn()` from `src/lib/utils.ts` for conditional classNames (wraps `clsx` + `tailwind-merge`)
- All form fields: `Label` → `Input`/`Textarea` stacked with `space-y-1.5`
- Section dividers: `divide-y divide-gray-100` on container, sections have `p-5`

---

## 8. Key Files Reference

| File | Purpose |
|---|---|
| [src/lib/prisma.ts](../src/lib/prisma.ts) | Prisma singleton — **must** have `dotenv.config({ override: true })` |
| [src/lib/utils.ts](../src/lib/utils.ts) | `cn()`, `getCustomerDisplayName()`, `getStatusColor()` |
| [src/lib/validations/customer.ts](../src/lib/validations/customer.ts) | Zod schema for customer API |
| [src/lib/validations/offer.ts](../src/lib/validations/offer.ts) | Zod schema for offer API |
| [src/components/shared/Sidebar.tsx](../src/components/shared/Sidebar.tsx) | Navigation — add new routes here |
| [src/components/shared/PageHeader.tsx](../src/components/shared/PageHeader.tsx) | Reusable page title component |
| [prisma/schema.prisma](../prisma/schema.prisma) | Database schema — source of truth |
| [prisma/seed.ts](../prisma/seed.ts) | Seeds 8 T&C templates + 2026 number sequence |

---

## 9. Current Progress

### Done ✅

| Area | Status |
|---|---|
| Project setup (Next.js, Tailwind, Prisma) | ✅ Complete |
| Database schema | ✅ Complete |
| Seed data (T&C templates + sequence) | ✅ Complete |
| Customers API (CRUD) | ✅ Complete |
| Customers UI (list, create, edit, detail) | ✅ Complete |
| Offers API (CRUD + status) | ✅ Complete |
| Offers UI (list, create, edit, detail) | ✅ Complete |
| Settings API (app_settings + terms) | ✅ Complete |
| Settings UI (hub + company + offers + terms + email) | ✅ Complete |

### Pending ⏳

| Area | Priority |
|---|---|
| PDF generation | High |
| Email sending (Resend integration) | High |
| Authentication (Supabase Auth) | High |
| Dashboard (stats/overview page) | Medium |
| Offer duplication | Medium |
| Offer number auto-generation using settings prefix | Medium |
| Apply `default_vat_rate` / `default_validity_days` on new offer | Medium |

---

## 10. Known Gotchas

### 1. System DATABASE_URL override

The development machine has a system env var `DATABASE_URL` pointing to a local MySQL instance.
Without `dotenv.config({ override: true })`, Prisma connects to the wrong database silently.
**Solution:** Already applied in `src/lib/prisma.ts`. If you add new scripts that use Prisma, add the same override.

### 2. Prisma version must stay at 5.x

Prisma v7 changed how `datasource` and `generator` blocks are configured.
The project is on **v5.22** — do not upgrade to v7 without migrating the schema.

### 3. AppSettings unique key constraint

`app_settings.key` is `@unique`. The `id` field is a fixed string `"default"` — this is fine because upserts use `where: { key }`, not `where: { id }`.

### 4. Terms delete protection

`DELETE /api/settings/terms/:id` returns **409 Conflict** if the clause is referenced in any `offer_selected_clauses` row. This protects historical offer data. To remove a clause cleanly, set `isActive = false` instead.

### 5. Supabase RLS

The `app_settings` table must have RLS enabled. Recommended policy:
```sql
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated_read" ON public.app_settings
  FOR SELECT TO authenticated USING (true);
-- Writes only via service role (server-side)
```

### 6. Next.js version in package.json

`package.json` lists `"next": "^16.1.6"` but the App Router patterns used are Next.js 14 style.
This is a version label inconsistency — the actual API surface used is standard App Router.
