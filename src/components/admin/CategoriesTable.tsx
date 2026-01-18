"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Edit, Trash2, Search, ImageIcon } from "lucide-react";
import type { Category } from "@/types/database.types";
import { useRouter } from "next/navigation";

interface CategoriesTableProps {
  initialCategories: Category[];
}

export function CategoriesTable({ initialCategories }: CategoriesTableProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  // Filtrer les catégories
  const filteredCategories = categories.filter((category) => {
    const nameFr = category.translations.fr.name.toLowerCase();
    const nameEn = category.translations.en.name.toLowerCase();
    const search = searchQuery.toLowerCase();
    return nameFr.includes(search) || nameEn.includes(search);
  });

  // Supprimer une catégorie
  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ?")) return;

    setLoading(id);
    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setCategories((prev) => prev.filter((c) => c.id !== id));
        router.refresh();
      } else {
        alert("Erreur lors de la suppression de la catégorie.");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher une catégorie..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                  Image
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                  Nom (FR)
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                  Nom (EN)
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                  Ordre
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                  Slug
                </th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCategories.map((category) => (
                <tr key={category.id}>
                  <td className="px-6 py-4">
                    {category.image_url ? (
                      <Image
                        src={category.image_url}
                        alt={category.translations.fr.name}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {category.translations.fr.name}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {category.translations.en.name}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {category.display_order}
                  </td>
                  <td className="px-6 py-4 text-gray-500 font-mono text-sm">
                    {category.slug}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/categories/${category.id}`}
                        className="p-2 rounded-lg"
                      >
                        <Edit className="w-4 h-4 text-gray-500" />
                      </Link>
                      <button
                        onClick={() => handleDelete(category.id)}
                        disabled={loading === category.id}
                        className="p-2 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucune catégorie trouvée</p>
          </div>
        )}
      </div>
    </div>
  );
}
