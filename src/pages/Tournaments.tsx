import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Coins, Calendar } from "lucide-react";

const Tournaments = () => {
  const tournaments = [
    {
      id: 1,
      name: "Nairobi Championship Series",
      game: "FIFA 24",
      entryFee: 20,
      prizePool: 500,
      participants: 64,
      maxParticipants: 128,
      startDate: "2025-01-15",
      status: "Open"
    },
    {
      id: 2,
      name: "Mombasa Showdown",
      game: "Call of Duty",
      entryFee: 30,
      prizePool: 800,
      participants: 42,
      maxParticipants: 64,
      startDate: "2025-01-18",
      status: "Open"
    },
    {
      id: 3,
      name: "Kisumu Elite League",
      game: "Valorant",
      entryFee: 25,
      prizePool: 600,
      participants: 88,
      maxParticipants: 128,
      startDate: "2025-01-20",
      status: "Open"
    },
    {
      id: 4,
      name: "Nakuru Pro Circuit",
      game: "Rocket League",
      entryFee: 15,
      prizePool: 400,
      participants: 128,
      maxParticipants: 128,
      startDate: "2025-01-12",
      status: "Full"
    },
    {
      id: 5,
      name: "Eldoret Masters",
      game: "League of Legends",
      entryFee: 35,
      prizePool: 1000,
      participants: 96,
      maxParticipants: 128,
      startDate: "2025-01-25",
      status: "Open"
    },
    {
      id: 6,
      name: "Thika Weekend Clash",
      game: "Fortnite",
      entryFee: 20,
      prizePool: 500,
      participants: 54,
      maxParticipants: 100,
      startDate: "2025-01-22",
      status: "Open"
    }
  ];

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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.map((tournament) => (
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
                      <span className="font-semibold">{tournament.entryFee} GZC</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-neon-cyan" />
                        <span className="text-muted-foreground">Prize Pool</span>
                      </div>
                      <span className="font-semibold text-neon-cyan">{tournament.prizePool} GZC</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-neon-pink" />
                        <span className="text-muted-foreground">Players</span>
                      </div>
                      <span className="font-semibold">
                        {tournament.participants}/{tournament.maxParticipants}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-neon-green" />
                        <span className="text-muted-foreground">Starts</span>
                      </div>
                      <span className="font-semibold">{tournament.startDate}</span>
                    </div>
                  </div>
                  
                  <Button 
                    variant={tournament.status === "Open" ? "tournament" : "secondary"}
                    className="w-full"
                    disabled={tournament.status !== "Open"}
                  >
                    {tournament.status === "Open" ? "Join Tournament" : "Tournament Full"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Tournaments;
