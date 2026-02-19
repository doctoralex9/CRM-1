"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, X, Check, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface Term {
  id: string;
  title: string;
  clauseText: string;
  sortOrder: number;
  isActive: boolean;
  isDefault: boolean;
}

interface FormState {
  title: string;
  clauseText: string;
  isDefault: boolean;
}

const EMPTY_FORM: FormState = { title: "", clauseText: "", isDefault: false };

export default function TermsSettingsPage() {
  const [terms, setTerms] = useState<Term[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function load() {
    try {
      const res = await fetch("/api/settings/terms");
      const json = await res.json();
      setTerms(json.data || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openNew() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
    setShowForm(true);
  }

  function openEdit(term: Term) {
    setEditingId(term.id);
    setForm({ title: term.title, clauseText: term.clauseText, isDefault: term.isDefault });
    setError("");
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
  }

  async function handleSave() {
    if (!form.title.trim() || !form.clauseText.trim()) {
      setError("Τίτλος και κείμενο είναι υποχρεωτικά.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (editingId) {
        const res = await fetch(`/api/settings/terms/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) {
          const j = await res.json();
          setError(j.error || "Σφάλμα αποθήκευσης");
          return;
        }
      } else {
        const res = await fetch("/api/settings/terms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) {
          const j = await res.json();
          setError(j.error || "Σφάλμα δημιουργίας");
          return;
        }
      }
      cancelForm();
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/settings/terms/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const j = await res.json();
        alert(j.error || "Σφάλμα διαγραφής");
        return;
      }
      await load();
    } finally {
      setDeletingId(null);
    }
  }

  async function toggleActive(term: Term) {
    await fetch(`/api/settings/terms/${term.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !term.isActive }),
    });
    await load();
  }

  return (
    <div>
      <PageHeader
        title="Όροι & Προϋποθέσεις"
        description="Πρότυπα κείμενα για τις προσφορές"
        backHref="/settings"
        action={!showForm ? { label: "Νέος Όρος", onClick: openNew } : undefined}
      />

      {/* Inline form */}
      {showForm && (
        <div className="bg-white border border-blue-200 rounded-lg p-5 mb-4 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">
            {editingId ? "Επεξεργασία Όρου" : "Νέος Όρος"}
          </h3>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="term_title">Τίτλος</Label>
              <Input
                id="term_title"
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="π.χ. Εγγύηση"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="term_text">Κείμενο Όρου</Label>
              <Textarea
                id="term_text"
                value={form.clauseText}
                onChange={(e) => setForm((p) => ({ ...p, clauseText: e.target.value }))}
                rows={4}
                placeholder="Γράψτε τον όρο..."
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={(e) => setForm((p) => ({ ...p, isDefault: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">
                Προεπιλεγμένος (επιλέγεται αυτόματα σε νέες προσφορές)
              </span>
            </label>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex gap-2 pt-1">
              <Button onClick={handleSave} disabled={saving} size="sm">
                <Check className="h-4 w-4 mr-1" />
                {saving ? "Αποθήκευση..." : "Αποθήκευση"}
              </Button>
              <Button variant="ghost" onClick={cancelForm} size="sm">
                <X className="h-4 w-4 mr-1" />
                Ακύρωση
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <p className="text-gray-500 text-sm">Φόρτωση...</p>
      ) : terms.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <p className="text-gray-500 text-sm mb-3">Δεν υπάρχουν όροι</p>
          <Button size="sm" onClick={openNew}>
            <Plus className="h-4 w-4 mr-1" />
            Προσθέστε τον πρώτο
          </Button>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
          {terms.map((term) => (
            <div
              key={term.id}
              className={cn(
                "p-4 flex items-start gap-3",
                !term.isActive && "opacity-50"
              )}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900 text-sm">{term.title}</span>
                  {term.isDefault && (
                    <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5">
                      <Star className="h-3 w-3" />
                      Προεπιλογή
                    </span>
                  )}
                  {!term.isActive && (
                    <span className="text-xs text-gray-400 bg-gray-100 rounded px-1.5 py-0.5">
                      Ανενεργό
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 line-clamp-2 whitespace-pre-wrap">
                  {term.clauseText}
                </p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-400 hover:text-gray-700"
                  onClick={() => toggleActive(term)}
                  title={term.isActive ? "Απενεργοποίηση" : "Ενεργοποίηση"}
                >
                  <span className="text-xs font-medium">
                    {term.isActive ? "OFF" : "ON"}
                  </span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-400 hover:text-blue-600"
                  onClick={() => openEdit(term)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-400 hover:text-red-600"
                  onClick={() => handleDelete(term.id)}
                  disabled={deletingId === term.id}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
