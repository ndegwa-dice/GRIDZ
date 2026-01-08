import { useState } from "react";
import { Trophy, Crown, Swords } from "lucide-react";
import { cn } from "@/lib/utils";
import MatchDetailsModal from "./MatchDetailsModal";

interface Match {
  id: string;
  player1: { name: string; score: number; winner?: boolean };
  player2: { name: string; score: number; winner?: boolean };
  penalties?: string;
}

interface BracketRound {
  name: string;
  matches: Match[];
}

const bracketData: BracketRound[] = [
  {
    name: "Round of 16",
    matches: [
      { id: "r16-1", player1: { name: "KenyanKing254", score: 3, winner: true }, player2: { name: "NairobiNinja", score: 1 } },
      { id: "r16-2", player1: { name: "MombasaMaster", score: 2 }, player2: { name: "KisumuKiller", score: 2, winner: true }, penalties: "(4-3 pen)" },
      { id: "r16-3", player1: { name: "ElDoretEagle", score: 4, winner: true }, player2: { name: "ThikaThunder", score: 0 } },
      { id: "r16-4", player1: { name: "NakuruNemesis", score: 2, winner: true }, player2: { name: "MeruMaverick", score: 1 } },
      { id: "r16-5", player1: { name: "LakeVictoriaLegend", score: 3, winner: true }, player2: { name: "RiftValleyRaider", score: 2 } },
      { id: "r16-6", player1: { name: "CoastalCrusader", score: 1, winner: true }, player2: { name: "SafariStriker", score: 0 } },
      { id: "r16-7", player1: { name: "MaasaiMenace", score: 2 }, player2: { name: "KerichoKing", score: 3, winner: true } },
      { id: "r16-8", player1: { name: "NyeriNinja", score: 1 }, player2: { name: "GarissaGamer", score: 2, winner: true } },
    ],
  },
  {
    name: "Quarter Finals",
    matches: [
      { id: "qf-1", player1: { name: "KenyanKing254", score: 2, winner: true }, player2: { name: "KisumuKiller", score: 1 } },
      { id: "qf-2", player1: { name: "ElDoretEagle", score: 3, winner: true }, player2: { name: "NakuruNemesis", score: 2 } },
      { id: "qf-3", player1: { name: "LakeVictoriaLegend", score: 2, winner: true }, player2: { name: "CoastalCrusader", score: 1 } },
      { id: "qf-4", player1: { name: "KerichoKing", score: 0 }, player2: { name: "GarissaGamer", score: 1, winner: true } },
    ],
  },
  {
    name: "Semi Finals",
    matches: [
      { id: "sf-1", player1: { name: "KenyanKing254", score: 1, winner: true }, player2: { name: "ElDoretEagle", score: 0 } },
      { id: "sf-2", player1: { name: "LakeVictoriaLegend", score: 2, winner: true }, player2: { name: "GarissaGamer", score: 1 } },
    ],
  },
  {
    name: "Final",
    matches: [
      { id: "final", player1: { name: "KenyanKing254", score: 3, winner: true }, player2: { name: "LakeVictoriaLegend", score: 2 } },
    ],
  },
];

const MatchCard = ({ 
  match, 
  isFinal, 
  onClick 
}: { 
  match: Match; 
  isFinal?: boolean;
  onClick: () => void;
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative bg-card/80 backdrop-blur-sm border rounded-lg p-3 min-w-[200px] cursor-pointer transition-all duration-300",
        isFinal 
          ? "border-primary shadow-glow-gold hover:shadow-[0_0_30px_hsl(45_100%_50%/0.5)]" 
          : "border-border hover:border-accent hover:shadow-glow-cyan"
      )}
    >
      {isFinal && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Crown className="w-6 h-6 text-primary animate-pulse" />
        </div>
      )}
      
      {/* Player 1 */}
      <div
        className={cn(
          "flex items-center justify-between py-1.5 px-2 rounded transition-colors",
          match.player1.winner ? "bg-neon-green/20 text-neon-green" : "text-muted-foreground"
        )}
      >
        <span className={cn("font-medium text-sm", match.player1.winner && "font-bold")}>
          {match.player1.name}
        </span>
        <span className="font-bold">{match.player1.score}</span>
      </div>

      {/* VS Divider */}
      <div className="flex items-center justify-center my-1">
        <Swords className="w-3 h-3 text-muted-foreground/50" />
      </div>

      {/* Player 2 */}
      <div
        className={cn(
          "flex items-center justify-between py-1.5 px-2 rounded transition-colors",
          match.player2.winner ? "bg-neon-green/20 text-neon-green" : "text-muted-foreground"
        )}
      >
        <span className={cn("font-medium text-sm", match.player2.winner && "font-bold")}>
          {match.player2.name}
        </span>
        <span className="font-bold">{match.player2.score}</span>
      </div>

      {match.penalties && (
        <p className="text-xs text-center text-muted-foreground mt-1">{match.penalties}</p>
      )}

      {/* Click hint */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-background/60 rounded-lg">
        <span className="text-xs text-foreground font-medium">View Details</span>
      </div>
    </div>
  );
};

const TournamentBracket = () => {
  const [selectedMatch, setSelectedMatch] = useState<{
    match: Match;
    round: string;
  } | null>(null);

  const champion = bracketData[3].matches[0].player1.winner
    ? bracketData[3].matches[0].player1.name
    : bracketData[3].matches[0].player2.name;

  return (
    <>
      <div className="glass-card p-6 rounded-xl">
        <div className="flex items-center gap-3 mb-6">
          <Trophy className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold bg-gradient-gold bg-clip-text text-transparent">
            Tournament Bracket
          </h2>
        </div>

        {/* Champion Banner */}
        <div className="mb-8 p-4 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-lg border border-primary/30 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Crown className="w-8 h-8 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground mb-1">Champion</p>
          <p className="text-2xl font-bold text-primary neon-text">{champion}</p>
        </div>

        {/* Bracket Grid */}
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-8 min-w-max">
            {bracketData.map((round, roundIndex) => (
              <div key={round.name} className="flex flex-col">
                <h3 className="text-sm font-semibold text-neon-cyan mb-4 text-center">
                  {round.name}
                </h3>
                <div
                  className="flex flex-col gap-4 justify-around"
                  style={{ minHeight: roundIndex === 0 ? "auto" : undefined }}
                >
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

        {/* Legend */}
        <div className="flex items-center gap-6 mt-6 pt-4 border-t border-border/50 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-neon-green/50" />
            <span className="text-muted-foreground">Winner</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-muted" />
            <span className="text-muted-foreground">Eliminated</span>
          </div>
          <div className="flex items-center gap-2 ml-auto text-xs text-muted-foreground">
            Click any match for details
          </div>
        </div>
      </div>

      {/* Match Details Modal */}
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
