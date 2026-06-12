alter table public.api_integrations
  add column if not exists environment text not null default 'production',
  add column if not exists encrypted_access_token text,
  add column if not exists parameters jsonb not null default '{}'::jsonb,
  add column if not exists status text not null default 'configured',
  add column if not exists last_verified_at timestamp with time zone;

alter table public.api_integrations drop constraint if exists supported_integration_environment;
alter table public.api_integrations
  add constraint supported_integration_environment check (environment in ('sandbox', 'production'));

alter table public.api_integrations drop constraint if exists supported_integration_status;
alter table public.api_integrations
  add constraint supported_integration_status check (status in ('configured', 'needs_review', 'verified', 'inactive'));

create index if not exists api_integrations_network_environment_idx
  on public.api_integrations(owner_profile_id, network_name, environment);
