import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTournaments, Tournament } from "@/hooks/useTournaments";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Calendar, Users, Coins, Loader2 } from "lucide-react";

const DashboardTournaments = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { getUserTournaments } = useTournaments();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadTournaments();
    }
  }, [user]);

  const loadTournaments = async () => {
    if (!user) return;
    try {
      const data = await getUserTournaments(user.id);
      setTournaments(data as Tournament[]);
    } catch (error) {
      console.error("Error loading tournaments:", error);
    } finally {
      setLoading(false);
    }
  };

  const activeTournaments = tournaments.filter(t => t.status === 'upcoming' || t.status === 'active');
  const completedTournaments = tournaments.filter(t => t.status === 'completed');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const TournamentCard = ({ tournament }: { tournament: Tournament }) => (
    <Card className="bg-secondary/30 border-border hover:border-primary/50 transition-all">
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h4 className="font-semibold text-lg">{tournament.name}</h4>
            <p className="text-sm text-muted-foreground">{tournament.game}</p>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full capitalize ${
            tournament.status === 'upcoming' ? 'bg-neon-cyan/20 text-neon-cyan' :
            tournament.status === 'active' ? 'bg-neon-green/20 text-neon-green' :
            'bg-muted text-muted-foreground'
          }`}>
            {tournament.status}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Trophy className="h-4 w-4 text-primary" />
            <span>{tournament.prize_pool} GZC</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{tournament.participants || 0}/{tournament.max_participants}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{new Date(tournament.start_date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Coins className="h-4 w-4" />
            <span>{tournament.entry_fee} GZC entry</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Tournaments</h1>
          <p className="text-muted-foreground mt-1">Manage your tournament participation</p>
        </div>
        <Button onClick={() => navigate("/tournaments")} className="bg-primary text-primary-foreground">
          <Trophy className="h-4 w-4 mr-2" />
          Find More
        </Button>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="bg-secondary/50">
          <TabsTrigger value="active">Active ({activeTournaments.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedTournaments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          {activeTournaments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeTournaments.map((tournament) => (
                <TournamentCard key={tournament.id} tournament={tournament} />
              ))}
            </div>
          ) : (
            <Card className="bg-card border-border">
              <CardContent className="py-12 text-center">
                <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground mb-4">No active tournaments</p>
                <Button onClick={() => navigate("/tournaments")} variant="outline">
                  Browse Tournaments
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          {completedTournaments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedTournaments.map((tournament) => (
                <TournamentCard key={tournament.id} tournament={tournament} />
              ))}
            </div>
          ) : (
            <Card className="bg-card border-border">
              <CardContent className="py-12 text-center">
                <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">No completed tournaments yet</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardTournaments;
