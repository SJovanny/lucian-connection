/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Upload, X, Save, Trash2 } from "lucide-react";
import type { Category } from "@/types/database.types";

interface CategoryFormProps {
  category?: Category;
  isEditing?: boolean;
}

export function CategoryForm({ category, isEditing = false }: CategoryFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(category?.image_url || null);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    slug: category?.slug || "",
    name_fr: category?.translations?.fr?.name || "",
    name_en: category?.translations?.en?.name || "",
    display_order: category?.display_order?.toString() || "0",
    image_url: category?.image_url || "",
  });

  // Auto-generate slug from French name
  useEffect(() => {
    if (!isEditing && formData.name_fr && !formData.slug) {
      const generatedSlug = formData.name_fr
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setFormData((prev) => ({ ...prev, slug: generatedSlug }));
    }
  }, [formData.name_fr, isEditing, formData.slug]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const url = isEditing
        ? `/api/admin/categories/${category?.id}`
        : "/api/admin/categories";

      const method = isEditing ? "PUT" : "POST";

      const payload = {
        slug: formData.slug,
        display_order: parseInt(formData.display_order) || 0,
        image_url: imagePreview || formData.image_url,
        translations: {
          fr: { name: formData.name_fr },
          en: { name: formData.name_en }
        }
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Une erreur est survenue");
      }

      router.push("/admin/categories");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!category?.id) return;

    const confirmed = window.confirm(
      "Êtes-vous sûr de vouloir supprimer cette catégorie ? Cette action est irréversible."
    );

    if (!confirmed) return;

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/categories/${category.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de la suppression");
      }

      router.push("/admin/categories");
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
              placeholder="Ex: Fruits"
              required
            />
            <Input
              label="Name (English)"
              name="name_en"
              value={formData.name_en}
              onChange={handleChange}
              placeholder="Ex: Fruits"
              required
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Slug (URL)"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              placeholder="ex: fruits"
              required
            />
            <Input
              label="Ordre d'affichage"
              name="display_order"
              type="number"
              value={formData.display_order}
              onChange={handleChange}
              placeholder="0"
            />
          </div>
        </CardContent>
      </Card>

      {/* Image */}
      <Card>
        <CardHeader>
          <CardTitle>Image de la catégorie</CardTitle>
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
            onClick={() => router.push("/admin/categories")}
          >
            Annuler
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            {isEditing ? "Enregistrer" : "Créer la catégorie"}
          </Button>
        </div>
      </div>
    </form>
  );
}
