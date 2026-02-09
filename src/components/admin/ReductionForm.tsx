"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Reduction } from "@/types/database.types";

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

const reductionSchema = z
  .object({
    name: z.string().min(3, "Le nom doit faire au moins 3 caractères"),
    description: z.string().optional(),
    discount_type: z.enum(["percentage", "fixed"]),
    discount_value: z.coerce.number().min(0, "La valeur doit être positive"),
    applies_to: z.enum(["all", "categories", "products"]),
    category_ids: z.array(z.string()),
    product_ids: z.array(z.string()),
    starts_at: z.string().optional(),
    expires_at: z.string().optional(),
    priority: z.coerce.number().min(1).max(5, "La priorité doit être entre 1 et 5"),
    is_active: z.boolean(),
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
  )
  .refine(
    (data) => {
      if (data.applies_to === "categories") {
        return data.category_ids.length > 0;
      }
      return true;
    },
    {
      message: "Sélectionnez au moins une catégorie",
      path: ["category_ids"],
    }
  )
  .refine(
    (data) => {
      if (data.applies_to === "products") {
        return data.product_ids.length > 0;
      }
      return true;
    },
    {
      message: "Sélectionnez au moins un produit",
      path: ["product_ids"],
    }
  );

type ReductionFormData = z.infer<typeof reductionSchema>;

interface ReductionFormProps {
  initialData?: Reduction;
  isEdit?: boolean;
}

export function ReductionForm({ initialData, isEdit = false }: ReductionFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ReductionFormData>({
    resolver: zodResolver(reductionSchema) as Resolver<ReductionFormData>,
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      discount_type: initialData?.discount_type || "percentage",
      discount_value: initialData?.discount_value || 0,
      applies_to: initialData?.applies_to || "all",
      category_ids: initialData?.category_ids || [],
      product_ids: initialData?.product_ids || [],
      starts_at: toLocalInputValue(initialData?.starts_at),
      expires_at: toLocalInputValue(initialData?.expires_at),
      priority: initialData?.priority || 0,
      is_active: initialData?.is_active ?? true,
    },
  });

  const appliesTo = watch("applies_to");
  const selectedCategoryIds = watch("category_ids");
  const selectedProductIds = watch("product_ids");

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      
      const [{ data: categoriesData }, { data: productsData }] = await Promise.all([
        supabase.from("categories").select("id, translations, slug").order("display_order"),
        supabase.from("products").select("id, translations, slug").order("translations->fr->name"),
      ]);

      setCategories(categoriesData || []);
      setProducts(productsData || []);
    };

    fetchData();
  }, []);

  const handleCategoryToggle = (categoryId: string) => {
    const current = selectedCategoryIds || [];
    if (current.includes(categoryId)) {
      setValue("category_ids", current.filter(id => id !== categoryId));
    } else {
      setValue("category_ids", [...current, categoryId]);
    }
  };

  const handleProductToggle = (productId: string) => {
    const current = selectedProductIds || [];
    if (current.includes(productId)) {
      setValue("product_ids", current.filter(id => id !== productId));
    } else {
      setValue("product_ids", [...current, productId]);
    }
  };

  const onSubmit = async (data: ReductionFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const supabase = createClient();
      
      const payload: Partial<Reduction> = {
        ...data,
        starts_at: toIsoWithOffset(data.starts_at),
        expires_at: toIsoWithOffset(data.expires_at),
        category_ids: data.applies_to === "categories" ? data.category_ids : [],
        product_ids: data.applies_to === "products" ? data.product_ids : [],
        updated_at: new Date().toISOString(),
      };

      if (isEdit) {
        if (!initialData?.id) {
          throw new Error("Reduction ID is required for updates.");
        }
        const { error } = await supabase
          .from("reductions")
          .update(payload)
          .eq("id", initialData.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("reductions")
          .insert(payload);

        if (error) throw error;
      }

      router.push("/admin/reductions");
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setError("Une erreur est survenue lors de l'enregistrement.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin/reductions"
          className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? "Modifier la réduction" : "Créer une réduction"}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card padding="lg" className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Informations générales</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Input
                label="Nom de la réduction"
                {...register("name")}
                placeholder="Ex: Soldes d'été"
                error={errors.name?.message}
              />
            </div>

            <div className="md:col-span-2">
              <Input
                label="Description"
                {...register("description")}
                placeholder="Description interne"
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
                {...register("discount_value", { valueAsNumber: true })}
                error={errors.discount_value?.message}
              />
            </div>

            <div>
              <Input
                label="Priorité"
                type="number"
                min={1}
                max={5}
                {...register("priority", { valueAsNumber: true })}
                error={errors.priority?.message}
              />
              <p className="mt-1 text-sm text-gray-500">Fourchette fixe de 1 à 5</p>
            </div>
          </div>
        </Card>

        <Card padding="lg" className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Portée de la réduction</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              S'applique à
            </label>
            <select
              {...register("applies_to")}
              className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500"
            >
              <option value="all">Tous les produits</option>
              <option value="categories">Catégories spécifiques</option>
              <option value="products">Produits spécifiques</option>
            </select>
          </div>

          {appliesTo === "categories" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Catégories ({selectedCategoryIds?.length || 0} sélectionnée(s))
              </label>
              {errors.category_ids && (
                <p className="text-sm text-red-600 mb-2">{errors.category_ids.message}</p>
              )}
              <div className="max-h-64 overflow-y-auto border border-gray-300 rounded-lg p-3 space-y-2">
                {categories.map((category) => (
                  <label
                    key={category.id}
                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategoryIds?.includes(category.id) || false}
                      onChange={() => handleCategoryToggle(category.id)}
                      className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                    />
                    <span>{category.translations.fr.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {appliesTo === "products" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Produits ({selectedProductIds?.length || 0} sélectionné(s))
              </label>
              {errors.product_ids && (
                <p className="text-sm text-red-600 mb-2">{errors.product_ids.message}</p>
              )}
              <div className="max-h-64 overflow-y-auto border border-gray-300 rounded-lg p-3 space-y-2">
                {products.map((product) => (
                  <label
                    key={product.id}
                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedProductIds?.includes(product.id) || false}
                      onChange={() => handleProductToggle(product.id)}
                      className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                    />
                    <span>{product.translations.fr.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </Card>

        <Card padding="lg" className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Période de validité</h2>
          
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

            <div className="md:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("is_active")}
                  className="w-5 h-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                />
                <span className="text-gray-700 font-medium">Activer la réduction</span>
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
          <Link href="/admin/reductions">
            <Button variant="secondary" type="button">
              Annuler
            </Button>
          </Link>
          <Button type="submit" isLoading={isSubmitting}>
            {isEdit ? "Enregistrer les modifications" : "Créer la réduction"}
          </Button>
        </div>
      </form>
    </div>
  );
}
