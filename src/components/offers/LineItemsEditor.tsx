"use client";

import { Plus, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { calculateLineTotal, formatCurrency } from "@/lib/utils";

export interface LineItem {
  id?: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discountPercent: number;
  sortOrder: number;
}

interface LineItemsEditorProps {
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
  errors?: Record<string, any>;
}

const UNIT_OPTIONS = ["τεμ.", "ώρα", "ημέρα", "μέτρο", "κιλό", "σετ", "υπηρεσία"];

export function LineItemsEditor({ items, onChange, errors }: LineItemsEditorProps) {
  function addItem() {
    onChange([
      ...items,
      {
        description: "",
        quantity: 1,
        unit: "τεμ.",
        unitPrice: 0,
        discountPercent: 0,
        sortOrder: items.length,
      },
    ]);
  }

  function removeItem(index: number) {
    const updated = items.filter((_, i) => i !== index);
    onChange(updated.map((item, i) => ({ ...item, sortOrder: i })));
  }

  function updateItem(index: number, field: keyof LineItem, value: any) {
    const updated = items.map((item, i) => {
      if (i === index) {
        return { ...item, [field]: value };
      }
      return item;
    });
    onChange(updated);
  }

  function getLineTotal(item: LineItem): number {
    return calculateLineTotal(item.quantity, item.unitPrice, item.discountPercent);
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="hidden sm:grid sm:grid-cols-[1fr_80px_80px_100px_70px_80px_36px] gap-2 px-2 text-xs font-medium text-gray-500 uppercase">
        <div>Περιγραφή</div>
        <div className="text-center">Ποσότητα</div>
        <div className="text-center">Μονάδα</div>
        <div className="text-right">Τιμή Μον.</div>
        <div className="text-center">Έκπτ. %</div>
        <div className="text-right">Σύνολο</div>
        <div></div>
      </div>

      {/* Items */}
      {items.map((item, index) => (
        <div
          key={index}
          className="bg-white border border-gray-200 rounded-lg p-3 sm:p-2 space-y-2 sm:space-y-0 sm:grid sm:grid-cols-[1fr_80px_80px_100px_70px_80px_36px] sm:gap-2 sm:items-center"
        >
          {/* Description */}
          <div>
            <label className="text-xs text-gray-500 sm:hidden">Περιγραφή</label>
            <Input
              value={item.description}
              onChange={(e) => updateItem(index, "description", e.target.value)}
              placeholder="Περιγραφή εργασίας/υλικού..."
              className="text-sm"
            />
            {errors?.[`lineItems.${index}.description`] && (
              <p className="text-xs text-red-600 mt-0.5">
                {errors[`lineItems.${index}.description`]}
              </p>
            )}
          </div>

          {/* Quantity */}
          <div>
            <label className="text-xs text-gray-500 sm:hidden">Ποσότητα</label>
            <Input
              type="number"
              min="0.01"
              step="0.01"
              value={item.quantity}
              onChange={(e) =>
                updateItem(index, "quantity", parseFloat(e.target.value) || 0)
              }
              className="text-sm text-center"
            />
          </div>

          {/* Unit */}
          <div>
            <label className="text-xs text-gray-500 sm:hidden">Μονάδα</label>
            <select
              value={item.unit}
              onChange={(e) => updateItem(index, "unit", e.target.value)}
              className="w-full h-10 rounded-md border border-gray-200 bg-white px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {UNIT_OPTIONS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          {/* Unit Price */}
          <div>
            <label className="text-xs text-gray-500 sm:hidden">Τιμή Μον.</label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={item.unitPrice}
              onChange={(e) =>
                updateItem(index, "unitPrice", parseFloat(e.target.value) || 0)
              }
              className="text-sm text-right"
            />
          </div>

          {/* Discount */}
          <div>
            <label className="text-xs text-gray-500 sm:hidden">Έκπτ. %</label>
            <Input
              type="number"
              min="0"
              max="100"
              step="0.5"
              value={item.discountPercent}
              onChange={(e) =>
                updateItem(
                  index,
                  "discountPercent",
                  parseFloat(e.target.value) || 0
                )
              }
              className="text-sm text-center"
            />
          </div>

          {/* Line Total */}
          <div className="text-right">
            <label className="text-xs text-gray-500 sm:hidden">Σύνολο</label>
            <p className="text-sm font-medium text-gray-900 py-2">
              {formatCurrency(getLineTotal(item))}
            </p>
          </div>

          {/* Delete */}
          <div className="flex justify-end sm:justify-center">
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded"
              title="Διαγραφή"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}

      {/* Add button */}
      <Button
        type="button"
        variant="outline"
        onClick={addItem}
        className="w-full border-dashed"
      >
        <Plus className="h-4 w-4 mr-1" />
        Προσθήκη Είδους
      </Button>

      {/* Validation error for no items */}
      {errors?.lineItems && typeof errors.lineItems === "string" && (
        <p className="text-sm text-red-600">{errors.lineItems}</p>
      )}
    </div>
  );
}
