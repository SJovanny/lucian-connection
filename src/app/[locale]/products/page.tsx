import { getTranslations, setRequestLocale } from "next-intl/server";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { ProductsContent } from "./ProductsContent";
import { getProducts, getCategories } from "@/lib/supabase/queries";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string; search?: string }>;
};

export default async function ProductsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { category, search } = await searchParams;
  const t = await getTranslations("products");

  // Récupérer les catégories et les produits
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts({ 
      categorySlug: category, 
      search: search 
    }),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <CartDrawer />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 font-display">
              {t("title")}
            </h1>
          </div>

          <ProductsContent 
            initialProducts={products}
            categories={categories}
            initialCategory={category || "all"}
            initialSearch={search || ""}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
