"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ArrowLeft, Upload, X } from "lucide-react";

export default function NewProductPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: Implement Supabase insert
    setTimeout(() => {
      setIsLoading(false);
      router.push("/admin/products");
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/products"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-display">
            Nouveau produit
          </h1>
          <p className="text-gray-500 mt-1">
            Ajoutez un nouveau produit à votre catalogue
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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
                placeholder="Ex: Avocat Italien"
                required
              />
              <Input
                label="Name (English)"
                name="name_en"
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
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500"
                  placeholder="Product description in English..."
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Slug (URL)"
                name="slug"
                placeholder="ex: italian-avocado"
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie
                </label>
                <select
                  name="category_id"
                  className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500"
                >
                  <option value="">Sélectionner une catégorie</option>
                  <option value="vegetables">Légumes</option>
                  <option value="fruits">Fruits</option>
                  <option value="meat">Viandes</option>
                  <option value="dairy">Produits laitiers</option>
                  <option value="drinks">Boissons</option>
                </select>
              </div>
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
                label="Prix ($)"
                name="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                required
              />
              <Input
                label="Prix barré ($)"
                name="compare_at_price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
              />
              <Input
                label="Unité"
                name="unit"
                placeholder="Ex: 500 gm."
                defaultValue="each"
              />
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <Input
                label="Stock"
                name="stock"
                type="number"
                min="0"
                placeholder="0"
                defaultValue="0"
              />
              <Input
                label="Seuil d'alerte"
                name="low_stock_threshold"
                type="number"
                min="0"
                placeholder="5"
                defaultValue="5"
              />
              <div className="flex items-end">
                <label className="flex items-center gap-2 h-12 cursor-pointer">
                  <input
                    type="checkbox"
                    name="track_stock"
                    defaultChecked
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
          <CardContent>
            {imagePreview ? (
              <div className="relative w-48 h-48">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setImagePreview(null)}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors">
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
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setImagePreview(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
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
                  defaultChecked
                  className="w-5 h-5 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Produit actif</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_featured"
                  className="w-5 h-5 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Produit vedette</span>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Link href="/admin/products">
            <Button variant="secondary" type="button">
              Annuler
            </Button>
          </Link>
          <Button variant="primary" type="submit" isLoading={isLoading}>
            Créer le produit
          </Button>
        </div>
      </form>
    </div>
  );
}
