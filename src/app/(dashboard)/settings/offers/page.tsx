"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save } from "lucide-react";

interface OfferSettings {
  default_vat_rate: string;
  default_validity_days: string;
  offer_number_prefix: string;
  offer_number_separator: string;
  default_payment_terms: string;
  default_delivery_terms: string;
  default_currency: string;
}

const DEFAULTS: OfferSettings = {
  default_vat_rate: "24",
  default_validity_days: "30",
  offer_number_prefix: "PRF",
  offer_number_separator: "-",
  default_payment_terms: "",
  default_delivery_terms: "",
  default_currency: "EUR",
};

export default function OfferSettingsPage() {
  const [values, setValues] = useState<OfferSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/settings");
        const json = await res.json();
        setValues((prev) => ({ ...prev, ...json.data }));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function set(key: keyof OfferSettings, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    setSaveError(false);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (res.ok) {
        setSaved(true);
      } else {
        setSaveError(true);
      }
    } catch {
      setSaveError(true);
    } finally {
      setSaving(false);
    }
  }

  // Preview of offer number format
  const previewNumber = `${values.offer_number_prefix || "PRF"}${values.offer_number_separator || "-"}2026${values.offer_number_separator || "-"}0001`;

  if (loading) {
    return (
      <div>
        <PageHeader title="Ρυθμίσεις Προσφορών" backHref="/settings" />
        <p className="text-gray-500 text-sm">Φόρτωση...</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Ρυθμίσεις Προσφορών"
        description="Προεπιλογές για νέες προσφορές"
        backHref="/settings"
      />

      <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
        {/* Numbering */}
        <div className="p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Αρίθμηση
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="offer_number_prefix">Πρόθεμα (Prefix)</Label>
              <Input
                id="offer_number_prefix"
                value={values.offer_number_prefix}
                onChange={(e) => set("offer_number_prefix", e.target.value.toUpperCase())}
                placeholder="π.χ. PRF"
                maxLength={10}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="offer_number_separator">Διαχωριστικό</Label>
              <Input
                id="offer_number_separator"
                value={values.offer_number_separator}
                onChange={(e) => set("offer_number_separator", e.target.value)}
                placeholder="π.χ. -"
                maxLength={3}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Παράδειγμα</Label>
              <div className="h-10 px-3 flex items-center bg-gray-50 border border-gray-200 rounded-md text-sm font-mono text-gray-700">
                {previewNumber}
              </div>
            </div>
          </div>
        </div>

        {/* Defaults */}
        <div className="p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Προεπιλογές
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="default_vat_rate">ΦΠΑ (%)</Label>
              <Input
                id="default_vat_rate"
                type="number"
                min="0"
                max="100"
                step="1"
                value={values.default_vat_rate}
                onChange={(e) => set("default_vat_rate", e.target.value)}
                placeholder="24"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="default_validity_days">Ισχύς Προσφοράς (ημέρες)</Label>
              <Input
                id="default_validity_days"
                type="number"
                min="1"
                value={values.default_validity_days}
                onChange={(e) => set("default_validity_days", e.target.value)}
                placeholder="30"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="default_currency">Νόμισμα</Label>
              <Input
                id="default_currency"
                value={values.default_currency}
                onChange={(e) => set("default_currency", e.target.value.toUpperCase())}
                placeholder="EUR"
                maxLength={3}
              />
            </div>
          </div>
        </div>

        {/* Default texts */}
        <div className="p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Προεπιλεγμένα Κείμενα
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="default_payment_terms">Τρόπος Πληρωμής</Label>
              <Input
                id="default_payment_terms"
                value={values.default_payment_terms}
                onChange={(e) => set("default_payment_terms", e.target.value)}
                placeholder="π.χ. Μετρητά / Τραπεζική μεταφορά"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="default_delivery_terms">Παράδοση</Label>
              <Input
                id="default_delivery_terms"
                value={values.default_delivery_terms}
                onChange={(e) => set("default_delivery_terms", e.target.value)}
                placeholder="π.χ. Ex Works Πειραιάς"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Αποθήκευση..." : saveError ? "Σφάλμα αποθήκευσης" : saved ? "Αποθηκεύτηκε ✓" : "Αποθήκευση"}
        </Button>
      </div>
    </div>
  );
}
