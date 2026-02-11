import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Users, Coins, Calendar, Gamepad2, Radio } from "lucide-react";
import { useTournaments } from "@/hooks/useTournaments";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import TournamentBracket from "@/components/TournamentBracket";

const Tournaments = () => {
  const { tournaments, loading, joinTournament, checkUserInTournament } = useTournaments();
  const { user } = useAuth();
  const { toast } = useToast();
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [joinedMap, setJoinedMap] = useState<Record<string, boolean>>({});
  const [bracketTournamentId, setBracketTournamentId] = useState<string | null>(null);

  const featuredTournament = tournaments.find(t => t.status === "live") || tournaments[0];
  const otherTournaments = tournaments.filter(t => t.id !== featuredTournament?.id);

  const handleJoin = async (tournamentId: string) => {
    if (!user) { toast({ title: "Login Required", description: "Please log in to join tournaments.", variant: "destructive" }); return; }
    setJoiningId(tournamentId);
    const success = await joinTournament(tournamentId, user.id);
    if (success) setJoinedMap(prev => ({ ...prev, [tournamentId]: true }));
    setJoiningId(null);
  };

  const checkJoined = async (tournamentId: string) => {
    if (!user) return;
    const joined = await checkUserInTournament(tournamentId, user.id);
    setJoinedMap(prev => ({ ...prev, [tournamentId]: joined }));
  };

  // Check join status on mount for upcoming tournaments
  useState(() => {
    if (user) {
      tournaments.filter(t => t.status === "upcoming").forEach(t => checkJoined(t.id));
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "live": return <Badge className="bg-neon-green text-background animate-pulse gap-1"><Radio className="h-3 w-3" />LIVE</Badge>;
      case "upcoming": return <Badge className="bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30">Upcoming</Badge>;
      case "completed": return <Badge className="bg-muted text-muted-foreground">Completed</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="fixed inset-0 gaming-mesh opacity-30" />
      <div className="fixed top-1/4 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="fixed bottom-1/4 -right-32 w-96 h-96 bg-neon-cyan/20 rounded-full blur-3xl animate-pulse animation-delay-500" />

      <Navbar />

      <div className="relative z-10 pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-gold bg-clip-text text-transparent">Active Tournaments</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Compete, win, and earn in Kenya's premier esports competitions</p>
          </div>

          {/* Featured Tournament */}
          {featuredTournament && (
            <div className="mb-12 animate-fade-in animation-delay-100">
              <div className="flex items-center gap-2 mb-4">
                <Gamepad2 className="w-5 h-5 text-neon-cyan" />
                <h2 className="text-xl font-semibold text-foreground">Featured Tournament</h2>
                {getStatusBadge(featuredTournament.status)}
              </div>

              <Card className="glass-card border-primary/30 hover:shadow-glow-gold transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-2xl md:text-3xl bg-gradient-gold bg-clip-text text-transparent">{featuredTournament.name}</CardTitle>
                      <p className="text-muted-foreground mt-1">{featuredTournament.game}</p>
                    </div>
                    {featuredTournament.status === "upcoming" && (
                      <Button
                        variant="hero"
                        disabled={joiningId === featuredTournament.id || joinedMap[featuredTournament.id]}
                        onClick={() => handleJoin(featuredTournament.id)}
                      >
                        {joinedMap[featuredTournament.id] ? "Already Joined" : joiningId === featuredTournament.id ? "Joining..." : "Join Tournament"}
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="glass-card p-4 rounded-lg text-center">
                      <Coins className="w-5 h-5 text-primary mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">Entry Fee</p>
                      <p className="font-semibold">{featuredTournament.entry_fee} GZC</p>
                    </div>
                    <div className="glass-card p-4 rounded-lg text-center">
                      <Trophy className="w-5 h-5 text-neon-cyan mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">Prize Pool</p>
                      <p className="font-semibold text-neon-cyan">{featuredTournament.prize_pool?.toLocaleString()} GZC</p>
                    </div>
                    <div className="glass-card p-4 rounded-lg text-center">
                      <Users className="w-5 h-5 text-neon-green mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">Players</p>
                      <p className="font-semibold">{featuredTournament.participants || 0}/{featuredTournament.max_participants}</p>
                    </div>
                    <div className="glass-card p-4 rounded-lg text-center">
                      <Calendar className="w-5 h-5 text-primary mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">Date</p>
                      <p className="font-semibold text-sm">{new Date(featuredTournament.start_date).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {(featuredTournament.status === "live" || featuredTournament.status === "completed") && (
                    <TournamentBracket tournamentId={featuredTournament.id} />
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Other Tournaments */}
          <div className="animate-fade-in animation-delay-200">
            <h2 className="text-xl font-semibold text-foreground mb-4">More Tournaments</h2>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Loading tournaments...</p>
              </div>
            ) : otherTournaments.length === 0 ? (
              <Card className="glass-card border-border">
                <CardContent className="py-12 text-center">
                  <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground">No additional tournaments available</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {otherTournaments.map((tournament, index) => (
                  <Card
                    key={tournament.id}
                    className="glass-card border-border hover:border-accent transition-all duration-300 hover:shadow-glow-cyan animate-fade-in"
                    style={{ animationDelay: `${(index + 3) * 100}ms` }}
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <CardTitle className="text-xl">{tournament.name}</CardTitle>
                        {getStatusBadge(tournament.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{tournament.game}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2"><Coins className="w-4 h-4 text-primary" /><span className="text-muted-foreground">Entry Fee</span></div>
                          <span className="font-semibold">{tournament.entry_fee} GZC</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2"><Trophy className="w-4 h-4 text-neon-cyan" /><span className="text-muted-foreground">Prize Pool</span></div>
                          <span className="font-semibold text-neon-cyan">{tournament.prize_pool} GZC</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2"><Users className="w-4 h-4 text-neon-pink" /><span className="text-muted-foreground">Players</span></div>
                          <span className="font-semibold">{tournament.participants || 0}/{tournament.max_participants}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-neon-green" /><span className="text-muted-foreground">Starts</span></div>
                          <span className="font-semibold">{new Date(tournament.start_date).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {tournament.status === "upcoming" && (
                        <Button
                          variant="neon" size="sm" className="w-full"
                          disabled={joiningId === tournament.id || joinedMap[tournament.id]}
                          onClick={() => handleJoin(tournament.id)}
                        >
                          {joinedMap[tournament.id] ? "Already Joined ✓" : joiningId === tournament.id ? "Joining..." : "Join Tournament"}
                        </Button>
                      )}

                      {(tournament.status === "live" || tournament.status === "completed") && (
                        <Button
                          variant="outline" size="sm" className="w-full border-accent/30 text-accent"
                          onClick={() => setBracketTournamentId(bracketTournamentId === tournament.id ? null : tournament.id)}
                        >
                          {bracketTournamentId === tournament.id ? "Hide Bracket" : "View Bracket"}
                        </Button>
                      )}

                      {bracketTournamentId === tournament.id && (
                        <div className="mt-4 animate-scale-in">
                          <TournamentBracket tournamentId={tournament.id} />
                        </div>
                      )}
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
