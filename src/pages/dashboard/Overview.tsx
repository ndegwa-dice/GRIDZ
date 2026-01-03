import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useTournaments, Tournament } from "@/hooks/useTournaments";
import { useUserStats } from "@/hooks/useUserStats";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Trophy, Coins, Target, Award, TrendingUp, Calendar, ChevronRight } from "lucide-react";

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
        <div className="h-8 w-48 bg-secondary/50 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-secondary/50 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, <span className="bg-gradient-gold bg-clip-text text-transparent">{profile?.username || 'Gamer'}</span>! 👋
          </h1>
          <p className="text-muted-foreground mt-1">Here's what's happening with your gaming journey</p>
        </div>
        <Button onClick={() => navigate("/tournaments")} className="bg-primary text-primary-foreground">
          <Trophy className="h-4 w-4 mr-2" />
          Find Tournaments
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border hover:border-primary/50 transition-colors group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">GZ Tokens</p>
                <p className="text-3xl font-bold text-neon-cyan mt-1">{profile?.wallet_balance || 0}</p>
              </div>
              <div className="p-3 rounded-full bg-neon-cyan/10 group-hover:bg-neon-cyan/20 transition-colors">
                <Coins className="h-6 w-6 text-neon-cyan" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-neon-green" />
              <span className="text-neon-green">+0</span>
              <span className="ml-1">this week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border hover:border-primary/50 transition-colors group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Tournaments</p>
                <p className="text-3xl font-bold text-foreground mt-1">{userTournaments.length}</p>
              </div>
              <div className="p-3 rounded-full bg-neon-pink/10 group-hover:bg-neon-pink/20 transition-colors">
                <Target className="h-6 w-6 text-neon-pink" />
              </div>
            </div>
            <div className="mt-4">
              <Progress value={userTournaments.length * 10} className="h-1" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border hover:border-primary/50 transition-colors group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Win Rate</p>
                <p className="text-3xl font-bold text-foreground mt-1">{stats.winRate.toFixed(1)}%</p>
              </div>
              <div className="p-3 rounded-full bg-neon-green/10 group-hover:bg-neon-green/20 transition-colors">
                <Award className="h-6 w-6 text-neon-green" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-muted-foreground">
              <span>From {stats.totalTournaments} tournaments</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border hover:border-primary/50 transition-colors group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Membership</p>
                <p className="text-3xl font-bold text-primary mt-1 capitalize">{profile?.subscription_tier || 'Free'}</p>
              </div>
              <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4">
              <Button variant="link" className="p-0 h-auto text-xs text-primary">
                Upgrade now <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Tournaments */}
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Your Tournaments</CardTitle>
              <CardDescription>Tournaments you've joined</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/tournaments")}>
              View all <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            {userTournaments.length > 0 ? (
              <div className="space-y-3">
                {userTournaments.slice(0, 3).map((tournament) => (
                  <div 
                    key={tournament.id}
                    className="p-4 rounded-lg bg-secondary/30 border border-border hover:border-primary/50 transition-all cursor-pointer group"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold group-hover:text-primary transition-colors">{tournament.name}</h4>
                        <p className="text-sm text-muted-foreground">{tournament.game}</p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-neon-green/20 text-neon-green capitalize">
                        {tournament.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3">
                      <span className="flex items-center gap-1">
                        <Trophy className="h-3 w-3" />
                        {tournament.prize_pool} GZC
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(tournament.start_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground mb-4">No active tournaments yet</p>
                <Button onClick={() => navigate("/tournaments")} variant="outline">
                  Browse Tournaments
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>Get started with these actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start bg-secondary/30 border-border hover:border-primary/50"
              onClick={() => navigate("/tournaments")}
            >
              <Trophy className="h-4 w-4 mr-3 text-primary" />
              Join a Tournament
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start bg-secondary/30 border-border hover:border-primary/50"
              onClick={() => navigate("/dashboard/wallet")}
            >
              <Coins className="h-4 w-4 mr-3 text-neon-cyan" />
              Add GZ Tokens
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start bg-secondary/30 border-border hover:border-primary/50"
              onClick={() => navigate("/dashboard/profile")}
            >
              <Award className="h-4 w-4 mr-3 text-neon-pink" />
              Complete Profile
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start bg-secondary/30 border-border hover:border-primary/50"
              onClick={() => navigate("/dashboard/stats")}
            >
              <TrendingUp className="h-4 w-4 mr-3 text-neon-green" />
              View Statistics
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Overview;
