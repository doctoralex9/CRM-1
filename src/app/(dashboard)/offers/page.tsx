"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, TicketPercent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  getCustomerDisplayName,
  getStatusLabel,
  getStatusColor,
  formatCurrency,
  formatDate,
  cn,
} from "@/lib/utils";

type StatusFilter = "all" | "draft" | "sent" | "accepted" | "rejected" | "expired";

interface OfferListItem {
  id: string;
  offerNumber: string;
  title: string;
  status: string;
  total: string;
  offerDate: string;
  customer: {
    id: string;
    customerType: "company" | "individual";
    companyName: string | null;
    firstName: string | null;
    lastName: string | null;
  };
  _count: { lineItems: number };
}

export default function OffersPage() {
  const [offers, setOffers] = useState<OfferListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    fetchOffers();
  }, [search, statusFilter, page]);

  async function fetchOffers() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        status: statusFilter,
      });
      if (search) params.set("search", search);

      const res = await fetch(`/api/offers?${params}`);
      const json = await res.json();
      setOffers(json.data || []);
      setTotal(json.total || 0);
    } catch (error) {
      console.error("Error fetching offers:", error);
    } finally {
      setLoading(false);
    }
  }

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      <PageHeader
        title="Προσφορές"
        description={`${total} προσφορές`}
        action={{ label: "Νέα Προσφορά", href: "/offers/new" }}
      />

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Αναζήτηση (αριθμός, τίτλος, πελάτης)..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-10"
          />
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 overflow-x-auto">
          {[
            { value: "all" as StatusFilter, label: "Όλες" },
            { value: "draft" as StatusFilter, label: "Πρόχειρες" },
            { value: "sent" as StatusFilter, label: "Απεσταλμένες" },
            { value: "accepted" as StatusFilter, label: "Αποδεκτές" },
            { value: "rejected" as StatusFilter, label: "Απορριφθείσες" },
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => {
                setStatusFilter(filter.value);
                setPage(1);
              }}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap",
                statusFilter === filter.value
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
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
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase hidden md:table-cell">
                  Πελάτης
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
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                    Φόρτωση...
                  </td>
                </tr>
              ) : offers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                    <TicketPercent className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    {search
                      ? "Δεν βρέθηκαν αποτελέσματα"
                      : "Δεν υπάρχουν προσφορές"}
                    {!search && (
                      <div className="mt-3">
                        <Link href="/offers/new">
                          <Button size="sm">
                            <Plus className="h-4 w-4 mr-1" />
                            Δημιουργήστε την πρώτη προσφορά
                          </Button>
                        </Link>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                offers.map((offer) => (
                  <tr
                    key={offer.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/offers/${offer.id}`}
                        className="text-sm font-medium text-blue-600 hover:underline"
                      >
                        {offer.offerNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/offers/${offer.id}`} className="block">
                        <p className="text-sm text-gray-900 truncate max-w-[200px]">
                          {offer.title}
                        </p>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 hidden md:table-cell">
                      <Link
                        href={`/customers/${offer.customer.id}`}
                        className="hover:text-blue-600 hover:underline"
                      >
                        {getCustomerDisplayName(offer.customer)}
                      </Link>
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
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, total)} από{" "}
              {total}
            </p>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Προηγούμενη
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
              >
                Επόμενη
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
