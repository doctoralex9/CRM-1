import { z } from "zod";

export const customerSchema = z
  .object({
    customerType: z.enum(["company", "individual"], {
      required_error: "Επιλέξτε τύπο πελάτη",
    }),
    companyName: z.string().optional().nullable(),
    firstName: z.string().optional().nullable(),
    lastName: z.string().optional().nullable(),
    vatNumber: z.string().optional().nullable(),
    taxOffice: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    email: z.string().email("Μη έγκυρο email").optional().nullable().or(z.literal("")),
    address: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    postalCode: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.customerType === "company") {
      if (!data.companyName || data.companyName.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Η επωνυμία είναι υποχρεωτική (τουλάχιστον 2 χαρακτήρες)",
          path: ["companyName"],
        });
      }
    }

    if (data.customerType === "individual") {
      if (!data.firstName || data.firstName.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Το όνομα είναι υποχρεωτικό (τουλάχιστον 2 χαρακτήρες)",
          path: ["firstName"],
        });
      }
      if (!data.lastName || data.lastName.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Το επώνυμο είναι υποχρεωτικό (τουλάχιστον 2 χαρακτήρες)",
          path: ["lastName"],
        });
      }
    }
  });

export type CustomerFormData = z.infer<typeof customerSchema>;
