-- =============================================================================
-- CRM Ship Pump Repair - PostgreSQL Schema v1
-- =============================================================================
-- Designed for 10-year scalability (~6,000 offers, ~200 customers)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Extensions
-- -----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";  -- For UUID generation

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------

-- Τύπος πελάτη
CREATE TYPE customer_type AS ENUM ('company', 'individual');

-- Κατάσταση προσφοράς
CREATE TYPE offer_status AS ENUM ('draft', 'sent', 'accepted', 'rejected', 'expired');

-- -----------------------------------------------------------------------------
-- Table: customers (Πελάτες)
-- -----------------------------------------------------------------------------
CREATE TABLE customers (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Τύπος πελάτη
    customer_type   customer_type NOT NULL,

    -- Στοιχεία εταιρείας (required if customer_type = 'company')
    company_name    VARCHAR(255),

    -- Στοιχεία ιδιώτη (required if customer_type = 'individual')
    first_name      VARCHAR(100),
    last_name       VARCHAR(100),

    -- Φορολογικά στοιχεία
    vat_number      VARCHAR(20) UNIQUE,  -- ΑΦΜ
    tax_office      VARCHAR(100),        -- ΔΟΥ

    -- Στοιχεία επικοινωνίας
    phone           VARCHAR(20),
    email           VARCHAR(255),
    address         TEXT,
    city            VARCHAR(100),
    postal_code     VARCHAR(10),

    -- Επιπλέον
    notes           TEXT,

    -- Timestamps
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT chk_company_name CHECK (
        customer_type != 'company' OR company_name IS NOT NULL
    ),
    CONSTRAINT chk_individual_name CHECK (
        customer_type != 'individual' OR (first_name IS NOT NULL AND last_name IS NOT NULL)
    )
);

-- Indexes για customers
CREATE INDEX idx_customers_type ON customers(customer_type);
CREATE INDEX idx_customers_company_name ON customers(company_name) WHERE company_name IS NOT NULL;
CREATE INDEX idx_customers_last_name ON customers(last_name) WHERE last_name IS NOT NULL;
CREATE INDEX idx_customers_vat ON customers(vat_number) WHERE vat_number IS NOT NULL;
CREATE INDEX idx_customers_created_at ON customers(created_at DESC);

-- Full-text search index για αναζήτηση
CREATE INDEX idx_customers_search ON customers USING GIN (
    to_tsvector('simple',
        COALESCE(company_name, '') || ' ' ||
        COALESCE(first_name, '') || ' ' ||
        COALESCE(last_name, '') || ' ' ||
        COALESCE(vat_number, '') || ' ' ||
        COALESCE(phone, '') || ' ' ||
        COALESCE(email, '')
    )
);

-- -----------------------------------------------------------------------------
-- Table: terms_clause_templates (Πρότυπα Όρων)
-- -----------------------------------------------------------------------------
CREATE TABLE terms_clause_templates (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    title           VARCHAR(255) NOT NULL,   -- Τίτλος για checkbox
    clause_text     TEXT NOT NULL,           -- Πλήρες κείμενο όρου
    sort_order      INTEGER NOT NULL DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    is_default      BOOLEAN NOT NULL DEFAULT FALSE,  -- Pre-checked σε νέες προσφορές

    -- Timestamps
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index για ταξινόμηση
CREATE INDEX idx_terms_templates_sort ON terms_clause_templates(sort_order) WHERE is_active = TRUE;

-- -----------------------------------------------------------------------------
-- Table: offers (Προσφορές)
-- -----------------------------------------------------------------------------
CREATE TABLE offers (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Αριθμός προσφοράς (auto-generated, unique)
    offer_number        VARCHAR(20) NOT NULL UNIQUE,

    -- Συνδεδεμένος πελάτης
    customer_id         UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,

    -- Βασικά στοιχεία
    title               VARCHAR(255) NOT NULL,
    object_description  TEXT,                -- Περιγραφή αντικειμένου
    work_report         TEXT,                -- Έκθεση εργασιών

    -- Κατάσταση
    status              offer_status NOT NULL DEFAULT 'draft',

    -- Ποσά (calculated from line items)
    subtotal            DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    vat_rate            DECIMAL(5, 2) NOT NULL DEFAULT 24.00,  -- ΦΠΑ %
    vat_amount          DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    total               DECIMAL(12, 2) NOT NULL DEFAULT 0.00,

    -- Terms & Conditions (generated + optionally edited)
    terms_text          TEXT,

    -- Ημερομηνίες
    offer_date          DATE NOT NULL DEFAULT CURRENT_DATE,
    valid_until         DATE,

    -- Timestamps
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT chk_offer_valid_until CHECK (valid_until IS NULL OR valid_until >= offer_date),
    CONSTRAINT chk_offer_amounts CHECK (subtotal >= 0 AND vat_amount >= 0 AND total >= 0)
);

-- Indexes για offers
CREATE INDEX idx_offers_customer ON offers(customer_id);
CREATE INDEX idx_offers_status ON offers(status);
CREATE INDEX idx_offers_date ON offers(offer_date DESC);
CREATE INDEX idx_offers_created_at ON offers(created_at DESC);
CREATE INDEX idx_offers_number ON offers(offer_number);

-- Composite index για common queries
CREATE INDEX idx_offers_customer_status ON offers(customer_id, status);
CREATE INDEX idx_offers_status_date ON offers(status, offer_date DESC);

-- -----------------------------------------------------------------------------
-- Table: offer_line_items (Γραμμές Προσφοράς)
-- -----------------------------------------------------------------------------
CREATE TABLE offer_line_items (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    offer_id            UUID NOT NULL REFERENCES offers(id) ON DELETE CASCADE,

    sort_order          INTEGER NOT NULL DEFAULT 0,
    description         TEXT NOT NULL,
    quantity            DECIMAL(10, 2) NOT NULL DEFAULT 1.00,
    unit                VARCHAR(20) DEFAULT 'τεμ.',
    unit_price          DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    discount_percent    DECIMAL(5, 2) NOT NULL DEFAULT 0.00,

    -- Calculated: qty * unit_price * (1 - discount/100)
    line_total          DECIMAL(12, 2) NOT NULL DEFAULT 0.00,

    -- Timestamp
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT chk_line_quantity CHECK (quantity > 0),
    CONSTRAINT chk_line_price CHECK (unit_price >= 0),
    CONSTRAINT chk_line_discount CHECK (discount_percent >= 0 AND discount_percent <= 100)
);

-- Indexes για line items
CREATE INDEX idx_line_items_offer ON offer_line_items(offer_id);
CREATE INDEX idx_line_items_order ON offer_line_items(offer_id, sort_order);

-- -----------------------------------------------------------------------------
-- Table: offer_selected_clauses (Junction: Offer ↔ Terms)
-- -----------------------------------------------------------------------------
CREATE TABLE offer_selected_clauses (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    offer_id                UUID NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
    clause_template_id      UUID NOT NULL REFERENCES terms_clause_templates(id) ON DELETE RESTRICT,

    sort_order              INTEGER NOT NULL DEFAULT 0,

    -- Snapshot του κειμένου τη στιγμή της δημιουργίας (immutable)
    clause_text_snapshot    TEXT NOT NULL,

    -- Unique constraint: δεν μπορεί να έχει διπλό clause στην ίδια προσφορά
    CONSTRAINT uq_offer_clause UNIQUE (offer_id, clause_template_id)
);

-- Indexes
CREATE INDEX idx_selected_clauses_offer ON offer_selected_clauses(offer_id);

-- -----------------------------------------------------------------------------
-- Table: offer_number_sequence (Για auto-increment offer numbers)
-- -----------------------------------------------------------------------------
CREATE TABLE offer_number_sequence (
    year        INTEGER PRIMARY KEY,
    last_number INTEGER NOT NULL DEFAULT 0
);

-- -----------------------------------------------------------------------------
-- Function: Generate offer number
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION generate_offer_number()
RETURNS VARCHAR(20) AS $$
DECLARE
    current_year INTEGER;
    next_number INTEGER;
BEGIN
    current_year := EXTRACT(YEAR FROM CURRENT_DATE);

    -- Insert or update sequence for current year
    INSERT INTO offer_number_sequence (year, last_number)
    VALUES (current_year, 1)
    ON CONFLICT (year) DO UPDATE
    SET last_number = offer_number_sequence.last_number + 1
    RETURNING last_number INTO next_number;

    -- Format: PRO-2024-0001
    RETURN 'PRO-' || current_year::TEXT || '-' || LPAD(next_number::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- Trigger: Auto-generate offer_number
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_offer_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.offer_number IS NULL OR NEW.offer_number = '' THEN
        NEW.offer_number := generate_offer_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_offer_number
    BEFORE INSERT ON offers
    FOR EACH ROW
    EXECUTE FUNCTION set_offer_number();

-- -----------------------------------------------------------------------------
-- Trigger: Update updated_at timestamp
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_customers_updated
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_offers_updated
    BEFORE UPDATE ON offers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_terms_templates_updated
    BEFORE UPDATE ON terms_clause_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- -----------------------------------------------------------------------------
-- Function: Calculate line item total
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION calculate_line_total()
RETURNS TRIGGER AS $$
BEGIN
    NEW.line_total := ROUND(
        NEW.quantity * NEW.unit_price * (1 - NEW.discount_percent / 100),
        2
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_line_item_total
    BEFORE INSERT OR UPDATE ON offer_line_items
    FOR EACH ROW
    EXECUTE FUNCTION calculate_line_total();

-- -----------------------------------------------------------------------------
-- Function: Recalculate offer totals
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION recalculate_offer_totals()
RETURNS TRIGGER AS $$
DECLARE
    offer_uuid UUID;
    new_subtotal DECIMAL(12, 2);
    offer_vat_rate DECIMAL(5, 2);
BEGIN
    -- Determine which offer to update
    IF TG_OP = 'DELETE' THEN
        offer_uuid := OLD.offer_id;
    ELSE
        offer_uuid := NEW.offer_id;
    END IF;

    -- Calculate new subtotal
    SELECT COALESCE(SUM(line_total), 0)
    INTO new_subtotal
    FROM offer_line_items
    WHERE offer_id = offer_uuid;

    -- Get current VAT rate
    SELECT vat_rate INTO offer_vat_rate
    FROM offers WHERE id = offer_uuid;

    -- Update offer totals
    UPDATE offers SET
        subtotal = new_subtotal,
        vat_amount = ROUND(new_subtotal * offer_vat_rate / 100, 2),
        total = ROUND(new_subtotal * (1 + offer_vat_rate / 100), 2),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = offer_uuid;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_recalculate_offer_totals
    AFTER INSERT OR UPDATE OR DELETE ON offer_line_items
    FOR EACH ROW
    EXECUTE FUNCTION recalculate_offer_totals();

-- -----------------------------------------------------------------------------
-- Sample Data: Terms & Conditions Templates
-- -----------------------------------------------------------------------------
INSERT INTO terms_clause_templates (title, clause_text, sort_order, is_default) VALUES
(
    'Εγγύηση εργασίας',
    'Η εργασία καλύπτεται από εγγύηση καλής λειτουργίας για διάστημα δώδεκα (12) μηνών από την ημερομηνία παράδοσης.',
    1,
    TRUE
),
(
    'Χρόνος παράδοσης',
    'Ο εκτιμώμενος χρόνος παράδοσης είναι εντός δέκα (10) εργάσιμων ημερών από την αποδοχή της προσφοράς, εκτός αν συμφωνηθεί διαφορετικά.',
    2,
    TRUE
),
(
    'Τρόπος πληρωμής',
    'Η πληρωμή γίνεται σε δύο δόσεις: 50% προκαταβολή με την ανάθεση και 50% με την παράδοση της εργασίας.',
    3,
    TRUE
),
(
    'Ισχύς προσφοράς',
    'Η παρούσα προσφορά ισχύει για τριάντα (30) ημέρες από την ημερομηνία έκδοσής της.',
    4,
    TRUE
),
(
    'Ανταλλακτικά',
    'Τα ανταλλακτικά που θα χρησιμοποιηθούν είναι γνήσια ή ισοδύναμης ποιότητας και καλύπτονται από εγγύηση κατασκευαστή.',
    5,
    FALSE
),
(
    'Δοκιμές λειτουργίας',
    'Μετά την ολοκλήρωση της επισκευής θα πραγματοποιηθούν δοκιμές λειτουργίας παρουσία του πελάτη ή εκπροσώπου του.',
    6,
    FALSE
),
(
    'Μεταφορά',
    'Η μεταφορά του εξοπλισμού από και προς το συνεργείο βαρύνει τον πελάτη, εκτός αν συμφωνηθεί διαφορετικά.',
    7,
    FALSE
),
(
    'Έκτακτες εργασίες',
    'Σε περίπτωση που κατά την επισκευή διαπιστωθούν επιπλέον βλάβες, θα ενημερωθεί ο πελάτης και θα αποσταλεί συμπληρωματική προσφορά.',
    8,
    FALSE
);

-- -----------------------------------------------------------------------------
-- View: Customer with stats
-- -----------------------------------------------------------------------------
CREATE VIEW v_customers_with_stats AS
SELECT
    c.*,
    CASE
        WHEN c.customer_type = 'company' THEN c.company_name
        ELSE c.first_name || ' ' || c.last_name
    END AS display_name,
    COUNT(o.id) AS total_offers,
    COUNT(o.id) FILTER (WHERE o.status = 'accepted') AS accepted_offers,
    COALESCE(SUM(o.total) FILTER (WHERE o.status = 'accepted'), 0) AS total_revenue
FROM customers c
LEFT JOIN offers o ON o.customer_id = c.id
GROUP BY c.id;

-- -----------------------------------------------------------------------------
-- View: Offers with customer info
-- -----------------------------------------------------------------------------
CREATE VIEW v_offers_with_customer AS
SELECT
    o.*,
    CASE
        WHEN c.customer_type = 'company' THEN c.company_name
        ELSE c.first_name || ' ' || c.last_name
    END AS customer_display_name,
    c.customer_type,
    c.vat_number AS customer_vat,
    c.phone AS customer_phone,
    c.email AS customer_email
FROM offers o
JOIN customers c ON c.id = o.customer_id;

-- =============================================================================
-- End of Schema
-- =============================================================================
