import type { Customer, Offer, OfferLineItem, OfferSelectedClause, TermsClauseTemplate } from "@prisma/client";

// Re-export Prisma types
export type { Customer, Offer, OfferLineItem, OfferSelectedClause, TermsClauseTemplate };

// Customer with computed fields
export type CustomerWithStats = Customer & {
  _count: { offers: number };
  displayName: string;
};

// Offer with relations
export type OfferWithRelations = Offer & {
  customer: Customer;
  lineItems: OfferLineItem[];
  selectedClauses?: (OfferSelectedClause & {
    clauseTemplate: TermsClauseTemplate;
  })[];
};

// API response types
export type ApiResponse<T> = {
  data: T;
  total?: number;
  page?: number;
  pageSize?: number;
};

export type ApiError = {
  error: string;
  details?: Record<string, string[]>;
};

// Search params
export type CustomerSearchParams = {
  search?: string;
  type?: "company" | "individual" | "all";
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export type OfferSearchParams = {
  search?: string;
  status?: "all" | "draft" | "sent" | "accepted" | "rejected" | "expired";
  customerId?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};
