# Stripe Webhook Setup

The refund state shown by the application comes from Stripe. Configure a webhook endpoint at:

```text
https://your-domain.example/api/payments/webhook
```

Enable these events:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.expired`
- `checkout.session.async_payment_failed`
- `refund.created`
- `refund.updated`
- `refund.failed`

Copy the signing secret of this endpoint to `STRIPE_WEBHOOK_SECRET` in the deployment environment. Use a separate endpoint and secret for Stripe test mode and live mode.

For local testing, run:

```bash
stripe listen --forward-to localhost:3000/api/payments/webhook
```

Use the `whsec_...` value printed by Stripe CLI as the local `STRIPE_WEBHOOK_SECRET`.

The scheduled cleanup endpoint also resynchronizes pending refunds and confirmed refunds created in the last 31 days. Set `CRON_SECRET` in the deployment environment so the scheduled request is authorized.
