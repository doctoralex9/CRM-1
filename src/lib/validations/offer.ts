import { z } from "zod";

// Line item validation
export const lineItemSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, "Η περιγραφή είναι υποχρεωτική"),
  quantity: z.coerce
    .number()
    .min(0.01, "Η ποσότητα πρέπει να είναι μεγαλύτερη από 0"),
  unit: z.string().default("τεμ."),
  unitPrice: z.coerce
    .number()
    .min(0, "Η τιμή δεν μπορεί να είναι αρνητική"),
  discountPercent: z.coerce
    .number()
    .min(0, "Η έκπτωση δεν μπορεί να είναι αρνητική")
    .max(100, "Η έκπτωση δεν μπορεί να υπερβαίνει το 100%")
    .default(0),
  sortOrder: z.number().optional(),
});

export type LineItemFormData = z.infer<typeof lineItemSchema>;

// Offer validation
export const offerSchema = z.object({
  customerId: z.string().min(1, "Επιλέξτε πελάτη"),
  title: z.string().min(2, "Ο τίτλος είναι υποχρεωτικός (τουλάχιστον 2 χαρακτήρες)"),
  objectDescription: z.string().optional().nullable(),
  workReport: z.string().optional().nullable(),
  vatRate: z.coerce.number().min(0).max(100).default(24),
  offerDate: z.string().min(1, "Η ημερομηνία είναι υποχρεωτική"),
  validUntil: z.string().optional().nullable(),
  lineItems: z.array(lineItemSchema).min(1, "Προσθέστε τουλάχιστον ένα είδος"),
});

export type OfferFormData = z.infer<typeof offerSchema>;

// Status update validation
export const offerStatusSchema = z.object({
  status: z.enum(["draft", "sent", "accepted", "rejected", "expired"], {
    required_error: "Επιλέξτε κατάσταση",
  }),
});

export type OfferStatusFormData = z.infer<typeof offerStatusSchema>;
