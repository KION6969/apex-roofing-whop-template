# Apex Shield Roofing — Whop Websites template

A production-shaped, config-driven roofing business site that takes payments with
**Whop Elements**, records leads as **Whop pixel events**, and bills the final
balance through **Whop invoices**. Built with Vite + React 19 + TypeScript +
Tailwind v4.

The whole business is described in one file (`src/roofing.config.ts`); no component
knows the company name, the services, or the prices.

---

## Quick start

```bash
npm install
cp .env.example .env     # add your three plan IDs
npm run dev
```

Without plan IDs the checkout deliberately refuses to render a fake form and
shows a setup panel listing exactly which variables are missing. That is the only
intentionally disabled state.

```bash
npm run typecheck
npm run build
npm run preview
```

---

## Configuration

Everything below is optional at the type level and read from `.env` (or the
config file as a fallback). `VITE_*` values are public identifiers — never put an
API key in one.

| Variable | Purpose |
| --- | --- |
| `VITE_WHOP_ACCOUNT_ID` | `biz_…` business ID, used for the pixel scope and API calls |
| `VITE_WHOP_ENVIRONMENT` | `production` (default) or `sandbox` |
| `VITE_WHOP_PLAN_INSPECTION` | `plan_…` for the inspection fee |
| `VITE_WHOP_PLAN_DEPOSIT` | `plan_…` for the project deposit |
| `VITE_WHOP_PLAN_FLAT_RATE` | `plan_…` for the flat-rate service |
| `VITE_LEAD_ENDPOINT` | Optional same-origin route that also records the lead server-side |
| `VITE_INVOICE_ENDPOINT` | Optional same-origin route that creates the final invoice |

`src/roofing.config.ts` also holds:

* company details (name, phone, licence, address, review stats)
* the three plans (`type: 'inspection' | 'deposit' | 'service'`), their prices,
  feature lists and deposit terms
* the services grid, reviews, certifications, financing copy and service area

### Swapping the business (template reuse)

1. Edit `company`, `services`, `plans`, `reviews` and `serviceArea` in
   `src/roofing.config.ts`.
2. Change the three plan IDs in `.env`.
3. Replace the logo mark in `index.html` and the hero image URLs in the config.

No component or layout file needs to change. Every number used in copy (deposit
amount, typical final invoice, plan prices) is read from the config, not typed
into JSX.

---

## How each Whop feature is wired

### 1. Checkout — Whop Elements (`@whop/elements-react` v1.9)

`src/components/WhopCheckoutModal.tsx` mounts Whop's hosted checkout:

```tsx
<WhopElements elements={getWhopElements()} environment={whopRuntime.environment}>
  <Checkout plan={planId} metadata={…} returnUrl={…} onComplete={handleComplete}>
    <CheckoutElement />
  </Checkout>
</WhopElements>
```

* The element mints its own checkout session, so **no API key and no server** are
  involved — the browser never asserts an amount.
* The composed checkout surface renders Whop's **Payment Element** (cards,
  Apple Pay / Google Pay, Klarna and other enabled methods) together with the
  mandatory **BrandingElement** merchant-of-record notice. Whop's contract
  requires that notice for any payment surface, and the Checkout element owns it
  internally; mounting `Payments` + `PaymentElement` + `BrandingElement`
  separately is only necessary when you confirm the token from your own server.
* `onComplete` fires with `{ result: 'payment', paymentId, sessionId }`; the site
  fires `checkout_completed` and shows a receipt.
* Off-site steps (3DS, financing) return to the current page with
  `?status=…&payment=…`; `App.tsx` reads and then strips those parameters.
* There is **no card input anywhere in this repository** — the old simulated
  fields were removed. Card data only ever lives inside Whop's iframe.

Sandbox: set `VITE_WHOP_ENVIRONMENT=sandbox` and use
`4242 4242 4242 4242`, any future expiry, any CVC. Sandbox supports cards only.

### 2. Pixel events — `whop.track`

`src/lib/whop-tracking.ts` wraps `window.whop.track` and retries until the real
pixel is present. Five custom events fire:

| Event | Where |
| --- | --- |
| `service_viewed` | opening any service card |
| `deposit_started` | opening any checkout |
| `estimate_requested` | estimate form submit |
| `checkout_completed` | `Checkout.onComplete` (not `purchase` — Whop already records its own sales) |
| `invoice_requested` | generating the final balance invoice |

Plus the standard **`lead`** event on the estimate form, and
`whop.setScope(biz_…)` once the pixel is live so events land on the right business.

Verify them in **Whop Dashboard → Events**, in the floating *Whop Pixel* inspector
on the page (each row shows `delivered` / `queued`), or via
`window.__whopPixelEvents` in the console.

### 3. Estimates → Whop leads

`src/lib/whop-leads.ts` always fires the standard `lead` pixel event with a stable
`event_id`, buyer identity, service, ZIP and insurance flag. That is the path
Whop documents for recording a lead from a site it hosts.

Set `VITE_LEAD_ENDPOINT` to also POST the same lead to your own route, which can
call the Whop Events API (`POST /api/v1/events`) with a server-held `event:create`
key. A reference implementation is in `examples/lead-endpoint.ts`. The browser
never sees a key.

### 4. Final balance invoice

`src/lib/whop-invoices.ts` builds the itemized statement (materials, labour,
disposal, deposit credit) from config values.

* Whop's public API does not expose invoice creation, so the default path is a
  **draft + deep link** to the Whop dashboard, where the contractor sends the
  invoice and the homeowner pays by card or installments.
* Setting `VITE_INVOICE_ENDPOINT` switches to a real API call through your own
  route; `examples/invoice-endpoint.ts` shows the shape.
* The flow never fakes a `paid` status.

### 5. Pricing model

Three plans cover the assignment's pricing requirements:

* **Inspection fee** — $149, 100% credited toward later work
* **Deposit plan** — $500 now, remaining balance invoiced at completion
* **Flat-rate service** — $799 tune-up, one fixed price

---

## Deploying to Whop Websites

The build is a static Vite app, which is what Whop serves. The supported path is
the Whop CLI:

```bash
npm i -g whop          # or: npx whop
whop                   # sign in, pick the business
whop apps init --app_type website --name "Apex Shield Roofing" --domain apex-shield
```

Then either copy this project into the scaffold, or add the plugin to this repo:

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { whop } from '@whop/cli/vite';

export default defineConfig({
  plugins: [tailwindcss(), react(), whop()],
});
```

Commit `.env.production` with the three plan IDs, then:

```bash
whop apps deploy          # builds, uploads, promotes
whop apps logs app_xxx --level error
```

The site comes up on `https://<domain>.whop.site` (or your own domain). Whop
injects the pixel automatically, so `whop.track` switches from the local shim to
the real pixel with no code change.

> Note on the URL: Whop Websites are served from `*.whop.site`; `whop.app` hosts
> Whop apps. If the submission requires `*.whop.app` specifically, deploy with
> `--app_type b2c_app` and mount the same React tree as the app surface.

---

## Project structure

```
src/
  roofing.config.ts          all business content and plan definitions
  lib/
    whop-runtime.ts          env/config resolution, plan ID validation, loader
    whop-tracking.ts         pixel wrapper + the five custom events
    whop-leads.ts            lead payload + optional server forward
    whop-invoices.ts         final balance statement + optional endpoint
  components/
    WhopCheckoutModal.tsx    Whop Checkout element + setup panel
    EstimateForm.tsx         lead form + receipt
    WhopInvoicesFlowDemo.tsx final balance statement
    LivePixelDebugger.tsx    on-page event inspector
    …
examples/
  lead-endpoint.ts           server route that forwards a lead to Whop
  invoice-endpoint.ts        server route that creates an invoice
```

## Responsiveness

Layouts collapse to one column below 1024px, two-column form rows become one
column below 640px, and the checkout modal switches to a full-height scroll
sheet on phones. Verified at 390×844 and desktop widths with no horizontal
overflow.
