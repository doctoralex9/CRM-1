"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { OfferForm } from "@/components/offers/OfferForm";

export default function EditOfferPage() {
  const params = useParams();
  const router = useRouter();
  const [offer, setOffer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

      // Check if offer can be edited (only draft offers)
      if (json.data.status !== "draft") {
        alert("Μόνο πρόχειρες προσφορές μπορούν να επεξεργαστούν");
        router.push(`/offers/${params.id}`);
        return;
      }

      setOffer(json.data);
    } catch (error) {
      console.error("Error:", error);
      router.push("/offers");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Φόρτωση...</p>
      </div>
    );
  }

  if (!offer) return null;

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        title={`Επεξεργασία: ${offer.offerNumber}`}
        backHref={`/offers/${offer.id}`}
      />
      <OfferForm mode="edit" initialData={offer} />
    </div>
  );
}
