# Contributing to Apex Roofing Whop Template

Thanks for your interest! Apex Roofing is a config-driven roofing contractor site template with Whop Elements checkout, whop.track lead capture, and final-balance invoicing. Built with Vite + React 19 + TypeScript + Tailwind v4.

## How to contribute

1. **Fork the repo** and create a branch from `main`.
2. **Make your change** — components, config, tracking, or docs.
3. **Typecheck** — `npm run typecheck` must pass.
4. **Build** — `npm run build` must succeed.
5. **Never commit API keys** — `.env` files are gitignored; `.env.production` contains only public plan IDs.
6. **Commit with a clear message** — e.g. `fix: handle checkout return URL params`.
7. **Open a pull request** — describe what changed and why.

## Security notes

- Whop plan IDs (`plan_...`) are public identifiers, not secrets
- Whop API keys must never reach the browser
- Card data only ever lives inside Whop's iframe — never in this repository

## License

MIT © KION6969