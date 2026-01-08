import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Target, Gamepad2, TrendingUp, Clock, Swords } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlayerStats {
  name: string;
  score: number;
  winner?: boolean;
  stats: {
    possession: number;
    shots: number;
    shotsOnTarget: number;
    passes: number;
    passAccuracy: number;
    tackles: number;
    fouls: number;
    corners: number;
    yellowCards: number;
    redCards: number;
  };
  history: {
    opponent: string;
    result: string;
    score: string;
  }[];
  ranking: number;
  winRate: number;
  gamesPlayed: number;
}

interface MatchDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matchId: string;
  player1: { name: string; score: number; winner?: boolean };
  player2: { name: string; score: number; winner?: boolean };
  round: string;
}

// Generate mock player stats
const generatePlayerStats = (name: string, score: number, winner?: boolean): PlayerStats => {
  const baseStats = {
    possession: Math.floor(Math.random() * 30) + 35,
    shots: Math.floor(Math.random() * 10) + 5,
    shotsOnTarget: Math.floor(Math.random() * 6) + 2,
    passes: Math.floor(Math.random() * 200) + 300,
    passAccuracy: Math.floor(Math.random() * 20) + 70,
    tackles: Math.floor(Math.random() * 15) + 5,
    fouls: Math.floor(Math.random() * 8),
    corners: Math.floor(Math.random() * 6),
    yellowCards: Math.floor(Math.random() * 3),
    redCards: Math.random() > 0.9 ? 1 : 0,
  };

  const opponents = ["MombasaMaster", "KisumuKiller", "ElDoretEagle", "NakuruNemesis", "ThikaThunder"];
  const history = Array.from({ length: 3 }, () => {
    const won = Math.random() > 0.4;
    const homeScore = Math.floor(Math.random() * 4) + (won ? 1 : 0);
    const awayScore = Math.floor(Math.random() * 3) + (won ? 0 : 1);
    return {
      opponent: opponents[Math.floor(Math.random() * opponents.length)],
      result: won ? "W" : "L",
      score: `${homeScore}-${awayScore}`,
    };
  });

  return {
    name,
    score,
    winner,
    stats: baseStats,
    history,
    ranking: Math.floor(Math.random() * 50) + 1,
    winRate: Math.floor(Math.random() * 30) + 50,
    gamesPlayed: Math.floor(Math.random() * 50) + 20,
  };
};

const StatComparison = ({ 
  label, 
  value1, 
  value2, 
  suffix = "" 
}: { 
  label: string; 
  value1: number; 
  value2: number;
  suffix?: string;
}) => {
  const total = value1 + value2;
  const percent1 = total > 0 ? (value1 / total) * 100 : 50;
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className={cn(value1 > value2 ? "text-neon-green font-semibold" : "text-muted-foreground")}>
          {value1}{suffix}
        </span>
        <span className="text-muted-foreground text-xs">{label}</span>
        <span className={cn(value2 > value1 ? "text-neon-green font-semibold" : "text-muted-foreground")}>
          {value2}{suffix}
        </span>
      </div>
      <div className="flex h-2 rounded-full overflow-hidden bg-muted">
        <div 
          className="bg-neon-cyan transition-all duration-500" 
          style={{ width: `${percent1}%` }} 
        />
        <div 
          className="bg-neon-pink transition-all duration-500" 
          style={{ width: `${100 - percent1}%` }} 
        />
      </div>
    </div>
  );
};

const PlayerCard = ({ player, color }: { player: PlayerStats; color: "cyan" | "pink" }) => {
  const colorClasses = color === "cyan" 
    ? "border-neon-cyan/30 bg-neon-cyan/5" 
    : "border-neon-pink/30 bg-neon-pink/5";
  
  return (
    <div className={cn("glass-card rounded-lg p-4 border", colorClasses)}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className={cn("font-bold", player.winner ? "text-neon-green" : "text-foreground")}>
            {player.name}
          </h4>
          <p className="text-xs text-muted-foreground">Rank #{player.ranking}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">{player.score}</p>
          {player.winner && (
            <Badge className="bg-neon-green/20 text-neon-green text-xs">Winner</Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="glass-card p-2 rounded">
          <Gamepad2 className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">Games</p>
          <p className="font-semibold">{player.gamesPlayed}</p>
        </div>
        <div className="glass-card p-2 rounded">
          <TrendingUp className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">Win Rate</p>
          <p className="font-semibold text-neon-green">{player.winRate}%</p>
        </div>
        <div className="glass-card p-2 rounded">
          <Trophy className="w-4 h-4 mx-auto mb-1 text-primary" />
          <p className="text-xs text-muted-foreground">Rank</p>
          <p className="font-semibold">#{player.ranking}</p>
        </div>
      </div>

      {/* Recent matches */}
      <div className="mt-3">
        <p className="text-xs text-muted-foreground mb-2">Recent Matches</p>
        <div className="space-y-1">
          {player.history.map((match, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground truncate max-w-[100px]">
                vs {match.opponent}
              </span>
              <div className="flex items-center gap-2">
                <span>{match.score}</span>
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-xs px-1.5",
                    match.result === "W" ? "border-neon-green text-neon-green" : "border-destructive text-destructive"
                  )}
                >
                  {match.result}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const MatchDetailsModal = ({
  open,
  onOpenChange,
  matchId,
  player1,
  player2,
  round,
}: MatchDetailsModalProps) => {
  const player1Stats = generatePlayerStats(player1.name, player1.score, player1.winner);
  const player2Stats = generatePlayerStats(player2.name, player2.score, player2.winner);

  // Adjust possession to equal 100%
  const totalPossession = player1Stats.stats.possession + player2Stats.stats.possession;
  player1Stats.stats.possession = Math.round((player1Stats.stats.possession / totalPossession) * 100);
  player2Stats.stats.possession = 100 - player1Stats.stats.possession;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto glass-card border-border">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Swords className="w-5 h-5 text-primary" />
              <span className="bg-gradient-gold bg-clip-text text-transparent">Match Details</span>
            </DialogTitle>
            <Badge variant="outline" className="text-neon-cyan border-neon-cyan">
              {round}
            </Badge>
          </div>
        </DialogHeader>

        {/* Score Header */}
        <div className="flex items-center justify-center gap-4 py-4 border-y border-border/50">
          <div className="text-center flex-1">
            <p className={cn("font-bold text-lg", player1.winner && "text-neon-green")}>
              {player1.name}
            </p>
          </div>
          <div className="flex items-center gap-3 px-6 py-3 glass-card rounded-lg">
            <span className={cn("text-3xl font-bold", player1.winner && "text-neon-green")}>
              {player1.score}
            </span>
            <span className="text-muted-foreground">-</span>
            <span className={cn("text-3xl font-bold", player2.winner && "text-neon-green")}>
              {player2.score}
            </span>
          </div>
          <div className="text-center flex-1">
            <p className={cn("font-bold text-lg", player2.winner && "text-neon-green")}>
              {player2.name}
            </p>
          </div>
        </div>

        {/* Match Stats Comparison */}
        <div className="space-y-3 py-4">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-4 h-4 text-neon-cyan" />
            <h3 className="font-semibold">Match Statistics</h3>
          </div>
          
          <StatComparison 
            label="Possession" 
            value1={player1Stats.stats.possession} 
            value2={player2Stats.stats.possession}
            suffix="%"
          />
          <StatComparison 
            label="Shots" 
            value1={player1Stats.stats.shots} 
            value2={player2Stats.stats.shots}
          />
          <StatComparison 
            label="Shots on Target" 
            value1={player1Stats.stats.shotsOnTarget} 
            value2={player2Stats.stats.shotsOnTarget}
          />
          <StatComparison 
            label="Pass Accuracy" 
            value1={player1Stats.stats.passAccuracy} 
            value2={player2Stats.stats.passAccuracy}
            suffix="%"
          />
          <StatComparison 
            label="Tackles" 
            value1={player1Stats.stats.tackles} 
            value2={player2Stats.stats.tackles}
          />
          <StatComparison 
            label="Corners" 
            value1={player1Stats.stats.corners} 
            value2={player2Stats.stats.corners}
          />
          <StatComparison 
            label="Fouls" 
            value1={player1Stats.stats.fouls} 
            value2={player2Stats.stats.fouls}
          />
        </div>

        {/* Player Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border/50">
          <PlayerCard player={player1Stats} color="cyan" />
          <PlayerCard player={player2Stats} color="pink" />
        </div>

        {/* Match Time */}
        <div className="flex items-center justify-center gap-2 pt-4 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>Full Time • 90:00</span>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MatchDetailsModal;
