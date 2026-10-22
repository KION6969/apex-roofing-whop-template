/**
 * Whop runtime configuration.
 *
 * Every Whop identifier the site needs is resolved here, in this order:
 *
 *   1. A build-time environment variable (`.env`, or Whop app secrets).
 *   2. The value in `roofing.config.ts`.
 *
 * That means a template buyer can clone the repo, drop three plan IDs into
 * `.env`, and have a working checkout without touching a single component.
 *
 * Element code is served from Whop's CDN, so nothing here carries an API key.
 * API keys must never reach the browser.
 */

import { loadWhop, type WhopLoad } from '@whop/elements';
import { roofingConfig, type RoofingPlan } from '../roofing.config';

export type WhopEnvironment = 'production' | 'sandbox';

/**
 * Environment variable names, exported so the setup panel can tell the person
 * running the site exactly what to set.
 */
export const WHOP_ENV_KEYS = {
  accountId: 'VITE_WHOP_ACCOUNT_ID',
  environment: 'VITE_WHOP_ENVIRONMENT',
  inspectionPlanId: 'VITE_WHOP_PLAN_INSPECTION',
  depositPlanId: 'VITE_WHOP_PLAN_DEPOSIT',
  flatRatePlanId: 'VITE_WHOP_PLAN_FLAT_RATE',
  leadEndpoint: 'VITE_LEAD_ENDPOINT',
  invoiceEndpoint: 'VITE_INVOICE_ENDPOINT',
} as const;

const env = import.meta.env as Record<string, string | undefined>;

function readEnv(key: string, fallback: string): string {
  const raw = env[key];
  return typeof raw === 'string' && raw.trim() ? raw.trim() : fallback;
}

function readEnvironment(): WhopEnvironment {
  const raw = readEnv(WHOP_ENV_KEYS.environment, roofingConfig.whop.environment);
  return raw.toLowerCase() === 'sandbox' ? 'sandbox' : 'production';
}

export const whopRuntime = {
  /** `biz_...` — scopes custom pixel events to your business. */
  accountId: readEnv(WHOP_ENV_KEYS.accountId, roofingConfig.whop.accountId),

  /** Where Elements sends card data. Sandbox only supports card payments. */
  environment: readEnvironment(),

  planIds: {
    inspection: readEnv(WHOP_ENV_KEYS.inspectionPlanId, roofingConfig.whop.inspectionPlanId),
    deposit: readEnv(WHOP_ENV_KEYS.depositPlanId, roofingConfig.whop.depositPlanId),
    service: readEnv(WHOP_ENV_KEYS.flatRatePlanId, roofingConfig.whop.flatRatePlanId),
  } as Record<RoofingPlan['type'], string>,

  /** Optional same-origin endpoint that also records the lead server-side. */
  leadEndpoint: readEnv(WHOP_ENV_KEYS.leadEndpoint, ''),

  /** Optional same-origin endpoint that creates the invoice through the Whop API. */
  invoiceEndpoint: readEnv(WHOP_ENV_KEYS.invoiceEndpoint, ''),

  invoiceDashboardUrl: roofingConfig.whop.invoiceDashboardUrl,
} as const;

const PLAN_ID_PATTERN = /^plan_[A-Za-z0-9]{6,}$/;
const PLACEHOLDER_PATTERN = /replace|placeholder|example|your_?plan|_demo$/i;

/**
 * True when the value looks like a real Whop plan ID rather than the
 * `plan_REPLACE_...` placeholder that ships with the template.
 */
export function isRealPlanId(planId: string | undefined): planId is string {
  return Boolean(planId && PLAN_ID_PATTERN.test(planId) && !PLACEHOLDER_PATTERN.test(planId));
}

/**
 * The plan ID Elements should mount. Environment variables win, so the same
 * build can point at sandbox plans without editing the config file.
 */
export function resolvePlanId(plan: RoofingPlan): string {
  const fromEnv = whopRuntime.planIds[plan.type];
  if (isRealPlanId(fromEnv)) return fromEnv;
  if (isRealPlanId(plan.whopPlanId)) return plan.whopPlanId;
  return fromEnv || plan.whopPlanId;
}

/** True when this plan can actually open a Whop checkout. */
export function isPlanConfigured(plan: RoofingPlan): boolean {
  return isRealPlanId(resolvePlanId(plan));
}

/** The env var that supplies a given plan's ID, for the setup panel. */
export function envKeyForPlan(plan: RoofingPlan): string {
  switch (plan.type) {
    case 'inspection':
      return WHOP_ENV_KEYS.inspectionPlanId;
    case 'deposit':
      return WHOP_ENV_KEYS.depositPlanId;
    default:
      return WHOP_ENV_KEYS.flatRatePlanId;
  }
}

/** True when the account ID looks real (used for `whop.setScope`). */
export function isRealAccountId(accountId: string): boolean {
  return /^biz_[A-Za-z0-9]{6,}$/.test(accountId) && !PLACEHOLDER_PATTERN.test(accountId);
}

let elementsLoad: WhopLoad | null = null;

/**
 * One shared Elements loader for the whole app. `loadWhop()` already dedupes
 * the script tag, but memoising keeps React re-renders from re-creating the
 * loader promise on every render.
 */
export function getWhopElements(): WhopLoad {
  if (!elementsLoad) elementsLoad = loadWhop();
  return elementsLoad;
}

/** Human-readable environment label for badges. */
export function environmentLabel(): string {
  return whopRuntime.environment === 'sandbox' ? 'Whop Sandbox' : 'Whop Live';
}
