import { cloudflare } from '@cloudflare/vite-plugin';
import { whop } from '@whop/cli/vite';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    // Whop hosting deploys Vite apps to Cloudflare Workers. The worker entry
    // (src/worker.ts) serves the SPA from the ASSETS binding.
    cloudflare({ viteEnvironment: { name: 'server' } }),
    whop({ disableTanstackDevtools: true }),
    tailwindcss(),
    react(),
  ],
  server: {
    port: 3000,
    host: true,
  },
});
