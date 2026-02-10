import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Users, Gamepad2, DollarSign, TrendingUp, Activity } from "lucide-react";

export default function AdminOverview() {
  const [stats, setStats] = useState({
    totalTournaments: 0,
    activeTournaments: 0,
    totalUsers: 0,
    totalParticipations: 0,
    totalPrizePool: 0,
  });
  const [recentTournaments, setRecentTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [tournamentsRes, participantsRes, profilesRes] = await Promise.all([
        supabase.from("tournaments").select("*"),
        supabase.from("tournament_participants").select("id"),
        supabase.from("profiles").select("id"),
      ]);

      const tournaments = tournamentsRes.data || [];
      const activeTournaments = tournaments.filter((t) => t.status === "live" || t.status === "upcoming");
      const totalPrize = tournaments.reduce((sum, t) => sum + (t.prize_pool || 0), 0);

      setStats({
        totalTournaments: tournaments.length,
        activeTournaments: activeTournaments.length,
        totalUsers: profilesRes.data?.length || 0,
        totalParticipations: participantsRes.data?.length || 0,
        totalPrizePool: totalPrize,
      });

      setRecentTournaments(tournaments.slice(0, 5));
    } catch (err) {
      console.error("Error loading admin stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: "Total Tournaments", value: stats.totalTournaments, icon: Trophy, color: "text-primary" },
    { label: "Active Tournaments", value: stats.activeTournaments, icon: Activity, color: "text-neon-green" },
    { label: "Total Gamers", value: stats.totalUsers, icon: Users, color: "text-neon-cyan" },
    { label: "Total Participations", value: stats.totalParticipations, icon: Gamepad2, color: "text-neon-pink" },
    { label: "Total Prize Pool", value: `${stats.totalPrizePool.toLocaleString()} GZC`, icon: DollarSign, color: "text-primary" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-destructive bg-clip-text text-transparent">
          Admin Overview
        </h1>
        <p className="text-muted-foreground mt-1">Platform stats at a glance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {statCards.map((stat, i) => (
          <Card
            key={stat.label}
            className="glass-card stat-card border-border/50 animate-slide-up opacity-0"
            style={{ animationDelay: `${i * 80}ms`, animationFillMode: "forwards" }}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color} opacity-60`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Tournaments */}
      <Card className="glass-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <TrendingUp className="h-5 w-5 text-primary" />
            Recent Tournaments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentTournaments.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No tournaments yet. Create your first one!</p>
          ) : (
            <div className="space-y-3">
              {recentTournaments.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/30 hover:border-primary/30 transition-all"
                >
                  <div>
                    <p className="font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.game} &bull; {new Date(t.start_date).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-primary">{t.prize_pool?.toLocaleString()} GZC</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                        t.status === "live"
                          ? "bg-neon-green/20 text-neon-green"
                          : t.status === "upcoming"
                          ? "bg-neon-cyan/20 text-neon-cyan"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
