"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  Pencil,
  Trash2,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  getCustomerDisplayName,
  getStatusLabel,
  getStatusColor,
  formatCurrency,
  formatDate,
} from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchCustomer();
  }, [params.id]);

  async function fetchCustomer() {
    try {
      const res = await fetch(`/api/customers/${params.id}`);
      if (!res.ok) {
        router.push("/customers");
        return;
      }
      const json = await res.json();
      setCustomer(json.data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Είστε σίγουροι ότι θέλετε να διαγράψετε αυτόν τον πελάτη;")) {
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch(`/api/customers/${params.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) {
        alert(json.error);
        return;
      }
      router.push("/customers");
    } catch (error) {
      alert("Σφάλμα κατά τη διαγραφή");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Φόρτωση...</p>
      </div>
    );
  }

  if (!customer) return null;

  const displayName = getCustomerDisplayName(customer);

  return (
    <div>
      <PageHeader title={displayName} backHref="/customers">
        <Link href={`/offers/new?customerId=${customer.id}`}>
          <Button>
            <Plus className="h-4 w-4 mr-1" />
            Νέα Προσφορά
          </Button>
        </Link>
        <Link href={`/customers/${customer.id}/edit`}>
          <Button variant="outline">
            <Pencil className="h-4 w-4 mr-1" />
            Επεξεργασία
          </Button>
        </Link>
        <Button
          variant="outline"
          onClick={handleDelete}
          disabled={deleting}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Διαγραφή
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Type Badge */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center",
                  customer.customerType === "company"
                    ? "bg-blue-100"
                    : "bg-green-100"
                )}
              >
                {customer.customerType === "company" ? (
                  <Building2 className="h-6 w-6 text-blue-600" />
                ) : (
                  <User className="h-6 w-6 text-green-600" />
                )}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{displayName}</p>
                <p className="text-sm text-gray-500">
                  {customer.customerType === "company"
                    ? "Εταιρεία"
                    : "Ιδιώτης"}
                </p>
              </div>
            </div>

            {/* Tax Info */}
            {customer.vatNumber && (
              <div className="space-y-2 pt-4 border-t border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">ΑΦΜ</span>
                  <span className="font-medium">{customer.vatNumber}</span>
                </div>
                {customer.taxOffice && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">ΔΟΥ</span>
                    <span className="font-medium">{customer.taxOffice}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Contact */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-3">
            <h3 className="font-medium text-gray-900 mb-3">Επικοινωνία</h3>

            {customer.phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-gray-400" />
                <a href={`tel:${customer.phone}`} className="text-blue-600 hover:underline">
                  {customer.phone}
                </a>
              </div>
            )}
            {customer.email && (
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-gray-400" />
                <a href={`mailto:${customer.email}`} className="text-blue-600 hover:underline">
                  {customer.email}
                </a>
              </div>
            )}
            {(customer.address || customer.city) && (
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                <span className="text-gray-700">
                  {[customer.address, customer.city, customer.postalCode]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </div>
            )}
            {!customer.phone && !customer.email && !customer.address && (
              <p className="text-sm text-gray-400">Δεν υπάρχουν στοιχεία επικοινωνίας</p>
            )}
          </div>

          {/* Notes */}
          {customer.notes && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-medium text-gray-900 mb-2">Σημειώσεις</h3>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">
                {customer.notes}
              </p>
            </div>
          )}
        </div>

        {/* Offers Table */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="font-medium text-gray-900">
                Προσφορές ({customer._count?.offers || customer.offers?.length || 0})
              </h3>
            </div>

            {customer.offers && customer.offers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                        Αριθμός
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                        Τίτλος
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">
                        Ημ/νία
                      </th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                        Σύνολο
                      </th>
                      <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                        Κατάσταση
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {customer.offers.map((offer: any) => (
                      <tr
                        key={offer.id}
                        className="hover:bg-gray-50 cursor-pointer"
                      >
                        <td className="px-4 py-3">
                          <Link
                            href={`/offers/${offer.id}`}
                            className="text-sm font-medium text-blue-600 hover:underline"
                          >
                            {offer.offerNumber}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {offer.title}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 hidden sm:table-cell">
                          {formatDate(offer.offerDate)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-medium">
                          {formatCurrency(offer.total)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={cn(
                              "inline-flex px-2 py-1 text-xs font-medium rounded-full",
                              getStatusColor(offer.status)
                            )}
                          >
                            {getStatusLabel(offer.status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-6 py-12 text-center text-gray-500">
                <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>Δεν υπάρχουν προσφορές</p>
                <Link href={`/offers/new?customerId=${customer.id}`}>
                  <Button size="sm" className="mt-3">
                    <Plus className="h-4 w-4 mr-1" />
                    Δημιουργία Προσφοράς
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
