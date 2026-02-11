import { useState, useEffect } from "react";
import { Trophy, Crown, Swords, Radio } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import MatchDetailsModal from "./MatchDetailsModal";

interface MatchData {
  id: string;
  tournament_id: string;
  round: number;
  match_order: number;
  player1_id: string | null;
  player2_id: string | null;
  player1_score: number;
  player2_score: number;
  winner_id: string | null;
  status: string;
}

interface DisplayMatch {
  id: string;
  player1: { name: string; score: number; winner?: boolean };
  player2: { name: string; score: number; winner?: boolean };
  status: string;
}

interface BracketRound {
  name: string;
  matches: DisplayMatch[];
}

const MatchCard = ({ match, isFinal, onClick }: { match: DisplayMatch; isFinal?: boolean; onClick: () => void }) => (
  <div
    onClick={onClick}
    className={cn(
      "relative bg-card/80 backdrop-blur-sm border rounded-lg p-3 min-w-[200px] cursor-pointer transition-all duration-300",
      match.status === "live" ? "border-neon-green/50 shadow-[0_0_15px_hsl(142_70%_45%/0.2)]" :
      isFinal ? "border-primary shadow-glow-gold hover:shadow-[0_0_30px_hsl(45_100%_50%/0.5)]" :
      "border-border hover:border-accent hover:shadow-glow-cyan"
    )}
  >
    {isFinal && <div className="absolute -top-3 left-1/2 -translate-x-1/2"><Crown className="w-6 h-6 text-primary animate-pulse" /></div>}
    {match.status === "live" && (
      <Badge className="absolute -top-2 right-2 bg-neon-green/20 text-neon-green border-neon-green/30 text-[10px] animate-pulse gap-1">
        <Radio className="h-2.5 w-2.5" />LIVE
      </Badge>
    )}
    <div className={cn("flex items-center justify-between py-1.5 px-2 rounded transition-colors", match.player1.winner ? "bg-neon-green/20 text-neon-green" : "text-muted-foreground")}>
      <span className={cn("font-medium text-sm", match.player1.winner && "font-bold")}>{match.player1.name}</span>
      <span className="font-bold">{match.player1.score}</span>
    </div>
    <div className="flex items-center justify-center my-1"><Swords className="w-3 h-3 text-muted-foreground/50" /></div>
    <div className={cn("flex items-center justify-between py-1.5 px-2 rounded transition-colors", match.player2.winner ? "bg-neon-green/20 text-neon-green" : "text-muted-foreground")}>
      <span className={cn("font-medium text-sm", match.player2.winner && "font-bold")}>{match.player2.name}</span>
      <span className="font-bold">{match.player2.score}</span>
    </div>
    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-background/60 rounded-lg">
      <span className="text-xs text-foreground font-medium">View Details</span>
    </div>
  </div>
);

interface TournamentBracketProps {
  tournamentId?: string;
}

const TournamentBracket = ({ tournamentId }: TournamentBracketProps) => {
  const [rounds, setRounds] = useState<BracketRound[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<{ match: DisplayMatch; round: string } | null>(null);

  useEffect(() => {
    if (!tournamentId) { setLoading(false); return; }
    loadBracket();

    const channel = supabase
      .channel(`bracket-${tournamentId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "matches", filter: `tournament_id=eq.${tournamentId}` }, () => loadBracket())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [tournamentId]);

  const loadBracket = async () => {
    if (!tournamentId) return;
    const { data, error } = await supabase
      .from("matches")
      .select("*")
      .eq("tournament_id", tournamentId)
      .order("round")
      .order("match_order");

    if (error || !data || data.length === 0) { setLoading(false); return; }

    const playerIds = new Set<string>();
    data.forEach((m: any) => {
      if (m.player1_id) playerIds.add(m.player1_id);
      if (m.player2_id) playerIds.add(m.player2_id);
    });

    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, username")
      .in("user_id", Array.from(playerIds));

    const nameMap = (profiles || []).reduce((acc, p) => { acc[p.user_id] = p.username || "Unknown"; return acc; }, {} as Record<string, string>);

    const totalRounds = Math.max(...data.map((m: any) => m.round));
    const bracketRounds: BracketRound[] = [];

    for (let r = 1; r <= totalRounds; r++) {
      const roundMatches = data.filter((m: any) => m.round === r);
      let name = `Round ${r}`;
      if (r === totalRounds) name = "Final";
      else if (r === totalRounds - 1) name = "Semi Finals";
      else if (r === totalRounds - 2) name = "Quarter Finals";

      bracketRounds.push({
        name,
        matches: roundMatches.map((m: any) => ({
          id: m.id,
          status: m.status,
          player1: {
            name: m.player1_id ? nameMap[m.player1_id] || "Unknown" : "TBD",
            score: m.player1_score,
            winner: m.winner_id === m.player1_id && m.winner_id !== null,
          },
          player2: {
            name: m.player2_id ? nameMap[m.player2_id] || "Unknown" : "TBD",
            score: m.player2_score,
            winner: m.winner_id === m.player2_id && m.winner_id !== null,
          },
        })),
      });
    }

    setRounds(bracketRounds);
    setLoading(false);
  };

  if (!tournamentId) {
    return (
      <div className="glass-card p-6 rounded-xl text-center text-muted-foreground">
        <Trophy className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
        <p>No bracket available yet</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (rounds.length === 0) {
    return (
      <div className="glass-card p-6 rounded-xl text-center text-muted-foreground">
        <Trophy className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
        <p>Bracket not generated yet</p>
      </div>
    );
  }

  const finalRound = rounds[rounds.length - 1];
  const finalMatch = finalRound?.matches[0];
  const champion = finalMatch?.status === "completed"
    ? (finalMatch.player1.winner ? finalMatch.player1.name : finalMatch.player2.name)
    : null;

  return (
    <>
      <div className="glass-card p-6 rounded-xl">
        <div className="flex items-center gap-3 mb-6">
          <Trophy className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold bg-gradient-gold bg-clip-text text-transparent">Tournament Bracket</h2>
        </div>

        {champion && (
          <div className="mb-8 p-4 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-lg border border-primary/30 text-center">
            <Crown className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-1">Champion</p>
            <p className="text-2xl font-bold text-primary neon-text">{champion}</p>
          </div>
        )}

        <div className="overflow-x-auto pb-4">
          <div className="flex gap-8 min-w-max">
            {rounds.map((round) => (
              <div key={round.name} className="flex flex-col">
                <h3 className="text-sm font-semibold text-neon-cyan mb-4 text-center">{round.name}</h3>
                <div className="flex flex-col gap-4 justify-around flex-1">
                  {round.matches.map((match) => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      isFinal={round.name === "Final"}
                      onClick={() => setSelectedMatch({ match, round: round.name })}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6 mt-6 pt-4 border-t border-border/50 text-sm">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-neon-green/50" /><span className="text-muted-foreground">Winner</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-muted" /><span className="text-muted-foreground">Pending</span></div>
          <div className="flex items-center gap-2 ml-auto text-xs text-muted-foreground">Click any match for details</div>
        </div>
      </div>

      {selectedMatch && (
        <MatchDetailsModal
          open={!!selectedMatch}
          onOpenChange={(open) => !open && setSelectedMatch(null)}
          matchId={selectedMatch.match.id}
          player1={selectedMatch.match.player1}
          player2={selectedMatch.match.player2}
          round={selectedMatch.round}
        />
      )}
    </>
  );
};

export default TournamentBracket;
