import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";

const Stats = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Statistics</h1>
        <p className="text-muted-foreground mt-1">Track your gaming performance</p>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="py-16 text-center">
          <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
          <h3 className="text-xl font-semibold mb-2">No Statistics Yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Join and complete tournaments to see your performance stats, charts, and rankings!
          </p>
          <Button onClick={() => navigate("/tournaments")} className="bg-primary text-primary-foreground">
            Browse Tournaments
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Stats;
