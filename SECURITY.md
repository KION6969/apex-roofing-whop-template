# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.0.x   | ✅        |

## Reporting a Vulnerability

Apex Roofing is a Whop Websites template. Security boundaries:

- No API keys in the browser — Whop Elements handles payments in an iframe
- `VITE_WHOP_*` environment variables are public plan IDs, not secrets
- Lead data flows through Whop's pixel and optional same-origin endpoints
- The browser never sees a Whop `event:create` API key

If you find a security issue, please open a GitHub issue. Do not submit pull requests containing tokens or keys.

## Disclosure

We will acknowledge receipt within 72 hours and provide a timeline for resolution within 7 days.