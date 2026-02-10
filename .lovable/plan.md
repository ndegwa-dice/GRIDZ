

## Add Live Activity Feed to Admin Overview

### What Changes

**File: `src/pages/admin/Overview.tsx`** -- Add a real-time activity feed section below the existing stats and recent tournaments.

### Implementation Details

**1. Supabase Realtime Subscriptions**
- Subscribe to `tournament_participants` table for INSERT events (player joins) and UPDATE events (placement/points changes, indicating completions and prize awards)
- Subscribe to `tournaments` table for UPDATE events (status changes like going live)
- Each event gets mapped into a feed item with a type, message, timestamp, and icon

**2. Activity Feed State**
- New state: `activityFeed` array holding up to 50 recent events
- Each feed item has: `id`, `type` (join / completion / prize / status_change), `message`, `timestamp`, `icon`, `color`
- New events prepend to the top with an animated entry effect
- On mount, load the 10 most recent `tournament_participants` entries (sorted by `joined_at` desc) as seed data, joining with tournament names

**3. Feed Item Rendering**
- A new "Live Activity" card with a pulsing green dot in the header
- ScrollArea (max height ~400px) containing feed items
- Each item shows: colored icon, descriptive message (e.g., "KenyanKing254 joined Nairobi Championship"), and relative timestamp (e.g., "2 min ago")
- Different colors per type: green for joins, gold for prizes, cyan for completions, purple for status changes
- Staggered `animate-slide-up` entry on new items

**4. Real-time Event Processing**
- On `tournament_participants` INSERT: fetch the participant's username from profiles and tournament name, display "USERNAME joined TOURNAMENT"
- On `tournament_participants` UPDATE where `placement` is set: display "USERNAME placed #N in TOURNAMENT"
- On `tournament_participants` UPDATE where `points_earned` > 0: display "USERNAME earned X GZC in TOURNAMENT"
- On `tournaments` UPDATE where status changes to "live": display "TOURNAMENT is now LIVE!"

**5. Stats Auto-Refresh**
- The existing stats (total users, participations, etc.) will also refresh when realtime events arrive, keeping the overview numbers current

**6. Cleanup**
- Unsubscribe from all Supabase channels on component unmount

### Technical Notes

- Uses existing `ScrollArea` component for the feed container
- Uses `date-fns` `formatDistanceToNow` for relative timestamps
- Realtime subscriptions use `supabase.channel()` API already used in admin tournaments page
- No new database tables or migrations needed -- reads existing data
- Icons from lucide-react: `UserPlus` (join), `Medal` (placement), `Coins` (prize), `Radio` (live status)

### Files Summary

| File | Action |
|------|--------|
| `src/pages/admin/Overview.tsx` | Edit -- add realtime subscriptions, activity feed section, and auto-refreshing stats |

