# Lucian Connection

French/English click-and-collect storefront and staff administration app, built with Next.js App Router, React, TypeScript, Tailwind CSS, next-intl, Supabase (Auth/Postgres/Storage), Stripe, and Zustand.

## Local setup

Use Node.js 22 (the CI version) and npm with the committed `package-lock.json`.

```bash
npm ci
npm run dev
```

Create `.env.local` from `.env.example` and supply values for the services you need. Do not overwrite an existing environment file.

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`: public Supabase configuration. Without valid configuration, public preview pages can render, but authenticated and database-backed flows require a configured project.
- `SUPABASE_SERVICE_ROLE_KEY`: server-only privileged Supabase access.
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and `NEXT_PUBLIC_SITE_URL`: payments and return URLs. See [Stripe webhook setup](docs/stripe-webhook.md) for the full checkout/refund event list and local Stripe CLI instructions.
- `CRON_SECRET`: authorization for scheduled reconciliation requests.
- `NEXT_PUBLIC_HCAPTCHA_SITE_KEY`: authentication CAPTCHA; configure its matching secret in Supabase.
- Optional analytics and legal/mediator configuration are listed in `.env.example`.
- `DATABASE_URL` (or `DIRECT_URL`, preferred by migration/backup scripts): direct PostgreSQL tooling access, separate from the application's Supabase HTTP access.

Open <http://localhost:3000>. `/` uses next-intl locale detection (locale cookie, browser language, then French fallback) to reach `/fr` or `/en`. Storefront routes live under `src/app/[locale]`; staff routes use `/admin`, with role-based access. Checkout uses server-side pricing, pickup slots, and Stripe. The legacy `/api/orders` endpoint remains an HTTP **410 Gone** compatibility endpoint; clients should use the payment checkout flow.

## Checks and CI

The root layout intentionally calls server-side `getLocale()` so the initial SSR document has the correct `<html lang>`. This request-dependent locale lookup accepts dynamic rendering rather than fully static locale pages. `DocumentLanguage` in the validated locale layout keeps the attribute synchronized during client-side language switching, when the root layout is preserved.

| Command | Purpose |
| --- | --- |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript without emitting files |
| `npm test` | Vitest unit, route, and component tests |
| `npm run test:watch` | Watch mode |
| `npm run test:coverage` | V8 coverage reports |
| `npm run secret:scan` | Repository secret-pattern scan |
| `npm run check` | Lint, typecheck, tests, then secret scan |
| `npm run build` | Production build |
| `npm run build:e2e` | Production build with explicit isolated E2E environment overrides |
| `npm run test:e2e` | Fresh isolated build, then Playwright Chromium browser tests |
| `npm start` | Serve an existing production build |

Tests live in `tests/`; Vitest excludes `tests/e2e/**`. Root redirect unit tests cover the page fallback for both locales and verify that locale detection remains enabled in the routing configuration. Automated tests use mocks for external services; a passing suite does not validate a live database, payment integration, or migration replay.

With Playwright Chromium installed (`npx playwright install chromium`), run `npm run test:e2e` locally. It always runs `build:e2e` first: `scripts/build_e2e.mjs` spawns Next with explicit empty service/analytics keys and the loopback site URL, overriding inherited values and `.env.local` even for build-time-inlined `NEXT_PUBLIC_*` values. Playwright starts this build on `127.0.0.1:3100` with the same overrides and refuses to reuse an existing server. Keep the override keys aligned in the build script, Playwright config, and CI workflow. This replaces the local `.next` build; use `npm run build` again for a normally configured production build.

The GitHub Actions workflow at `.github/workflows/quality.yml` runs on pushes and pull requests: Node 22, `npm ci`, `npm run check`, installs Chromium with system dependencies, then runs `npm run test:e2e` (one isolated build followed by browser tests). Browser coverage includes localized storefronts, document language changes through the LanguageSwitcher without reload, locale negotiation, and public admin routing. It does not provision a database or apply migrations.

## Database status and migration caution

**The current database baseline is not reproducible from this repository alone.** Files in `supabase/migrations/` are incremental changes to an existing schema: the first migration already assumes `public.orders` and `public.profiles` exist. A clean-database replay is not an established setup path. Obtain and verify the matching baseline and applied migration history before attempting a rebuild or upgrade.

Direct database verification currently has a reported **TLS/certificate connection blocker**. Its resolution and a successful baseline replay are still unverified; application checks are not evidence that this blocker is fixed. Verify the connection's certificate trust and TLS configuration before relying on direct database tooling.

`scripts/apply_migration.js` reads `.env.local`, prefers `DIRECT_URL` over `DATABASE_URL`, and executes the supplied SQL file directly. It has no migration-history tracking or automatic transaction wrapper, and currently sets `rejectUnauthorized: false`; that is not a verified TLS fix. Do not blindly replay the directory or treat this script as a fresh-project bootstrap. Review each migration's prerequisites, transaction requirements, data effects, and existing application state first.

Backup commands require PostgreSQL's `pg_dump`:

- `npm run db:backup` targets the connection in **`.env.prod`** by default.
- `npm run db:backup:local` targets `.env.local` (the filename does not guarantee a local database).
- Both prefer `DIRECT_URL`, write custom-format dumps to `backups/`, and export only the `public` schema without ownership/privileges. They are not full Supabase backups of Auth, Storage objects, and project configuration.

Confirm the target and a tested recovery path before any database change. Ad hoc `scripts/db_*.js` utilities are maintenance tools, not routine installation steps.
