
-- Create matches table
CREATE TABLE public.matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  round integer NOT NULL,
  match_order integer NOT NULL,
  player1_id uuid,
  player2_id uuid,
  player1_score integer NOT NULL DEFAULT 0,
  player2_score integer NOT NULL DEFAULT 0,
  winner_id uuid,
  status text NOT NULL DEFAULT 'pending',
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view matches" ON public.matches FOR SELECT USING (true);
CREATE POLICY "Only admins can insert matches" ON public.matches FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Only admins can update matches" ON public.matches FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Only admins can delete matches" ON public.matches FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Create match_events table
CREATE TABLE public.match_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  user_id uuid,
  minute integer NOT NULL DEFAULT 0,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.match_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view match events" ON public.match_events FOR SELECT USING (true);
CREATE POLICY "Only admins can insert match events" ON public.match_events FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Only admins can update match events" ON public.match_events FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Only admins can delete match events" ON public.match_events FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;
ALTER PUBLICATION supabase_realtime ADD TABLE public.match_events;

-- Create generate_bracket function
CREATE OR REPLACE FUNCTION public.generate_bracket(p_tournament_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_participants uuid[];
  v_count integer;
  v_total_slots integer;
  v_total_rounds integer;
  v_i integer;
  v_match_order integer;
  v_round integer;
  v_matches_in_round integer;
BEGIN
  -- Verify caller is admin
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins can generate brackets';
  END IF;

  -- Get shuffled participants
  SELECT array_agg(user_id ORDER BY random()) INTO v_participants
  FROM tournament_participants
  WHERE tournament_id = p_tournament_id;

  v_count := array_length(v_participants, 1);
  IF v_count IS NULL OR v_count < 2 THEN
    RAISE EXCEPTION 'Need at least 2 participants';
  END IF;

  -- Calculate total slots (next power of 2)
  v_total_slots := 1;
  WHILE v_total_slots < v_count LOOP
    v_total_slots := v_total_slots * 2;
  END LOOP;

  -- Calculate total rounds
  v_total_rounds := 0;
  v_i := v_total_slots;
  WHILE v_i > 1 LOOP
    v_total_rounds := v_total_rounds + 1;
    v_i := v_i / 2;
  END LOOP;

  -- Delete existing matches for this tournament
  DELETE FROM matches WHERE tournament_id = p_tournament_id;

  -- Insert round 1 matches
  v_match_order := 1;
  FOR v_i IN 1..v_total_slots BY 2 LOOP
    INSERT INTO matches (tournament_id, round, match_order, player1_id, player2_id, status)
    VALUES (
      p_tournament_id,
      1,
      v_match_order,
      CASE WHEN v_i <= v_count THEN v_participants[v_i] ELSE NULL END,
      CASE WHEN v_i + 1 <= v_count THEN v_participants[v_i + 1] ELSE NULL END,
      CASE 
        WHEN v_i <= v_count AND v_i + 1 <= v_count THEN 'pending'
        ELSE 'completed'
      END
    );
    
    -- Auto-advance BYE matches
    IF v_i <= v_count AND v_i + 1 > v_count THEN
      UPDATE matches SET winner_id = v_participants[v_i], completed_at = now()
      WHERE tournament_id = p_tournament_id AND round = 1 AND match_order = v_match_order;
    END IF;
    
    v_match_order := v_match_order + 1;
  END LOOP;

  -- Create placeholder matches for subsequent rounds
  FOR v_round IN 2..v_total_rounds LOOP
    v_matches_in_round := v_total_slots / (power(2, v_round)::integer);
    FOR v_i IN 1..v_matches_in_round LOOP
      INSERT INTO matches (tournament_id, round, match_order, status)
      VALUES (p_tournament_id, v_round, v_i, 'pending');
    END LOOP;
  END LOOP;

  -- Update tournament status to live
  UPDATE tournaments SET status = 'live' WHERE id = p_tournament_id;

  -- Auto-advance winners from BYE matches in round 1 to round 2
  PERFORM advance_bye_winners(p_tournament_id);
END;
$$;

-- Helper function to advance BYE winners
CREATE OR REPLACE FUNCTION public.advance_bye_winners(p_tournament_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_match RECORD;
  v_next_match_order integer;
BEGIN
  FOR v_match IN 
    SELECT id, round, match_order, winner_id 
    FROM matches 
    WHERE tournament_id = p_tournament_id 
      AND status = 'completed' 
      AND winner_id IS NOT NULL
    ORDER BY round, match_order
  LOOP
    v_next_match_order := ceil(v_match.match_order::numeric / 2);
    
    IF v_match.match_order % 2 = 1 THEN
      UPDATE matches SET player1_id = v_match.winner_id
      WHERE tournament_id = p_tournament_id 
        AND round = v_match.round + 1 
        AND match_order = v_next_match_order
        AND player1_id IS NULL;
    ELSE
      UPDATE matches SET player2_id = v_match.winner_id
      WHERE tournament_id = p_tournament_id 
        AND round = v_match.round + 1 
        AND match_order = v_next_match_order
        AND player2_id IS NULL;
    END IF;
  END LOOP;
END;
$$;

-- Function to complete a match and advance winner
CREATE OR REPLACE FUNCTION public.complete_match(p_match_id uuid, p_winner_id uuid, p_player1_score integer, p_player2_score integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_match RECORD;
  v_next_match_order integer;
  v_total_rounds integer;
  v_matches_count integer;
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins can complete matches';
  END IF;

  -- Get match info
  SELECT * INTO v_match FROM matches WHERE id = p_match_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Match not found';
  END IF;

  -- Update the match
  UPDATE matches SET 
    winner_id = p_winner_id,
    player1_score = p_player1_score,
    player2_score = p_player2_score,
    status = 'completed',
    completed_at = now()
  WHERE id = p_match_id;

  -- Calculate total rounds for this tournament
  SELECT count(DISTINCT round) INTO v_total_rounds FROM matches WHERE tournament_id = v_match.tournament_id;

  -- If not the final round, advance winner
  IF v_match.round < v_total_rounds THEN
    v_next_match_order := ceil(v_match.match_order::numeric / 2);
    
    IF v_match.match_order % 2 = 1 THEN
      UPDATE matches SET player1_id = p_winner_id
      WHERE tournament_id = v_match.tournament_id 
        AND round = v_match.round + 1 
        AND match_order = v_next_match_order;
    ELSE
      UPDATE matches SET player2_id = p_winner_id
      WHERE tournament_id = v_match.tournament_id 
        AND round = v_match.round + 1 
        AND match_order = v_next_match_order;
    END IF;
  ELSE
    -- Final match completed, check if tournament is done
    SELECT count(*) INTO v_matches_count 
    FROM matches 
    WHERE tournament_id = v_match.tournament_id AND status != 'completed';
    
    IF v_matches_count = 0 THEN
      UPDATE tournaments SET status = 'completed' WHERE id = v_match.tournament_id;
    END IF;
  END IF;
END;
$$;
