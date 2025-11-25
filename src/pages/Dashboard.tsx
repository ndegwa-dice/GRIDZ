import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Coins, Target, Award } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTournaments, Tournament } from "@/hooks/useTournaments";
import { useUserStats } from "@/hooks/useUserStats";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { WinRateChart } from "@/components/dashboard/WinRateChart";
import { PlacementDistribution } from "@/components/dashboard/PlacementDistribution";

interface Profile {
  gamer_tag: string;
  email: string;
  phone: string | null;
  region: string;
  rank: string;
  wallet_balance: number;
  achievements: any;
  subscription_status: boolean;
  created_at: string;
  updated_at: string;
}

const Dashboard = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const { getUserTournaments } = useTournaments();
  const [userTournaments, setUserTournaments] = useState<Tournament[]>([]);
  const { stats, loading: statsLoading } = useUserStats(user?.id);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      loadProfile();
      loadUserTournaments();
      subscribeToProfileChanges();
      subscribeToTournamentChanges();
    }
  }, [user]);

  const loadUserTournaments = async () => {
    if (!user) return;
    const tournaments = await getUserTournaments(user.id);
    setUserTournaments(tournaments as Tournament[]);
  };

  const subscribeToProfileChanges = () => {
    if (!user) return;

    const channel = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`
        },
        (payload) => {
          console.log('Profile updated:', payload);
          setProfile(payload.new as Profile);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const subscribeToTournamentChanges = () => {
    if (!user) return;

    const channel = supabase
      .channel('user-tournaments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tournament_participants',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          console.log('Tournament participation changed, reloading...');
          loadUserTournaments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (error) throw error;
      setProfile(data as Profile);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    } finally {
      setLoadingProfile(false);
    }
  };

  if (loading || loadingProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) return null;

  const achievementCount = Array.isArray(profile.achievements) ? profile.achievements.length : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-12 pt-24">
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-gold bg-clip-text text-transparent mb-2">
              Welcome, {profile.gamer_tag}
            </h1>
            <p className="text-muted-foreground">
              {profile.region} • {profile.rank}
            </p>
          </div>
          <Button onClick={signOut} variant="outline">
            Sign Out
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">GZ Tokens</CardTitle>
              <Coins className="h-4 w-4 text-neon-cyan" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-neon-cyan">{profile.wallet_balance}</div>
              <p className="text-xs text-muted-foreground">Available balance</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rank</CardTitle>
              <Target className="h-4 w-4 text-neon-pink" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile.rank}</div>
              <p className="text-xs text-muted-foreground">{profile.region} region</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Subscription</CardTitle>
              <Trophy className="h-4 w-4 text-neon-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {profile.subscription_status ? "Active" : "Inactive"}
              </div>
              <p className="text-xs text-muted-foreground">
                {profile.subscription_status ? "KES 2,800 - Paid" : "Upgrade now"}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Achievements</CardTitle>
              <Award className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{achievementCount}</div>
              <p className="text-xs text-muted-foreground">Badges earned</p>
            </CardContent>
          </Card>
        </div>

        {/* Statistics Section */}
        <div className="mb-8">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-foreground mb-2">📊 Your Statistics</h2>
            <p className="text-muted-foreground">Track your performance and progress</p>
          </div>

          {statsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading statistics...</p>
            </div>
          ) : stats.totalTournaments === 0 ? (
            <Card className="bg-card border-border p-12">
              <div className="text-center text-muted-foreground">
                <Trophy className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <h3 className="text-xl font-semibold mb-2">No Statistics Yet</h3>
                <p className="mb-6">Join and complete tournaments to see your stats and performance charts!</p>
                <Button onClick={() => navigate("/tournaments")} className="bg-primary text-primary-foreground">
                  Browse Tournaments
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-6">
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
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Active Tournaments</CardTitle>
              <CardDescription>Tournaments you've joined</CardDescription>
            </CardHeader>
            <CardContent>
              {userTournaments.length > 0 ? (
                <div className="space-y-3">
                  {userTournaments.map((tournament) => (
                    <div 
                      key={tournament.id}
                      className="p-4 border border-border rounded-lg hover:border-primary/50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold">{tournament.name}</h4>
                          <p className="text-sm text-muted-foreground">{tournament.game}</p>
                        </div>
                        <span className="text-xs px-2 py-1 rounded bg-neon-green/20 text-neon-green">
                          {tournament.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                        <span>🏆 {tournament.prize_pool} GZC</span>
                        <span>📅 {tournament.start_date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No active tournaments yet</p>
                  <Button className="mt-4" onClick={() => navigate("/tournaments")}>
                    View Tournaments
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest actions on GRIDZ</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p>No recent activity</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;
