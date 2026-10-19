# Clown Tricks homepage and modal update
- Based on Admin White Screen Fix ZIP (includes adminPage state fix).
- Homepage: Apps, OTT, Tools and Videos all show preview cards with View All buttons opening a modal, not a new page.
- Modal: 10 items per page in four-column grid, category tabs, search, close, Previous/Next and page numbers.
- Adsterra placements: banner at modal start, 468x60 banner after 4 and 8 items when present, two banners at bottom.
- Uses existing AdUnits.jsx ad IDs; does not change database schema, admin, bulk importer or download timer.
- Existing apps tagged category=tools and records from tools table both appear in Tools.
- For newly imported tools, run existing supabase/03_app_category_tools.sql if not already applied.
- Verify production build and mobile ad display before deploying live. Ad network may not fill all slots.
