

## Rebuild the Dashboard Tournaments Tab

### Vision
Transform the dashboard `/dashboard/tournaments` tab from a bare empty-state page into a rich, immersive tournament hub that gives gamers everything they need at a glance — live tournament feeds, real-time stats, bracket views, leaderboards, and upcoming events — all wrapped in the GRIDZ gaming gradient theme.

### What Changes

**File: `src/pages/dashboard/Tournaments.tsx`** — Complete redesign with these sections:

**1. Header with Live Pulse Indicator**
- Title "My Tournaments" with gradient gold text
- Live indicator dot (pulsing green) showing real-time connection status
- "Find More" button linking to `/tournaments`

**2. Tournament Stats Bar (4 mini stat cards)**
- Tournaments Joined: 3 (demo)
- Win Rate: 67% (demo)
- Total Earnings: 4,500 GZC (demo)
- Current Rank: #12 (demo)
- Each card uses the `stat-card` hover effect with neon color accents

**3. Tabbed Content Area (4 tabs instead of 2)**
- **Live Now** — Active tournaments with real-time score tickers, featuring the EA FC 26 Nairobi Championship with an inline mini-bracket preview and clickable match cards
- **Upcoming** — Tournaments opening soon with countdown timers, entry fees, and "Register" buttons
- **My History** — Completed tournaments with placement, earnings, and performance summaries
- **Leaderboard** — Top 10 players ranked by earnings/wins with avatar, gamer tag, win rate, and earnings

**4. Featured Tournament Card (Live)**
- The EA FC 26 Nairobi Championship displayed prominently
- Shows current round (e.g., "Semi Finals"), live match score, time elapsed
- Quick stats row: prize pool, players remaining, your placement
- "View Bracket" button that expands the `TournamentBracket` component inline
- Glass-card styling with gold border glow

**5. Upcoming Tournaments Grid**
- 3 demo upcoming tournaments (e.g., "GRIDZ FIFA Pro League", "Mombasa Showdown", "Rift Valley Cup")
- Each card shows: game, date, entry fee, prize pool, spots remaining
- Animated countdown timer for the nearest tournament
- Progress bar showing registration fill rate

**6. Match History Table**
- Recent 5 matches with: opponent, score, result (W/L badge), earnings, date
- Color-coded rows (green tint for wins, subtle red for losses)
- Animated row entry with stagger

**7. Mini Leaderboard**
- Top 10 gamers with rank, avatar placeholder, gamer tag, wins, earnings
- Current user highlighted with gold border
- Trophy icon for top 3

### Demo Data
All data is hardcoded demo data (no auth required), matching the Kenyan gaming theme:
- Gamer tags: KenyanKing254, ElDoretEagle, LakeVictoriaLegend, etc.
- Tournaments: EA FC 26 themed, Nairobi/Mombasa/Eldoret locations
- GZC token amounts for prizes and earnings

### New Components Created

**File: `src/components/dashboard/TournamentLeaderboard.tsx`** (NEW)
- Reusable leaderboard component with rank, player name, wins, earnings
- Top 3 get gold/silver/bronze crown icons
- Animated row entry

**File: `src/components/dashboard/LiveMatchTicker.tsx`** (NEW)
- Shows a live match with pulsing "LIVE" badge
- Two player names with animated score
- Time elapsed counter
- Click to expand to full bracket view

**File: `src/components/dashboard/CountdownTimer.tsx`** (NEW)
- Countdown display showing days, hours, minutes, seconds
- Uses `useEffect` with `setInterval` for real-time countdown
- Neon-styled digit boxes

### Technical Details

- Reuses existing `TournamentBracket` and `MatchDetailsModal` components
- All demo data is defined as constants within the file (no database queries needed for demo)
- Uses existing CSS classes: `glass-card`, `stat-card`, `gaming-mesh`, `neon-text`, `hover-glow`
- Staggered `animate-slide-up` animations on all cards
- Tabs component from `@/components/ui/tabs`
- Badge, Progress, Card components from existing UI library
- Recharts `AreaChart` for a small performance sparkline in the stats section
- `date-fns` for countdown formatting (already installed)
- All colors use the existing neon accent variables (cyan, pink, green, gold)

### Files Summary

| File | Action |
|------|--------|
| `src/pages/dashboard/Tournaments.tsx` | Rewrite |
| `src/components/dashboard/TournamentLeaderboard.tsx` | Create |
| `src/components/dashboard/LiveMatchTicker.tsx` | Create |
| `src/components/dashboard/CountdownTimer.tsx` | Create |

