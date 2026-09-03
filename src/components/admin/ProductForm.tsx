/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Upload, X, Save, Trash2 } from "lucide-react";
import type { Product, Category } from "@/types/database.types";

interface ProductFormProps {
  product?: Product & { categories?: Category | null };
  categories: Category[];
  isEditing?: boolean;
}

export function ProductForm({ product, categories, isEditing = false }: ProductFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(product?.image_url || null);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name_fr: product?.translations?.fr?.name || "",
    name_en: product?.translations?.en?.name || "",
    description_fr: product?.translations?.fr?.description || "",
    description_en: product?.translations?.en?.description || "",
    allergens_fr: product?.allergens?.fr?.join(", ") || "",
    allergens_en: product?.allergens?.en?.join(", ") || "",
    category_id: product?.category_id || "",
    price: product?.price?.toString() || "",
    compare_at_price: product?.compare_at_price?.toString() || "",
    unit: product?.unit || "each",
    stock: product?.stock?.toString() || "0",
    low_stock_threshold: product?.low_stock_threshold?.toString() || "5",
    track_stock: product?.track_stock !== false,
    is_active: product?.is_active !== false,
    is_featured: product?.is_featured || false,
    image_url: product?.image_url || "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const url = isEditing
        ? `/api/admin/products/${product?.id}`
        : "/api/admin/products";

      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          image_url: imagePreview || formData.image_url,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Une erreur est survenue");
      }

      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!product?.id) return;

    const confirmed = window.confirm(
      "Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible."
    );

    if (!confirmed) return;

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de la suppression");
      }

      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informations de base</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Nom (Français)"
              name="name_fr"
              value={formData.name_fr}
              onChange={handleChange}
              placeholder="Ex: Avocat Italien"
              required
            />
            <Input
              label="Name (English)"
              name="name_en"
              value={formData.name_en}
              onChange={handleChange}
              placeholder="Ex: Italian Avocado"
              required
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Français)
              </label>
              <textarea
                name="description_fr"
                value={formData.description_fr}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500"
                placeholder="Description du produit en français..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (English)
              </label>
              <textarea
                name="description_en"
                value={formData.description_en}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500"
                placeholder="Product description in English..."
              />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Allergènes (Français)
              </label>
              <textarea
                name="allergens_fr"
                value={formData.allergens_fr}
                onChange={handleChange}
                rows={2}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500"
                placeholder="Ex: lait, soja, gluten"
              />
              <p className="mt-1 text-xs text-gray-500">Séparer les allergènes par des virgules.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Allergens (English)
              </label>
              <textarea
                name="allergens_en"
                value={formData.allergens_en}
                onChange={handleChange}
                rows={2}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500"
                placeholder="Ex: milk, soy, gluten"
              />
              <p className="mt-1 text-xs text-gray-500">Separate allergens with commas.</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catégorie
            </label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500"
            >
              <option value="">Sans catégorie</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.translations?.fr?.name || category.slug}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Pricing & Stock */}
      <Card>
        <CardHeader>
          <CardTitle>Prix & Stock</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <Input
              label="Prix (€)"
              name="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={handleChange}
              placeholder="0.00"
              required
            />
            <Input
              label="Prix barré (€)"
              name="compare_at_price"
              type="number"
              step="0.01"
              min="0"
              value={formData.compare_at_price}
              onChange={handleChange}
              placeholder="0.00"
            />
            <Input
              label="Unité"
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              placeholder="Ex: 500 gm."
            />
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <Input
              label="Stock"
              name="stock"
              type="number"
              min="0"
              value={formData.stock}
              onChange={handleChange}
              placeholder="0"
            />
            <Input
              label="Seuil d'alerte"
              name="low_stock_threshold"
              type="number"
              min="0"
              value={formData.low_stock_threshold}
              onChange={handleChange}
              placeholder="5"
            />
            <div className="flex items-end">
              <label className="flex items-center gap-2 h-12 cursor-pointer">
                <input
                  type="checkbox"
                  name="track_stock"
                  checked={formData.track_stock}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Suivre le stock</span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Image */}
      <Card>
        <CardHeader>
          <CardTitle>Image du produit</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="URL de l'image"
            name="image_url"
            value={formData.image_url}
            onChange={(e) => {
              handleChange(e);
              setImagePreview(e.target.value);
            }}
            placeholder="https://example.com/image.jpg"
          />

          <div className="text-sm text-gray-500 text-center">ou</div>

          {imagePreview ? (
            <div className="relative w-48 h-48">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-cover rounded-xl"
              />
              <button
                type="button"
                onClick={() => {
                  setImagePreview(null);
                  setFormData((prev) => ({ ...prev, image_url: "" }));
                }}
                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer">
              <Upload className="w-10 h-10 text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">
                Cliquez pour uploader une image
              </span>
              <span className="text-xs text-gray-400 mt-1">
                PNG, JPG jusqu&apos;à 5MB
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </label>
          )}
        </CardContent>
      </Card>

      {/* Options */}
      <Card>
        <CardHeader>
          <CardTitle>Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="w-5 h-5 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Produit actif</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="is_featured"
                checked={formData.is_featured}
                onChange={handleChange}
                className="w-5 h-5 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Produit vedette</span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between">
        <div>
          {isEditing && (
            <Button
              type="button"
              variant="secondary"
              onClick={handleDelete}
              isLoading={isDeleting}
              className="!bg-red-50 !text-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Supprimer
            </Button>
          )}
        </div>
        <div className="flex gap-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push("/admin/products")}
          >
            Annuler
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            {isEditing ? "Enregistrer" : "Créer le produit"}
          </Button>
        </div>
      </div>
    </form>
  );
}
