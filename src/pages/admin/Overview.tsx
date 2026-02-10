import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trophy, Users, Gamepad2, DollarSign, TrendingUp, Activity, UserPlus, Medal, Coins, Radio } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface FeedItem {
  id: string;
  type: "join" | "completion" | "prize" | "status_change";
  message: string;
  timestamp: Date;
  iconType: "join" | "completion" | "prize" | "status_change";
  color: string;
}

const FEED_ICONS = {
  join: UserPlus,
  completion: Medal,
  prize: Coins,
  status_change: Radio,
};

const FEED_COLORS = {
  join: "text-neon-green",
  completion: "text-neon-cyan",
  prize: "text-primary",
  status_change: "text-neon-pink",
};

export default function AdminOverview() {
  const [stats, setStats] = useState({
    totalTournaments: 0,
    activeTournaments: 0,
    totalUsers: 0,
    totalParticipations: 0,
    totalPrizePool: 0,
  });
  const [recentTournaments, setRecentTournaments] = useState<any[]>([]);
  const [activityFeed, setActivityFeed] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const feedIdCounter = useRef(0);

  const addFeedItem = useCallback((item: Omit<FeedItem, "id">) => {
    const id = `feed-${Date.now()}-${feedIdCounter.current++}`;
    setActivityFeed((prev) => [{ ...item, id }, ...prev].slice(0, 50));
  }, []);

  const loadStats = useCallback(async () => {
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
  }, []);

  const loadSeedActivity = useCallback(async () => {
    try {
      const { data: recentParticipants } = await supabase
        .from("tournament_participants")
        .select("id, joined_at, user_id, tournament_id, placement, points_earned")
        .order("joined_at", { ascending: false })
        .limit(10);

      if (!recentParticipants?.length) return;

      const userIds = [...new Set(recentParticipants.map((p) => p.user_id))];
      const tournamentIds = [...new Set(recentParticipants.map((p) => p.tournament_id))];

      const [profilesRes, tournamentsRes] = await Promise.all([
        supabase.from("profiles").select("user_id, username").in("user_id", userIds),
        supabase.from("tournaments").select("id, name").in("id", tournamentIds),
      ]);

      const userMap = Object.fromEntries((profilesRes.data || []).map((p) => [p.user_id, p.username || "Unknown"]));
      const tournamentMap = Object.fromEntries((tournamentsRes.data || []).map((t) => [t.id, t.name]));

      const seedItems: FeedItem[] = recentParticipants.map((p, i) => {
        const username = userMap[p.user_id] || "Unknown";
        const tournament = tournamentMap[p.tournament_id] || "a tournament";

        if (p.points_earned && p.points_earned > 0) {
          return {
            id: `seed-prize-${i}`,
            type: "prize" as const,
            message: `${username} earned ${p.points_earned} GZC in ${tournament}`,
            timestamp: new Date(p.joined_at),
            iconType: "prize" as const,
            color: FEED_COLORS.prize,
          };
        }
        if (p.placement) {
          return {
            id: `seed-place-${i}`,
            type: "completion" as const,
            message: `${username} placed #${p.placement} in ${tournament}`,
            timestamp: new Date(p.joined_at),
            iconType: "completion" as const,
            color: FEED_COLORS.completion,
          };
        }
        return {
          id: `seed-join-${i}`,
          type: "join" as const,
          message: `${username} joined ${tournament}`,
          timestamp: new Date(p.joined_at),
          iconType: "join" as const,
          color: FEED_COLORS.join,
        };
      });

      setActivityFeed(seedItems);
    } catch (err) {
      console.error("Error loading seed activity:", err);
    }
  }, []);

  useEffect(() => {
    loadStats();
    loadSeedActivity();
  }, [loadStats, loadSeedActivity]);

  useEffect(() => {
    const channel = supabase
      .channel("admin-overview-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "tournament_participants" },
        async (payload) => {
          const record = payload.new as any;
          const [profileRes, tournamentRes] = await Promise.all([
            supabase.from("profiles").select("username").eq("user_id", record.user_id).maybeSingle(),
            supabase.from("tournaments").select("name").eq("id", record.tournament_id).maybeSingle(),
          ]);
          const username = profileRes.data?.username || "A player";
          const tournament = tournamentRes.data?.name || "a tournament";
          addFeedItem({
            type: "join",
            message: `${username} joined ${tournament}`,
            timestamp: new Date(),
            iconType: "join",
            color: FEED_COLORS.join,
          });
          loadStats();
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "tournament_participants" },
        async (payload) => {
          const record = payload.new as any;
          const old = payload.old as any;
          const [profileRes, tournamentRes] = await Promise.all([
            supabase.from("profiles").select("username").eq("user_id", record.user_id).maybeSingle(),
            supabase.from("tournaments").select("name").eq("id", record.tournament_id).maybeSingle(),
          ]);
          const username = profileRes.data?.username || "A player";
          const tournament = tournamentRes.data?.name || "a tournament";

          if (record.points_earned > 0 && record.points_earned !== old?.points_earned) {
            addFeedItem({
              type: "prize",
              message: `${username} earned ${record.points_earned} GZC in ${tournament}`,
              timestamp: new Date(),
              iconType: "prize",
              color: FEED_COLORS.prize,
            });
          }
          if (record.placement && record.placement !== old?.placement) {
            addFeedItem({
              type: "completion",
              message: `${username} placed #${record.placement} in ${tournament}`,
              timestamp: new Date(),
              iconType: "completion",
              color: FEED_COLORS.completion,
            });
          }
          loadStats();
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "tournaments" },
        async (payload) => {
          const record = payload.new as any;
          const old = payload.old as any;
          if (record.status === "live" && old?.status !== "live") {
            addFeedItem({
              type: "status_change",
              message: `${record.name} is now LIVE!`,
              timestamp: new Date(),
              iconType: "status_change",
              color: FEED_COLORS.status_change,
            });
          }
          loadStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [addFeedItem, loadStats]);

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

        {/* Live Activity Feed */}
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-green opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-neon-green" />
              </span>
              Live Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activityFeed.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No activity yet. Events will appear here in real-time.</p>
            ) : (
              <ScrollArea className="h-[400px] pr-3">
                <div className="space-y-3">
                  {activityFeed.map((item, i) => {
                    const Icon = FEED_ICONS[item.iconType];
                    return (
                      <div
                        key={item.id}
                        className="flex items-start gap-3 p-3 rounded-xl bg-secondary/30 border border-border/30 animate-slide-up opacity-0"
                        style={{ animationDelay: `${i * 40}ms`, animationFillMode: "forwards" }}
                      >
                        <div className={`mt-0.5 p-1.5 rounded-lg bg-secondary/50 ${item.color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground leading-snug">{item.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
