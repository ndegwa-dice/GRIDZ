import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Users, Coins, Calendar, Gamepad2, Radio, ArrowLeft, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import TournamentBracket from "@/components/TournamentBracket";
import LiveMatchTicker from "@/components/dashboard/LiveMatchTicker";

interface Tournament {
  id: string;
  name: string;
  game: string;
  status: string | null;
  prize_pool: number | null;
  entry_fee: number | null;
  max_participants: number | null;
  current_participants: number | null;
  start_date: string;
  image_url: string | null;
}

interface LiveMatch {
  id: string;
  player1_name: string;
  player2_name: string;
  player1_score: number;
  player2_score: number;
  started_at: string | null;
}

const TournamentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [liveMatches, setLiveMatches] = useState<LiveMatch[]>([]);
  const [joined, setJoined] = useState(false);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (!id) return;
    loadTournament();
    loadLiveMatches();
    checkJoined();

    const channel = supabase
      .channel(`tournament-detail-${id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "matches", filter: `tournament_id=eq.${id}` }, () => loadLiveMatches())
      .on("postgres_changes", { event: "*", schema: "public", table: "tournaments", filter: `id=eq.${id}` }, () => loadTournament())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [id, user]);

  const loadTournament = async () => {
    const { data, error } = await supabase.from("tournaments").select("*").eq("id", id!).single();
    if (!error && data) setTournament(data);
    setLoading(false);
  };

  const loadLiveMatches = async () => {
    const { data } = await supabase.from("matches").select("*").eq("tournament_id", id!).eq("status", "live");
    if (!data || data.length === 0) { setLiveMatches([]); return; }

    const playerIds = new Set<string>();
    data.forEach(m => { if (m.player1_id) playerIds.add(m.player1_id); if (m.player2_id) playerIds.add(m.player2_id); });
    const { data: profiles } = await supabase.from("profiles").select("user_id, username").in("user_id", Array.from(playerIds));
    const nameMap = (profiles || []).reduce((acc, p) => { acc[p.user_id] = p.username || "Unknown"; return acc; }, {} as Record<string, string>);

    setLiveMatches(data.map(m => ({
      id: m.id,
      player1_name: m.player1_id ? nameMap[m.player1_id] || "Unknown" : "TBD",
      player2_name: m.player2_id ? nameMap[m.player2_id] || "Unknown" : "TBD",
      player1_score: m.player1_score,
      player2_score: m.player2_score,
      started_at: m.started_at,
    })));
  };

  const checkJoined = async () => {
    if (!user || !id) return;
    const { data } = await supabase.from("tournament_participants").select("id").eq("tournament_id", id).eq("user_id", user.id).maybeSingle();
    setJoined(!!data);
  };

  const handleJoin = async () => {
    if (!user) { toast({ title: "Login Required", description: "Please log in to join.", variant: "destructive" }); return; }
    if (!id) return;
    setJoining(true);
    const { error } = await supabase.rpc("join_tournament", { p_tournament_id: id, p_user_id: user.id });
    if (error) { toast({ title: "Failed to join", description: error.message, variant: "destructive" }); }
    else { toast({ title: "Joined!", description: "You've joined the tournament." }); setJoined(true); loadTournament(); }
    setJoining(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "live": return <Badge className="bg-neon-green text-background animate-pulse gap-1"><Radio className="h-3 w-3" />LIVE</Badge>;
      case "upcoming": return <Badge className="bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30">Upcoming</Badge>;
      case "completed": return <Badge className="bg-muted text-muted-foreground">Completed</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-20 space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-20 text-center">
          <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Tournament Not Found</h1>
          <p className="text-muted-foreground mb-6">This tournament doesn't exist or has been removed.</p>
          <Button onClick={() => navigate("/tournaments")} variant="outline">Back to Tournaments</Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="fixed inset-0 gaming-mesh opacity-30" />
      <div className="fixed top-1/4 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="fixed bottom-1/4 -right-32 w-96 h-96 bg-neon-cyan/20 rounded-full blur-3xl animate-pulse animation-delay-500" />

      <Navbar />

      <div className="relative z-10 pt-24 pb-20">
        <div className="container mx-auto px-4">
          {/* Back button */}
          <Button variant="ghost" size="sm" className="mb-6 text-muted-foreground hover:text-foreground" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>

          {/* Tournament Header */}
          <div className="mb-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  {getStatusBadge(tournament.status || "upcoming")}
                  <Badge variant="outline" className="text-accent border-accent/50">{tournament.game}</Badge>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-gold bg-clip-text text-transparent">{tournament.name}</h1>
              </div>
              {tournament.status === "upcoming" && (
                <Button variant="hero" size="lg" disabled={joining || joined} onClick={handleJoin}>
                  {joined ? "Already Joined ✓" : joining ? "Joining..." : "Join Tournament"}
                </Button>
              )}
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="glass-card">
                <CardContent className="p-4 text-center">
                  <Coins className="w-5 h-5 text-primary mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">Entry Fee</p>
                  <p className="font-bold text-foreground">{tournament.entry_fee} GZC</p>
                </CardContent>
              </Card>
              <Card className="glass-card">
                <CardContent className="p-4 text-center">
                  <Trophy className="w-5 h-5 text-neon-cyan mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">Prize Pool</p>
                  <p className="font-bold text-neon-cyan">{tournament.prize_pool?.toLocaleString()} GZC</p>
                </CardContent>
              </Card>
              <Card className="glass-card">
                <CardContent className="p-4 text-center">
                  <Users className="w-5 h-5 text-neon-green mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">Players</p>
                  <p className="font-bold text-foreground">{tournament.current_participants || 0}/{tournament.max_participants}</p>
                </CardContent>
              </Card>
              <Card className="glass-card">
                <CardContent className="p-4 text-center">
                  <Calendar className="w-5 h-5 text-primary mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">Start Date</p>
                  <p className="font-bold text-foreground text-sm">{new Date(tournament.start_date).toLocaleDateString()}</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Live Matches Feed */}
          {liveMatches.length > 0 && (
            <div className="mb-8 animate-fade-in animation-delay-100">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-neon-green" />
                <h2 className="text-xl font-semibold text-foreground">Live Matches</h2>
                <Badge className="bg-destructive/90 text-destructive-foreground border-0 text-[10px] animate-pulse">LIVE</Badge>
              </div>
              <div className="space-y-2">
                {liveMatches.map(m => (
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
            </div>
          )}

          {/* Full Bracket - always visible */}
          {(tournament.status === "live" || tournament.status === "completed") && (
            <div className="animate-fade-in animation-delay-200">
              <TournamentBracket tournamentId={tournament.id} />
            </div>
          )}

          {tournament.status === "upcoming" && (
            <Card className="glass-card border-border">
              <CardContent className="py-12 text-center">
                <Gamepad2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                <p className="text-muted-foreground">Bracket will be generated once the tournament goes live.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TournamentDetail;
