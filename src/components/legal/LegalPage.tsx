import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Link } from "@/i18n/routing";
import type { ReactNode } from "react";

type LegalPageProps = {
  title: string;
  children: ReactNode;
};

export function LegalPage({ title, children }: LegalPageProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1">
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8 flex flex-wrap gap-4 text-sm text-primary-700">
            <Link href="/terms" className="hover:underline">CGV</Link>
            <Link href="/privacy" className="hover:underline">Confidentialité</Link>
            <Link href="/cookies" className="hover:underline">Cookies</Link>
            <Link href="/legal-notice" className="hover:underline">Mentions légales</Link>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-10">
            <h1 className="mb-8 text-3xl font-bold text-gray-900 font-display">{title}</h1>
            <div className="space-y-8 text-gray-700 leading-7">{children}</div>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-xl font-semibold text-gray-900">{title}</h2>
      {children}
    </section>
  );
}
