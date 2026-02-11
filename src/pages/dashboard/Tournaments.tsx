import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy, Users, Target, Coins, TrendingUp, ChevronDown, ChevronUp, Gamepad2, Calendar, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTournaments } from "@/hooks/useTournaments";
import { useToast } from "@/hooks/use-toast";
import TournamentBracket from "@/components/TournamentBracket";
import LiveMatchTicker from "@/components/dashboard/LiveMatchTicker";
import CountdownTimer from "@/components/dashboard/CountdownTimer";
import TournamentLeaderboard from "@/components/dashboard/TournamentLeaderboard";

interface MatchWithNames {
  id: string;
  tournament_id: string;
  player1_name: string;
  player2_name: string;
  player1_score: number;
  player2_score: number;
  status: string;
  started_at: string | null;
}

const DashboardTournaments = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tournaments, loading, joinTournament, checkUserInTournament } = useTournaments();
  const { toast } = useToast();
  const [bracketOpen, setBracketOpen] = useState(false);
  const [liveTournamentId, setLiveTournamentId] = useState<string | null>(null);
  const [liveMatches, setLiveMatches] = useState<MatchWithNames[]>([]);
  const [joinedMap, setJoinedMap] = useState<Record<string, boolean>>({});
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [matchHistory, setMatchHistory] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [stats, setStats] = useState({ tournaments: 0, winRate: "0%", earnings: "0 GZC", rank: "—" });

  // Get user's live tournaments
  const liveTournaments = tournaments.filter(t => t.status === "live");
  const upcomingTournaments = tournaments.filter(t => t.status === "upcoming");

  useEffect(() => {
    if (!user) return;
    loadUserData();
    loadLeaderboard();

    const channel = supabase
      .channel("dashboard-matches")
      .on("postgres_changes", { event: "*", schema: "public", table: "matches" }, () => {
        if (liveTournamentId) loadLiveMatches(liveTournamentId);
        loadUserData();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, liveTournamentId]);

  useEffect(() => {
    if (liveTournaments.length > 0 && !liveTournamentId) {
      setLiveTournamentId(liveTournaments[0].id);
      loadLiveMatches(liveTournaments[0].id);
    }
  }, [liveTournaments]);

  useEffect(() => {
    if (user) {
      upcomingTournaments.forEach(async (t) => {
        const joined = await checkUserInTournament(t.id, user.id);
        setJoinedMap(prev => ({ ...prev, [t.id]: joined }));
      });
    }
  }, [user, upcomingTournaments.length]);

  const loadUserData = async () => {
    if (!user) return;

    // Stats: count tournaments joined
    const { data: participations } = await supabase
      .from("tournament_participants")
      .select("tournament_id, placement, points_earned")
      .eq("user_id", user.id);

    const totalJoined = participations?.length || 0;
    const totalEarnings = participations?.reduce((sum, p) => sum + (p.points_earned || 0), 0) || 0;

    // Win rate from matches
    const { data: userMatches } = await supabase
      .from("matches")
      .select("*")
      .or(`player1_id.eq.${user.id},player2_id.eq.${user.id}`)
      .eq("status", "completed");

    const wins = userMatches?.filter(m => m.winner_id === user.id).length || 0;
    const total = userMatches?.length || 0;
    const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;

    setStats({
      tournaments: totalJoined.toString() as any,
      winRate: `${winRate}%`,
      earnings: `${totalEarnings.toLocaleString()} GZC`,
      rank: `#${totalJoined > 0 ? "—" : "—"}`,
    });

    // Match history
    if (userMatches && userMatches.length > 0) {
      const playerIds = new Set<string>();
      userMatches.forEach(m => {
        if (m.player1_id) playerIds.add(m.player1_id);
        if (m.player2_id) playerIds.add(m.player2_id);
      });
      const { data: profiles } = await supabase.from("profiles").select("user_id, username").in("user_id", Array.from(playerIds));
      const nameMap = (profiles || []).reduce((acc, p) => { acc[p.user_id] = p.username || "Unknown"; return acc; }, {} as Record<string, string>);

      setMatchHistory(userMatches.map(m => {
        const isP1 = m.player1_id === user.id;
        const opponentId = isP1 ? m.player2_id : m.player1_id;
        const won = m.winner_id === user.id;
        return {
          opponent: opponentId ? nameMap[opponentId] || "Unknown" : "BYE",
          score: `${m.player1_score} - ${m.player2_score}`,
          won,
          earnings: won ? 0 : 0, // Could be calculated from tournament data
          date: m.completed_at ? new Date(m.completed_at).toLocaleDateString() : "—",
        };
      }).reverse());
    }
  };

  const loadLiveMatches = async (tournamentId: string) => {
    const { data } = await supabase
      .from("matches")
      .select("*")
      .eq("tournament_id", tournamentId)
      .eq("status", "live");

    if (data && data.length > 0) {
      const playerIds = new Set<string>();
      data.forEach((m: any) => {
        if (m.player1_id) playerIds.add(m.player1_id);
        if (m.player2_id) playerIds.add(m.player2_id);
      });
      const { data: profiles } = await supabase.from("profiles").select("user_id, username").in("user_id", Array.from(playerIds));
      const nameMap = (profiles || []).reduce((acc, p) => { acc[p.user_id] = p.username || "Unknown"; return acc; }, {} as Record<string, string>);

      setLiveMatches(data.map((m: any) => ({
        ...m,
        player1_name: m.player1_id ? nameMap[m.player1_id] || "Unknown" : "TBD",
        player2_name: m.player2_id ? nameMap[m.player2_id] || "Unknown" : "TBD",
      })));
    } else {
      setLiveMatches([]);
    }
  };

  const loadLeaderboard = async () => {
    const { data } = await supabase
      .from("tournament_participants")
      .select("user_id, points_earned");

    if (!data) return;

    // Aggregate by user
    const userAgg: Record<string, { points: number; count: number }> = {};
    data.forEach(p => {
      if (!userAgg[p.user_id]) userAgg[p.user_id] = { points: 0, count: 0 };
      userAgg[p.user_id].points += p.points_earned || 0;
      userAgg[p.user_id].count += 1;
    });

    const userIds = Object.keys(userAgg);
    const { data: profiles } = await supabase.from("profiles").select("user_id, username").in("user_id", userIds);
    const nameMap = (profiles || []).reduce((acc, p) => { acc[p.user_id] = p.username || "Unknown"; return acc; }, {} as Record<string, string>);

    const sorted = Object.entries(userAgg)
      .sort(([, a], [, b]) => b.points - a.points)
      .map(([userId, agg], i) => ({
        rank: i + 1,
        gamerTag: nameMap[userId] || "Unknown",
        wins: agg.count,
        earnings: agg.points,
        isCurrentUser: userId === user?.id,
      }));

    setLeaderboard(sorted.slice(0, 20));
  };

  const handleJoin = async (tournamentId: string) => {
    if (!user) return;
    setJoiningId(tournamentId);
    const success = await joinTournament(tournamentId, user.id);
    if (success) setJoinedMap(prev => ({ ...prev, [tournamentId]: true }));
    setJoiningId(null);
  };

  const STATS_DISPLAY = [
    { icon: Trophy, label: "Tournaments", value: String(stats.tournaments), color: "text-primary", bg: "bg-primary/10" },
    { icon: Target, label: "Win Rate", value: stats.winRate, color: "text-neon-green", bg: "bg-neon-green/10" },
    { icon: Coins, label: "Earnings", value: stats.earnings, color: "text-primary", bg: "bg-primary/10" },
    { icon: TrendingUp, label: "Rank", value: stats.rank, color: "text-accent", bg: "bg-accent/10" },
  ];

  const activeLiveTournament = liveTournaments.find(t => t.id === liveTournamentId) || liveTournaments[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-gold bg-clip-text text-transparent">My Tournaments</h1>
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
          <Trophy className="h-4 w-4 mr-1" /> Find Tournaments
        </Button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {STATS_DISPLAY.map((stat, i) => (
          <Card key={stat.label} className="stat-card p-4 bg-card border-border animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bg}`}><stat.icon className={`h-5 w-5 ${stat.color}`} /></div>
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="live" className="w-full">
        <TabsList className="bg-secondary/50 w-full sm:w-auto">
          <TabsTrigger value="live" className="gap-1.5"><Zap className="h-3.5 w-3.5" /> Live</TabsTrigger>
          <TabsTrigger value="upcoming" className="gap-1.5"><Calendar className="h-3.5 w-3.5" /> Upcoming</TabsTrigger>
          <TabsTrigger value="history" className="gap-1.5"><Gamepad2 className="h-3.5 w-3.5" /> History</TabsTrigger>
          <TabsTrigger value="leaderboard" className="gap-1.5"><Trophy className="h-3.5 w-3.5" /> Leaderboard</TabsTrigger>
        </TabsList>

        {/* Live */}
        <TabsContent value="live" className="mt-6 space-y-4">
          {activeLiveTournament ? (
            <Card className="glass-card border-primary/30 overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <Badge className="bg-destructive/90 text-destructive-foreground border-0 mb-2 text-[10px] animate-pulse">LIVE NOW</Badge>
                    <CardTitle className="text-xl bg-gradient-gold bg-clip-text text-transparent">{activeLiveTournament.name}</CardTitle>
                  </div>
                  <Badge variant="outline" className="text-accent border-accent/50">{activeLiveTournament.game}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div><p className="text-xs text-muted-foreground">Prize Pool</p><p className="font-bold text-primary">{activeLiveTournament.prize_pool?.toLocaleString()} GZC</p></div>
                  <div><p className="text-xs text-muted-foreground">Players</p><p className="font-bold text-foreground">{activeLiveTournament.participants || 0}/{activeLiveTournament.max_participants}</p></div>
                  <div><p className="text-xs text-muted-foreground">Game</p><p className="font-bold text-neon-green">{activeLiveTournament.game}</p></div>
                </div>

                {liveMatches.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Live Matches</p>
                    {liveMatches.map((m) => (
                      <LiveMatchTicker
                        key={m.id}
                        player1={m.player1_name}
                        player2={m.player2_name}
                        score1={m.player1_score}
                        score2={m.player2_score}
                        startMinute={m.started_at ? Math.floor((Date.now() - new Date(m.started_at).getTime()) / 60000) : 0}
                      />
                    ))}
                  </div>
                )}

                {liveMatches.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground text-sm">No live matches right now</div>
                )}

                <Button variant="outline" size="sm" className="w-full border-accent/30 text-accent hover:bg-accent/10" onClick={() => setBracketOpen(!bracketOpen)}>
                  {bracketOpen ? <><ChevronUp className="h-4 w-4 mr-1" /> Hide Bracket</> : <><ChevronDown className="h-4 w-4 mr-1" /> View Full Bracket</>}
                </Button>
                {bracketOpen && (
                  <div className="animate-scale-in">
                    <TournamentBracket tournamentId={activeLiveTournament.id} />
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="glass-card border-border">
              <CardContent className="py-12 text-center">
                <Zap className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                <p className="text-muted-foreground">No live tournaments right now</p>
                <Button variant="outline" className="mt-4" onClick={() => navigate("/tournaments")}>Browse Tournaments</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Upcoming */}
        <TabsContent value="upcoming" className="mt-6">
          {upcomingTournaments.length === 0 ? (
            <Card className="glass-card border-border">
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                <p className="text-muted-foreground">No upcoming tournaments</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingTournaments.map((t, i) => (
                <Card key={t.id} className="glass-card border-border hover:border-primary/40 transition-all duration-300 animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                  <CardContent className="p-5 space-y-4">
                    <div>
                      <h3 className="font-bold text-foreground">{t.name}</h3>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <Gamepad2 className="h-3 w-3" /> {t.game}
                      </div>
                    </div>
                    <CountdownTimer targetDate={new Date(t.start_date)} />
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><p className="text-muted-foreground">Entry Fee</p><p className="font-semibold text-foreground">{t.entry_fee} GZC</p></div>
                      <div><p className="text-muted-foreground">Prize Pool</p><p className="font-semibold text-primary">{t.prize_pool?.toLocaleString()} GZC</p></div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">{t.participants || 0}/{t.max_participants} spots</span>
                        <span className="text-muted-foreground">{Math.round(((t.participants || 0) / (t.max_participants || 1)) * 100)}%</span>
                      </div>
                      <Progress value={((t.participants || 0) / (t.max_participants || 1)) * 100} className="h-1.5" />
                    </div>
                    <Button
                      variant="neon" size="sm" className="w-full"
                      disabled={joiningId === t.id || joinedMap[t.id]}
                      onClick={() => handleJoin(t.id)}
                    >
                      {joinedMap[t.id] ? "Already Joined ✓" : joiningId === t.id ? "Joining..." : "Register Now"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* History */}
        <TabsContent value="history" className="mt-6">
          <Card className="glass-card">
            <CardContent className="p-0">
              {matchHistory.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <Gamepad2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                  <p>No match history yet. Join a tournament to get started!</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50 hover:bg-transparent">
                      <TableHead className="text-muted-foreground">Date</TableHead>
                      <TableHead className="text-muted-foreground">Opponent</TableHead>
                      <TableHead className="text-muted-foreground text-center">Score</TableHead>
                      <TableHead className="text-muted-foreground text-center">Result</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {matchHistory.map((m, i) => (
                      <TableRow key={i} className={`border-border/30 animate-slide-up ${m.won ? "bg-neon-green/[0.03]" : "bg-destructive/[0.03]"}`} style={{ animationDelay: `${i * 60}ms` }}>
                        <TableCell className="text-xs text-muted-foreground">{m.date}</TableCell>
                        <TableCell className="font-medium text-foreground">{m.opponent}</TableCell>
                        <TableCell className="text-center font-mono text-sm text-foreground">{m.score}</TableCell>
                        <TableCell className="text-center">
                          <Badge className={m.won ? "bg-neon-green/20 text-neon-green border-neon-green/30" : "bg-destructive/20 text-destructive border-destructive/30"}>
                            {m.won ? "W" : "L"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leaderboard */}
        <TabsContent value="leaderboard" className="mt-6">
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-foreground flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" /> Top Players
              </CardTitle>
            </CardHeader>
            <CardContent>
              {leaderboard.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">No leaderboard data yet</div>
              ) : (
                <TournamentLeaderboard entries={leaderboard} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardTournaments;
