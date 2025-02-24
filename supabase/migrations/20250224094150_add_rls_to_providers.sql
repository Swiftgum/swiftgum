-- Enable RLS on the providers table
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;

-- Create policy to allow read access to everyone
CREATE POLICY "Allow read access for all users" ON public.providers FOR
SELECT
  USING (true);
