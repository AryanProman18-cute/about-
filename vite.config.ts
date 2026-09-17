import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GITHUB_PAGES=true is set by the deploy workflow (.github/workflows/deploy.yml).
// It builds with base '/about/' so assets resolve under https://<user>.github.io/about/.
// Locally (and in dev) the base stays '/', nothing changes.
export default defineConfig({
  base: process.env.GITHUB_PAGES ? '/about/' : '/',
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: true,
  },
});
