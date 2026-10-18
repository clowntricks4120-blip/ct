# Clown Tricks source upgrade

## Included
- Keeps existing React routes, Supabase setup, admin authorization, Apps/Videos/Tools CRUD, JSON bulk import, Adsterra placements and 15-second download stages.
- Client-side pagination on the homepage (24 items/page) and admin app list (30 items/page).
- Admin published/draft/total counts and a one-click JSON backup of the currently loaded apps.
- Per-page browser metadata for home, app details and download pages; canonical links, Open Graph tags, robots.txt and a static sitemap for main routes.
- Responsive styles for the added controls.

## Deployment
1. Back up the current production repository and Supabase data first.
2. Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY using your existing deployment environment settings. Never expose the service-role key.
3. Run `npm install` and `npm run build` in a network-enabled environment.
4. Test admin login, add/edit/delete (on a test entry), bulk preview/import, Apps/Videos/Tools pages, ad display and both countdown stages before publishing.
5. Deploy the built `dist` directory using your existing Cloudflare pipeline.

## Limitations / next work
- The homepage still fetches all published apps. Pagination is client-side; server-side pagination requires a further query refactor.
- 'Popular Apps' still means newest entries, not real popularity; click analytics are not yet available.
- The sitemap covers the main static routes only. A database-backed dynamic sitemap needs a server-side or build-time generation job.
- Automated dead-link checks are not included because cross-origin host HEAD requests can be unreliable and a scheduled backend needs deployment credentials.
- Existing Tools remain in the `tools` table; category-based Apps/Tools unification needs a separately tested database migration.
- Build could not be verified in this execution environment because npm dependency installation did not finish. Test before deployment.
