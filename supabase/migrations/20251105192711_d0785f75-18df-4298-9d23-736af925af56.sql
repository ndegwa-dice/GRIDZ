-- Drop the public SELECT policy that exposes all user data
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- The "Users can view their own profile" policy (auth.uid() = id) remains
-- and provides appropriate access control for user data privacy