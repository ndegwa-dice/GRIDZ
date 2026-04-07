import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, Gamepad2, TrendingUp, Clock, Swords, Calendar, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface MatchDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matchId: string;
  player1: { name: string; score: number; winner?: boolean };
  player2: { name: string; score: number; winner?: boolean };
  round: string;
}

interface MatchEvent {
  id: string;
  event_type: string;
  minute: number;
  description: string | null;
  user_id: string | null;
  created_at: string;
}

interface MatchRecord {
  id: string;
  player1_score: number;
  player2_score: number;
  winner_id: string | null;
  status: string;
  started_at: string | null;
  completed_at: string | null;
  player1_id: string | null;
  player2_id: string | null;
  round: number;
  match_order: number;
}

interface PlayerProfile {
  gamesPlayed: number;
  wins: number;
  winRate: number;
}

const EventIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "goal": return <span className="text-neon-green">⚽</span>;
    case "yellow_card": return <span className="text-primary">🟨</span>;
    case "red_card": return <span className="text-destructive">🟥</span>;
    case "substitution": return <span>🔄</span>;
    case "start": return <span className="text-neon-cyan">▶</span>;
    case "end": return <span className="text-muted-foreground">⏹</span>;
    default: return <span>📌</span>;
  }
};

const StatComparison = ({ label, value1, value2, suffix = "" }: { label: string; value1: number; value2: number; suffix?: string }) => {
  const total = value1 + value2;
  const percent1 = total > 0 ? (value1 / total) * 100 : 50;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className={cn(value1 > value2 ? "text-neon-green font-semibold" : "text-muted-foreground")}>{value1}{suffix}</span>
        <span className="text-muted-foreground text-xs">{label}</span>
        <span className={cn(value2 > value1 ? "text-neon-green font-semibold" : "text-muted-foreground")}>{value2}{suffix}</span>
      </div>
      <div className="flex h-2 rounded-full overflow-hidden bg-muted">
        <div className="bg-neon-cyan transition-all duration-500" style={{ width: `${percent1}%` }} />
        <div className="bg-neon-pink transition-all duration-500" style={{ width: `${100 - percent1}%` }} />
      </div>
    </div>
  );
};

const PlayerCard = ({ name, profile, score, winner, color }: {
  name: string; profile: PlayerProfile | null; score: number; winner?: boolean; color: "cyan" | "pink";
}) => {
  const colorClasses = color === "cyan" ? "border-neon-cyan/30 bg-neon-cyan/5" : "border-neon-pink/30 bg-neon-pink/5";

  return (
    <div className={cn("glass-card rounded-lg p-4 border", colorClasses)}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className={cn("font-bold", winner ? "text-neon-green" : "text-foreground")}>{name}</h4>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">{score}</p>
          {winner && <Badge className="bg-neon-green/20 text-neon-green text-xs">Winner</Badge>}
        </div>
      </div>
      {profile ? (
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="glass-card p-2 rounded">
            <Gamepad2 className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Games</p>
            <p className="font-semibold">{profile.gamesPlayed}</p>
          </div>
          <div className="glass-card p-2 rounded">
            <TrendingUp className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Win Rate</p>
            <p className="font-semibold text-neon-green">{profile.winRate}%</p>
          </div>
          <div className="glass-card p-2 rounded">
            <Trophy className="w-4 h-4 mx-auto mb-1 text-primary" />
            <p className="text-xs text-muted-foreground">Wins</p>
            <p className="font-semibold">{profile.wins}</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          <Skeleton className="h-16 rounded" />
          <Skeleton className="h-16 rounded" />
          <Skeleton className="h-16 rounded" />
        </div>
      )}
    </div>
  );
};

export const MatchDetailsModal = ({ open, onOpenChange, matchId, player1, player2, round }: MatchDetailsModalProps) => {
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [matchRecord, setMatchRecord] = useState<MatchRecord | null>(null);
  const [player1Profile, setPlayer1Profile] = useState<PlayerProfile | null>(null);
  const [player2Profile, setPlayer2Profile] = useState<PlayerProfile | null>(null);

  // Use real DB scores if available, fallback to props
  const realPlayer1 = matchRecord ? {
    name: player1.name,
    score: matchRecord.player1_score,
    winner: matchRecord.winner_id !== null && matchRecord.winner_id === matchRecord.player1_id,
  } : player1;

  const realPlayer2 = matchRecord ? {
    name: player2.name,
    score: matchRecord.player2_score,
    winner: matchRecord.winner_id !== null && matchRecord.winner_id === matchRecord.player2_id,
  } : player2;

  useEffect(() => {
    if (!open || !matchId) return;
    loadMatchData();

    const channel = supabase
      .channel(`match-details-${matchId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "match_events", filter: `match_id=eq.${matchId}` }, () => loadMatchData())
      .on("postgres_changes", { event: "*", schema: "public", table: "matches", filter: `id=eq.${matchId}` }, () => loadMatchData())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [open, matchId]);

  const loadMatchData = async () => {
    setLoadingEvents(true);

    // Fetch match record and events in parallel
    const [matchRes, eventsRes] = await Promise.all([
      supabase.from("matches").select("*").eq("id", matchId).single(),
      supabase.from("match_events").select("*").eq("match_id", matchId).order("minute", { ascending: true }),
    ]);

    setEvents(eventsRes.data || []);
    setLoadingEvents(false);

    const match = matchRes.data;
    if (!match) return;
    setMatchRecord(match as MatchRecord);

    // Load player profiles in parallel
    if (match.player1_id) loadPlayerProfile(match.player1_id, setPlayer1Profile);
    if (match.player2_id) loadPlayerProfile(match.player2_id, setPlayer2Profile);
  };

  const loadPlayerProfile = async (userId: string, setter: (p: PlayerProfile) => void) => {
    const { data: matches } = await supabase
      .from("matches")
      .select("winner_id")
      .or(`player1_id.eq.${userId},player2_id.eq.${userId}`)
      .eq("status", "completed");

    const gamesPlayed = matches?.length || 0;
    const wins = matches?.filter(m => m.winner_id === userId).length || 0;
    const winRate = gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * 100) : 0;
    setter({ gamesPlayed, wins, winRate });
  };

  const formatDate = (date: string | null) => {
    if (!date) return null;
    return new Date(date).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const matchDuration = matchRecord?.started_at && matchRecord?.completed_at
    ? Math.round((new Date(matchRecord.completed_at).getTime() - new Date(matchRecord.started_at).getTime()) / 60000)
    : null;

  const statusLabel = matchRecord?.status === "completed" ? "Completed" : matchRecord?.status === "live" ? "Live" : "Pending";
  const statusColor = matchRecord?.status === "completed" ? "bg-neon-green/20 text-neon-green border-neon-green/30"
    : matchRecord?.status === "live" ? "bg-destructive/20 text-destructive border-destructive/30"
    : "bg-muted text-muted-foreground border-border";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto glass-card border-border">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Swords className="w-5 h-5 text-primary" />
              <span className="bg-gradient-gold bg-clip-text text-transparent">Match Details</span>
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Badge className={cn("text-xs", statusColor)}>{statusLabel}</Badge>
              <Badge variant="outline" className="text-neon-cyan border-neon-cyan">{round}</Badge>
            </div>
          </div>
        </DialogHeader>

        {/* Score Header - uses real DB scores */}
        <div className="flex items-center justify-center gap-4 py-4 border-y border-border/50">
          <div className="text-center flex-1">
            <p className={cn("font-bold text-lg", realPlayer1.winner && "text-neon-green")}>{realPlayer1.name}</p>
          </div>
          <div className="flex items-center gap-3 px-6 py-3 glass-card rounded-lg">
            <span className={cn("text-3xl font-bold", realPlayer1.winner && "text-neon-green")}>{realPlayer1.score}</span>
            <span className="text-muted-foreground">-</span>
            <span className={cn("text-3xl font-bold", realPlayer2.winner && "text-neon-green")}>{realPlayer2.score}</span>
          </div>
          <div className="text-center flex-1">
            <p className={cn("font-bold text-lg", realPlayer2.winner && "text-neon-green")}>{realPlayer2.name}</p>
          </div>
        </div>

        {/* Match Info Bar - real data from DB */}
        {matchRecord && (matchRecord.status === "completed" || matchRecord.status === "live") && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-3">
            {matchRecord.started_at && (
              <div className="glass-card p-3 rounded-lg text-center">
                <Calendar className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                <p className="text-[10px] text-muted-foreground uppercase">Started</p>
                <p className="text-xs font-medium text-foreground">{formatDate(matchRecord.started_at)}</p>
              </div>
            )}
            {matchRecord.completed_at && (
              <div className="glass-card p-3 rounded-lg text-center">
                <CheckCircle className="w-4 h-4 mx-auto mb-1 text-neon-green" />
                <p className="text-[10px] text-muted-foreground uppercase">Finished</p>
                <p className="text-xs font-medium text-foreground">{formatDate(matchRecord.completed_at)}</p>
              </div>
            )}
            {matchDuration !== null && (
              <div className="glass-card p-3 rounded-lg text-center">
                <Clock className="w-4 h-4 mx-auto mb-1 text-neon-cyan" />
                <p className="text-[10px] text-muted-foreground uppercase">Duration</p>
                <p className="text-xs font-medium text-foreground">{matchDuration} min</p>
              </div>
            )}
          </div>
        )}

        {/* Winner Banner */}
        {matchRecord?.status === "completed" && (realPlayer1.winner || realPlayer2.winner) && (
          <div className="p-3 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-lg border border-primary/30 text-center">
            <Trophy className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Winner</p>
            <p className="text-lg font-bold text-primary">{realPlayer1.winner ? realPlayer1.name : realPlayer2.name}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Final Score: {realPlayer1.score} - {realPlayer2.score}
            </p>
          </div>
        )}

        {/* Match Events Timeline */}
        <div className="py-4">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-neon-cyan" />
            <h3 className="font-semibold">Match Events</h3>
          </div>
          {loadingEvents ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-3/4" />
            </div>
          ) : events.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No events recorded yet</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {events.map(event => (
                <div key={event.id} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/30 text-sm">
                  <span className="text-xs font-mono text-neon-green w-8 shrink-0">{event.minute}'</span>
                  <EventIcon type={event.event_type} />
                  <span className="text-foreground capitalize">{event.event_type.replace("_", " ")}</span>
                  {event.description && <span className="text-muted-foreground text-xs ml-auto truncate max-w-[150px]">{event.description}</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Player Stats Comparison */}
        {player1Profile && player2Profile && (
          <div className="space-y-3 py-4 border-t border-border/50">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-4 h-4 text-neon-cyan" />
              <h3 className="font-semibold">Player Comparison</h3>
            </div>
            <StatComparison label="Win Rate" value1={player1Profile.winRate} value2={player2Profile.winRate} suffix="%" />
            <StatComparison label="Total Games" value1={player1Profile.gamesPlayed} value2={player2Profile.gamesPlayed} />
            <StatComparison label="Total Wins" value1={player1Profile.wins} value2={player2Profile.wins} />
          </div>
        )}

        {/* Player Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border/50">
          <PlayerCard name={realPlayer1.name} profile={player1Profile} score={realPlayer1.score} winner={realPlayer1.winner} color="cyan" />
          <PlayerCard name={realPlayer2.name} profile={player2Profile} score={realPlayer2.score} winner={realPlayer2.winner} color="pink" />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MatchDetailsModal;
