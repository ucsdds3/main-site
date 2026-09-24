# Subscribe to DS3 events (personal calendar)

Public ICS feed of **published** DS3 events (`workflow_status = complete`, not deleted, not DataHacks).
Includes upcoming events plus the last ~90 days so the feed is rarely empty.

## Why not Google’s `cid=` deep link?

`https://calendar.google.com/calendar/r?cid=…` only works for **Google-hosted** calendars.
Pointing it at our ICS URL shows: “Unable to add calendar. Check the URL.”

The landing button instead:
1. Copies the ICS URL to the clipboard
2. Opens Google Calendar’s **Add calendar → From URL** settings page
3. User pastes and clicks Add calendar

## Deploy

```bash
cd main-site
npx supabase functions deploy events-ics --no-verify-jwt
```

JWT verification must stay **off** so Google/Apple can fetch the feed without an auth header.

## URLs

- ICS: `https://<project-ref>.supabase.co/functions/v1/events-ics`
- Landing CTA: **Add our event calendar** (`Landing.tsx` + `src/Utils/calendarSubscribe.ts`)
