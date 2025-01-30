-- Create a default workspace when a user is inserted in auth.users
CREATE FUNCTION public.create_default_workspace () RETURNS trigger AS $$
BEGIN
    INSERT INTO public.workspace (
      owner_user_id,
      label
    )
    VALUES (
      NEW.id,
      'Default Workspace'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to create a default workspace when a user is inserted in auth.users
CREATE TRIGGER create_default_workspace_trigger
AFTER INSERT ON auth.users FOR EACH ROW
EXECUTE FUNCTION public.create_default_workspace ();
