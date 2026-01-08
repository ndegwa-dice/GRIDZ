import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy } from "lucide-react";

const DashboardTournaments = () => {
  const navigate = useNavigate();

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
          <TabsTrigger value="active">Active (0)</TabsTrigger>
          <TabsTrigger value="completed">Completed (0)</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          <Card className="bg-card border-border">
            <CardContent className="py-12 text-center">
              <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground mb-4">No active tournaments</p>
              <Button onClick={() => navigate("/tournaments")} variant="outline">
                Browse Tournaments
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <Card className="bg-card border-border">
            <CardContent className="py-12 text-center">
              <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">No completed tournaments yet</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardTournaments;
