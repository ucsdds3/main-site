# Newsletter email CSV export

Admin **Members** → **Newsletter CSV** downloads emails for marketing.

## Filters

| Rule | Detail |
|------|--------|
| Active | `deleted !== true` |
| UCSD | email matches `@…ucsd.edu` (case-insensitive; allows subdomains) |
| Not alumni | `graduation_year` newer than the latest graduated class |
| Deduped | one row per email (lowercase) |

### Alumni rule

- From **June** onward in year Y: class Y has graduated → alumni if `graduation_year ≤ Y`
- Before June: alumni if `graduation_year ≤ Y−1`
- Missing / invalid graduation year (e.g. junk values) → **excluded**

Example in Sep 2026: keep `2027+`; drop `2026` and earlier.

## Output

CSV columns: `email`, `full_name`, `graduation_year`  
Filename: `newsletter_ucsd_emails_YYYY-MM-DD.csv`

## Code

- `src/Sites/Members/Pages/Admin/Utils/newsletterExport.ts`
- Button: `DataTableControls.tsx` (Members table only)

Uses the Members rows already loaded in the admin table (full fetch), not the search filter.
