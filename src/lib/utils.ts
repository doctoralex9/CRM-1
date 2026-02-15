import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as currency (EUR)
 */
export function formatCurrency(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("el-GR", {
    style: "currency",
    currency: "EUR",
  }).format(num);
}

/**
 * Format a date in Greek locale
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("el-GR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

/**
 * Generate offer number: PRO-YYYY-NNNN
 */
export function generateOfferNumber(year: number, sequence: number): string {
  return `PRO-${year}-${sequence.toString().padStart(4, "0")}`;
}

/**
 * Calculate line item total
 */
export function calculateLineTotal(
  quantity: number,
  unitPrice: number,
  discountPercent: number
): number {
  return quantity * unitPrice * (1 - discountPercent / 100);
}

/**
 * Calculate offer totals from line items
 */
export function calculateOfferTotals(
  lineItems: Array<{ lineTotal: number | string }>,
  vatRate: number = 24
): { subtotal: number; vatAmount: number; total: number } {
  const subtotal = lineItems.reduce((sum, item) => {
    const lineTotal = typeof item.lineTotal === "string"
      ? parseFloat(item.lineTotal)
      : item.lineTotal;
    return sum + lineTotal;
  }, 0);

  const vatAmount = subtotal * (vatRate / 100);
  const total = subtotal + vatAmount;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    vatAmount: Math.round(vatAmount * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}

/**
 * Validate Greek VAT number (ΑΦΜ)
 */
export function validateGreekVAT(vat: string): boolean {
  // Remove spaces and dashes
  const cleaned = vat.replace(/[\s-]/g, "");

  // Must be 9 digits
  if (!/^\d{9}$/.test(cleaned)) {
    return false;
  }

  // Checksum validation
  const digits = cleaned.split("").map(Number);
  let sum = 0;
  for (let i = 0; i < 8; i++) {
    sum += digits[i] * Math.pow(2, 8 - i);
  }
  const checksum = sum % 11 % 10;

  return checksum === digits[8];
}

/**
 * Get display name for customer
 */
export function getCustomerDisplayName(customer: {
  customerType: "company" | "individual";
  companyName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}): string {
  if (customer.customerType === "company") {
    return customer.companyName || "Χωρίς όνομα";
  }
  return [customer.firstName, customer.lastName].filter(Boolean).join(" ") || "Χωρίς όνομα";
}

/**
 * Get status label in Greek
 */
export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    draft: "Πρόχειρο",
    sent: "Απεσταλμένη",
    accepted: "Αποδεκτή",
    rejected: "Απορριφθείσα",
    expired: "Ληγμένη",
  };
  return labels[status] || status;
}

/**
 * Get status color classes
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-800",
    sent: "bg-blue-100 text-blue-800",
    accepted: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    expired: "bg-yellow-100 text-yellow-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}
