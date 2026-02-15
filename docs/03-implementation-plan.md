# CRM Ship Pump Repair - Implementation Plan v1

## Tech Stack (Προτεινόμενο)

| Layer | Τεχνολογία | Γιατί |
|-------|------------|-------|
| Frontend | **React + TypeScript** | Type safety, ecosystem |
| UI Framework | **Tailwind CSS + shadcn/ui** | Γρήγορο, modern, customizable |
| State | **React Query (TanStack)** | Server state, caching, mutations |
| Forms | **React Hook Form + Zod** | Validation, performance |
| Backend | **Node.js + Express** ή **Next.js API Routes** | JavaScript ecosystem |
| ORM | **Prisma** | Type-safe, migrations, PostgreSQL support |
| Database | **PostgreSQL** | Reliable, scales well |
| PDF | **@react-pdf/renderer** ή **Puppeteer** | PDF generation |
| Auth | **NextAuth.js** ή **Passport.js** | Simple auth |

**Εναλλακτικά:** Αν προτιμάτε full-stack framework → **Next.js 14 (App Router)**

---

## Milestones

### Milestone 1: Foundation (MVP Core)
**Στόχος:** Βασική λειτουργικότητα - Πελάτες & Προσφορές

#### M1.1 - Project Setup
- [ ] Initialize Next.js project με TypeScript
- [ ] Setup Tailwind CSS + shadcn/ui
- [ ] Configure Prisma με PostgreSQL
- [ ] Setup database schema (migrations)
- [ ] Create base layout (header, sidebar, main content)

#### M1.2 - Customers CRUD
- [ ] CustomerList page με pagination
- [ ] CustomerForm (create/edit) με type toggle
- [ ] CustomerDetail page
- [ ] Search functionality
- [ ] Delete με confirmation

#### M1.3 - Offers Basic CRUD
- [ ] OfferList page με pagination + filters
- [ ] OfferForm basic (title, description, work report)
- [ ] Auto-generate offer number
- [ ] Link offer to customer
- [ ] Status management

#### M1.4 - Line Items
- [ ] LineItems component με inline editing
- [ ] Add/remove rows
- [ ] Drag-to-reorder (optional for MVP)
- [ ] Auto-calculate line totals
- [ ] Auto-calculate offer totals (subtotal, VAT, total)

**Deliverable M1:** Λειτουργικό CRUD για Πελάτες & Προσφορές με line items

---

### Milestone 2: Terms & Conditions
**Στόχος:** Checkbox-based T&C system

#### M2.1 - Terms Templates Management
- [ ] TermsTemplateList page (settings)
- [ ] TermsTemplateForm (create/edit)
- [ ] Reorder templates
- [ ] Activate/deactivate templates
- [ ] Set default templates

#### M2.2 - Terms Selection in Offers
- [ ] ClauseCheckboxList component
- [ ] Pre-select default clauses
- [ ] Generate terms_text από επιλογές
- [ ] Editable final text
- [ ] Store snapshots σε offer_selected_clauses

**Deliverable M2:** Πλήρες T&C system με templates

---

### Milestone 3: PDF & Polish
**Στόχος:** Export & UX improvements

#### M3.1 - PDF Generation
- [ ] Design PDF template (professional layout)
- [ ] Customer info section
- [ ] Line items table
- [ ] Totals section
- [ ] Terms & Conditions
- [ ] Company letterhead/logo
- [ ] Download PDF button
- [ ] Preview PDF in browser

#### M3.2 - UX Improvements
- [ ] Dashboard με stats
- [ ] Quick actions
- [ ] Better search (full-text)
- [ ] Filter presets
- [ ] Keyboard shortcuts (optional)
- [ ] Loading states & skeletons
- [ ] Error handling & toast notifications

#### M3.3 - Data Validation
- [ ] Greek VAT validation
- [ ] Email format validation
- [ ] Required field indicators
- [ ] Inline error messages

**Deliverable M3:** Production-ready MVP με PDF export

---

### Milestone 4: Authentication & Deployment
**Στόχος:** Secure & deployed

#### M4.1 - Authentication
- [ ] Login page
- [ ] Session management
- [ ] Protect all routes
- [ ] Logout functionality
- [ ] (Optional) Multiple users

#### M4.2 - Deployment
- [ ] Setup PostgreSQL (Railway/Supabase/Neon)
- [ ] Deploy to Vercel/Railway
- [ ] Environment variables
- [ ] Domain setup (optional)
- [ ] SSL certificate

#### M4.3 - Backup & Monitoring
- [ ] Database backup strategy
- [ ] Error logging (Sentry optional)
- [ ] Basic uptime monitoring

**Deliverable M4:** Live production system

---

## Optional v1.1 Improvements

| Feature | Περιγραφή | Priority |
|---------|-----------|----------|
| Duplicate Offer | Αντιγραφή προσφοράς σε νέα | High |
| Offer History | Log αλλαγών status | Medium |
| Email Send | Αποστολή PDF via email | Medium |
| Customer Import | Import από Excel/CSV | Low |
| Dashboard Charts | Γραφήματα στατιστικών | Low |
| Dark Mode | Theme toggle | Low |
| Mobile Responsive | Better mobile UX | Medium |
| Print Styling | Optimized print CSS | Medium |

---

## Risks & Edge Cases

### Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Data loss** | Critical | Daily backups, test restores |
| **Slow queries με scale** | Medium | Indexes, pagination, lazy load |
| **Browser compatibility** | Low | Test on Chrome, Firefox, Edge |
| **PDF generation fails** | Medium | Fallback to print CSS |
| **VAT rate changes** | Low | Configurable rate in settings |

### Edge Cases

| Case | Handling |
|------|----------|
| Offer χωρίς line items | Allow, show 0.00 total |
| Customer με 0 offers | Allow, show empty state |
| Delete customer με offers | RESTRICT - block deletion |
| Πολύ μεγάλο work_report | Textarea με scroll, truncate in lists |
| Offer number collision | DB unique constraint + retry logic |
| Concurrent edits | Last-write-wins (simple for 2-3 users) |
| Template αλλάζει μετά από offer | Snapshot system - immutable |

---

## Development Order (Recommended)

```
Week 1-2: M1.1 + M1.2 (Setup + Customers)
    ↓
Week 3-4: M1.3 + M1.4 (Offers + Line Items)
    ↓
Week 5:   M2 (Terms & Conditions)
    ↓
Week 6:   M3.1 (PDF)
    ↓
Week 7:   M3.2 + M3.3 (Polish)
    ↓
Week 8:   M4 (Auth + Deploy)
```

---

## File Structure (Proposed)

```
src/
├── app/                      # Next.js App Router
│   ├── (auth)/
│   │   └── login/
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx          # Dashboard
│   │   ├── customers/
│   │   │   ├── page.tsx      # List
│   │   │   ├── new/
│   │   │   └── [id]/
│   │   │       ├── page.tsx  # Detail
│   │   │       └── edit/
│   │   ├── offers/
│   │   │   ├── page.tsx      # List
│   │   │   ├── new/
│   │   │   └── [id]/
│   │   │       ├── page.tsx  # Detail
│   │   │       ├── edit/
│   │   │       └── pdf/
│   │   └── settings/
│   │       └── terms/
│   └── api/
│       ├── customers/
│       ├── offers/
│       └── terms/
├── components/
│   ├── ui/                   # shadcn components
│   ├── customers/
│   │   ├── CustomerForm.tsx
│   │   ├── CustomerList.tsx
│   │   └── CustomerCard.tsx
│   ├── offers/
│   │   ├── OfferForm.tsx
│   │   ├── OfferList.tsx
│   │   ├── LineItemsEditor.tsx
│   │   └── TermsSelector.tsx
│   └── shared/
│       ├── PageHeader.tsx
│       ├── SearchBar.tsx
│       └── Pagination.tsx
├── lib/
│   ├── prisma.ts
│   ├── utils.ts
│   └── validations/
│       ├── customer.ts
│       └── offer.ts
├── hooks/
│   ├── useCustomers.ts
│   └── useOffers.ts
└── types/
    └── index.ts
```

---

## API Endpoints (REST)

### Customers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/customers` | List με pagination & search |
| GET | `/api/customers/:id` | Get single |
| POST | `/api/customers` | Create |
| PUT | `/api/customers/:id` | Update |
| DELETE | `/api/customers/:id` | Delete |

### Offers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/offers` | List με pagination & filters |
| GET | `/api/offers/:id` | Get single με line items & clauses |
| POST | `/api/offers` | Create |
| PUT | `/api/offers/:id` | Update |
| DELETE | `/api/offers/:id` | Delete |
| PATCH | `/api/offers/:id/status` | Update status only |
| GET | `/api/offers/:id/pdf` | Generate PDF |

### Terms Templates
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/terms` | List all active |
| POST | `/api/terms` | Create |
| PUT | `/api/terms/:id` | Update |
| DELETE | `/api/terms/:id` | Delete (soft) |
| PUT | `/api/terms/reorder` | Reorder templates |

---

## Acceptance Criteria (MVP)

- [ ] Μπορώ να δημιουργήσω πελάτη (εταιρεία ή ιδιώτη)
- [ ] Μπορώ να δημιουργήσω προσφορά από το προφίλ πελάτη
- [ ] Μπορώ να προσθέσω γραμμές με τιμή, ποσότητα, έκπτωση
- [ ] Τα σύνολα υπολογίζονται αυτόματα
- [ ] Μπορώ να επιλέξω T&C με checkboxes
- [ ] Μπορώ να δω και να επεξεργαστώ το τελικό κείμενο όρων
- [ ] Μπορώ να δω όλες τις προσφορές κεντρικά
- [ ] Μπορώ να δω τις προσφορές ανά πελάτη
- [ ] Μπορώ να αλλάξω το status της προσφοράς
- [ ] Μπορώ να κατεβάσω την προσφορά ως PDF
