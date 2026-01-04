-- =============================================
-- SECURITY FIX: Address all 4 error-level issues
-- =============================================

-- 1. Create app_role enum and user_roles table for admin system
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- RLS for user_roles - only admins can manage roles
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- 2. Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- =============================================
-- FIX 1: join_tournament function - add authorization check
-- =============================================
CREATE OR REPLACE FUNCTION public.join_tournament(p_tournament_id uuid, p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- CRITICAL: Verify caller is acting on their own behalf
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: Cannot join tournament for another user';
  END IF;

  -- Insert participant
  INSERT INTO public.tournament_participants (tournament_id, user_id)
  VALUES (p_tournament_id, p_user_id);
  
  -- Update participant count
  UPDATE public.tournaments 
  SET current_participants = current_participants + 1
  WHERE id = p_tournament_id;
END;
$$;

-- =============================================
-- FIX 2: Profiles - restrict public access to own profile only
-- =============================================
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

-- =============================================
-- FIX 3: Tournaments - restrict INSERT/UPDATE to admins only
-- =============================================
DROP POLICY IF EXISTS "Authenticated users can insert tournaments" ON public.tournaments;
DROP POLICY IF EXISTS "Authenticated users can update tournaments" ON public.tournaments;

CREATE POLICY "Only admins can insert tournaments"
  ON public.tournaments FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update tournaments"
  ON public.tournaments FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete tournaments"
  ON public.tournaments FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- FIX 4: Tournament participants - remove user ability to update results
-- =============================================
DROP POLICY IF EXISTS "Users can update own participation" ON public.tournament_participants;

-- Only admins can update tournament results (placement, points)
CREATE POLICY "Only admins can update tournament results"
  ON public.tournament_participants FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));