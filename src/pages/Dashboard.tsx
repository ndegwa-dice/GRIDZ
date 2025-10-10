import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Coins, TrendingUp, Calendar, Award, Users } from "lucide-react";

const Dashboard = () => {
  // Mock data - will be replaced with real data from Lovable Cloud
  const userData = {
    name: "John Kamau",
    rank: "Elite Gamer",
    tokenBalance: 850,
    activeTournaments: 3,
    wins: 12,
    totalEarnings: 2400
  };

  const upcomingTournaments = [
    { name: "Nairobi Championship", game: "FIFA 24", date: "2025-01-15", prize: 500 },
    { name: "Mombasa Showdown", game: "COD", date: "2025-01-18", prize: 800 },
  ];

  const recentAchievements = [
    { title: "First Victory", description: "Won your first tournament", icon: Trophy },
    { title: "Token Collector", description: "Earned 500+ GZC tokens", icon: Coins },
    { title: "Active Member", description: "30 days streak", icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Welcome back, <span className="bg-gradient-gold bg-clip-text text-transparent">{userData.name}</span>
            </h1>
            <Badge className="bg-neon-cyan text-background">{userData.rank}</Badge>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-card border-border hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Token Balance</p>
                    <p className="text-2xl font-bold text-primary">{userData.tokenBalance} GZC</p>
                  </div>
                  <Coins className="w-10 h-10 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border hover:border-neon-cyan/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Active Tournaments</p>
                    <p className="text-2xl font-bold text-neon-cyan">{userData.activeTournaments}</p>
                  </div>
                  <Calendar className="w-10 h-10 text-neon-cyan" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border hover:border-neon-green/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Wins</p>
                    <p className="text-2xl font-bold text-neon-green">{userData.wins}</p>
                  </div>
                  <Trophy className="w-10 h-10 text-neon-green" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border hover:border-neon-pink/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Earnings</p>
                    <p className="text-2xl font-bold text-neon-pink">{userData.totalEarnings} GZC</p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-neon-pink" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Upcoming Tournaments */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Upcoming Tournaments
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingTournaments.map((tournament, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
                    <div>
                      <h4 className="font-semibold">{tournament.name}</h4>
                      <p className="text-sm text-muted-foreground">{tournament.game}</p>
                      <p className="text-xs text-muted-foreground mt-1">{tournament.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-neon-cyan font-semibold">{tournament.prize} GZC</p>
                      <Button variant="tournament" size="sm" className="mt-2">
                        View
                      </Button>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  View All Tournaments
                </Button>
              </CardContent>
            </Card>

            {/* Recent Achievements */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  Recent Achievements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentAchievements.map((achievement, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-background rounded-lg border border-border">
                    <achievement.icon className="w-8 h-8 text-primary flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">{achievement.title}</h4>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;
