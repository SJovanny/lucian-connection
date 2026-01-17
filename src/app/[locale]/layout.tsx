import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing, Locale } from "@/i18n/routing";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;

  const titles: Record<Locale, string> = {
    fr: "Lucian Connection - Épicerie caribéenne en ligne",
    en: "Lucian Connection - Caribbean Grocery Online",
  };

  const descriptions: Record<Locale, string> = {
    fr: "Votre épicerie caribéenne en ligne. Produits frais de Sainte-Lucie livrés chez vous.",
    en: "Your Caribbean grocery store online. Fresh products from Saint Lucia delivered to you.",
  };

  return {
    title: titles[locale as Locale] || titles.fr,
    description: descriptions[locale as Locale] || descriptions.fr,
    alternates: {
      canonical: `/${locale}`,
      languages: {
        fr: "/fr",
        en: "/en",
      },
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
