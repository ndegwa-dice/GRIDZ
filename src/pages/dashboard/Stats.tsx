import { useAuth } from "@/hooks/useAuth";
import { useUserStats } from "@/hooks/useUserStats";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Loader2 } from "lucide-react";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { WinRateChart } from "@/components/dashboard/WinRateChart";
import { PlacementDistribution } from "@/components/dashboard/PlacementDistribution";

const Stats = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { stats, loading } = useUserStats(user?.id);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (stats.totalTournaments === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Statistics</h1>
          <p className="text-muted-foreground mt-1">Track your gaming performance</p>
        </div>

        <Card className="bg-card border-border">
          <CardContent className="py-16 text-center">
            <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="text-xl font-semibold mb-2">No Statistics Yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Join and complete tournaments to see your performance stats, charts, and rankings!
            </p>
            <Button onClick={() => navigate("/tournaments")} className="bg-primary text-primary-foreground">
              Browse Tournaments
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Statistics</h1>
        <p className="text-muted-foreground mt-1">Track your gaming performance</p>
      </div>

      <StatsOverview
        totalTournaments={stats.totalTournaments}
        winRate={stats.winRate}
        averagePlacement={stats.averagePlacement}
        totalEarnings={stats.totalEarnings}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PerformanceChart data={stats.performanceOverTime} />
        <WinRateChart 
          winRate={stats.winRate} 
          totalTournaments={stats.totalTournaments} 
        />
      </div>

      <PlacementDistribution data={stats.placementDistribution} />
    </div>
  );
};

export default Stats;
