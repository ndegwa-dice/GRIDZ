import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface PlacementDistributionProps {
  data: Array<{
    placement: string;
    count: number;
  }>;
}

export const PlacementDistribution = ({ data }: PlacementDistributionProps) => {
  if (data.length === 0) {
    return (
      <Card className="p-6 bg-card border-border">
        <h3 className="text-xl font-bold text-foreground mb-4">Placement Distribution</h3>
        <div className="flex items-center justify-center h-[300px] text-muted-foreground">
          <p>Complete tournaments to see your placement distribution</p>
        </div>
      </Card>
    );
  }

  // Color placements differently
  const getBarColor = (placement: string) => {
    if (placement === "1st") return "hsl(var(--primary))";
    if (placement === "2nd") return "hsl(var(--neon-cyan))";
    if (placement === "3rd") return "hsl(var(--neon-pink))";
    return "hsl(var(--muted))";
  };

  return (
    <Card className="p-6 bg-card border-border">
      <h3 className="text-xl font-bold text-foreground mb-6">Placement Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="placement" 
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: '12px' }}
            label={{ value: 'Count', angle: -90, position: 'insideLeft', style: { fill: 'hsl(var(--muted-foreground))' } }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              color: 'hsl(var(--foreground))',
            }}
          />
          <Bar 
            dataKey="count" 
            fill="hsl(var(--primary))"
            radius={[8, 8, 0, 0]}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.placement)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};
