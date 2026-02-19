"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save } from "lucide-react";

interface CompanySettings {
  company_name: string;
  company_legal_name: string;
  company_vat_number: string;
  company_tax_office: string;
  company_address: string;
  company_city: string;
  company_postal_code: string;
  company_phone: string;
  company_email: string;
  company_website: string;
  company_iban: string;
  company_bank_name: string;
}

const DEFAULTS: CompanySettings = {
  company_name: "",
  company_legal_name: "",
  company_vat_number: "",
  company_tax_office: "",
  company_address: "",
  company_city: "",
  company_postal_code: "",
  company_phone: "",
  company_email: "",
  company_website: "",
  company_iban: "",
  company_bank_name: "",
};

export default function CompanySettingsPage() {
  const [values, setValues] = useState<CompanySettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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

  function set(key: keyof CompanySettings, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div>
        <PageHeader title="Στοιχεία Εταιρείας" backHref="/settings" />
        <p className="text-gray-500 text-sm">Φόρτωση...</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Στοιχεία Εταιρείας"
        description="Εμφανίζονται στις προσφορές και τα emails"
        backHref="/settings"
      />

      <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
        {/* Basic Info */}
        <div className="p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Βασικά Στοιχεία
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="company_name">Εμπορική Επωνυμία</Label>
              <Input
                id="company_name"
                value={values.company_name}
                onChange={(e) => set("company_name", e.target.value)}
                placeholder="π.χ. Pump Repair Co."
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="company_legal_name">Νομική Επωνυμία</Label>
              <Input
                id="company_legal_name"
                value={values.company_legal_name}
                onChange={(e) => set("company_legal_name", e.target.value)}
                placeholder="π.χ. PUMP REPAIR ΙΚΕ"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="company_vat_number">ΑΦΜ</Label>
              <Input
                id="company_vat_number"
                value={values.company_vat_number}
                onChange={(e) => set("company_vat_number", e.target.value)}
                placeholder="π.χ. 123456789"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="company_tax_office">ΔΟΥ</Label>
              <Input
                id="company_tax_office"
                value={values.company_tax_office}
                onChange={(e) => set("company_tax_office", e.target.value)}
                placeholder="π.χ. ΔΟΥ Πειραιά"
              />
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Επικοινωνία
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="company_phone">Τηλέφωνο</Label>
              <Input
                id="company_phone"
                value={values.company_phone}
                onChange={(e) => set("company_phone", e.target.value)}
                placeholder="π.χ. 210 1234567"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="company_email">Email</Label>
              <Input
                id="company_email"
                type="email"
                value={values.company_email}
                onChange={(e) => set("company_email", e.target.value)}
                placeholder="π.χ. info@company.gr"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="company_website">Ιστότοπος</Label>
              <Input
                id="company_website"
                value={values.company_website}
                onChange={(e) => set("company_website", e.target.value)}
                placeholder="π.χ. www.company.gr"
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Διεύθυνση
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5 sm:col-span-3">
              <Label htmlFor="company_address">Οδός & Αριθμός</Label>
              <Input
                id="company_address"
                value={values.company_address}
                onChange={(e) => set("company_address", e.target.value)}
                placeholder="π.χ. Λιμενική 12"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="company_city">Πόλη</Label>
              <Input
                id="company_city"
                value={values.company_city}
                onChange={(e) => set("company_city", e.target.value)}
                placeholder="π.χ. Πειραιάς"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="company_postal_code">ΤΚ</Label>
              <Input
                id="company_postal_code"
                value={values.company_postal_code}
                onChange={(e) => set("company_postal_code", e.target.value)}
                placeholder="π.χ. 18510"
              />
            </div>
          </div>
        </div>

        {/* Bank */}
        <div className="p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Τραπεζικά Στοιχεία
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="company_bank_name">Τράπεζα</Label>
              <Input
                id="company_bank_name"
                value={values.company_bank_name}
                onChange={(e) => set("company_bank_name", e.target.value)}
                placeholder="π.χ. Alpha Bank"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="company_iban">IBAN</Label>
              <Input
                id="company_iban"
                value={values.company_iban}
                onChange={(e) => set("company_iban", e.target.value)}
                placeholder="π.χ. GR00 0000 0000 0000 0000 0000 000"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="mt-4 flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Αποθήκευση..." : saved ? "Αποθηκεύτηκε ✓" : "Αποθήκευση"}
        </Button>
      </div>
    </div>
  );
}
