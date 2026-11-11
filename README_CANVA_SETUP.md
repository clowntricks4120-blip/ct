# Canva feature setup (add-on)

This feature is additive. Existing Apps, Tools, Videos, login and admin pages are retained.

## 1. Supabase
1. Open Supabase SQL Editor and run `supabase/canva.sql` after your existing `supabase/schema.sql`.
2. In the SQL Editor, create the initial rows (replace the two task URLs with the websites you want visitors to open):

```sql
insert into public.links(id,url,manual_override)
values (1,'https://www.canva.com/',false)
on conflict (id) do nothing;

insert into public.canva_settings(id,task1_url,task2_url)
values (1,'https://example.com/','https://example.org/')
on conflict (id) do nothing;
```

3. Change the example task URLs in Admin > Canva. The Canva destination can also be set there; saving it activates a manual override.

## 2. Cloudflare Pages environment variables
Keep your existing Vite variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as before. In addition, set these for Pages Functions in Production (and Preview if desired):
- `SUPABASE_URL` — same project URL as the Vite app.
- `SUPABASE_ANON_KEY` — Supabase anon/publishable key.

These are read only by Pages Functions. Do not put the service-role key in Vite or Cloudflare client-side variables.

## 3. GitHub Actions secrets
In GitHub repository Settings > Secrets and variables > Actions, add:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY` (service-role key; secret only)

The workflow `.github/workflows/update-canva.yml` runs every three hours and can also be started manually from Actions. `getl.py` preserves the original extraction sequence, validates HTTPS Canva hosts, and calls an atomic database function. If extraction fails, the old link stays untouched. If a manual override is active, automatic updates are skipped.

## 4. Deploy
Commit and push the project. Cloudflare Pages will build the Vite app and deploy the `functions/` endpoints automatically. Check that the Pages project is connected to the repository root and builds with `npm run build` to `dist`.

## 5. Admin and visitor flow
- Admin URL remains `/control-portal-ct`; Canva is a new Admin tab.
- Public Canva page is `/canva`.
- Admin can set the two visit URLs, set a manual Canva invite, or resume automatic updates.
- Each visitor task opens in a new tab; returning to the page starts a 15-second wait. The second completion unlocks the invite.
- Broken-link reports are limited to three per hashed IP per day.

## Important
- The task URLs are placeholders until you set your actual two website URLs in Admin > Canva.
- The 15-second wait is a client-side flow, not proof that a visitor read a page or a bot check.
- The Canva invite must be a real HTTPS `canva.com` URL. Invite links may expire and Canva team owners can access information shared within their team.

## Extraction behavior
`getl.py` now follows the supplied `canva.py` extraction sequence exactly: it fetches the configured Bingotingo page, finds the first `https://biozium.com/public/bio-links/...` URL, fetches that Biozium profile, and extracts a `https://www.canva.com/brand/join?...` invitation. The destination is validated before it is saved. If either page changes, the network fails, or no valid invitation is found, the existing database invite is left unchanged.

To test the extractor locally without updating Supabase, you can temporarily comment out the `save_invite(invite_url)` call at the bottom of `getl.py`, then run `python getl.py`. For the scheduled GitHub Action, keep that call enabled and configure the two GitHub Actions secrets described above.
