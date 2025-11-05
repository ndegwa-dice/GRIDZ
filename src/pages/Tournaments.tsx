import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Coins, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTournaments } from "@/hooks/useTournaments";
import { useState, useEffect } from "react";

const Tournaments = () => {
  const { user } = useAuth();
  const { tournaments, loading, joinTournament, checkUserInTournament } = useTournaments();
  const [joiningTournament, setJoiningTournament] = useState<string | null>(null);
  const [userTournaments, setUserTournaments] = useState<Set<string>>(new Set());

  // Check which tournaments the user has joined
  useEffect(() => {
    if (user && tournaments.length > 0) {
      tournaments.forEach(async (tournament) => {
        const isJoined = await checkUserInTournament(tournament.id, user.id);
        if (isJoined) {
          setUserTournaments(prev => new Set(prev).add(tournament.id));
        }
      });
    }
  }, [user, tournaments]);

  const handleJoinTournament = async (tournamentId: string) => {
    if (!user) return;
    
    setJoiningTournament(tournamentId);
    const success = await joinTournament(tournamentId, user.id);
    
    if (success) {
      setUserTournaments(prev => new Set(prev).add(tournamentId));
    }
    
    setJoiningTournament(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-gold bg-clip-text text-transparent">
                Active Tournaments
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Compete, win, and earn in Kenya's premier esports competitions
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading tournaments...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tournaments.map((tournament) => {
                const isJoined = userTournaments.has(tournament.id);
                const isJoining = joiningTournament === tournament.id;
                
                return (
                <Card 
                  key={tournament.id}
                  className="bg-card border-border hover:border-accent transition-all duration-300 hover:shadow-glow-cyan"
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
                    
                    {isJoined ? (
                      <Button variant="secondary" className="w-full" disabled>
                        Already Joined ✓
                      </Button>
                    ) : tournament.status === "Open" ? (
                      user ? (
                        <Button 
                          variant="tournament" 
                          className="w-full"
                          onClick={() => handleJoinTournament(tournament.id)}
                          disabled={isJoining}
                        >
                          {isJoining ? "Joining..." : "Join Tournament"}
                        </Button>
                      ) : (
                        <Button variant="tournament" className="w-full" asChild>
                          <Link to="/signup">Sign Up to Join</Link>
                        </Button>
                      )
                    ) : (
                      <Button variant="secondary" className="w-full" disabled>
                        Tournament Full
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Tournaments;
