"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, Info } from "lucide-react";

interface EmailSettings {
  email_from_name: string;
  email_reply_to: string;
  email_subject_template: string;
  email_body_template: string;
  email_signature: string;
}

const DEFAULTS: EmailSettings = {
  email_from_name: "",
  email_reply_to: "",
  email_subject_template: "Προσφορά {{offer_number}} - {{company_name}}",
  email_body_template:
    "Αγαπητέ/η {{customer_name}},\n\nΣας αποστέλλουμε συνημμένη την προσφορά μας αρ. {{offer_number}}.\n\nΓια οποιαδήποτε πληροφορία, μη διστάσετε να επικοινωνήσετε μαζί μας.\n\nΜε εκτίμηση,",
  email_signature: "",
};

const VARIABLES = [
  { var: "{{offer_number}}", label: "Αριθμός Προσφοράς" },
  { var: "{{customer_name}}", label: "Όνομα Πελάτη" },
  { var: "{{company_name}}", label: "Επωνυμία Εταιρείας" },
  { var: "{{offer_date}}", label: "Ημερομηνία Προσφοράς" },
  { var: "{{total}}", label: "Σύνολο" },
];

export default function EmailSettingsPage() {
  const [values, setValues] = useState<EmailSettings>(DEFAULTS);
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

  function set(key: keyof EmailSettings, value: string) {
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
        <PageHeader title="Ρυθμίσεις Email" backHref="/settings" />
        <p className="text-gray-500 text-sm">Φόρτωση...</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Ρυθμίσεις Email"
        description="Πρότυπα αποστολής προσφορών μέσω email"
        backHref="/settings"
      />

      <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
        {/* Sender */}
        <div className="p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Αποστολέας
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="email_from_name">Όνομα Αποστολέα</Label>
              <Input
                id="email_from_name"
                value={values.email_from_name}
                onChange={(e) => set("email_from_name", e.target.value)}
                placeholder="π.χ. Pump Repair CRM"
              />
              <p className="text-xs text-gray-400">
                Εμφανίζεται ως όνομα στο εισερχόμενο του παραλήπτη
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email_reply_to">Reply-To Email</Label>
              <Input
                id="email_reply_to"
                type="email"
                value={values.email_reply_to}
                onChange={(e) => set("email_reply_to", e.target.value)}
                placeholder="π.χ. info@company.gr"
              />
              <p className="text-xs text-gray-400">
                Διεύθυνση απάντησης όταν ο πελάτης πατά Reply
              </p>
            </div>
          </div>
        </div>

        {/* Variables reference */}
        <div className="p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-500" />
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Διαθέσιμες Μεταβλητές
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {VARIABLES.map((v) => (
              <span
                key={v.var}
                className="inline-flex items-center gap-1.5 text-xs bg-gray-100 text-gray-700 rounded px-2 py-1 font-mono"
                title={v.label}
              >
                {v.var}
                <span className="font-sans text-gray-400">— {v.label}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Subject */}
        <div className="p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Θέμα (Subject)
          </h2>
          <div className="space-y-1.5">
            <Label htmlFor="email_subject_template">Πρότυπο Θέματος</Label>
            <Input
              id="email_subject_template"
              value={values.email_subject_template}
              onChange={(e) => set("email_subject_template", e.target.value)}
              placeholder="π.χ. Προσφορά {{offer_number}} - {{company_name}}"
            />
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Σώμα Email
          </h2>
          <div className="space-y-1.5">
            <Label htmlFor="email_body_template">Πρότυπο Κειμένου</Label>
            <Textarea
              id="email_body_template"
              value={values.email_body_template}
              onChange={(e) => set("email_body_template", e.target.value)}
              rows={7}
              placeholder="Κείμενο email..."
            />
          </div>
        </div>

        {/* Signature */}
        <div className="p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Υπογραφή
          </h2>
          <div className="space-y-1.5">
            <Label htmlFor="email_signature">Υπογραφή Email</Label>
            <Textarea
              id="email_signature"
              value={values.email_signature}
              onChange={(e) => set("email_signature", e.target.value)}
              rows={4}
              placeholder="π.χ. Με εκτίμηση,&#10;Pump Repair Co.&#10;Τηλ: 210 1234567"
            />
            <p className="text-xs text-gray-400">
              Προστίθεται αυτόματα στο τέλος κάθε email
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Αποθήκευση..." : saved ? "Αποθηκεύτηκε ✓" : "Αποθήκευση"}
        </Button>
      </div>
    </div>
  );
}
