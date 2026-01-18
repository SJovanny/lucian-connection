import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";
import { CategoriesTable } from "@/components/admin/CategoriesTable";
import { getCategories } from "@/lib/supabase/queries";

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-display">
            Catégories
          </h1>
          <p className="text-gray-500 mt-1">
            Gérez les catégories de produits
          </p>
        </div>
        <Link href="/admin/categories/new">
          <Button variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter une catégorie
          </Button>
        </Link>
      </div>

      {/* Categories Table */}
      <CategoriesTable initialCategories={categories} />
    </div>
  );
}
