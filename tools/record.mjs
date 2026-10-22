#!/usr/bin/env node
/**
 * Screen recorder for the demo walkthrough.
 *
 * Drives a real Edge window with Playwright, captures the tab through the Chrome
 * DevTools screencast (so what you see is the actual site, not a mockup), burns
 * captions into the page, and encodes the frames to MP4 with ffmpeg.
 *
 * Usage:
 *   node tools/record.mjs --url=http://localhost:5199 --out=recording/walkthrough.mp4
 *   node tools/record.mjs --payment=manual --headed     # you type the test card
 *   node tools/record.mjs --scenario=tour --payment=skip --out=recording/tour.mp4
 *
 * Flags:
 *   --url=<url>          site to record (default http://localhost:5199/)
 *   --out=<file.mp4>     output path (default recording/walkthrough.mp4)
 *   --scenario=full|tour full = every section + checkout (default), tour = no payment
 *   --payment=auto|manual|skip
 *                        auto   = try to fill 4242 test card in Whop's iframe
 *                        manual = pause and let a human type it (use --headed)
 *                        skip   = do not attempt payment
 *   --headed             show the browser window (required for --payment=manual)
 *   --keep-frames        keep the extracted JPEGs next to the output
 */

import { chromium } from 'playwright-core';
import ffmpegPath from 'ffmpeg-static';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const argv = Object.fromEntries(
  process.argv.slice(2).map(arg => {
    const [key, ...rest] = arg.replace(/^--/, '').split('=');
    return [key, rest.length ? rest.join('=') : 'true'];
  }),
);

const URL = argv.url || 'http://localhost:5199/';
const OUT = path.resolve(argv.out || 'recording/walkthrough.mp4');
const SCENARIO = argv.scenario === 'tour' ? 'tour' : 'full';
const PAYMENT = ['auto', 'manual', 'skip'].includes(argv.payment) ? argv.payment : 'auto';
const HEADED = argv.headed === 'true';
const KEEP = argv['keep-frames'] === 'true';

const WIDTH = 1440;
const HEIGHT = 900;

const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'whop-rec-'));
const framesDir = path.join(workDir, 'frames');
fs.mkdirSync(framesDir, { recursive: true });

const log = (...args) => console.log('[record]', ...args);

/* -------------------------------------------------------------------------- */
/* Capture                                                                     */
/* -------------------------------------------------------------------------- */

const frames = [];

function startScreencast(cdp) {
  cdp.on('Page.screencastFrame', async ({ data, sessionId, metadata }) => {
    const index = frames.length;
    const file = path.join(framesDir, `f${String(index).padStart(5, '0')}.jpg`);
    try {
      fs.writeFileSync(file, Buffer.from(data, 'base64'));
      frames.push({ file, t: metadata.timestamp });
    } catch (error) {
      log('frame write failed', error.message);
    }
    cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {});
  });

  return cdp.send('Page.startScreencast', {
    format: 'jpeg',
    quality: 82,
    maxWidth: WIDTH,
    maxHeight: HEIGHT,
    everyNthFrame: 1,
  });
}

/* -------------------------------------------------------------------------- */
/* Page helpers                                                                */
/* -------------------------------------------------------------------------- */

const beat = ms => new Promise(resolve => setTimeout(resolve, ms));

async function caption(page, title, subtitle = '') {
  await page.evaluate(
    ({ title, subtitle }) => {
      let el = document.getElementById('__rec_caption');
      if (!el) {
        el = document.createElement('div');
        el.id = '__rec_caption';
        el.style.cssText = [
          'position:fixed',
          'left:50%',
          'bottom:26px',
          'transform:translateX(-50%)',
          'z-index:2147483647',
          'max-width:min(920px, 88vw)',
          'background:rgba(2,6,23,0.94)',
          'border:1px solid rgba(245,158,11,0.55)',
          'border-radius:16px',
          'padding:14px 24px',
          'color:#ffffff',
          'font-family:"Plus Jakarta Sans",system-ui,sans-serif',
          'text-align:center',
          'box-shadow:0 20px 50px rgba(0,0,0,0.7)',
          'backdrop-filter:blur(10px)',
          'pointer-events:none',
          'transition:opacity 0.18s ease',
        ].join(';');
        document.body.appendChild(el);
      }
      el.innerHTML =
        `<div style="font-weight:800;font-size:17px;line-height:1.35">${title}</div>` +
        (subtitle
          ? `<div style="font-size:13px;color:#cbd5e1;margin-top:5px;line-height:1.45">${subtitle}</div>`
          : '');
      el.style.opacity = '1';
    },
    { title, subtitle },
  );
}

async function clearCaption(page) {
  await page.evaluate(() => {
    const el = document.getElementById('__rec_caption');
    if (el) el.remove();
  });
}

async function scrollToSelector(page, selector, offset = 90, duration = 900) {
  const target = await page.evaluate(
    ({ selector, offset }) => {
      const el = document.querySelector(selector);
      if (!el) return null;
      return Math.max(0, el.getBoundingClientRect().top + window.scrollY - offset);
    },
    { selector, offset },
  );

  if (target === null) {
    log('scroll target missing:', selector);
    return false;
  }

  await page.evaluate(
    async ({ target, duration }) => {
      const start = window.scrollY;
      const t0 = performance.now();
      const ease = t => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

      await new Promise(resolve => {
        const step = now => {
          const p = Math.min(1, (now - t0) / duration);
          window.scrollTo(0, start + (target - start) * ease(p));
          if (p < 1) requestAnimationFrame(step);
          else resolve();
        };
        requestAnimationFrame(step);
      });
    },
    { target, duration },
  );

  return true;
}

async function scrollBy(page, delta, duration = 900) {
  await page.evaluate(
    async ({ delta, duration }) => {
      const start = window.scrollY;
      const t0 = performance.now();
      const ease = t => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

      await new Promise(resolve => {
        const step = now => {
          const p = Math.min(1, (now - t0) / duration);
          window.scrollTo(0, start + delta * ease(p));
          if (p < 1) requestAnimationFrame(step);
          else resolve();
        };
        requestAnimationFrame(step);
      });
    },
    { delta, duration },
  );
}

async function clickText(page, text, selector = 'button') {
  const locator = page.locator(selector, { hasText: text }).first();
  if ((await locator.count()) === 0) {
    log('click target missing:', text);
    return false;
  }
  await locator.click({ timeout: 5000 }).catch(error => log('click failed:', text, error.message));
  return true;
}

/* -------------------------------------------------------------------------- */
/* Checkout                                                                    */
/* -------------------------------------------------------------------------- */

async function fillFirst(frame, selectors, value) {
  for (const selector of selectors) {
    const locator = frame.locator(selector).first();
    try {
      if ((await locator.count()) === 0) continue;
      if (!(await locator.isVisible().catch(() => false))) continue;
      await locator.fill(value, { timeout: 2000 });
      return selector;
    } catch {
      /* try the next selector */
    }
  }
  return null;
}

async function attemptCardEntry(page) {
  const frames = page.frames().filter(frame => frame.url().includes('whop.com'));
  log(`checkout frames: ${frames.length}`);

  for (const frame of frames) {
    try {
      const number = await fillFirst(frame, [
        'input[autocomplete="cc-number"]',
        'input[name*="card" i]',
        'input[placeholder*="card number" i]',
        'input[inputmode="numeric"]',
      ], '4242424242424242');
      if (!number) continue;

      log('card number filled via', number);
      await fillFirst(frame, [
        'input[autocomplete="cc-exp"]',
        'input[name*="exp" i]',
        'input[placeholder*="MM" i]',
      ], '12/34');

      await fillFirst(frame, [
        'input[autocomplete="cc-csc"]',
        'input[name*="cvc" i]',
        'input[name*="cvv" i]',
        'input[placeholder*="CVC" i]',
        'input[placeholder*="CVV" i]',
      ], '123');

      await fillFirst(frame, ['input[autocomplete="postal-code"]', 'input[name*="zip" i]'], '75201');

      await beat(400);

      for (const selector of [
        'button:has-text("Pay")',
        'button:has-text("Complete")',
        'button:has-text("Subscribe")',
        'button:has-text("Confirm")',
        'button[type="submit"]',
      ]) {
        const button = frame.locator(selector).first();
        if ((await button.count()) > 0 && (await button.isVisible().catch(() => false))) {
          log('submitting with', selector);
          await button.click({ timeout: 5000 }).catch(() => {});
          return true;
        }
      }
    } catch (error) {
      log('frame attempt failed', error.message);
    }
  }

  return false;
}

async function runCheckout(page, planLabel) {
  const opened = await page
    .locator('.plan-card', { hasText: planLabel })
    .locator('button', { hasText: 'Select & Pay' })
    .first()
    .click({ timeout: 8000 })
    .then(() => true)
    .catch(error => {
      log('could not open checkout:', error.message);
      return false;
    });

  if (!opened) return false;

  await beat(1200);

  const configured = await page.locator('.whop-config-panel').count() === 0;
  if (!configured) {
    await caption(page, 'Checkout is config-ready', 'Add plan IDs to .env.local to mount Whop’s payment element');
    await beat(5000);
    await page.locator('.checkout-modal-card .modal-close-btn').click().catch(() => {});
    return false;
  }

  // Wait for Whop's iframe to render its payment surface.
  await page.waitForSelector('.whop-checkout-shell iframe', { timeout: 20000 }).catch(() => {});
  await beat(2500);

  if (PAYMENT === 'skip') {
    await caption(page, 'Whop Checkout element', 'Payment surface is hosted by Whop — the site holds no card fields');
    await beat(6000);
    await page.locator('.checkout-modal-card .modal-close-btn').click().catch(() => {});
    return false;
  }

  if (PAYMENT === 'manual') {
    await caption(page, 'Type the test card in the Whop iframe', '4242 4242 4242 4242 · any future expiry · any CVC');
    log('waiting up to 5 minutes for manual payment…');
  } else {
    await caption(page, 'Completing a sandbox payment', 'Whop Elements · test card 4242 4242 4242 4242');
    const filled = await attemptCardEntry(page);
    if (!filled) {
      await caption(page, 'Card entry needs a human', 'Re-run with --payment=manual --headed and type 4242…');
      log('automatic card entry failed; close the modal manually or re-run with --payment=manual');
    }
  }

  // Success unmounts the modal (App closes it and shows a toast).
  const paid = await page
    .waitForFunction(() => !document.querySelector('.checkout-modal-card'), { timeout: 300000 })
    .then(() => true)
    .catch(() => false);

  if (paid) {
    await caption(page, 'Payment confirmed by Whop', 'checkout_completed event fired · receipt shown');
    await beat(7000);
  } else {
    log('checkout did not complete');
    await page.locator('.checkout-modal-card .modal-close-btn').click().catch(() => {});
  }

  return paid;
}

/* -------------------------------------------------------------------------- */
/* Scenarios                                                                   */
/* -------------------------------------------------------------------------- */

async function tourScenario(page) {
  await caption(page, 'Apex Shield Roofing & Exteriors', 'Whop Websites template · Vite + React');
  await beat(6000);

  await scrollBy(page, 220, 900);
  await beat(3500);

  await scrollToSelector(page, '#plans');
  await caption(page, 'Three Whop products', '$149 inspection fee · $500 project deposit · $799 flat rate');
  await beat(9000);

  await scrollToSelector(page, '#services');
  await beat(2500);

  const card = page.locator('.service-card').first();
  if (await card.count()) {
    await caption(page, 'Service detail', "whop.track('service_viewed')");
    await card.click({ timeout: 5000 }).catch(() => {});
    await beat(7000);
    await page.locator('.modal-dialog .close-btn').click().catch(() => {});
    await beat(1200);
  }

  await scrollToSelector(page, '#estimate');
  await caption(page, 'Estimate form → Whop lead', "whop.track('lead') with a stable event ID");
  await beat(5000);

  const toggle = page.locator('.pixel-debugger-toggle');
  if (await toggle.count()) {
    await toggle.click().catch(() => {});
    await caption(page, 'Every event is inspectable', 'delivered / queued state per whop.track call');
    await beat(8000);
  }
}

async function fullScenario(page) {
  await caption(page, 'Apex Shield Roofing & Exteriors', 'Whop Websites template · React + Whop Elements');
  await beat(8000);

  await scrollBy(page, 200, 1000);
  await beat(4000);

  await scrollToSelector(page, '#services');
  await caption(page, 'Six services, all tracked', "Opening a card fires whop.track('service_viewed')");
  await beat(8000);

  for (const index of [0, 3]) {
    const card = page.locator('.service-card').nth(index);
    if ((await card.count()) === 0) continue;
    await card.click({ timeout: 5000 }).catch(() => {});
    await beat(8000);
    await page.locator('.modal-dialog .close-btn').click().catch(() => {});
    await beat(1200);
  }

  await scrollToSelector(page, '#plans');
  await caption(page, 'Three Whop products', '$149 inspection fee · $500 project deposit · $799 flat rate');
  await beat(11000);

  await scrollBy(page, 260, 900);
  await beat(4500);

  const paid = await runCheckout(page, 'Project deposit');

  if (paid) {
    await scrollToSelector(page, '#plans');
    const invoiceButton = page.locator('button', { hasText: 'Open final balance invoice' }).first();
    if (await invoiceButton.count()) {
      await invoiceButton.click({ timeout: 5000 }).catch(() => {});
      await caption(page, 'Final balance invoice', 'Deposit credited · remaining balance due');
      await beat(10000);

      const generate = page.locator('button', { hasText: 'Generate $' }).first();
      if (await generate.count()) {
        await generate.click({ timeout: 5000 }).catch(() => {});
        await caption(page, 'Invoice drafted', "whop.track('invoice_requested') · hand-off to Whop");
        await beat(12000);
      }

      await page.locator('.invoices-modal-card .modal-close-btn').click().catch(() => {});
      await beat(1000);
    }
  }

  await scrollToSelector(page, '#estimate');
  await caption(page, 'Estimate form creates a Whop lead', "whop.track('lead', { event_id, … })");
  await beat(6000);

  const form = page.locator('#estimate form');
  if (await form.count()) {
    await page.locator('#lead-name').fill('').catch(() => {});
    await page.locator('#lead-name').type('Marcus Vance', { delay: 55 }).catch(() => {});
    await page.locator('#lead-email').fill('').catch(() => {});
    await page.locator('#lead-email').type('marcus.homeowner@example.com', { delay: 30 }).catch(() => {});
    await page.locator('#lead-phone').fill('').catch(() => {});
    await page.locator('#lead-phone').type('(214) 555-0182', { delay: 45 }).catch(() => {});
    await page.locator('#lead-zip').fill('').catch(() => {});
    await page.locator('#lead-zip').type('75201', { delay: 90 }).catch(() => {});
    await beat(3500);

    await form.locator('button[type="submit"]').click().catch(() => {});
    await page.waitForSelector('#estimate >> text=Lead recorded', { timeout: 15000 }).catch(() => {});
    await caption(page, 'Lead recorded', 'lead ID · event ID · delivery state · payload sent');
    await beat(12000);
  }

  const toggle = page.locator('.pixel-debugger-toggle');
  if (await toggle.count()) {
    await toggle.click().catch(() => {});
    await caption(page, 'Custom pixel events', 'service_viewed · deposit_started · estimate_requested · checkout_completed · invoice_requested');
    await beat(12000);
    await toggle.click().catch(() => {});
    await beat(1000);
  }
}

async function fullScenarioRest(page) {
  await scrollToSelector(page, '#financing');
  await caption(page, 'Whop-native financing', 'Deposit → job → final invoice, no custom checkout');
  await beat(8000);

  await scrollBy(page, 240, 900);
  await beat(5000);

  await scrollToSelector(page, '#service-area');
  await caption(page, 'Service area + trust signals', 'One config file drives every section');
  await beat(7000);

  await scrollToSelector(page, '#reviews');
  await caption(page, 'Customer reviews', 'All copy lives in roofing.config.ts');
  await beat(7000);

  await scrollToSelector(page, 'footer');
  await caption(page, 'Source + setup docs', 'github.com/KION6969/apex-roofing-whop-template');
  await beat(7000);
}

/* -------------------------------------------------------------------------- */
/* Encode                                                                      */
/* -------------------------------------------------------------------------- */

function encode(framesList, outFile) {
  if (framesList.length < 2) throw new Error('not enough frames captured');

  const listFile = path.join(workDir, 'frames.txt');
  const base = framesList[0].t;
  const lines = [];

  for (let index = 0; index < framesList.length; index++) {
    const current = framesList[index];
    const next = framesList[index + 1];
    const duration = next
      ? Math.min(1.5, Math.max(0.001, next.t - current.t))
      : 3;

    lines.push(`file '${current.file.replace(/\\/g, '/')}'`);
    lines.push(`duration ${duration.toFixed(3)}`);
  }

  // concat demuxer requires the final file repeated without a duration.
  lines.push(`file '${framesList[framesList.length - 1].file.replace(/\\/g, '/')}'`);
  fs.writeFileSync(listFile, lines.join('\n'), 'utf8');

  fs.mkdirSync(path.dirname(outFile), { recursive: true });

  const ffmpegArgs = [
    '-y',
    '-f', 'concat',
    '-safe', '0',
    '-i', listFile,
    '-f', 'lavfi',
    '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100',
    '-shortest',
    '-vf', 'fps=30',
    '-c:v', 'libx264',
    '-preset', 'medium',
    '-crf', '21',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac',
    '-b:a', '96k',
    '-movflags', '+faststart',
    outFile,
  ];

  const seconds = framesList[framesList.length - 1].t - base;
  log(`encoding ${framesList.length} frames (~${seconds.toFixed(1)}s)`);
  const result = spawnSync(ffmpegPath, ffmpegArgs, { stdio: 'inherit' });

  if (result.status !== 0) throw new Error(`ffmpeg exited with ${result.status}`);

  if (!KEEP) fs.rmSync(workDir, { recursive: true, force: true });
  else log('frames kept in', framesDir);

  return outFile;
}

/* -------------------------------------------------------------------------- */
/* Main                                                                        */
/* -------------------------------------------------------------------------- */

async function main() {
  const startedAt = Date.now();
  log(`scenario=${SCENARIO} payment=${PAYMENT} headless=${!HEADED}`);
  log('url', URL);

  const browser = await chromium.launch({
    channel: 'msedge',
    headless: !HEADED,
    args: ['--hide-scrollbars', '--force-device-scale-factor=1'],
  });

  const context = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
    colorScheme: 'dark',
  });

  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);

  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(error => {
    throw new Error(`could not open ${URL}: ${error.message}`);
  });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await beat(1200);

  await startScreencast(cdp);

  try {
    if (SCENARIO === 'tour') {
      await tourScenario(page);
    } else {
      await fullScenario(page);
      await fullScenarioRest(page);
    }

    await clearCaption(page);
    await caption(page, 'Built on Whop', 'apex-roofing-whop-template · React + Whop Elements');
    await beat(5000);
  } finally {
    await cdp.send('Page.stopScreencast').catch(() => {});
    await beat(400);
    await browser.close().catch(() => {});
  }

  const outFile = encode(frames, OUT);
  const stats = fs.statSync(outFile);
  log(`done: ${outFile} (${(stats.size / 1024 / 1024).toFixed(1)} MB, wall ${((Date.now() - startedAt) / 1000).toFixed(1)}s)`);
}

main().catch(error => {
  console.error('[record] failed:', error);
  process.exit(1);
});
