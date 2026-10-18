# Clown Tricks UI Update

## Included
- Four-item navigation: Apps | Tools | Videos | OTT's.
- Home View All opens a responsive dialog, rather than scrolling down.
- Dialog displays 10 apps per page with Previous, Next and numbered pages.
- Search, Escape, outside-click, and close button supported.
- Adsterra 300x250 unit after five apps in the dialog when a page has six or more apps.
- OTT's landing route and filtered dialog.
- Admin pagination missing-state fix (`adminPage`, `ADMIN_PAGE_SIZE`).
- Existing app detail, countdown, admin, bulk import, Supabase and ad configurations preserved.

## Important limitations
- OTT classification is currently based on existing optional `category` values (`ott`, `otts`) or app-name keyword detection (`ott`, `movie`, `stream`, `cinema`, `tv`). It is not a new admin-managed OTT category yet.
- Existing `tools` and `videos` pages and their tables are unchanged.
- This ZIP has not passed a production build in this environment because npm dependencies could not be installed; run `npm install && npm run build` before deployment.
- Test ad delivery in the browser; ad networks may block or suppress individual placements.
- No Supabase migration is required for this UI-only update.
