import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Tournament {
  id: string;
  name: string;
  game: string;
  entry_fee: number;
  prize_pool: number;
  max_participants: number;
  start_date: string;
  status: string;
  created_at: string;
  updated_at: string;
  participants?: number;
}

export interface TournamentParticipant {
  id: string;
  tournament_id: string;
  user_id: string;
  joined_at: string;
}

export const useTournaments = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadTournaments();
    subscribeToTournaments();
  }, []);

  const loadTournaments = async () => {
    try {
      // Get all tournaments
      const { data: tournamentsData, error: tournamentsError } = await supabase
        .from('tournaments')
        .select('*')
        .order('start_date', { ascending: true });

      if (tournamentsError) throw tournamentsError;

      // Get participant counts for each tournament
      const { data: participantsData, error: participantsError } = await supabase
        .from('tournament_participants')
        .select('tournament_id');

      if (participantsError) throw participantsError;

      // Count participants per tournament
      const participantCounts = participantsData.reduce((acc, p) => {
        acc[p.tournament_id] = (acc[p.tournament_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Merge the data
      const tournamentsWithCounts = tournamentsData.map(t => ({
        ...t,
        participants: participantCounts[t.id] || 0
      }));

      setTournaments(tournamentsWithCounts);
    } catch (error: any) {
      console.error('Error loading tournaments:', error);
      toast({
        title: 'Error',
        description: 'Failed to load tournaments',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const subscribeToTournaments = () => {
    const channel = supabase
      .channel('tournaments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tournaments'
        },
        () => {
          console.log('Tournament updated, reloading...');
          loadTournaments();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tournament_participants'
        },
        () => {
          console.log('Participants updated, reloading...');
          loadTournaments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const joinTournament = async (tournamentId: string, userId: string) => {
    try {
      const { data, error } = await supabase.rpc('join_tournament', {
        p_tournament_id: tournamentId,
        p_user_id: userId
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; new_balance?: number };

      if (!result.success) {
        toast({
          title: 'Cannot Join Tournament',
          description: result.error,
          variant: 'destructive',
        });
        return false;
      }

      toast({
        title: 'Successfully Joined!',
        description: `You've joined the tournament. New balance: ${result.new_balance} GZC`,
      });

      // Reload tournaments to update counts
      await loadTournaments();
      return true;
    } catch (error: any) {
      console.error('Error joining tournament:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to join tournament',
        variant: 'destructive',
      });
      return false;
    }
  };

  const getUserTournaments = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('tournament_participants')
        .select(`
          tournament_id,
          joined_at,
          tournaments (*)
        `)
        .eq('user_id', userId);

      if (error) throw error;

      return data.map(p => p.tournaments).filter(Boolean);
    } catch (error: any) {
      console.error('Error loading user tournaments:', error);
      return [];
    }
  };

  const checkUserInTournament = async (tournamentId: string, userId: string) => {
    try {
      const { data, error } = await supabase
        .from('tournament_participants')
        .select('id')
        .eq('tournament_id', tournamentId)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    } catch (error: any) {
      console.error('Error checking tournament participation:', error);
      return false;
    }
  };

  return {
    tournaments,
    loading,
    joinTournament,
    getUserTournaments,
    checkUserInTournament,
    reloadTournaments: loadTournaments
  };
};
