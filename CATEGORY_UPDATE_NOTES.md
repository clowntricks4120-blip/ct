# Clown Tricks Bulk Category Manager

1. Back up Supabase apps table and existing website source.
2. Run `supabase/04_bulk_categories.sql` in Supabase SQL Editor before deploying.
3. Deploy this source to GitHub/Cloudflare.
4. Log into Admin > Apps. Tick entries, choose Apps / Tools / OTT / Games / +18, and press Move Selected. Selection applies to current page; selected IDs persist when changing pages until cleared or moved.
5. Existing standalone Tools content manager and Videos manager remain separate. The new bulk category manager updates entries in `apps` table only.
6. The homepage has Games and +18 preview sections and View All modals. Existing app links continue using `/app/:slug`. `/games` and `/18plus` currently point to homepage; category filtering is in modal.
7. Category change is live after confirmation. Verify Supabase admin RLS permits updates.
8. No live Supabase/Cloudflare tests were performed. npm install/build could not complete in this environment.
