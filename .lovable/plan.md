

## Enhance Tournament Access and Live Bracket Experience

### Problem
1. The dashboard tournaments page already fetches real data but the bracket is hidden behind a toggle -- it should be more prominent
2. `MatchDetailsModal` still uses **fully mock data** (random stats) instead of real `match_events` from the database
3. Users can't easily navigate to a specific tournament's dedicated page with its full live bracket
4. No dedicated tournament detail page exists -- users must expand inline brackets

### Changes

**1. Create a Tournament Detail Page (`src/pages/TournamentDetail.tsx`)**
- New route `/tournaments/:id` showing a single tournament with its full live bracket always visible
- Real-time subscriptions on `matches` and `match_events` for that tournament
- Shows tournament info (name, game, prize pool, players), join button for upcoming, and the full `TournamentBracket` component
- Live match feed section showing active matches with `LiveMatchTicker`
- Accessible from both `/tournaments` and `/dashboard/tournaments`

**2. Update MatchDetailsModal to Use Real Data (`src/components/MatchDetailsModal.tsx`)**
- Fetch real `match_events` from DB using the `matchId` prop (already passed in)
- Fetch real player profiles (games played, win rate from completed matches)
- Replace the `generatePlayerStats` mock function with actual DB queries
- Show real match events timeline (goals, cards, etc.) instead of random stats
- Subscribe to realtime on `match_events` for live updates when match is active

**3. Improve Dashboard Tournament Navigation (`src/pages/dashboard/Tournaments.tsx`)**
- Add "View Tournament" link/button on each tournament card that navigates to `/tournaments/:id`
- Make the live bracket visible by default (remove the toggle) for the active live tournament
- Show all live tournaments the user is in (not just the first one) with a selector

**4. Update Public Tournaments Page (`src/pages/Tournaments.tsx`)**
- Tournament cards link to `/tournaments/:id` for full detail view
- Featured tournament card gets a "View Full Tournament" button

**5. Add Route (`src/App.tsx`)**
- Add `/tournaments/:id` route pointing to `TournamentDetail`

### Files Summary

| File | Action |
|------|--------|
| `src/pages/TournamentDetail.tsx` | Create -- dedicated tournament page with live bracket |
| `src/components/MatchDetailsModal.tsx` | Rewrite -- use real match_events and profile data |
| `src/pages/dashboard/Tournaments.tsx` | Edit -- show bracket by default, add navigation links |
| `src/pages/Tournaments.tsx` | Edit -- add links to tournament detail pages |
| `src/App.tsx` | Edit -- add `/tournaments/:id` route |

