
-- Allow anyone (including anon) to read profiles for tournament display
-- This is safe because profiles only contain public gaming info (username, avatar, bio)
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  TO public
  USING (true);
