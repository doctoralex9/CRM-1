"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  Pencil,
  Trash2,
  User,
  Building2,
  Calendar,
  Package,
  Send,
  Check,
  X,
  Clock,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  getCustomerDisplayName,
  getStatusLabel,
  getStatusColor,
  formatCurrency,
  formatDate,
  calculateLineTotal,
  cn,
} from "@/lib/utils";

interface LineItem {
  id: string;
  description: string;
  quantity: number | string;
  unit: string;
  unitPrice: number | string;
  discountPercent: number | string;
  lineTotal: number | string;
  sortOrder: number;
}

interface Offer {
  id: string;
  offerNumber: string;
  title: string;
  objectDescription: string | null;
  workReport: string | null;
  status: string;
  subtotal: number | string;
  vatRate: number | string;
  vatAmount: number | string;
  total: number | string;
  offerDate: string;
  validUntil: string | null;
  customer: {
    id: string;
    customerType: "company" | "individual";
    companyName: string | null;
    firstName: string | null;
    lastName: string | null;
    vatNumber: string | null;
  };
  lineItems: LineItem[];
}

export default function OfferDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [changingStatus, setChangingStatus] = useState(false);

  useEffect(() => {
    fetchOffer();
  }, [params.id]);

  async function fetchOffer() {
    try {
      const res = await fetch(`/api/offers/${params.id}`);
      if (!res.ok) {
        router.push("/offers");
        return;
      }
      const json = await res.json();
      setOffer(json.data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (
      !confirm(
        "Είστε σίγουροι ότι θέλετε να διαγράψετε αυτή την προσφορά;"
      )
    ) {
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch(`/api/offers/${params.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) {
        alert(json.error);
        return;
      }
      router.push("/offers");
    } catch (error) {
      alert("Σφάλμα κατά τη διαγραφή");
    } finally {
      setDeleting(false);
    }
  }

  async function handleStatusChange(newStatus: string) {
    setChangingStatus(true);
    try {
      const res = await fetch(`/api/offers/${params.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (!res.ok) {
        alert(json.error);
        return;
      }
      await fetchOffer();
    } catch (error) {
      alert("Σφάλμα κατά την αλλαγή κατάστασης");
    } finally {
      setChangingStatus(false);
    }
  }

  function getStatusActions(status: string) {
    const actions = [];

    if (status === "draft") {
      actions.push({
        label: "Αποστολή",
        icon: Send,
        status: "sent",
        variant: "default" as const,
      });
    }

    if (status === "sent") {
      actions.push(
        {
          label: "Αποδοχή",
          icon: Check,
          status: "accepted",
          variant: "default" as const,
        },
        {
          label: "Απόρριψη",
          icon: X,
          status: "rejected",
          variant: "outline" as const,
        },
        {
          label: "Λήξη",
          icon: Clock,
          status: "expired",
          variant: "outline" as const,
        },
        {
          label: "Επιστροφή σε Πρόχειρο",
          icon: RotateCcw,
          status: "draft",
          variant: "outline" as const,
        }
      );
    }

    if (["accepted", "rejected", "expired"].includes(status)) {
      actions.push({
        label: "Επιστροφή σε Πρόχειρο",
        icon: RotateCcw,
        status: "draft",
        variant: "outline" as const,
      });
    }

    return actions;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Φόρτωση...</p>
      </div>
    );
  }

  if (!offer) return null;

  const statusActions = getStatusActions(offer.status);
  const canEdit = offer.status === "draft";
  const canDelete = offer.status === "draft";

  return (
    <div>
      <PageHeader title={offer.offerNumber} backHref="/offers">
        {statusActions.map((action) => (
          <Button
            key={action.status}
            variant={action.variant}
            onClick={() => handleStatusChange(action.status)}
            disabled={changingStatus}
          >
            <action.icon className="h-4 w-4 mr-1" />
            {action.label}
          </Button>
        ))}
        {canEdit && (
          <Link href={`/offers/${offer.id}/edit`}>
            <Button variant="outline">
              <Pencil className="h-4 w-4 mr-1" />
              Επεξεργασία
            </Button>
          </Link>
        )}
        {canDelete && (
          <Button
            variant="outline"
            onClick={handleDelete}
            disabled={deleting}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Διαγραφή
          </Button>
        )}
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Offer Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  {offer.title}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {offer.offerNumber}
                </p>
              </div>
              <span
                className={cn(
                  "inline-flex px-3 py-1 text-sm font-medium rounded-full",
                  getStatusColor(offer.status)
                )}
              >
                {getStatusLabel(offer.status)}
              </span>
            </div>

            {offer.objectDescription && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Περιγραφή Αντικειμένου
                </h3>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {offer.objectDescription}
                </p>
              </div>
            )}

            {offer.workReport && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Έκθεση Εργασίας
                </h3>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {offer.workReport}
                </p>
              </div>
            )}
          </div>

          {/* Line Items */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="font-medium text-gray-900">
                Είδη / Εργασίες ({offer.lineItems.length})
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                      Περιγραφή
                    </th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                      Ποσότητα
                    </th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">
                      Μονάδα
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                      Τιμή Μον.
                    </th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase hidden md:table-cell">
                      Έκπτ. %
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                      Σύνολο
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {offer.lineItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {item.description}
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-gray-700">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-gray-700 hidden sm:table-cell">
                        {item.unit}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-700">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-gray-700 hidden md:table-cell">
                        {item.discountPercent}%
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                        {formatCurrency(item.lineTotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="max-w-xs ml-auto space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Υποσύνολο</span>
                  <span className="font-medium">
                    {formatCurrency(offer.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">ΦΠΑ ({offer.vatRate}%)</span>
                  <span className="font-medium">
                    {formatCurrency(offer.vatAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-base pt-2 border-t border-gray-200">
                  <span className="font-semibold text-gray-900">Σύνολο</span>
                  <span className="font-bold text-gray-900">
                    {formatCurrency(offer.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-medium text-gray-900 mb-4">Πελάτης</h3>
            <Link
              href={`/customers/${offer.customer.id}`}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                  offer.customer.customerType === "company"
                    ? "bg-blue-100"
                    : "bg-green-100"
                )}
              >
                {offer.customer.customerType === "company" ? (
                  <Building2 className="h-5 w-5 text-blue-600" />
                ) : (
                  <User className="h-5 w-5 text-green-600" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {getCustomerDisplayName(offer.customer)}
                </p>
                <p className="text-xs text-gray-500">
                  {offer.customer.customerType === "company"
                    ? "Εταιρεία"
                    : "Ιδιώτης"}
                </p>
                {offer.customer.vatNumber && (
                  <p className="text-xs text-gray-500 mt-1">
                    ΑΦΜ: {offer.customer.vatNumber}
                  </p>
                )}
              </div>
            </Link>
          </div>

          {/* Dates */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            <h3 className="font-medium text-gray-900">Ημερομηνίες</h3>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Ημ/νία Προσφοράς</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(offer.offerDate)}
                  </p>
                </div>
              </div>

              {offer.validUntil && (
                <div className="flex items-start gap-3">
                  <Clock className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Ισχύς Έως</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDate(offer.validUntil)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-medium text-gray-900 mb-4">Περίληψη</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Package className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">
                  {offer.lineItems.length} είδη
                </span>
              </div>
              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Συνολική Αξία</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(offer.total)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
