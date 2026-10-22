# Submission pack

Everything in this file maps the assignment's checklist to something you can open,
click, or read. Items that require your Whop account are marked **owner action**.

---

## 1. Status at a glance

| Requirement | State | Evidence |
| --- | --- | --- |
| Built on Whop Websites | Code ready, **not deployed** (needs your CLI login) | Deploy section below |
| Live at a `whop.app` URL | **Owner action** | `whop apps deploy` |
| Whop Payments only, no Stripe/PayPal/custom card form | Done | No card `<input>` exists; see §4 |
| Sandbox checkout completes with Payment Elements + BrandingElement | Wired, **needs real plan ID** | `WhopCheckoutModal.tsx` |
| Estimate form creates a Lead via Whop | Done (pixel `lead` event) + optional API route | `whop-leads.ts`, `examples/lead-endpoint.ts` |
| ≥3 custom `whop.track` events, verifiable | 5 custom + standard `lead` | `whop-tracking.ts`, Dashboard → Events |
| Inspection fee, deposit plan, flat-rate plan | Done: $149 / $500 / $799 | `roofing.config.ts` |
| Template-reusable, no structural changes | Done: one config file + 3 env vars | `README.md` §"Swapping the business" |
| Responsive | Verified 390×844 and desktop, no overflow | `src/index.css` media queries |
| Source code | This repo / `apex-roofing-whop-template.zip` | — |
| 3–5 min recording | **Owner action** | Script in §6 |
| One-paragraph feature list | Ready to paste | §3 |

---

## 2. What changed in this pass

The previous draft looked finished but could not have passed:

* The checkout was **simulated** — fake card fields printed `4242 •••• 4242` and
  never contacted Whop. Removed. The modal now mounts the real `Checkout` +
  `CheckoutElement` from `@whop/elements-react`.
* The "Leads API" (`POST /api/v1/leads`) and "Invoices API"
  (`POST /api/v1/invoices`) **do not exist** in Whop's public API. Replaced with
  the documented paths: `whop.track('lead', …)` (plus an optional server route
  using `POST /api/v1/events`) and a draft-statement + dashboard flow.
* Pixel events went to a console shim and were never scoped to a business. Now
  `whop.setScope(biz_…)` runs as soon as the real pixel is available and the
  queue replays, with a per-event `delivered` / `queued` badge.
* Tailwind was installed but never imported, so every utility class in the JSX
  was dead CSS. `@import "tailwindcss";` added; the pixel inspector, toasts and
  modal layout now actually position themselves.
* Hardcoded `$500` / `$4,500` / "Apex" strings in copy now come from config.

Verified after the rewrite: `npm run typecheck` ✅, `npm run build` ✅ (1,984
modules), headless interaction test ✅ (checkout opens, setup panel, service
modal, lead receipt, invoice draft, 0 console errors), mobile emulation ✅
(no horizontal overflow, single-column grids), and a configured-plan test ✅
where Whop's CDN mounted the real checkout iframe and replied
`[CHECKOUT_UNAVAILABLE] Plan not found` for the dummy ID — proof the call is real.

---

## 3. One-paragraph feature list (paste into the submission)

> The site runs on Whop Websites as a Vite/React front end and uses Whop Elements
> for every money movement: the `Checkout` element (with `CheckoutElement`)
> mounts Whop's hosted payment surface — Payment Element methods including cards,
> Apple Pay, Google Pay and Klarna, together with the required BrandingElement
> merchant-of-record notice — and completes the payment in the browser with no
> API key on the page. Three products are sold: a $149 inspection fee, a $500
> project deposit, and a $799 flat-rate service. The estimate form records a lead
> by firing the standard `whop.track('lead')` event with a stable event ID, and
> can additionally forward the same payload to a server route that calls Whop's
> Events API with a server-held `event:create` key. Five custom pixel events
> (`service_viewed`, `deposit_started`, `estimate_requested`, `checkout_completed`,
> `invoice_requested`) fire at each funnel step and are inspectable in-page and
> in Dashboard → Events; `whop.setScope` binds them to the business. After the
> job, the app builds an itemized final-balance statement that credits the
> deposit and either creates the invoice through a configured endpoint or hands
> off to Whop's invoice dashboard. All copy, services, prices and plan IDs are
> configuration, so the same codebase rebrands without structural edits, and the
> layout is responsive from 390 px phones to desktop.

---

## 4. Requirement → evidence

**Whop Payments only.**
Search the repo for card inputs: there are none. `WhopCheckoutModal.tsx` renders
only `<CheckoutElement />`; every sensitive field lives in
`cdn.whop.com/elements/…` iframes. No Stripe/PayPal SDK in `package.json`.

**Payment Elements + BrandingElement.**
`Checkout` is Whop's composed payment surface: it mints the checkout session,
renders the Payment Element methods and owns the BrandingElement notice. Mounting
`Payments` + `PaymentElement` + `BrandingElement` as separate components is only
possible when a server confirms `createConfirmationToken()`, which static Whop
hosting cannot do — the `Checkout` element is the documented browser-complete
path. Show the notice in the recording by scrolling to the bottom of the mounted
checkout.

**Lead.**
`src/lib/whop-leads.ts` → `fireWhopPixel('lead', { event_id, customer_email, … })`.
The form receipt shows the lead ID, event ID, account, delivery state and the
exact JSON sent. `examples/lead-endpoint.ts` is the server-side alternative.

**≥3 custom events.**
`src/lib/whop-tracking.ts` defines five. Trigger them in this order for the video:
open a service card → open a checkout → submit the estimate form → complete the
test payment → generate the invoice.

**Three price points.**
`roofing.config.ts` → `plans[]`: `inspection` $149, `deposit` $500 with
`depositTerms.finalInvoiceEstimated`, `service` $799.

**Template reuse.**
Only `roofing.config.ts` and `.env` change; no component reads a price or company
name directly. `README.md` documents the swap in three steps.

**Responsive.**
Breakpoints at 1024 px and 640 px; modals become scroll sheets; grids collapse.

---

## 5. Deploy (owner action)

```bash
# 1. three plans in Whop Dashboard → Products
#    inspection $149 one-time
#    deposit    $500 one-time
#    service    $799 one-time

# 2. project env
cp .env.example .env.production
#    fill VITE_WHOP_ACCOUNT_ID + the three plan IDs

# 3. create the Whop app (once)
whop apps init --app_type website --name "Apex Shield Roofing" --domain apex-shield

# 4. add the Whop Vite plugin to vite.config.ts, then:
whop apps deploy
```

`whop.app` vs `whop.site`: Whop Websites are served from `*.whop.site`.
`whop.app` is the app host (`--app_type b2c_app`). If the grader insists on
`whop.app`, deploy the same React tree as a `b2c_app`; the Whop integration code
is identical.

After the first deploy, open the site, click a plan, and confirm the checkout
iframe renders. If Whop replies `Plan not found`, the plan ID belongs to a
different account or environment.

---

## 6. Recording script (3–5 minutes)

| Time | Action | What the viewer should see |
| --- | --- | --- |
| 0:00 | Land on the live URL | Hero, three plans, floating **Whop Pixel** pill |
| 0:20 | Scroll to Plans | $149 inspection, $500 deposit, $799 flat rate |
| 0:35 | Open a service card | Modal + `service_viewed` appears in the pixel pill |
| 0:50 | Click **Select & Pay** on the deposit | Whop checkout iframe mounts, order summary says $500 |
| 1:10 | Scroll inside the checkout to the bottom | Payment methods + **BrandingElement** notice |
| 1:25 | Enter `4242 4242 4242 4242`, any future date, any CVC | Test-mode card |
| 1:50 | Complete payment | Whop success face, then the site receipt + `checkout_completed` |
| 2:10 | Open the final-balance invoice | Itemized statement, deposit credited, $4,500 due |
| 2:25 | Click **Generate $4,500 invoice** | Invoice number/status + `invoice_requested`; open Whop dashboard |
| 2:50 | Create/send the invoice in Whop Dashboard → Invoices | Real invoice for the balance |
| 3:20 | Back on the site, submit the estimate form | "Lead recorded", lead ID, event ID, `lead` + `estimate_requested` |
| 3:50 | Open **Whop Pixel** tray | 6 events, each `delivered` |
| 4:10 | Switch to Dashboard → Events | Same events on Whop's side |
| 4:35 | Resize to phone width | Single-column layout, no horizontal scroll |

Before recording: set `VITE_WHOP_ENVIRONMENT=sandbox` if you want card-only test
payments, or leave it on production with your own card and refund it. Sandbox
test cards: `4242 4242 4242 4242` (success), `4000 0000 0000 0002` (decline),
`4000 0000 0000 0341` (setup succeeds, charge fails), `5385 3083 6013 5181`
(3-D Secure, code `Checkout1!`).

---

## 7. Honest limitations

1. **Deployment** needs your Whop login and a claimed domain; the repo cannot
   create an app on your account.
2. **Checkout completion** needs three real `plan_` IDs. The dummy-ID test proves
   the element reaches Whop and gets `Plan not found`; swap in real IDs and the
   same path pays.
3. **Whop has no public invoice-creation endpoint.** The default flow builds the
   statement and deep-links to the dashboard, which is exactly what the recording
   shows. `examples/invoice-endpoint.ts` is ready if your account exposes one.
4. **Pixel delivery** shows `queued` on `localhost` by design (no pixel exists
   there). On `*.whop.site` Whop injects it and the same events show `delivered`.
