import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lucian Connection - Épicerie caribéenne en ligne",
  description:
    "Votre épicerie caribéenne en ligne. Produits frais de Sainte-Lucie livrés chez vous.",
  keywords: ["épicerie", "caribéen", "sainte-lucie", "livraison", "produits frais"],
  icons: {
    icon: "/logo_lc.svg",
    apple: "/logo_lc.svg",
  },
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params?: Promise<{ locale?: string }>;
}>) {
  const resolvedParams = params ? await params : {};
  const locale = resolvedParams.locale || "fr";

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${inter.variable} ${poppins.variable} antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
