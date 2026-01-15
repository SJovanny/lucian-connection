import { getTranslations, setRequestLocale } from "next-intl/server";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroBanner } from "@/components/home/HeroBanner";
import { CategoryNav } from "@/components/home/CategoryNav";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { CartDrawer } from "@/components/cart/CartDrawer";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <CartDrawer />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <HeroBanner />
          <CategoryNav />
          <FeaturedProducts />
        </div>
      </main>
      <Footer />
    </div>
  );
}
