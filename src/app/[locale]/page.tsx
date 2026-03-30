import { getTranslations, setRequestLocale } from "next-intl/server";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroBanner } from "@/components/home/HeroBanner";
import { CategoryNav } from "@/components/home/CategoryNav";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { getProducts, getCategories } from "@/lib/supabase/queries";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  await getTranslations("home");

  // Récupérer les produits vedettes et les catégories
  const [featuredProducts, categories] = await Promise.all([
    getProducts({ featured: true, limit: 10 }),
    getCategories(),
  ]);

  // Si pas de produits vedettes, prendre les 10 premiers produits
  const productsToShow = featuredProducts.length > 0
    ? featuredProducts
    : await getProducts({ limit: 10 });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <CartDrawer />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <HeroBanner />
          <CategoryNav categories={categories} />
          <FeaturedProducts products={productsToShow} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
