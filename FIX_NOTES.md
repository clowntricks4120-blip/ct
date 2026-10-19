# Tools + View All grid fix
1. Run `supabase/03_app_category_tools.sql` in Supabase SQL Editor **before** deployment. This preserves apps and tools records.
2. Bulk Import now accepts category: tools/apps/ott/otts. Import tool JSON as usual. Existing tool slugs listed in the SQL migration are automatically tagged. Other older tools may require a manual UPDATE.
3. Tools page combines categorized `apps` records with legacy `tools` table entries. App-type tools open `/app/:slug` and retain their screenshots/download timer. Legacy tools still open `/tools/:slug`.
4. View All modal now uses icon grid, keeps 10 items per page and a mid-grid ad; removes “10 per page” label.
5. Build with `npm install && npm run build`; test on staging before production.
