"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, BookUser, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/shared/PageHeader";
import { getCustomerDisplayName, getStatusColor } from "@/lib/utils";
import { cn } from "@/lib/utils";

type CustomerType = "all" | "company" | "individual";

interface Customer {
  id: string;
  customerType: "company" | "individual";
  companyName: string | null;
  firstName: string | null;
  lastName: string | null;
  vatNumber: string | null;
  phone: string | null;
  email: string | null;
  createdAt: string;
  _count: { offers: number };
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<CustomerType>("all");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    fetchCustomers();
  }, [search, typeFilter, page]);

  async function fetchCustomers() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        type: typeFilter,
      });
      if (search) params.set("search", search);

      const res = await fetch(`/api/customers?${params}`);
      const json = await res.json();
      setCustomers(json.data || []);
      setTotal(json.total || 0);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  }

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      <PageHeader
        title="Πελάτες"
        description={`${total} πελάτες`}
        action={{ label: "Νέος Πελάτης", href: "/customers/new" }}
      />

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Αναζήτηση (όνομα, ΑΦΜ, τηλ, email)..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-10"
          />
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {[
            { value: "all" as CustomerType, label: "Όλοι" },
            { value: "company" as CustomerType, label: "Εταιρείες" },
            { value: "individual" as CustomerType, label: "Ιδιώτες" },
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => {
                setTypeFilter(filter.value);
                setPage(1);
              }}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                typeFilter === filter.value
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
                  Πελάτης
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">
                  ΑΦΜ
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase hidden md:table-cell">
                  Τηλέφωνο
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">
                  Email
                </th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                  Προσφορές
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                    Φόρτωση...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                    {search
                      ? "Δεν βρέθηκαν αποτελέσματα"
                      : "Δεν υπάρχουν πελάτες"}
                    {!search && (
                      <div className="mt-3">
                        <Link href="/customers/new">
                          <Button size="sm">
                            <Plus className="h-4 w-4 mr-1" />
                            Προσθέστε τον πρώτο πελάτη
                          </Button>
                        </Link>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link href={`/customers/${customer.id}`} className="block">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                              customer.customerType === "company"
                                ? "bg-blue-100"
                                : "bg-green-100"
                            )}
                          >
                            {customer.customerType === "company" ? (
                              <BookUser className="h-4 w-4 text-blue-600" />
                            ) : (
                              <User className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {getCustomerDisplayName(customer)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {customer.customerType === "company"
                                ? "Εταιρεία"
                                : "Ιδιώτης"}
                            </p>
                          </div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 hidden sm:table-cell">
                      {customer.vatNumber || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 hidden md:table-cell">
                      {customer.phone || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 hidden lg:table-cell">
                      {customer.email || "-"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                        {customer._count.offers}
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
