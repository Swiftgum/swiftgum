-- Create function to generate unique dns names
CREATE OR REPLACE FUNCTION public.generate_dns_name () RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER
SET
  search_path = '' AS $$
DECLARE
    attempt INT := 0;
    new_dns_name TEXT;
BEGIN
    WHILE attempt < 10 LOOP
        new_dns_name := encode(extensions.gen_random_bytes(12), 'hex');

        -- Check if the generated name is unique
        IF NOT EXISTS (
            SELECT 1
            FROM public.workspace
            WHERE dns_name = new_dns_name
        ) THEN
            RETURN new_dns_name;
        END IF;

        attempt := attempt + 1;
    END LOOP;

    RAISE EXCEPTION 'Could not generate unique dns_name after 10 attempts';
END;
$$;

-- Add dns_name column to workspace table
ALTER TABLE workspace
ADD COLUMN dns_name TEXT UNIQUE DEFAULT generate_dns_name ();

-- Update existing rows with random values
UPDATE workspace
SET
  dns_name = generate_dns_name ()
WHERE
  dns_name IS NULL;

-- Make dns_name NOT NULL after populating existing rows
ALTER TABLE workspace
ALTER COLUMN dns_name
SET NOT NULL;
