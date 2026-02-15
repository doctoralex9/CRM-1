# CRM Ship Pump Repair - Υποθέσεις & Εναλλακτικές

## Υποθέσεις που Έγιναν

### 1. Platform

| Υπόθεση | Εναλλακτική |
|---------|-------------|
| **Web Application** | Desktop app (Electron), Mobile app (React Native) |
| Γιατί: Accessible από παντού, no installation, easy updates | |

**Ερώτηση για πελάτη:** Θέλετε να λειτουργεί μόνο σε browser ή χρειάζεστε και mobile app;

---

### 2. Authentication

| Υπόθεση | Εναλλακτική |
|---------|-------------|
| **Simple login (email/password)** | No auth (local only), SSO, 2FA |
| Γιατί: 2-3 users, minimal security needs | |

**Ερώτηση για πελάτη:** Χρειάζεστε ξεχωριστό login για κάθε χρήστη ή μπορείτε με κοινό access;

---

### 3. ΦΠΑ

| Υπόθεση | Εναλλακτική |
|---------|-------------|
| **Σταθερό 24%** με δυνατότητα αλλαγής ανά προσφορά | Πολλαπλοί συντελεστές (24%, 13%, 6%), 0% για εξαγωγές |
| Γιατί: Απλή περίπτωση για B2B υπηρεσίες | |

**Ερώτηση για πελάτη:** Χρησιμοποιείτε πάντα 24% ΦΠΑ ή υπάρχουν περιπτώσεις με διαφορετικό συντελεστή;

---

### 4. PDF Export

| Υπόθεση | Εναλλακτική |
|---------|-------------|
| **PDF download από browser** | Email αποστολή, Print to PDF, Word export |
| Γιατί: Simplest implementation, universal format | |

**Ερώτηση για πελάτη:** Πώς στέλνετε τις προσφορές στους πελάτες; Email με attachment; Print;

---

### 5. Offer Status Workflow

| Υπόθεση | Εναλλακτική |
|---------|-------------|
| **Manual status change** (user clicks to change) | Automatic (sent when emailed), Workflow automation |
| Status: Draft → Sent → Accepted/Rejected/Expired | |

**Ερώτηση για πελάτη:** Θέλετε να αλλάζετε χειροκίνητα την κατάσταση ή να γίνεται αυτόματα;

---

### 6. Offer Numbering

| Υπόθεση | Εναλλακτική |
|---------|-------------|
| **PRO-YYYY-NNNN** (π.χ. PRO-2024-0001) | Custom format, Manual entry, Per-customer numbering |
| Reset ανά έτος | |

**Ερώτηση για πελάτη:** Έχετε συγκεκριμένη μορφή αρίθμησης προσφορών που θέλετε να διατηρήσετε;

---

### 7. Multi-language

| Υπόθεση | Εναλλακτική |
|---------|-------------|
| **Μόνο Ελληνικά** | Bilingual (EL/EN), Full i18n |
| Γιατί: Family business, local customers | |

**Ερώτηση για πελάτη:** Χρειάζεστε αγγλικά για ξένους πελάτες;

---

### 8. Currency

| Υπόθεση | Εναλλακτική |
|---------|-------------|
| **Μόνο EUR (€)** | Multi-currency, USD for international |
| Γιατί: Greek business, EU market | |

---

### 9. Line Item Units

| Υπόθεση | Εναλλακτική |
|---------|-------------|
| **Free text unit** (default: τεμ.) | Predefined list (τεμ., ώρες, μέτρα) |
| Γιατί: Flexibility for different work types | |

---

### 10. Customer Deletion

| Υπόθεση | Εναλλακτική |
|---------|-------------|
| **Block deletion if has offers** | Soft delete, Archive, Cascade delete |
| Γιατί: Protect data integrity for 10-year history | |

---

### 11. Concurrent Editing

| Υπόθεση | Εναλλακτική |
|---------|-------------|
| **Last-write-wins** (no locking) | Optimistic locking, Real-time collaboration |
| Γιατί: 2-3 users, unlikely conflicts | |

---

### 12. Data Backup

| Υπόθεση | Εναλλακτική |
|---------|-------------|
| **Automated daily backup** (managed by hosting) | Manual export, Local backup script |
| Γιατί: Standard practice, critical data | |

---

### 13. Hosting

| Υπόθεση | Εναλλακτική |
|---------|-------------|
| **Cloud hosted** (Vercel + managed PostgreSQL) | Self-hosted, Local server, Hybrid |
| Γιατί: No maintenance overhead, auto-scaling | |

**Cost estimate:** ~$0-20/month για αυτό το scale

---

### 14. Offer Line Items

| Υπόθεση | Εναλλακτική |
|---------|-------------|
| **Free text descriptions** (no inventory link) | Product catalog, Inventory management |
| Γιατί: Flexibility, no stock tracking needed | |

---

### 15. Work Report Field

| Υπόθεση | Εναλλακτική |
|---------|-------------|
| **Plain text** (large textarea) | Rich text (bold, lists), Markdown |
| Γιατί: Simple, no formatting complexity | |

**Ερώτηση για πελάτη:** Χρειάζεστε formatting (bold, bullets) στην έκθεση εργασιών;

---

## Κρίσιμες Ερωτήσεις για τον Πελάτη (Prioritized)

### Must Answer (πριν ξεκινήσει development)

1. **Platform:** Web μόνο ή και mobile; Θα χρησιμοποιούν tablets;

2. **PDF/Delivery:** Πώς στέλνετε τις προσφορές; Χρειάζεστε αυτόματη αποστολή email ή κατεβάζετε PDF και στέλνετε χειροκίνητα;

3. **Authentication:** Ξεχωριστό login ανά χρήστη ή κοινό;

4. **Company Branding:** Έχετε logo και στοιχεία εταιρείας για το PDF; (Θα χρειαστούν)

### Nice to Know (μπορούν να απαντηθούν αργότερα)

5. **Αρίθμηση:** Η μορφή PRO-2024-0001 είναι OK;

6. **ΦΠΑ:** Πάντα 24% ή χρειάζονται εξαιρέσεις;

7. **Γλώσσα:** Μόνο ελληνικά;

8. **Work Report Format:** Plain text ή χρειάζεται bold/bullets;

---

## Out of Scope (Confirmed)

Τα παρακάτω **δεν** περιλαμβάνονται στο v1:

- ❌ Τιμολόγηση (invoicing)
- ❌ Πληρωμές & οικονομική παρακολούθηση
- ❌ Inventory management
- ❌ Job/Work order tracking
- ❌ Calendar/Scheduling
- ❌ Email integration (automated)
- ❌ Mobile app (native)
- ❌ Reports & Analytics (advanced)
- ❌ Multiple companies/branches
- ❌ API για third-party integrations

Αυτά μπορούν να προστεθούν σε μελλοντικές εκδόσεις (v1.1+).
