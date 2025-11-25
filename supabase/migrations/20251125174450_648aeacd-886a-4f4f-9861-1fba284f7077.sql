-- Add result tracking columns to tournament_participants table
ALTER TABLE public.tournament_participants
ADD COLUMN placement integer,
ADD COLUMN completed_at timestamp with time zone,
ADD COLUMN points_earned integer DEFAULT 0;

-- Add index for better query performance
CREATE INDEX idx_tournament_participants_user_placement 
ON public.tournament_participants(user_id, placement) 
WHERE placement IS NOT NULL;

-- Add index for time-based queries
CREATE INDEX idx_tournament_participants_completed_at 
ON public.tournament_participants(completed_at) 
WHERE completed_at IS NOT NULL;