-- Add missing INSERT and DELETE RLS policies for profiles table
-- Provides defense-in-depth beyond the trigger and enables GDPR-compliant account deletion

-- Allow users to insert their own profile (backup to trigger)
CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Allow users to delete their own profile (GDPR compliance)
CREATE POLICY "Users can delete their own profile"
  ON public.profiles
  FOR DELETE
  USING (auth.uid() = id);