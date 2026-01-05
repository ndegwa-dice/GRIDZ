import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useTournaments, Tournament } from "@/hooks/useTournaments";
import { useUserStats } from "@/hooks/useUserStats";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Trophy, Coins, Target, Award, TrendingUp, Calendar, ChevronRight, Sparkles, Zap, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Profile {
  id: string;
  user_id: string;
  username: string | null;
  avatar_url: string | null;
  wallet_balance: number;
  subscription_tier: string;
}

const Overview = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { getUserTournaments } = useTournaments();
  const [userTournaments, setUserTournaments] = useState<Tournament[]>([]);
  const { stats } = useUserStats(user?.id);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      const [profileData, tournaments] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id).single(),
        getUserTournaments(user.id)
      ]);

      if (profileData.data) setProfile(profileData.data as Profile);
      setUserTournaments(tournaments as Tournament[]);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 bg-secondary/30 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-36 bg-secondary/30 rounded-2xl animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: "GZ Tokens",
      value: profile?.wallet_balance || 0,
      icon: Coins,
      color: "neon-cyan",
      gradient: "from-neon-cyan/20 to-neon-cyan/5",
      shadow: "shadow-glow-cyan",
      trend: "+0 this week",
      trendUp: true,
    },
    {
      label: "Active Tournaments",
      value: userTournaments.length,
      icon: Target,
      color: "neon-pink",
      gradient: "from-neon-pink/20 to-neon-pink/5",
      shadow: "shadow-glow-pink",
      progress: userTournaments.length * 10,
    },
    {
      label: "Win Rate",
      value: `${stats.winRate.toFixed(1)}%`,
      icon: Award,
      color: "neon-green",
      gradient: "from-neon-green/20 to-neon-green/5",
      subtitle: `From ${stats.totalTournaments} tournaments`,
    },
    {
      label: "Membership",
      value: profile?.subscription_tier || 'Free',
      icon: Crown,
      color: "primary",
      gradient: "from-primary/20 to-primary/5",
      shadow: "shadow-glow-gold",
      action: "Upgrade now",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-slide-up opacity-0" style={{ animationDelay: '0ms' }}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            <span className="text-sm text-muted-foreground font-medium">Welcome back</span>
          </div>
          <h1 className="text-4xl font-bold text-foreground">
            <span className="bg-gradient-gold bg-clip-text text-transparent">{profile?.username || 'Gamer'}</span>
            <span className="ml-2">👋</span>
          </h1>
          <p className="text-muted-foreground mt-2">Here's what's happening with your gaming journey</p>
        </div>
        <Button 
          onClick={() => navigate("/tournaments")} 
          className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:shadow-glow-gold transition-all duration-300 rounded-xl gap-2 group"
        >
          <Trophy className="h-4 w-4 transition-transform group-hover:scale-110" />
          <span>Find Tournaments</span>
          <Zap className="h-3 w-3 opacity-60" />
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card 
            key={stat.label}
            className={cn(
              "stat-card bg-gradient-to-br border-border/50 rounded-2xl overflow-hidden group cursor-pointer",
              stat.gradient,
              "animate-slide-up opacity-0"
            )}
            style={{ animationDelay: `${(index + 1) * 100}ms` }}
          >
            <CardContent className="p-6 relative">
              {/* Background glow on hover */}
              <div className={cn(
                "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                `bg-${stat.color}/5`
              )} />
              
              <div className="flex items-start justify-between relative z-10">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                  <p className={cn(
                    "text-3xl font-bold tracking-tight",
                    stat.label === "Membership" ? "capitalize" : "",
                    `text-${stat.color}`
                  )}>
                    {stat.value}
                  </p>
                </div>
                <div className={cn(
                  "p-3 rounded-xl transition-all duration-300 group-hover:scale-110",
                  `bg-${stat.color}/10 group-hover:bg-${stat.color}/20`
                )}>
                  <stat.icon className={cn("h-6 w-6", `text-${stat.color}`)} />
                </div>
              </div>
              
              <div className="mt-4 relative z-10">
                {stat.trend && (
                  <div className="flex items-center text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3 mr-1 text-neon-green" />
                    <span className="text-neon-green font-medium">{stat.trend.split(' ')[0]}</span>
                    <span className="ml-1">{stat.trend.split(' ').slice(1).join(' ')}</span>
                  </div>
                )}
                {stat.progress !== undefined && (
                  <Progress value={stat.progress} className="h-1.5 bg-secondary/50" />
                )}
                {stat.subtitle && (
                  <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
                )}
                {stat.action && (
                  <Button variant="link" className="p-0 h-auto text-xs text-primary group-hover:underline">
                    {stat.action} <ChevronRight className="h-3 w-3 ml-1 transition-transform group-hover:translate-x-1" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Tournaments */}
        <Card className="lg:col-span-2 glass-card border-border/50 rounded-2xl overflow-hidden animate-slide-up opacity-0" style={{ animationDelay: '500ms' }}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Your Tournaments
              </CardTitle>
              <CardDescription>Tournaments you've joined</CardDescription>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate("/dashboard/tournaments")}
              className="text-muted-foreground hover:text-primary transition-colors group"
            >
              View all <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
            </Button>
          </CardHeader>
          <CardContent>
            {userTournaments.length > 0 ? (
              <div className="space-y-3">
                {userTournaments.slice(0, 3).map((tournament, index) => (
                  <div 
                    key={tournament.id}
                    className="p-4 rounded-xl bg-secondary/20 border border-border/50 hover:border-primary/30 hover:bg-secondary/30 transition-all duration-300 cursor-pointer group"
                    style={{ animationDelay: `${(index + 6) * 100}ms` }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold group-hover:text-primary transition-colors">{tournament.name}</h4>
                        <p className="text-sm text-muted-foreground">{tournament.game}</p>
                      </div>
                      <span className="text-xs px-3 py-1 rounded-full bg-neon-green/20 text-neon-green border border-neon-green/30 capitalize font-medium">
                        {tournament.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3">
                      <span className="flex items-center gap-1.5 bg-primary/10 px-2 py-1 rounded-lg">
                        <Trophy className="h-3 w-3 text-primary" />
                        <span className="text-primary font-medium">{tournament.prize_pool} GZC</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3" />
                        {new Date(tournament.start_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="relative inline-block mb-4">
                  <Trophy className="h-16 w-16 text-muted-foreground/20" />
                  <Sparkles className="h-6 w-6 absolute -top-2 -right-2 text-primary/40 animate-pulse" />
                </div>
                <p className="text-muted-foreground mb-4">No active tournaments yet</p>
                <Button 
                  onClick={() => navigate("/tournaments")} 
                  variant="outline"
                  className="rounded-xl border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all"
                >
                  Browse Tournaments
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="glass-card border-border/50 rounded-2xl overflow-hidden animate-slide-up opacity-0" style={{ animationDelay: '600ms' }}>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Zap className="h-5 w-5 text-neon-cyan" />
              Quick Actions
            </CardTitle>
            <CardDescription>Get started with these actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { icon: Trophy, label: "Join a Tournament", path: "/tournaments", color: "primary" },
              { icon: Coins, label: "Add GZ Tokens", path: "/dashboard/wallet", color: "neon-cyan" },
              { icon: Award, label: "Complete Profile", path: "/dashboard/profile", color: "neon-pink" },
              { icon: TrendingUp, label: "View Statistics", path: "/dashboard/stats", color: "neon-green" },
            ].map((action, index) => (
              <Button 
                key={action.label}
                variant="outline" 
                className={cn(
                  "w-full justify-start rounded-xl border-border/50 bg-secondary/20",
                  "hover:bg-secondary/40 hover:border-primary/30 transition-all duration-300 group",
                  "animate-slide-up opacity-0"
                )}
                style={{ animationDelay: `${(index + 7) * 100}ms` }}
                onClick={() => navigate(action.path)}
              >
                <action.icon className={cn("h-4 w-4 mr-3 transition-transform group-hover:scale-110", `text-${action.color}`)} />
                <span className="group-hover:text-foreground transition-colors">{action.label}</span>
                <ChevronRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Overview;