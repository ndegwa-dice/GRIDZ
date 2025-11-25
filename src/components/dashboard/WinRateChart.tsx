import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface WinRateChartProps {
  winRate: number;
  totalTournaments: number;
}

export const WinRateChart = ({ winRate, totalTournaments }: WinRateChartProps) => {
  if (totalTournaments === 0) {
    return (
      <Card className="p-6 bg-card border-border">
        <h3 className="text-xl font-bold text-foreground mb-4">Win Rate</h3>
        <div className="flex items-center justify-center h-[300px] text-muted-foreground">
          <p>Join tournaments to track your win rate</p>
        </div>
      </Card>
    );
  }

  const wins = Math.round((winRate / 100) * totalTournaments);
  const losses = totalTournaments - wins;

  const data = [
    { name: "Wins", value: wins, percentage: winRate },
    { name: "Other Placements", value: losses, percentage: 100 - winRate },
  ];

  const COLORS = ["hsl(var(--neon-green))", "hsl(var(--muted))"];

  return (
    <Card className="p-6 bg-card border-border">
      <h3 className="text-xl font-bold text-foreground mb-6">Win Rate</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              color: 'hsl(var(--foreground))',
            }}
          />
          <Legend 
            wrapperStyle={{ color: 'hsl(var(--foreground))' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
};
