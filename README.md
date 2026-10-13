# Clown Tricks — APK discovery and external download links

Light-theme, Play Store-inspired responsive web app. Public homepage, search, per-app details, 15-second continuation timer, separate download page with 15-second timer, unlimited external mirror links, and a private admin portal with create/edit/delete. **No APK hosting.**

## Local setup
1. Install Node.js 20+.
2. Run `npm install`.
3. Create `.env` based on `.env.example` and enter your Supabase project URL and **publishable/anon** key (never the service-role/secret key).
4. In Supabase SQL Editor run `supabase/schema.sql` once on a new project.
5. Supabase Authentication > Users: create your admin user (email + password). Disable public sign-ups in Auth settings if only one admin is needed.
6. In SQL Editor run `insert into public.admins(user_id) select id from auth.users where email='YOUR_ADMIN_EMAIL@example.com';` replacing the email. Only that user can write apps. Do not add admin users from the public client.
7. Run `npm run dev` and open the displayed localhost URL. Admin login: `/control-portal-ct`.

## Publish to Cloudflare Pages
- Push this folder to a private GitHub repository (never commit `.env`).
- Cloudflare Workers & Pages > Create > Pages > Connect Git repository.
- Framework preset: **Vite**; build command `npm run build`; build output directory `dist`.
- Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Pages environment variables, then redeploy.
- `public/_redirects` supplies SPA routing for `/app/...`, `/download/...` and admin URLs.
- In Supabase Auth URL configuration, set Site URL to your published website. If using email confirmation or password recovery, add appropriate redirect URLs.

## Admin use
- Open `https://YOUR-SITE.pages.dev/control-portal-ct` and sign in.
- New Upload form: name, version, icon URL, screenshot URLs (one per line), description, and at least one external mirror server name + URL. Add as many mirrors as needed. Publish.
- New app automatically appears on the homepage and at `/app/your-slug`; the download page is `/download/your-slug`.
- Edit/delete from dashboard. Drafts are visible only to authenticated admins through RLS.
- Icon/screenshots are hotlinked from third-party URLs; only use sources permitting hotlinking. Some image providers block embeds. Public content is not stored locally.

## Advertising and verification
- `AdSlot` is a clearly labeled placeholder; it **does not serve ads**. Integrate approved ad tags according to the provider's policies after approval; never disguise ads as download buttons.
- The countdown **does not verify a human**. For actual bot checks use Cloudflare Turnstile with server-side token verification.
- Timers are a client-side UX feature, not a security gate, and can be bypassed by directly opening a URL. Do not claim otherwise.
- Avoid ad-only pages, forced ad clicks, or deceptive interstitials. Two timers may reduce completion and revenue. Measure real click-through and completion.
- Use only APK links you have rights to distribute, and check your file host and ad provider policies..

## Security notes
- The admin path is not an authentication secret. Supabase Auth + Row Level Security protect writes.
- Client environment keys are public by design; never put a Supabase service role key in Vite.
- Production use should add appropriate CSP, abuse monitoring, and optionally server-side URL allowlisting. External mirror links open in a new tab with `noopener noreferrer`.
- If re-running schema.sql, PostgreSQL policies/triggers already exist; execute only once on a fresh project or drop existing policies/triggers before reapplying.
