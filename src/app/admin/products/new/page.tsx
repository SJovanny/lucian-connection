import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProductForm } from "@/components/admin/ProductForm";
import { createClient } from "@supabase/supabase-js";

// Admin client pour bypasser RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getCategories() {
  const { data } = await supabaseAdmin
    .from("categories")
    .select("*")
    .order("display_order", { ascending: true });
  return data || [];
}

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/products"
          className="p-2 rounded-lg"
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

      <ProductForm categories={categories} />
    </div>
  );
}
