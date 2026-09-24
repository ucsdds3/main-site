# Event check-in rating + feedback

After a successful check-in (`validate_event_code`), members are prompted for:

1. **Rating** 1–10 (required to submit)
2. **Optional** free-text feedback

## Database

Run [`sql/attendance_feedback.sql`](../sql/attendance_feedback.sql) once (already applied on Membership if using the Cursor migration):

- `Attendance.rating` (1–10, nullable for older rows)
- `Attendance.feedback` (text, optional)
- RPC `submit_attendance_feedback(event_id, rating, feedback)` — security definer; updates the caller’s attendance row

## Frontend

- Members home check-in: `useEvents.ts` + `CheckInFeedbackModal.tsx`
- Works for typed codes and QR `?eventcode=` (modal opens after check-in / already-registered)
- Admin Attendance table shows Rating + Feedback columns

## Flow

```
enter code / scan QR
  → validate_event_code (creates Attendance + points)
  → feedback modal
  → submit_attendance_feedback (updates rating/feedback)
```

Skip is allowed; check-in still counts. Re-entering the code / rescanning QR reopens the modal so they can submit later.
