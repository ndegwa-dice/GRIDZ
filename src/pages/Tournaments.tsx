import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Coins, Calendar, MapPin, Gamepad2 } from "lucide-react";
import { useTournaments } from "@/hooks/useTournaments";
import TournamentBracket from "@/components/TournamentBracket";

// Demo EA FC 26 Tournament
const featuredTournament = {
  id: "fc26-nairobi",
  name: "GRIDZ EA FC 26 Nairobi Championship",
  game: "EA Sports FC 26",
  location: "Nairobi, Kenya",
  entry_fee: 50,
  prize_pool: 10000,
  max_participants: 16,
  participants: 16,
  start_date: "2026-01-15",
  status: "Live",
};

const Tournaments = () => {
  const { tournaments, loading } = useTournaments();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 gaming-mesh opacity-30" />
      <div className="fixed top-1/4 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="fixed bottom-1/4 -right-32 w-96 h-96 bg-neon-cyan/20 rounded-full blur-3xl animate-pulse animation-delay-500" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-pink/10 rounded-full blur-3xl" />

      <Navbar />

      <div className="relative z-10 pt-24 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-gold bg-clip-text text-transparent">
                Active Tournaments
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Compete, win, and earn in Kenya's premier esports competitions
            </p>
          </div>

          {/* Featured Tournament */}
          <div className="mb-12 animate-fade-in animation-delay-100">
            <div className="flex items-center gap-2 mb-4">
              <Gamepad2 className="w-5 h-5 text-neon-cyan" />
              <h2 className="text-xl font-semibold text-foreground">Featured Tournament</h2>
              <Badge className="bg-neon-green text-background animate-pulse">LIVE</Badge>
            </div>

            <Card className="glass-card border-primary/30 hover:shadow-glow-gold transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl md:text-3xl bg-gradient-gold bg-clip-text text-transparent">
                      {featuredTournament.name}
                    </CardTitle>
                    <p className="text-muted-foreground mt-1">{featuredTournament.game}</p>
                  </div>
                  <Badge className="bg-neon-green text-background w-fit text-lg px-4 py-1">
                    {featuredTournament.status}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                  <div className="glass-card p-4 rounded-lg text-center">
                    <MapPin className="w-5 h-5 text-neon-pink mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="font-semibold text-sm">{featuredTournament.location}</p>
                  </div>
                  <div className="glass-card p-4 rounded-lg text-center">
                    <Coins className="w-5 h-5 text-primary mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Entry Fee</p>
                    <p className="font-semibold">{featuredTournament.entry_fee} GZC</p>
                  </div>
                  <div className="glass-card p-4 rounded-lg text-center">
                    <Trophy className="w-5 h-5 text-neon-cyan mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Prize Pool</p>
                    <p className="font-semibold text-neon-cyan">{featuredTournament.prize_pool.toLocaleString()} GZC</p>
                  </div>
                  <div className="glass-card p-4 rounded-lg text-center">
                    <Users className="w-5 h-5 text-neon-green mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Players</p>
                    <p className="font-semibold">{featuredTournament.participants}/{featuredTournament.max_participants}</p>
                  </div>
                  <div className="glass-card p-4 rounded-lg text-center">
                    <Calendar className="w-5 h-5 text-primary mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Started</p>
                    <p className="font-semibold text-sm">{featuredTournament.start_date}</p>
                  </div>
                </div>

                {/* Tournament Bracket */}
                <TournamentBracket />
              </CardContent>
            </Card>
          </div>

          {/* Other Tournaments */}
          <div className="animate-fade-in animation-delay-200">
            <h2 className="text-xl font-semibold text-foreground mb-4">More Tournaments</h2>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading tournaments...</p>
              </div>
            ) : tournaments.length === 0 ? (
              <Card className="glass-card border-border">
                <CardContent className="py-12 text-center">
                  <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground">No additional tournaments available</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tournaments.map((tournament, index) => (
                  <Card
                    key={tournament.id}
                    className="glass-card border-border hover:border-accent transition-all duration-300 hover:shadow-glow-cyan animate-fade-in"
                    style={{ animationDelay: `${(index + 3) * 100}ms` }}
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <CardTitle className="text-xl">{tournament.name}</CardTitle>
                        <Badge
                          variant={tournament.status === "Open" ? "default" : "secondary"}
                          className={tournament.status === "Open" ? "bg-neon-green text-background" : ""}
                        >
                          {tournament.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{tournament.game}</p>
                    </CardHeader>

                    <CardContent>
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <Coins className="w-4 h-4 text-primary" />
                            <span className="text-muted-foreground">Entry Fee</span>
                          </div>
                          <span className="font-semibold">{tournament.entry_fee} GZC</span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-neon-cyan" />
                            <span className="text-muted-foreground">Prize Pool</span>
                          </div>
                          <span className="font-semibold text-neon-cyan">{tournament.prize_pool} GZC</span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-neon-pink" />
                            <span className="text-muted-foreground">Players</span>
                          </div>
                          <span className="font-semibold">
                            {tournament.participants || 0}/{tournament.max_participants}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-neon-green" />
                            <span className="text-muted-foreground">Starts</span>
                          </div>
                          <span className="font-semibold">{tournament.start_date}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Tournaments;
