"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BookUser, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { customerSchema, type CustomerFormData } from "@/lib/validations/customer";
import { cn } from "@/lib/utils";

interface CustomerFormProps {
  initialData?: CustomerFormData & { id?: string };
  mode: "create" | "edit";
}

export function CustomerForm({ initialData, mode }: CustomerFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: initialData || {
      customerType: "company",
      companyName: "",
      firstName: "",
      lastName: "",
      vatNumber: "",
      taxOffice: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      postalCode: "",
      notes: "",
    },
  });

  const customerType = watch("customerType");

  async function onSubmit(data: CustomerFormData) {
    setSaving(true);
    setError(null);

    try {
      const url =
        mode === "create"
          ? "/api/customers"
          : `/api/customers/${initialData?.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Σφάλμα κατά την αποθήκευση");
        return;
      }

      router.push(`/customers/${json.data.id}`);
      router.refresh();
    } catch (err) {
      setError("Σφάλμα σύνδεσης. Δοκιμάστε ξανά.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Customer Type Toggle */}
      <div>
        <Label className="mb-3 block">Τύπος Πελάτη</Label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setValue("customerType", "company")}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-colors flex-1",
              customerType === "company"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            )}
          >
            <BookUser size={36} color="#27915a" absoluteStrokeWidth />
            <span
              className={cn(
                "font-medium",
                customerType === "company" ? "text-blue-700" : "text-gray-600"
              )}
            >
              Εταιρεία
            </span>
          </button>

          <button
            type="button"
            onClick={() => setValue("customerType", "individual")}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-colors flex-1",
              customerType === "individual"
                ? "border-green-500 bg-green-50"
                : "border-gray-200 hover:border-gray-300"
            )}
          >
            <User
              className={cn(
                "h-5 w-5",
                customerType === "individual"
                  ? "text-green-600"
                  : "text-gray-400"
              )}
            />
            <span
              className={cn(
                "font-medium",
                customerType === "individual"
                  ? "text-green-700"
                  : "text-gray-600"
              )}
            >
              Ιδιώτης
            </span>
          </button>
        </div>
      </div>

      {/* Company / Individual Fields */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <h3 className="font-medium text-gray-900">
          {customerType === "company" ? "Στοιχεία Εταιρείας" : "Στοιχεία Ιδιώτη"}
        </h3>

        {customerType === "company" ? (
          <>
            <div>
              <Label htmlFor="companyName">Επωνυμία *</Label>
              <Input
                id="companyName"
                {...register("companyName")}
                placeholder="π.χ. Ναυτική Εταιρεία ΑΕ"
                className="mt-1"
              />
              {errors.companyName && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.companyName.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vatNumber">ΑΦΜ</Label>
                <Input
                  id="vatNumber"
                  {...register("vatNumber")}
                  placeholder="123456789"
                  className="mt-1"
                />
                {errors.vatNumber && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.vatNumber.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="taxOffice">ΔΟΥ</Label>
                <Input
                  id="taxOffice"
                  {...register("taxOffice")}
                  placeholder="π.χ. Α' Πειραιά"
                  className="mt-1"
                />
              </div>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">Όνομα *</Label>
              <Input
                id="firstName"
                {...register("firstName")}
                placeholder="π.χ. Γιώργος"
                className="mt-1"
              />
              {errors.firstName && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.firstName.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="lastName">Επώνυμο *</Label>
              <Input
                id="lastName"
                {...register("lastName")}
                placeholder="π.χ. Παπαδόπουλος"
                className="mt-1"
              />
              {errors.lastName && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Contact Info */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <h3 className="font-medium text-gray-900">Στοιχεία Επικοινωνίας</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="phone">Τηλέφωνο</Label>
            <Input
              id="phone"
              {...register("phone")}
              placeholder="210 1234567"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="info@example.com"
              className="mt-1"
            />
            {errors.email && (
              <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="address">Διεύθυνση</Label>
          <Input
            id="address"
            {...register("address")}
            placeholder="π.χ. Λεωφ. Ποσειδώνος 42"
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="city">Πόλη</Label>
            <Input
              id="city"
              {...register("city")}
              placeholder="π.χ. Πειραιάς"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="postalCode">Τ.Κ.</Label>
            <Input
              id="postalCode"
              {...register("postalCode")}
              placeholder="π.χ. 18535"
              className="mt-1"
            />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <Label htmlFor="notes">Σημειώσεις</Label>
        <Textarea
          id="notes"
          {...register("notes")}
          placeholder="Προαιρετικές σημειώσεις..."
          className="mt-1"
          rows={3}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={saving}
        >
          Ακύρωση
        </Button>
        <Button type="submit" disabled={saving}>
          {saving
            ? "Αποθήκευση..."
            : mode === "create"
            ? "Δημιουργία"
            : "Ενημέρωση"}
        </Button>
      </div>
    </form>
  );
}
