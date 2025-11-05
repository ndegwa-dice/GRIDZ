-- Create tournaments table
CREATE TABLE public.tournaments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  game TEXT NOT NULL,
  entry_fee INTEGER NOT NULL,
  prize_pool INTEGER NOT NULL,
  max_participants INTEGER NOT NULL,
  start_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'Open',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('Open', 'Full', 'In Progress', 'Completed'))
);

-- Create tournament_participants table
CREATE TABLE public.tournament_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tournament_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_participants ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tournaments
CREATE POLICY "Anyone can view tournaments"
  ON public.tournaments
  FOR SELECT
  USING (true);

CREATE POLICY "Only admins can create tournaments"
  ON public.tournaments
  FOR INSERT
  WITH CHECK (false); -- Will be updated when admin system is implemented

CREATE POLICY "Only admins can update tournaments"
  ON public.tournaments
  FOR UPDATE
  USING (false); -- Will be updated when admin system is implemented

-- RLS Policies for tournament_participants
CREATE POLICY "Anyone can view tournament participants"
  ON public.tournament_participants
  FOR SELECT
  USING (true);

CREATE POLICY "Users can join tournaments"
  ON public.tournament_participants
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave their own tournaments"
  ON public.tournament_participants
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to join tournament (handles transaction atomically)
CREATE OR REPLACE FUNCTION public.join_tournament(
  p_tournament_id UUID,
  p_user_id UUID
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_entry_fee INTEGER;
  v_current_balance INTEGER;
  v_current_participants INTEGER;
  v_max_participants INTEGER;
  v_tournament_status TEXT;
BEGIN
  -- Get tournament details
  SELECT entry_fee, status, max_participants
  INTO v_entry_fee, v_tournament_status, v_max_participants
  FROM public.tournaments
  WHERE id = p_tournament_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Tournament not found'
    );
  END IF;

  -- Check if tournament is open
  IF v_tournament_status != 'Open' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Tournament is not open for registration'
    );
  END IF;

  -- Check if already joined
  IF EXISTS (
    SELECT 1 FROM public.tournament_participants
    WHERE tournament_id = p_tournament_id AND user_id = p_user_id
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'You have already joined this tournament'
    );
  END IF;

  -- Check current participants count
  SELECT COUNT(*)
  INTO v_current_participants
  FROM public.tournament_participants
  WHERE tournament_id = p_tournament_id;

  IF v_current_participants >= v_max_participants THEN
    -- Update tournament status to Full
    UPDATE public.tournaments
    SET status = 'Full', updated_at = now()
    WHERE id = p_tournament_id;

    RETURN jsonb_build_object(
      'success', false,
      'error', 'Tournament is full'
    );
  END IF;

  -- Get user's current balance
  SELECT wallet_balance
  INTO v_current_balance
  FROM public.profiles
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User profile not found'
    );
  END IF;

  -- Check if user has enough tokens
  IF v_current_balance < v_entry_fee THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Insufficient GZC tokens. You need ' || v_entry_fee || ' GZC but only have ' || v_current_balance || ' GZC'
    );
  END IF;

  -- Deduct entry fee from user's wallet
  UPDATE public.profiles
  SET wallet_balance = wallet_balance - v_entry_fee,
      updated_at = now()
  WHERE id = p_user_id;

  -- Add user to tournament
  INSERT INTO public.tournament_participants (tournament_id, user_id)
  VALUES (p_tournament_id, p_user_id);

  -- Check if tournament is now full
  v_current_participants := v_current_participants + 1;
  IF v_current_participants >= v_max_participants THEN
    UPDATE public.tournaments
    SET status = 'Full', updated_at = now()
    WHERE id = p_tournament_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'new_balance', v_current_balance - v_entry_fee
  );
END;
$$;

-- Create trigger for tournaments updated_at
CREATE TRIGGER update_tournaments_updated_at
  BEFORE UPDATE ON public.tournaments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Enable realtime for tournaments and participants
ALTER PUBLICATION supabase_realtime ADD TABLE public.tournaments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tournament_participants;

-- Set replica identity for realtime updates
ALTER TABLE public.tournaments REPLICA IDENTITY FULL;
ALTER TABLE public.tournament_participants REPLICA IDENTITY FULL;