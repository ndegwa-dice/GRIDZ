import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Trophy,
  Users,
  Target,
  Coins,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Gamepad2,
  MapPin,
  Calendar,
  Zap,
} from "lucide-react";
import TournamentBracket from "@/components/TournamentBracket";
import LiveMatchTicker from "@/components/dashboard/LiveMatchTicker";
import CountdownTimer from "@/components/dashboard/CountdownTimer";
import TournamentLeaderboard from "@/components/dashboard/TournamentLeaderboard";

// ─── Demo Data ───────────────────────────────────────────────
const STATS = [
  { icon: Trophy, label: "Tournaments", value: "3", color: "text-primary", bg: "bg-primary/10" },
  { icon: Target, label: "Win Rate", value: "67%", color: "text-neon-green", bg: "bg-neon-green/10" },
  { icon: Coins, label: "Earnings", value: "4,500 GZC", color: "text-primary", bg: "bg-primary/10" },
  { icon: TrendingUp, label: "Rank", value: "#12", color: "text-accent", bg: "bg-accent/10" },
];

const LIVE_MATCHES = [
  { player1: "KenyanKing254", player2: "ElDoretEagle", score1: 2, score2: 1, minute: 67 },
  { player1: "LakeVictoriaLegend", player2: "GarissaGamer", score1: 1, score2: 1, minute: 43 },
];

const UPCOMING = [
  {
    name: "GRIDZ FIFA Pro League",
    game: "EA FC 26",
    location: "Nairobi",
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    entryFee: 500,
    prize: 25000,
    spots: 32,
    filled: 24,
  },
  {
    name: "Mombasa Showdown",
    game: "EA FC 26",
    location: "Mombasa",
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    entryFee: 300,
    prize: 15000,
    spots: 16,
    filled: 9,
  },
  {
    name: "Rift Valley Cup",
    game: "EA FC 26",
    location: "Eldoret",
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    entryFee: 200,
    prize: 10000,
    spots: 64,
    filled: 18,
  },
];

const MATCH_HISTORY = [
  { opponent: "NairobiNinja", score: "3 - 1", won: true, earnings: 1200, date: "2026-02-05" },
  { opponent: "MombasaMaster", score: "2 - 2 (4-3)", won: true, earnings: 800, date: "2026-02-03" },
  { opponent: "ElDoretEagle", score: "0 - 1", won: false, earnings: 0, date: "2026-02-01" },
  { opponent: "KisumuKiller", score: "4 - 2", won: true, earnings: 1500, date: "2026-01-28" },
  { opponent: "ThikaThunder", score: "1 - 3", won: false, earnings: 0, date: "2026-01-25" },
];

const LEADERBOARD = [
  { rank: 1, gamerTag: "KenyanKing254", wins: 42, earnings: 85000, isCurrentUser: false },
  { rank: 2, gamerTag: "ElDoretEagle", wins: 38, earnings: 72000 },
  { rank: 3, gamerTag: "LakeVictoriaLegend", wins: 35, earnings: 64000 },
  { rank: 4, gamerTag: "MombasaMaster", wins: 31, earnings: 51000 },
  { rank: 5, gamerTag: "KisumuKiller", wins: 29, earnings: 48000 },
  { rank: 6, gamerTag: "NakuruNemesis", wins: 27, earnings: 42000 },
  { rank: 7, gamerTag: "CoastalCrusader", wins: 24, earnings: 36000 },
  { rank: 8, gamerTag: "MaasaiMenace", wins: 22, earnings: 31000 },
  { rank: 9, gamerTag: "KerichoKing", wins: 20, earnings: 27000 },
  { rank: 10, gamerTag: "SafariStriker", wins: 18, earnings: 22000 },
  { rank: 12, gamerTag: "You", wins: 15, earnings: 4500, isCurrentUser: true },
];

// ─── Component ───────────────────────────────────────────────
const DashboardTournaments = () => {
  const navigate = useNavigate();
  const [bracketOpen, setBracketOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-gold bg-clip-text text-transparent">
              My Tournaments
            </h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon-green opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-neon-green" />
              </span>
              Live tournament feed
            </p>
          </div>
        </div>
        <Button onClick={() => navigate("/tournaments")} variant="hero" size="sm">
          <Trophy className="h-4 w-4 mr-1" />
          Find Tournaments
        </Button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {STATS.map((stat, i) => (
          <Card
            key={stat.label}
            className="stat-card p-4 bg-card border-border animate-slide-up"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="live" className="w-full">
        <TabsList className="bg-secondary/50 w-full sm:w-auto">
          <TabsTrigger value="live" className="gap-1.5">
            <Zap className="h-3.5 w-3.5" /> Live
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="gap-1.5">
            <Calendar className="h-3.5 w-3.5" /> Upcoming
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-1.5">
            <Gamepad2 className="h-3.5 w-3.5" /> History
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="gap-1.5">
            <Trophy className="h-3.5 w-3.5" /> Leaderboard
          </TabsTrigger>
        </TabsList>

        {/* ─── Live Now ──────────────────── */}
        <TabsContent value="live" className="mt-6 space-y-4">
          {/* Featured Tournament */}
          <Card className="glass-card border-primary/30 overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <Badge className="bg-destructive/90 text-destructive-foreground border-0 mb-2 text-[10px] animate-pulse">
                    LIVE NOW
                  </Badge>
                  <CardTitle className="text-xl bg-gradient-gold bg-clip-text text-transparent">
                    EA FC 26 Nairobi Championship
                  </CardTitle>
                </div>
                <Badge variant="outline" className="text-accent border-accent/50">
                  Semi Finals
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-xs text-muted-foreground">Prize Pool</p>
                  <p className="font-bold text-primary">50,000 GZC</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Players Left</p>
                  <p className="font-bold text-foreground">4 / 16</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Your Place</p>
                  <p className="font-bold text-neon-green">#3</p>
                </div>
              </div>

              {/* Live matches */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Live Matches
                </p>
                {LIVE_MATCHES.map((m, i) => (
                  <LiveMatchTicker key={i} {...m} startMinute={m.minute} />
                ))}
              </div>

              {/* Bracket toggle */}
              <Button
                variant="outline"
                size="sm"
                className="w-full border-accent/30 text-accent hover:bg-accent/10"
                onClick={() => setBracketOpen(!bracketOpen)}
              >
                {bracketOpen ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" /> Hide Bracket
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" /> View Full Bracket
                  </>
                )}
              </Button>
              {bracketOpen && (
                <div className="animate-scale-in">
                  <TournamentBracket />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Upcoming ──────────────────── */}
        <TabsContent value="upcoming" className="mt-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {UPCOMING.map((t, i) => (
              <Card
                key={t.name}
                className="glass-card border-border hover:border-primary/40 transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <CardContent className="p-5 space-y-4">
                  <div>
                    <h3 className="font-bold text-foreground">{t.name}</h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <Gamepad2 className="h-3 w-3" /> {t.game}
                      <span className="mx-1">·</span>
                      <MapPin className="h-3 w-3" /> {t.location}
                    </div>
                  </div>

                  <CountdownTimer targetDate={t.date} />

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Entry Fee</p>
                      <p className="font-semibold text-foreground">{t.entryFee} GZC</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Prize Pool</p>
                      <p className="font-semibold text-primary">{t.prize.toLocaleString()} GZC</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">
                        {t.filled}/{t.spots} spots
                      </span>
                      <span className="text-muted-foreground">
                        {Math.round((t.filled / t.spots) * 100)}%
                      </span>
                    </div>
                    <Progress value={(t.filled / t.spots) * 100} className="h-1.5" />
                  </div>

                  <Button variant="neon" size="sm" className="w-full">
                    Register Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ─── History ──────────────────── */}
        <TabsContent value="history" className="mt-6">
          <Card className="glass-card">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50 hover:bg-transparent">
                    <TableHead className="text-muted-foreground">Date</TableHead>
                    <TableHead className="text-muted-foreground">Opponent</TableHead>
                    <TableHead className="text-muted-foreground text-center">Score</TableHead>
                    <TableHead className="text-muted-foreground text-center">Result</TableHead>
                    <TableHead className="text-muted-foreground text-right">Earnings</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MATCH_HISTORY.map((m, i) => (
                    <TableRow
                      key={i}
                      className={`border-border/30 animate-slide-up ${
                        m.won ? "bg-neon-green/[0.03]" : "bg-destructive/[0.03]"
                      }`}
                      style={{ animationDelay: `${i * 60}ms` }}
                    >
                      <TableCell className="text-xs text-muted-foreground">{m.date}</TableCell>
                      <TableCell className="font-medium text-foreground">{m.opponent}</TableCell>
                      <TableCell className="text-center font-mono text-sm text-foreground">
                        {m.score}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          className={
                            m.won
                              ? "bg-neon-green/20 text-neon-green border-neon-green/30"
                              : "bg-destructive/20 text-destructive border-destructive/30"
                          }
                        >
                          {m.won ? "W" : "L"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-primary">
                        {m.earnings > 0 ? `+${m.earnings} GZC` : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Leaderboard ──────────────────── */}
        <TabsContent value="leaderboard" className="mt-6">
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-foreground flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Top Players
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TournamentLeaderboard entries={LEADERBOARD} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardTournaments;
