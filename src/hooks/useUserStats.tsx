import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UserStats {
  totalTournaments: number;
  winRate: number;
  averagePlacement: number;
  totalEarnings: number;
  performanceOverTime: Array<{
    month: string;
    avgPlacement: number;
    tournamentsCount: number;
  }>;
  placementDistribution: Array<{
    placement: string;
    count: number;
  }>;
}

export const useUserStats = (userId: string | undefined) => {
  const [stats, setStats] = useState<UserStats>({
    totalTournaments: 0,
    winRate: 0,
    averagePlacement: 0,
    totalEarnings: 0,
    performanceOverTime: [],
    placementDistribution: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const loadStats = async () => {
      try {
        // Fetch all tournament participations with results
        const { data: participations, error } = await supabase
          .from("tournament_participants")
          .select("placement, completed_at, points_earned, tournament_id")
          .eq("user_id", userId);

        if (error) throw error;

        if (!participations || participations.length === 0) {
          setLoading(false);
          return;
        }

        // Calculate total tournaments
        const totalTournaments = participations.length;

        // Calculate completed tournaments (those with placement data)
        const completedTournaments = participations.filter(
          (p) => p.placement !== null
        );

        // Calculate win rate
        const wins = completedTournaments.filter((p) => p.placement === 1).length;
        const winRate = completedTournaments.length > 0
          ? (wins / completedTournaments.length) * 100
          : 0;

        // Calculate average placement
        const placements = completedTournaments.map((p) => p.placement!);
        const averagePlacement = placements.length > 0
          ? placements.reduce((sum, p) => sum + p, 0) / placements.length
          : 0;

        // Calculate total earnings
        const totalEarnings = participations.reduce(
          (sum, p) => sum + (p.points_earned || 0),
          0
        );

        // Calculate performance over time (last 6 months)
        const now = new Date();
        const sixMonthsAgo = new Date(now.setMonth(now.getMonth() - 6));
        
        const recentCompletedTournaments = completedTournaments.filter((p) => {
          if (!p.completed_at) return false;
          return new Date(p.completed_at) >= sixMonthsAgo;
        });

        // Group by month
        const monthlyData = new Map<string, { placements: number[]; count: number }>();
        
        recentCompletedTournaments.forEach((p) => {
          if (!p.completed_at || p.placement === null) return;
          
          const date = new Date(p.completed_at);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          
          if (!monthlyData.has(monthKey)) {
            monthlyData.set(monthKey, { placements: [], count: 0 });
          }
          
          const monthData = monthlyData.get(monthKey)!;
          monthData.placements.push(p.placement);
          monthData.count++;
        });

        const performanceOverTime = Array.from(monthlyData.entries())
          .map(([month, data]) => ({
            month: new Date(month + "-01").toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            }),
            avgPlacement: data.placements.reduce((sum, p) => sum + p, 0) / data.placements.length,
            tournamentsCount: data.count,
          }))
          .sort((a, b) => {
            const dateA = new Date(a.month);
            const dateB = new Date(b.month);
            return dateA.getTime() - dateB.getTime();
          });

        // Calculate placement distribution
        const placementCounts = new Map<number, number>();
        completedTournaments.forEach((p) => {
          if (p.placement !== null) {
            placementCounts.set(p.placement, (placementCounts.get(p.placement) || 0) + 1);
          }
        });

        const placementDistribution = Array.from(placementCounts.entries())
          .map(([placement, count]) => ({
            placement: placement <= 3 ? `${placement}${["st", "nd", "rd"][placement - 1]}` : `${placement}th`,
            count,
          }))
          .sort((a, b) => {
            const numA = parseInt(a.placement);
            const numB = parseInt(b.placement);
            return numA - numB;
          })
          .slice(0, 10); // Top 10 placements

        setStats({
          totalTournaments,
          winRate,
          averagePlacement,
          totalEarnings,
          performanceOverTime,
          placementDistribution,
        });
      } catch (error) {
        console.error("Error loading user stats:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();

    // Subscribe to changes
    const channel = supabase
      .channel("user-stats-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tournament_participants",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          loadStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return { stats, loading };
};
