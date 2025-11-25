import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface PerformanceChartProps {
  data: Array<{
    month: string;
    avgPlacement: number;
    tournamentsCount: number;
  }>;
}

export const PerformanceChart = ({ data }: PerformanceChartProps) => {
  if (data.length === 0) {
    return (
      <Card className="p-6 bg-card border-border">
        <h3 className="text-xl font-bold text-foreground mb-4">Performance Over Time</h3>
        <div className="flex items-center justify-center h-[300px] text-muted-foreground">
          <p>Complete tournaments to see your performance trends</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-card border-border">
      <h3 className="text-xl font-bold text-foreground mb-6">Performance Over Time</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="month" 
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: '12px' }}
            reversed
            label={{ value: 'Placement (lower is better)', angle: -90, position: 'insideLeft', style: { fill: 'hsl(var(--muted-foreground))' } }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              color: 'hsl(var(--foreground))',
            }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
          />
          <Legend 
            wrapperStyle={{ color: 'hsl(var(--foreground))' }}
          />
          <Line 
            type="monotone" 
            dataKey="avgPlacement" 
            stroke="hsl(var(--neon-cyan))" 
            strokeWidth={3}
            dot={{ fill: 'hsl(var(--neon-cyan))', r: 5 }}
            activeDot={{ r: 7 }}
            name="Avg Placement"
          />
          <Line 
            type="monotone" 
            dataKey="tournamentsCount" 
            stroke="hsl(var(--primary))" 
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--primary))', r: 4 }}
            name="Tournaments"
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};
