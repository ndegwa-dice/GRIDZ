import { Card } from "@/components/ui/card";
import { Trophy, Target, TrendingUp, Coins } from "lucide-react";

interface StatsOverviewProps {
  totalTournaments: number;
  winRate: number;
  averagePlacement: number;
  totalEarnings: number;
}

export const StatsOverview = ({
  totalTournaments,
  winRate,
  averagePlacement,
  totalEarnings,
}: StatsOverviewProps) => {
  const statCards = [
    {
      icon: Trophy,
      label: "Total Tournaments",
      value: totalTournaments,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: Target,
      label: "Win Rate",
      value: `${winRate.toFixed(1)}%`,
      color: "text-neon-green",
      bgColor: "bg-neon-green/10",
    },
    {
      icon: TrendingUp,
      label: "Avg Placement",
      value: averagePlacement > 0 ? averagePlacement.toFixed(1) : "N/A",
      color: "text-neon-cyan",
      bgColor: "bg-neon-cyan/10",
    },
    {
      icon: Coins,
      label: "Total Earnings",
      value: `${totalEarnings} GZC`,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <Card
          key={index}
          className="p-6 bg-card border-border hover:border-primary/50 transition-all duration-300"
        >
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
