import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Swords } from "lucide-react";

interface LiveMatchTickerProps {
  player1: string;
  player2: string;
  score1: number;
  score2: number;
  startMinute: number;
  onClick?: () => void;
}

const LiveMatchTicker = ({
  player1,
  player2,
  score1,
  score2,
  startMinute,
  onClick,
}: LiveMatchTickerProps) => {
  const [elapsed, setElapsed] = useState(startMinute);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed((prev) => (prev < 90 ? prev + 1 : prev));
    }, 60000); // increment every real minute for demo
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border/50 cursor-pointer hover:border-accent/50 transition-all duration-300 hover:bg-secondary/80"
    >
      <Badge className="bg-destructive/90 text-destructive-foreground border-0 text-[10px] px-1.5 py-0.5 animate-pulse">
        LIVE
      </Badge>

      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="text-sm font-medium text-foreground truncate">{player1}</span>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-sm font-bold text-primary tabular-nums">{score1}</span>
          <Swords className="w-3 h-3 text-muted-foreground" />
          <span className="text-sm font-bold text-primary tabular-nums">{score2}</span>
        </div>
        <span className="text-sm font-medium text-foreground truncate">{player2}</span>
      </div>

      <span className="text-xs text-neon-green font-mono shrink-0">{elapsed}'</span>
    </div>
  );
};

export default LiveMatchTicker;
