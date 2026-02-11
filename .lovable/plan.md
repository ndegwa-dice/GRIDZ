

## Connect Real Tournament Data to All Client Pages

This plan replaces all hardcoded demo data across the platform with live database-driven content, adds a working tournament join flow, creates a matches system for auto-matchmaking, and builds a real-time live tournament feed.

---

### 1. New Database Tables

**`matches` table** -- stores individual match pairings within a tournament:
- `id` (uuid, PK)
- `tournament_id` (uuid, FK to tournaments)
- `round` (integer) -- round number (1 = first round, 2 = quarters, etc.)
- `match_order` (integer) -- position within the round
- `player1_id` (uuid, nullable) -- user_id
- `player2_id` (uuid, nullable) -- user_id (null = BYE)
- `player1_score` (integer, default 0)
- `player2_score` (integer, default 0)
- `winner_id` (uuid, nullable)
- `status` (text, default 'pending') -- pending / live / completed
- `started_at` (timestamptz, nullable)
- `completed_at` (timestamptz, nullable)
- `created_at` (timestamptz, default now())

RLS: Anyone can SELECT. Only admins can INSERT/UPDATE/DELETE. Enable realtime.

**`match_events` table** -- stores live match events (goals, cards, etc.) for the live feed:
- `id` (uuid, PK)
- `match_id` (uuid, FK to matches)
- `event_type` (text) -- 'goal', 'yellow_card', 'red_card', 'substitution', 'start', 'end'
- `user_id` (uuid, nullable) -- who triggered the event
- `minute` (integer)
- `description` (text, nullable)
- `created_at` (timestamptz, default now())

RLS: Anyone can SELECT. Only admins can INSERT/UPDATE/DELETE. Enable realtime.

---

### 2. Auto-Matchmaking Database Function

Create a `generate_bracket` PL/pgSQL function (SECURITY DEFINER, admin-only):
- Takes a `tournament_id`
- Reads all participants, shuffles them randomly
- Calculates total rounds based on participant count (rounds up to nearest power of 2)
- Inserts round 1 matches pairing players sequentially (with BYEs if odd count)
- Creates empty placeholder matches for subsequent rounds
- Sets the tournament status to 'live'

---

### 3. Admin: Match Result Entry + Auto-Advance

Update **`src/pages/admin/Tournaments.tsx`**:
- Add a "Generate Bracket" button for tournaments with status 'upcoming' and participants joined
- Show the generated bracket with match cards
- Allow admins to enter scores for each match and mark a winner
- When a match is completed, automatically populate the winner into the next round's match slot
- Add "Start Match" button that sets match status to 'live' and `started_at`

---

### 4. Public Tournaments Page (`/tournaments`)

Update **`src/pages/Tournaments.tsx`**:
- Remove hardcoded `featuredTournament` -- use the first "live" tournament from the database
- Show real participant counts, prize pools, and statuses
- Add a "Join Tournament" button for upcoming tournaments (uses `join_tournament` RPC)
- Show login prompt if not authenticated
- Replace hardcoded `TournamentBracket` with a new dynamic bracket component that reads from the `matches` table
- Show real-time updates via Supabase subscriptions

---

### 5. Dashboard Tournaments (`/dashboard/tournaments`)

Rewrite **`src/pages/dashboard/Tournaments.tsx`** to use real data:

**Live Tab:**
- Fetch tournaments with status 'live' where the current user is a participant
- Show live matches from the `matches` table (status = 'live') with real player names from profiles
- Subscribe to realtime on `matches` and `match_events` tables for live score updates
- Replace static `LiveMatchTicker` data with real match data

**Upcoming Tab:**
- Fetch upcoming tournaments from DB
- Show real countdown timers, entry fees, prize pools, spot counts
- "Register Now" button calls `join_tournament` RPC with the user's wallet balance check
- Show "Already Joined" state for tournaments the user has registered for

**History Tab:**
- Fetch completed matches from the `matches` table where the user was player1 or player2
- Show real scores, win/loss results, and earnings from `tournament_participants.points_earned`

**Leaderboard Tab:**
- Query `tournament_participants` aggregating wins, total earnings across all tournaments
- Highlight the current user's position

**Stats Bar:**
- Count real tournaments joined, calculate real win rate from matches, sum real earnings

---

### 6. Dynamic Tournament Bracket Component

Rewrite **`src/components/TournamentBracket.tsx`**:
- Accept a `tournamentId` prop
- Fetch all matches for that tournament from the `matches` table
- Group by round number
- Fetch player usernames from profiles
- Display live/completed/pending states with appropriate styling
- Subscribe to realtime changes on `matches` table for live bracket updates
- Show pulsing "LIVE" badge on active matches

---

### 7. Live Match Ticker Updates

Update **`src/components/dashboard/LiveMatchTicker.tsx`**:
- Accept match data props (match ID, player names, scores, status)
- Subscribe to `match_events` for the match to show real-time score changes

---

### 8. Wallet Integration

Update **`src/pages/dashboard/Wallet.tsx`**:
- Read real `wallet_balance` from the user's profile
- Show balance and basic transaction feedback when joining tournaments

---

### Files Summary

| File | Action |
|------|--------|
| Migration SQL | Create `matches` and `match_events` tables, `generate_bracket` function, realtime publication |
| `src/pages/Tournaments.tsx` | Rewrite -- real data, join flow, dynamic bracket |
| `src/pages/dashboard/Tournaments.tsx` | Rewrite -- all tabs use real DB data with realtime |
| `src/components/TournamentBracket.tsx` | Rewrite -- dynamic, prop-driven, realtime bracket |
| `src/components/dashboard/LiveMatchTicker.tsx` | Update -- accept real match data |
| `src/components/MatchDetailsModal.tsx` | Update -- fetch real match stats from DB |
| `src/pages/admin/Tournaments.tsx` | Update -- add bracket generation + match management |
| `src/pages/dashboard/Wallet.tsx` | Update -- show real wallet balance |
| `src/hooks/useTournaments.tsx` | Update -- add match-related queries |

