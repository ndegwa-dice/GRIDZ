import { Trophy, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeaderboardEntry {
  rank: number;
  gamerTag: string;
  wins: number;
  earnings: number;
  isCurrentUser?: boolean;
}

interface TournamentLeaderboardProps {
  entries: LeaderboardEntry[];
}

const rankColors: Record<number, string> = {
  1: "text-primary",
  2: "text-muted-foreground",
  3: "text-orange-400",
};

const TournamentLeaderboard = ({ entries }: TournamentLeaderboardProps) => {
  return (
    <div className="space-y-1.5">
      {entries.map((entry, i) => (
        <div
          key={entry.rank}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 animate-slide-up",
            entry.isCurrentUser
              ? "bg-primary/10 border border-primary/30"
              : "bg-secondary/30 hover:bg-secondary/50"
          )}
          style={{ animationDelay: `${i * 50}ms` }}
        >
          {/* Rank */}
          <div className="w-7 text-center shrink-0">
            {entry.rank <= 3 ? (
              <Crown className={cn("w-4 h-4 mx-auto", rankColors[entry.rank])} />
            ) : (
              <span className="text-sm font-bold text-muted-foreground">#{entry.rank}</span>
            )}
          </div>

          {/* Avatar placeholder */}
          <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center shrink-0 text-xs font-bold text-muted-foreground">
            {entry.gamerTag.charAt(0)}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className={cn("text-sm font-medium truncate", entry.isCurrentUser ? "text-primary" : "text-foreground")}>
              {entry.gamerTag}
              {entry.isCurrentUser && <span className="text-xs ml-1 text-primary/70">(You)</span>}
            </p>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 shrink-0 text-xs">
            <div className="flex items-center gap-1">
              <Trophy className="w-3 h-3 text-neon-green" />
              <span className="text-muted-foreground">{entry.wins}W</span>
            </div>
            <span className="font-semibold text-primary tabular-nums">{entry.earnings.toLocaleString()} GZC</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TournamentLeaderboard;
