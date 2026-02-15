import { PageHeader } from "@/components/shared/PageHeader";
import { CustomerForm } from "@/components/customers/CustomerForm";

export default function NewCustomerPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title="Νέος Πελάτης"
        backHref="/customers"
      />
      <CustomerForm mode="create" />
    </div>
  );
}
