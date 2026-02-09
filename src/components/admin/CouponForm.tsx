"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Coupon } from "@/types/database.types";

const toLocalInputValue = (iso?: string | null) => {
  if (!iso) return "";
  const date = new Date(iso);
  const tzOffset = date.getTimezoneOffset() * 60000;
  const local = new Date(date.getTime() - tzOffset);
  return local.toISOString().slice(0, 16);
};

const toIsoWithOffset = (value?: string) => {
  if (!value) return null;
  const [datePart, timePart] = value.split("T");
  if (!datePart || !timePart) return null;
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);
  const localDate = new Date(year, month - 1, day, hour, minute, 0);
  const offsetMinutes = -localDate.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const pad = (n: number) => String(Math.abs(Math.trunc(n))).padStart(2, "0");
  const offsetH = pad(offsetMinutes / 60);
  const offsetM = pad(offsetMinutes % 60);
  return `${datePart}T${timePart}:00${sign}${offsetH}:${offsetM}`;
};

const getDefaultStartDate = () => {
  const now = new Date();
  const tzOffset = now.getTimezoneOffset() * 60000;
  const local = new Date(now.getTime() - tzOffset);
  return local.toISOString().slice(0, 16);
};

const couponSchema = z
  .object({
    code: z.string().min(3, "Le code doit faire au moins 3 caractères").toUpperCase(),
    description: z.string().optional(),
    discount_type: z.enum(["percentage", "fixed"]),
    discount_value: z.coerce.number().min(0, "La valeur doit être positive"),
    min_order_amount: z.coerce.number().min(0).default(0),
    max_discount_amount: z.coerce.number().optional().nullable(),
    usage_limit: z.coerce.number().optional().nullable(),
    starts_at: z.string().optional(),
    expires_at: z.string().optional(),
    is_first_order_only: z.boolean().default(false),
    is_active: z.boolean().default(true),
  })
  .refine(
    (data) => {
      if (data.starts_at && data.expires_at) {
        return new Date(data.starts_at) <= new Date(data.expires_at);
      }
      return true;
    },
    {
      message: "La date de fin doit être après la date de début",
      path: ["expires_at"],
    }
  );

type CouponFormData = z.output<typeof couponSchema>;

interface CouponFormProps {
  initialData?: Partial<Coupon> & { id?: string };
  isEdit?: boolean;
}

export function CouponForm({ initialData, isEdit = false }: CouponFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: initialData?.code || "",
      description: initialData?.description || "",
      discount_type: initialData?.discount_type || "percentage",
      discount_value: initialData?.discount_value || 0,
      min_order_amount: initialData?.min_order_amount || 0,
      max_discount_amount: initialData?.max_discount_amount || null,
      usage_limit: initialData?.usage_limit || null,
      starts_at: toLocalInputValue(initialData?.starts_at) || getDefaultStartDate(),
      expires_at: toLocalInputValue(initialData?.expires_at) || "",
      is_first_order_only: initialData?.is_first_order_only || false,
      is_active: initialData?.is_active ?? true,
    } as CouponFormData,
  });

  const discountType = watch("discount_type");

  const onSubmit = async (data: CouponFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        ...data,
        starts_at: toIsoWithOffset(data.starts_at),
        expires_at: toIsoWithOffset(data.expires_at),
        max_discount_amount: data.max_discount_amount || null,
        usage_limit: data.usage_limit || null,
        min_order_amount: data.min_order_amount ?? 0,
      };

      if (isEdit && initialData?.id) {
        // Update existing coupon via API
        const response = await fetch(`/api/admin/coupons/${initialData.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to update coupon");
        }
      } else {
        // Create new coupon via API
        const response = await fetch("/api/admin/coupons", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to create coupon");
        }
      }

      router.push("/admin/coupons");
      router.refresh();
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes("déjà")) {
        setError("Ce code promo existe déjà.");
      } else {
        setError(err.message || "Une erreur est survenue lors de l'enregistrement.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin/coupons"
          className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? "Modifier le coupon" : "Créer un coupon"}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card padding="lg" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Input
                label="Code Promo"
                {...register("code")}
                placeholder="Ex: ETE2024"
                error={errors.code?.message}
                className="uppercase font-mono"
              />
            </div>

            <div className="md:col-span-2">
              <Input
                label="Description (Interne)"
                {...register("description")}
                placeholder="Description pour l'administration"
                error={errors.description?.message}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de réduction
              </label>
              <select
                {...register("discount_type")}
                className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500"
              >
                <option value="percentage">Pourcentage (%)</option>
                <option value="fixed">Montant fixe (€)</option>
              </select>
            </div>

            <div>
              <Input
                label="Valeur de la réduction"
                type="number"
                step="0.01"
                {...register("discount_value")}
                error={errors.discount_value?.message}
              />
            </div>

            {discountType === "percentage" && (
              <div>
                <Input
                  label="Montant max de réduction (€)"
                  type="number"
                  step="0.01"
                  placeholder="Optionnel"
                  {...register("max_discount_amount")}
                  helperText="Laisser vide pour illimité"
                />
              </div>
            )}

            <div>
              <Input
                label="Montant minimum de commande (€)"
                type="number"
                step="0.01"
                {...register("min_order_amount")}
                error={errors.min_order_amount?.message}
              />
            </div>
          </div>
        </Card>

        <Card padding="lg" className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Validité et Limites</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Input
                label="Date de début"
                type="datetime-local"
                {...register("starts_at")}
                error={errors.starts_at?.message}
              />
            </div>

            <div>
              <Input
                label="Date de fin"
                type="datetime-local"
                {...register("expires_at")}
                error={errors.expires_at?.message}
              />
            </div>

            <div>
              <Input
                label="Limite d'utilisation (Total)"
                type="number"
                placeholder="Ex: 100"
                {...register("usage_limit")}
                helperText="Laisser vide pour illimité"
              />
            </div>

            <div className="flex flex-col gap-4 pt-8">
               <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("is_first_order_only")}
                  className="w-5 h-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                />
                <span className="text-gray-700">Valable uniquement pour la première commande</span>
              </label>
              
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("is_active")}
                  className="w-5 h-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                />
                <span className="text-gray-700">Activer le coupon</span>
              </label>
            </div>
          </div>
        </Card>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Link href="/admin/coupons">
            <Button variant="ghost" type="button">
              Annuler
            </Button>
          </Link>
          <Button type="submit" isLoading={isSubmitting}>
            {isEdit ? "Enregistrer les modifications" : "Créer le coupon"}
          </Button>
        </div>
      </form>
    </div>
  );
}
