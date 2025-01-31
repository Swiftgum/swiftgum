CREATE TABLE public.providers (
  provider_id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
  identifier TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.providers
ADD CONSTRAINT uq_providers_identifier UNIQUE (identifier);

CREATE TABLE public.integrations (
  integration_id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
  provider_id UUID NOT NULL,
  workspace_id UUID NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  credentials JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.integrations
ADD CONSTRAINT fk_integrations_provider FOREIGN KEY (provider_id) REFERENCES public.providers (provider_id) ON DELETE CASCADE;

ALTER TABLE public.integrations
ADD CONSTRAINT fk_integrations_workspace FOREIGN KEY (workspace_id) REFERENCES public.workspace (workspace_id) ON DELETE CASCADE;

-- Add unique constraint on provider_id and workspace_id
ALTER TABLE public.integrations
ADD CONSTRAINT uq_integrations_provider_workspace UNIQUE (provider_id, workspace_id);
