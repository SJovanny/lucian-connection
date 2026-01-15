import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const locales = ['fr', 'en'] as const;
export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale: 'fr',
  localePrefix: 'always',
  localeDetection: true,
});

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
