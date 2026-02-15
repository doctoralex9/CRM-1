import { PageHeader } from "@/components/shared/PageHeader";
import { OfferForm } from "@/components/offers/OfferForm";

export default function NewOfferPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        title="Νέα Προσφορά"
        backHref="/offers"
      />
      <OfferForm mode="create" />
    </div>
  );
}
