# Canva Premium by Clown Tricks — add-on setup

This is an additive feature. Existing Apps, Tools, Videos, downloads, and Admin features remain in place.

## 1. Supabase (one-time setup)
1. Open Supabase SQL Editor and run `supabase/canva.sql` after your existing `supabase/schema.sql`.
2. Create the initial rows once (replace the two partner URLs with your real HTTPS destinations):

```sql
insert into public.links(id,url,manual_override)
values (1,'https://www.canva.com/',false)
on conflict (id) do nothing;

insert into public.canva_settings(id,task1_url,task2_url)
values (1,'https://example.com/','https://example.org/')
on conflict (id) do nothing;
```

3. Keep the existing Vite environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` configured exactly as they are for the rest of the website. The Canva visitor page reads the public invite and task URLs directly through the existing Supabase client; it does not depend on `/api/canva-link` or `/api/canva-report` Worker routes.

## 2. Admin settings
- Admin URL remains `/control-portal-ct`.
- Open the **Canva** tab.
- Set the Canva team invite URL and both partner website URLs, then save.
- Saving a manual Canva invite pauses the scheduled GitHub update. Use **Resume automatic updates** to re-enable it.
- The existing GitHub Action can continue refreshing the invite every three hours. It uses repository secrets `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`; never put the service-role key in Vite or browser code.

## 3. Visitor flow and ad placements
- Home page: the **Canva Premium By ClownTricks** feature link appears directly below the top banner ad.
- `/canva`: shows two ad placements and the two-step progress.
- `/canva/task/1` and `/canva/task/2`: each shows two ad placements and the configured partner destination. Visitors open the external site, return, and wait 15 seconds before the step is marked complete.
- After both steps, the Canva invite URL entered in Admin becomes available.
- There are six ad placements across the Canva main page and the two internal partner-visit pages. Ads cannot be inserted into the external partner websites themselves.

## 4. Deploy
Build with `npm run build` and deploy using the same Cloudflare setup already used by the website. The `_redirects` files were removed because the Worker/Vite single-page-app fallback handles client routes; keeping `/* /index.html 200` alongside that fallback can cause Cloudflare's infinite redirect-rule error.

## Important
- Replace the example partner URLs with real HTTPS links in Admin > Canva.
- The 15-second wait is a client-side flow, not proof that a visitor read a page or a bot check.
- The Canva invite must be a real HTTPS Canva URL. Invite links may expire, and Canva team owners can access information shared within their team.
- Clown Tricks is not affiliated with Canva.

## Automatic invite extraction
`getl.py` follows the configured extraction sequence: it fetches the Bingotingo page, finds a Biozium public bio-link, fetches that profile, and extracts a Canva brand-join URL. The destination is validated before saving. GitHub Actions requires `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` repository secrets. If extraction fails, the old invite remains unchanged; a manual override prevents automatic replacement.
