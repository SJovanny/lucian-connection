import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";
import { ProductsTable } from "@/components/admin/ProductsTable";
import { getProducts, getCategories } from "@/lib/supabase/queries";

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-display">
            Produits
          </h1>
          <p className="text-gray-500 mt-1">
            Gérez votre catalogue de produits
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un produit
          </Button>
        </Link>
      </div>

      {/* Products Table with real data */}
      <ProductsTable initialProducts={products} categories={categories} />
    </div>
  );
}
