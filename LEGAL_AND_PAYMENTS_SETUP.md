# Legal and Payment Setup

## Before launch

1. Apply the migrations in `supabase/migrations/` to the production Supabase project.
2. Set the following server environment variables:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `NEXT_PUBLIC_SITE_URL`
   - `NEXT_PUBLIC_GA_MEASUREMENT_ID` only when Google Analytics is ready.
3. Create a Stripe webhook for `/api/payments/webhook` and subscribe to:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `checkout.session.async_payment_failed`
4. Complete the OVH hosting and domain details in `/fr/legal-notice` and `/en/legal-notice`.
5. Confirm the appointed consumer mediator and add its details to the terms.
6. Confirm that product prices include the applicable VAT and that the checkout displays the correct tax treatment.

## Local Stripe testing

With the Stripe CLI installed, forward test events to the local application:

```text
stripe listen --forward-to http://localhost:3000/api/payments/webhook
```

Use the signing secret printed by the CLI as `STRIPE_WEBHOOK_SECRET`.

## Consent behavior

Necessary authentication and cart storage work without a consent prompt. Google Analytics is
loaded only after the user explicitly accepts analytics. The footer link opens the preferences
panel again so the choice can be changed later.

The Analytics measurement ID is intentionally absent from `.env.local` until the service is
ready. Do not add analytics scripts directly to a page or layout outside the consent component.
