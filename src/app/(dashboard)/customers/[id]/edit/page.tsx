"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { CustomerForm } from "@/components/customers/CustomerForm";

export default function EditCustomerPage() {
  const params = useParams();
  const router = useRouter();
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/customers/${params.id}`);
        if (!res.ok) {
          router.push("/customers");
          return;
        }
        const json = await res.json();
        setCustomer(json.data);
      } catch (error) {
        router.push("/customers");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Φόρτωση...</p>
      </div>
    );
  }

  if (!customer) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title="Επεξεργασία Πελάτη"
        backHref={`/customers/${customer.id}`}
      />
      <CustomerForm
        mode="edit"
        initialData={{
          id: customer.id,
          customerType: customer.customerType,
          companyName: customer.companyName || "",
          firstName: customer.firstName || "",
          lastName: customer.lastName || "",
          vatNumber: customer.vatNumber || "",
          taxOffice: customer.taxOffice || "",
          phone: customer.phone || "",
          email: customer.email || "",
          address: customer.address || "",
          city: customer.city || "",
          postalCode: customer.postalCode || "",
          notes: customer.notes || "",
        }}
      />
    </div>
  );
}
