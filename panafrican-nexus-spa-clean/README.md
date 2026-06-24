# Panafrican Nexus — SPA build (cPanel-ready)

Converted from TanStack Start to a classic React + Vite SPA using
React Router DOM, so it can be deployed on any static host (cPanel,
shared hosting, S3, etc.).

## Local build

```bash
npm install         # or: bun install
npm run dev         # http://localhost:5173
npm run build       # outputs to ./dist
```

## Deploy on cPanel (PlanetHoster, etc.)

1. Run `npm run build` locally.
2. Open the generated `dist/` folder.
3. In cPanel **File Manager**, go to `public_html/` (or your subdomain dir).
4. Upload **all the contents** of `dist/` (not the folder itself).
5. The `.htaccess` file (already inside `dist/`) handles SPA routing —
   refreshing `/recommendations` will serve `index.html` correctly.

## Notes
- Auth is mocked (localStorage). Credentials are in `src/lib/local-auth.ts`.
- Data is mocked in `src/lib/mock-data.ts`.
- i18n: English / French via `src/lib/i18n.tsx` (no extra lib).
- Removed: SSR, TanStack Start, Cloudflare Worker config, route tree gen.
- Added: `react-router-dom`, `react-helmet-async` (kept light).
