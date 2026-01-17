import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProductForm } from "@/components/admin/ProductForm";
import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";

// Admin client pour bypasser RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getProduct(id: string) {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("*, categories(*)")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data;
}

async function getCategories() {
  const { data } = await supabaseAdmin
    .from("categories")
    .select("*")
    .order("display_order", { ascending: true });
  return data || [];
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  const [product, categories] = await Promise.all([
    getProduct(id),
    getCategories(),
  ]);

  if (!product) {
    notFound();
  }

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
            Modifier le produit
          </h1>
          <p className="text-gray-500 mt-1">
            {product.translations?.fr?.name || product.slug}
          </p>
        </div>
      </div>

      <ProductForm product={product} categories={categories} isEditing />
    </div>
  );
}
