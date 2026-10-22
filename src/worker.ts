interface Env {
  ASSETS: {
    fetch: (request: Request) => Promise<Response>;
  };
}

/**
 * Whop hosting runs Vite builds on Cloudflare Workers. This site is a static
 * React SPA, so the worker simply serves the built assets; the `assets`
 * binding in wrangler.jsonc handles SPA fallback (`/any/route` -> index.html).
 */
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    return env.ASSETS.fetch(request);
  },
};
