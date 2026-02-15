"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LineItemsEditor, type LineItem } from "./LineItemsEditor";
import {
  cn,
  formatCurrency,
  calculateLineTotal,
  calculateOfferTotals,
  getCustomerDisplayName,
} from "@/lib/utils";
import { Search, ChevronDown } from "lucide-react";

interface Customer {
  id: string;
  customerType: "company" | "individual";
  companyName: string | null;
  firstName: string | null;
  lastName: string | null;
  vatNumber: string | null;
}

interface OfferFormProps {
  mode: "create" | "edit";
  initialData?: {
    id: string;
    customerId: string;
    customer?: Customer;
    title: string;
    objectDescription: string | null;
    workReport: string | null;
    vatRate: number | string;
    offerDate: string;
    validUntil: string | null;
    lineItems: Array<{
      id?: string;
      description: string;
      quantity: number | string;
      unit: string;
      unitPrice: number | string;
      discountPercent: number | string;
      sortOrder: number;
    }>;
  };
}

export function OfferForm({ mode, initialData }: OfferFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCustomerId = searchParams.get("customerId") || "";

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, any>>({});

  // Form state
  const [customerId, setCustomerId] = useState(
    initialData?.customerId || preselectedCustomerId
  );
  const [title, setTitle] = useState(initialData?.title || "");
  const [objectDescription, setObjectDescription] = useState(
    initialData?.objectDescription || ""
  );
  const [workReport, setWorkReport] = useState(
    initialData?.workReport || ""
  );
  const [vatRate, setVatRate] = useState(
    parseFloat(String(initialData?.vatRate ?? 24))
  );
  const [offerDate, setOfferDate] = useState(
    initialData?.offerDate
      ? initialData.offerDate.split("T")[0]
      : new Date().toISOString().split("T")[0]
  );
  const [validUntil, setValidUntil] = useState(
    initialData?.validUntil ? initialData.validUntil.split("T")[0] : ""
  );
  const [lineItems, setLineItems] = useState<LineItem[]>(
    initialData?.lineItems?.map((item, index) => ({
      id: item.id,
      description: item.description,
      quantity: parseFloat(String(item.quantity)),
      unit: item.unit,
      unitPrice: parseFloat(String(item.unitPrice)),
      discountPercent: parseFloat(String(item.discountPercent)),
      sortOrder: item.sortOrder ?? index,
    })) || [
      {
        description: "",
        quantity: 1,
        unit: "τεμ.",
        unitPrice: 0,
        discountPercent: 0,
        sortOrder: 0,
      },
    ]
  );

  // Customer search
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    initialData?.customer || null
  );

  // Load customers for dropdown
  useEffect(() => {
    fetchCustomers();
  }, [customerSearch]);

  // If preselected customer, load their info
  useEffect(() => {
    if (preselectedCustomerId && !selectedCustomer) {
      loadCustomer(preselectedCustomerId);
    }
  }, [preselectedCustomerId]);

  async function fetchCustomers() {
    try {
      const params = new URLSearchParams({ pageSize: "10" });
      if (customerSearch) params.set("search", customerSearch);
      const res = await fetch(`/api/customers?${params}`);
      const json = await res.json();
      setCustomers(json.data || []);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  }

  async function loadCustomer(id: string) {
    try {
      const res = await fetch(`/api/customers/${id}`);
      if (res.ok) {
        const json = await res.json();
        setSelectedCustomer(json.data);
        setCustomerId(json.data.id);
      }
    } catch (error) {
      console.error("Error loading customer:", error);
    }
  }

  function selectCustomer(customer: Customer) {
    setSelectedCustomer(customer);
    setCustomerId(customer.id);
    setShowCustomerDropdown(false);
    setCustomerSearch("");
  }

  // Calculate totals
  const itemsWithTotals = lineItems.map((item) => ({
    ...item,
    lineTotal: calculateLineTotal(item.quantity, item.unitPrice, item.discountPercent),
  }));
  const totals = calculateOfferTotals(itemsWithTotals, vatRate);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setErrors({});

    const payload = {
      customerId,
      title,
      objectDescription: objectDescription || null,
      workReport: workReport || null,
      vatRate,
      offerDate,
      validUntil: validUntil || null,
      lineItems: lineItems.map((item, index) => ({
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        discountPercent: item.discountPercent,
        sortOrder: index,
      })),
    };

    try {
      const url =
        mode === "create"
          ? "/api/offers"
          : `/api/offers/${initialData?.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Σφάλμα κατά την αποθήκευση");
        if (json.details) {
          setErrors(json.details);
        }
        return;
      }

      router.push(`/offers/${json.data.id}`);
      router.refresh();
    } catch (err) {
      setError("Σφάλμα σύνδεσης. Δοκιμάστε ξανά.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Customer Selection */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <h3 className="font-medium text-gray-900">Πελάτης *</h3>

        {selectedCustomer ? (
          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
            <div>
              <p className="font-medium text-gray-900">
                {getCustomerDisplayName(selectedCustomer)}
              </p>
              {selectedCustomer.vatNumber && (
                <p className="text-sm text-gray-500">
                  ΑΦΜ: {selectedCustomer.vatNumber}
                </p>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedCustomer(null);
                setCustomerId("");
                setShowCustomerDropdown(true);
              }}
            >
              Αλλαγή
            </Button>
          </div>
        ) : (
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Αναζήτηση πελάτη..."
                value={customerSearch}
                onChange={(e) => {
                  setCustomerSearch(e.target.value);
                  setShowCustomerDropdown(true);
                }}
                onFocus={() => setShowCustomerDropdown(true)}
                className="pl-10"
              />
            </div>

            {showCustomerDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {customers.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-500">
                    Δεν βρέθηκαν πελάτες
                  </div>
                ) : (
                  customers.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => selectCustomer(c)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                    >
                      <p className="text-sm font-medium text-gray-900">
                        {getCustomerDisplayName(c)}
                      </p>
                      {c.vatNumber && (
                        <p className="text-xs text-gray-500">
                          ΑΦΜ: {c.vatNumber}
                        </p>
                      )}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}
        {errors?.customerId && (
          <p className="text-sm text-red-600">{errors.customerId}</p>
        )}
      </div>

      {/* Basic Info */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <h3 className="font-medium text-gray-900">Στοιχεία Προσφοράς</h3>

        <div>
          <Label htmlFor="title">Τίτλος *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="π.χ. Επισκευή αντλίας θαλάσσιου νερού"
            className="mt-1"
          />
          {errors?.title && (
            <p className="text-sm text-red-600 mt-1">{errors.title}</p>
          )}
        </div>

        <div>
          <Label htmlFor="objectDescription">Περιγραφή Αντικειμένου</Label>
          <Textarea
            id="objectDescription"
            value={objectDescription}
            onChange={(e) => setObjectDescription(e.target.value)}
            placeholder="Περιγραφή του αντικειμένου εργασίας..."
            className="mt-1"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="workReport">Έκθεση Εργασίας</Label>
          <Textarea
            id="workReport"
            value={workReport}
            onChange={(e) => setWorkReport(e.target.value)}
            placeholder="Αναφορά εργασιών που πραγματοποιήθηκαν..."
            className="mt-1"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="offerDate">Ημ/νία Προσφοράς *</Label>
            <Input
              id="offerDate"
              type="date"
              value={offerDate}
              onChange={(e) => setOfferDate(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="validUntil">Ισχύς Έως</Label>
            <Input
              id="validUntil"
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="vatRate">ΦΠΑ %</Label>
            <Input
              id="vatRate"
              type="number"
              min="0"
              max="100"
              step="0.5"
              value={vatRate}
              onChange={(e) => setVatRate(parseFloat(e.target.value) || 0)}
              className="mt-1"
            />
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <h3 className="font-medium text-gray-900">Είδη / Εργασίες *</h3>
        <LineItemsEditor
          items={lineItems}
          onChange={setLineItems}
          errors={errors}
        />
      </div>

      {/* Totals */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="max-w-xs ml-auto space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Υποσύνολο</span>
            <span className="font-medium">{formatCurrency(totals.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">ΦΠΑ ({vatRate}%)</span>
            <span className="font-medium">{formatCurrency(totals.vatAmount)}</span>
          </div>
          <div className="flex justify-between text-base pt-2 border-t border-gray-200">
            <span className="font-semibold text-gray-900">Σύνολο</span>
            <span className="font-bold text-gray-900">
              {formatCurrency(totals.total)}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={saving}
        >
          Ακύρωση
        </Button>
        <Button type="submit" disabled={saving}>
          {saving
            ? "Αποθήκευση..."
            : mode === "create"
            ? "Δημιουργία Προσφοράς"
            : "Ενημέρωση Προσφοράς"}
        </Button>
      </div>
    </form>
  );
}
