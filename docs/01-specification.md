# CRM Ship Pump Repair - Προδιαγραφές v1

## 1. Οντότητες (Entities)

### 1.1 Customer (Πελάτης)

| Πεδίο | Τύπος | Required | Validation | Περιγραφή |
|-------|-------|----------|------------|-----------|
| `id` | UUID | ✅ | auto-generated | Primary key |
| `customer_type` | ENUM | ✅ | 'company' \| 'individual' | Τύπος πελάτη |
| `company_name` | VARCHAR(255) | ✅* | min 2 chars | Επωνυμία (*required αν company) |
| `first_name` | VARCHAR(100) | ✅* | min 2 chars | Όνομα (*required αν individual) |
| `last_name` | VARCHAR(100) | ✅* | min 2 chars | Επώνυμο (*required αν individual) |
| `vat_number` | VARCHAR(20) | ❌ | unique, Greek VAT format | ΑΦΜ (κυρίως για εταιρείες) |
| `tax_office` | VARCHAR(100) | ❌ | - | ΔΟΥ |
| `phone` | VARCHAR(20) | ❌ | - | Τηλέφωνο |
| `email` | VARCHAR(255) | ❌ | email format | Email |
| `address` | TEXT | ❌ | - | Διεύθυνση |
| `city` | VARCHAR(100) | ❌ | - | Πόλη |
| `postal_code` | VARCHAR(10) | ❌ | - | Τ.Κ. |
| `notes` | TEXT | ❌ | - | Σημειώσεις |
| `created_at` | TIMESTAMP | ✅ | auto | Ημ/νία δημιουργίας |
| `updated_at` | TIMESTAMP | ✅ | auto | Ημ/νία τροποποίησης |

**Business Rules:**
- Αν `customer_type = 'company'` → `company_name` required
- Αν `customer_type = 'individual'` → `first_name` + `last_name` required
- `vat_number` πρέπει να είναι unique (αν δοθεί)

---

### 1.2 Offer (Προσφορά)

| Πεδίο | Τύπος | Required | Validation | Περιγραφή |
|-------|-------|----------|------------|-----------|
| `id` | UUID | ✅ | auto-generated | Primary key |
| `offer_number` | VARCHAR(20) | ✅ | auto, unique | Αριθμός προσφοράς (π.χ. PRO-2024-0001) |
| `customer_id` | UUID | ✅ | FK → customers | Συνδεδεμένος πελάτης |
| `title` | VARCHAR(255) | ✅ | min 3 chars | Τίτλος προσφοράς |
| `object_description` | TEXT | ❌ | - | Περιγραφή αντικειμένου |
| `work_report` | TEXT | ❌ | - | Έκθεση εργασιών |
| `status` | ENUM | ✅ | default 'draft' | Κατάσταση προσφοράς |
| `subtotal` | DECIMAL(12,2) | ✅ | >= 0 | Υποσύνολο (υπολογίζεται) |
| `vat_rate` | DECIMAL(5,2) | ✅ | default 24.00 | Ποσοστό ΦΠΑ |
| `vat_amount` | DECIMAL(12,2) | ✅ | >= 0 | Ποσό ΦΠΑ (υπολογίζεται) |
| `total` | DECIMAL(12,2) | ✅ | >= 0 | Σύνολο (υπολογίζεται) |
| `terms_text` | TEXT | ❌ | - | Τελικό κείμενο όρων (generated + editable) |
| `offer_date` | DATE | ✅ | default today | Ημ/νία προσφοράς |
| `valid_until` | DATE | ❌ | >= offer_date | Ισχύς έως |
| `created_at` | TIMESTAMP | ✅ | auto | Ημ/νία δημιουργίας |
| `updated_at` | TIMESTAMP | ✅ | auto | Ημ/νία τροποποίησης |

**Status Values:**
| Value | Ελληνικά | Περιγραφή |
|-------|----------|-----------|
| `draft` | Πρόχειρο | Υπό επεξεργασία |
| `sent` | Απεσταλμένη | Στάλθηκε στον πελάτη |
| `accepted` | Αποδεκτή | Ο πελάτης αποδέχτηκε |
| `rejected` | Απορριφθείσα | Ο πελάτης αρνήθηκε |
| `expired` | Ληγμένη | Πέρασε η ισχύς |

**Offer Number Format:** `PRO-{YYYY}-{NNNN}` (π.χ. PRO-2024-0042)

---

### 1.3 OfferLineItem (Γραμμή Προσφοράς)

| Πεδίο | Τύπος | Required | Validation | Περιγραφή |
|-------|-------|----------|------------|-----------|
| `id` | UUID | ✅ | auto-generated | Primary key |
| `offer_id` | UUID | ✅ | FK → offers | Συνδεδεμένη προσφορά |
| `sort_order` | INTEGER | ✅ | >= 0 | Σειρά εμφάνισης |
| `description` | TEXT | ✅ | min 1 char | Περιγραφή τεμαχίου/εργασίας |
| `quantity` | DECIMAL(10,2) | ✅ | > 0, default 1 | Ποσότητα |
| `unit` | VARCHAR(20) | ❌ | default 'τεμ.' | Μονάδα μέτρησης |
| `unit_price` | DECIMAL(12,2) | ✅ | >= 0 | Τιμή μονάδας |
| `discount_percent` | DECIMAL(5,2) | ❌ | 0-100, default 0 | Έκπτωση % |
| `line_total` | DECIMAL(12,2) | ✅ | calculated | Σύνολο γραμμής |
| `created_at` | TIMESTAMP | ✅ | auto | Ημ/νία δημιουργίας |

**Calculation:**
```
line_total = (quantity * unit_price) * (1 - discount_percent / 100)
```

---

### 1.4 TermsClauseTemplate (Πρότυπο Όρου)

| Πεδίο | Τύπος | Required | Validation | Περιγραφή |
|-------|-------|----------|------------|-----------|
| `id` | UUID | ✅ | auto-generated | Primary key |
| `title` | VARCHAR(255) | ✅ | min 3 chars | Τίτλος (για checkbox label) |
| `clause_text` | TEXT | ✅ | min 10 chars | Πλήρες κείμενο όρου |
| `sort_order` | INTEGER | ✅ | >= 0 | Σειρά εμφάνισης |
| `is_active` | BOOLEAN | ✅ | default true | Ενεργός όρος |
| `is_default` | BOOLEAN | ✅ | default false | Προεπιλογή (pre-checked) |
| `created_at` | TIMESTAMP | ✅ | auto | Ημ/νία δημιουργίας |

---

### 1.5 OfferSelectedClause (Junction Table)

| Πεδίο | Τύπος | Required | Validation | Περιγραφή |
|-------|-------|----------|------------|-----------|
| `id` | UUID | ✅ | auto-generated | Primary key |
| `offer_id` | UUID | ✅ | FK → offers | Προσφορά |
| `clause_template_id` | UUID | ✅ | FK → terms_clause_templates | Πρότυπο όρου |
| `sort_order` | INTEGER | ✅ | >= 0 | Σειρά στην προσφορά |
| `clause_text_snapshot` | TEXT | ✅ | copied from template | Αντίγραφο κειμένου (immutable) |

**Σημείωση:** Αποθηκεύουμε `clause_text_snapshot` ώστε αν αλλάξει το template, οι παλιές προσφορές να διατηρούν το αρχικό κείμενο.

---

## 2. Σχέσεις (Relationships)

```
┌─────────────┐       1:N        ┌─────────────┐
│  Customer   │─────────────────▶│   Offer     │
└─────────────┘                  └─────────────┘
                                       │
                                       │ 1:N
                                       ▼
                                ┌──────────────────┐
                                │  OfferLineItem   │
                                └──────────────────┘

┌─────────────┐       1:N        ┌─────────────────────┐
│   Offer     │─────────────────▶│ OfferSelectedClause │
└─────────────┘                  └─────────────────────┘
                                          │
                                          │ N:1
                                          ▼
                                ┌─────────────────────┐
                                │ TermsClauseTemplate │
                                └─────────────────────┘
```

**Summary:**
- Customer → Offers (1:N)
- Offer → OfferLineItems (1:N)
- Offer ↔ TermsClauseTemplates (M:N via OfferSelectedClause)

---

## 3. UI Pages (Routes)

### 3.1 Route Structure

| Route | Σελίδα | Περιγραφή |
|-------|--------|-----------|
| `/` | Dashboard | Overview με stats |
| `/customers` | CustomerList | Λίστα πελατών |
| `/customers/new` | CustomerForm | Δημιουργία πελάτη |
| `/customers/:id` | CustomerDetail | Προφίλ πελάτη + offers tab |
| `/customers/:id/edit` | CustomerForm | Επεξεργασία πελάτη |
| `/offers` | OfferList | Κεντρική λίστα προσφορών |
| `/offers/new` | OfferForm | Νέα προσφορά (standalone) |
| `/offers/new?customerId=:id` | OfferForm | Νέα προσφορά από πελάτη |
| `/offers/:id` | OfferDetail | Προβολή προσφοράς |
| `/offers/:id/edit` | OfferForm | Επεξεργασία προσφοράς |
| `/offers/:id/pdf` | PDF View | Preview/Download PDF |
| `/settings/terms` | TermsTemplateList | Διαχείριση όρων |

---

### 3.2 Components ανά Page

#### CustomerList (`/customers`)
```
├── PageHeader (τίτλος + "Νέος Πελάτης" button)
├── SearchBar (αναζήτηση με debounce)
├── FilterTabs (Όλοι | Εταιρείες | Ιδιώτες)
├── CustomerTable
│   ├── columns: Επωνυμία, ΑΦΜ, Τηλέφωνο, Email, Προσφορές
│   ├── sortable columns
│   └── row click → navigate to detail
└── Pagination
```

#### CustomerForm (`/customers/new`, `/customers/:id/edit`)
```
├── FormHeader (τίτλος + Cancel/Save buttons)
├── CustomerTypeSelector (toggle: Εταιρεία | Ιδιώτης)
├── ConditionalFields
│   ├── if company: CompanyNameField, VATField, TaxOfficeField
│   └── if individual: FirstNameField, LastNameField
├── ContactSection
│   ├── PhoneField, EmailField
│   └── AddressFields (address, city, postal_code)
├── NotesField (textarea)
└── FormActions (Ακύρωση | Αποθήκευση)
```

#### CustomerDetail (`/customers/:id`)
```
├── CustomerHeader
│   ├── Display name (company or full name)
│   ├── Type badge
│   └── Actions (Edit | Delete | "Νέα Προσφορά")
├── CustomerInfoCard
│   ├── Contact info
│   └── Notes
├── Tabs
│   └── OffersTab
│       ├── OffersTable (filtered by customer)
│       └── Pagination
```

#### OfferList (`/offers`)
```
├── PageHeader (τίτλος + "Νέα Προσφορά" button)
├── SearchBar
├── FilterBar
│   ├── StatusFilter (dropdown/chips)
│   └── DateRangeFilter
├── OfferTable
│   ├── columns: Αριθμός, Πελάτης, Τίτλος, Ημ/νία, Σύνολο, Status
│   ├── sortable
│   └── row click → navigate to detail
└── Pagination
```

#### OfferForm (`/offers/new`, `/offers/:id/edit`)
```
├── FormHeader (Αριθμός προσφοράς + Status badge + Actions)
├── CustomerSelector
│   ├── if customerId in URL → pre-filled, readonly
│   └── else → searchable dropdown
├── BasicInfoSection
│   ├── TitleField
│   ├── ObjectDescriptionField (textarea)
│   └── WorkReportField (rich textarea)
├── LineItemsSection
│   ├── LineItemsTable
│   │   ├── columns: Περιγραφή, Ποσότητα, Μονάδα, Τιμή, Έκπτωση%, Σύνολο
│   │   ├── inline editing
│   │   ├── drag-to-reorder
│   │   └── delete row button
│   ├── AddLineItemButton
│   └── TotalsDisplay
│       ├── Υποσύνολο
│       ├── ΦΠΑ (24%)
│       └── Τελικό Σύνολο
├── TermsSection
│   ├── ClauseCheckboxList
│   │   └── foreach template: Checkbox + title
│   ├── GeneratedTermsPreview (readonly, from checked)
│   └── TermsTextEditor (editable override)
├── MetaSection
│   ├── OfferDatePicker
│   └── ValidUntilPicker
└── FormActions
    ├── Ακύρωση
    ├── Αποθήκευση ως Πρόχειρο
    └── Αποθήκευση & Αποστολή (sets status=sent)
```

#### OfferDetail (`/offers/:id`)
```
├── OfferHeader
│   ├── Offer number + Status badge
│   └── Actions (Edit | Duplicate | PDF | Delete | Change Status)
├── CustomerCard (linked customer summary)
├── OfferContent
│   ├── Title, Description, Work Report
│   ├── LineItemsTable (readonly)
│   ├── TotalsSummary
│   └── TermsText
└── ActivityLog (optional: status changes history)
```

---

## 4. Workflows

### 4.1 Δημιουργία Πελάτη

```
1. User navigates to /customers/new
2. User selects customer type (Εταιρεία/Ιδιώτης)
3. Form adapts fields based on type
4. User fills required + optional fields
5. User clicks "Αποθήκευση"
6. System validates:
   - Required fields based on type
   - VAT format (if provided)
   - VAT uniqueness (if provided)
7. On success → redirect to /customers/:id
8. On error → show inline validation messages
```

### 4.2 Δημιουργία Προσφοράς από Πελάτη

```
1. User is on /customers/:id (CustomerDetail)
2. User clicks "Νέα Προσφορά"
3. System navigates to /offers/new?customerId=:id
4. OfferForm loads with:
   - Customer pre-selected (readonly)
   - Auto-generated offer_number
   - offer_date = today
   - Default T&C clauses pre-checked
5. User fills offer details
6. User adds line items (see 4.3)
7. User selects T&C clauses (see 4.4)
8. User clicks "Αποθήκευση"
9. System calculates totals and saves
10. Redirect to /offers/:id
```

### 4.3 Διαχείριση Line Items

```
Adding:
1. User clicks "Προσθήκη Γραμμής"
2. New empty row appears at bottom
3. User fills: description, qty, unit_price, discount%
4. System auto-calculates line_total in real-time

Editing:
1. User clicks on cell to edit inline
2. Changes auto-save on blur (or explicit save)

Removing:
1. User clicks delete icon on row
2. Confirmation dialog appears
3. On confirm → row removed, totals recalculated

Reordering:
1. User drags row handle
2. Drop at new position
3. sort_order updated for affected rows
```

### 4.4 Επιλογή T&C Clauses

```
1. System displays all active clause templates as checkboxes
2. Templates with is_default=true are pre-checked
3. User checks/unchecks clauses
4. On each change:
   a. System regenerates terms_text from checked clauses
   b. Clauses joined with newlines, sorted by sort_order
5. User can manually edit the generated terms_text
6. On save:
   a. Selected clauses saved to offer_selected_clauses
   b. clause_text_snapshot copied for each
   c. Final terms_text saved to offer
```

### 4.5 Υπολογισμός Συνόλων

```
Trigger: Any change to line items

Calculation:
1. For each line item:
   line_total = qty * unit_price * (1 - discount_percent/100)

2. subtotal = SUM(all line_total)

3. vat_amount = subtotal * (vat_rate / 100)

4. total = subtotal + vat_amount

Display:
- Real-time update in UI
- Stored in database on save
```

---

## 5. Non-Functional Requirements

### 5.1 Performance

| Απαίτηση | Target | Σημειώσεις |
|----------|--------|------------|
| Page load | < 2s | Initial load with data |
| Search response | < 500ms | With debounce 300ms |
| Form save | < 1s | Including validation |
| PDF generation | < 3s | Client-side or server |

### 5.2 Scalability (10 έτη)

**Εκτιμήσεις όγκου:**
- ~50 προσφορές/μήνα × 12 × 10 = 6,000 offers
- ~200 πελάτες
- ~30,000 line items

**Strategies:**
- Database indexes (see schema)
- Pagination (20-50 items/page)
- Lazy loading for large text fields
- Archive old offers (optional, year-based)

### 5.3 Security Basics

| Μέτρο | Implementation |
|-------|----------------|
| Authentication | Simple login (email/password) |
| Authorization | All users have full access (family business) |
| Input validation | Server-side + client-side |
| SQL injection | Parameterized queries (ORM) |
| XSS | Escape output, sanitize rich text |
| HTTPS | Required for production |

### 5.4 Backup

- Daily automated database backup
- Retain 30 days of backups
- Test restore procedure monthly

---

## 6. Μελλοντικές Επεκτάσεις (Out of Scope για v1)

- Invoicing (τιμολόγηση)
- Email integration (αποστολή από το app)
- Multi-language
- Multiple VAT rates
- User roles/permissions
- Dashboard analytics
- Mobile app
