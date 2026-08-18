create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text not null default 'active'
    constraint organizations_status_check
    check (status in ('active', 'suspended', 'closed')),
  created_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint organizations_name_check
    check (name = btrim(name) and char_length(name) between 1 and 120),
  constraint organizations_created_by_fk
    foreign key (created_by) references auth.users (id) on delete restrict
);

comment on column public.organizations.status is
  'Self-service organizations begin active; suspended and closed organizations grant no tenant visibility.';
comment on column public.organizations.created_by is
  'Immutable creation provenance only; organization authorization is derived from active memberships.';

create table public.organization_memberships (
  organization_id uuid not null,
  user_id uuid not null,
  role text not null
    constraint organization_memberships_role_check
    check (role in ('owner', 'member')),
  status text not null default 'active'
    constraint organization_memberships_status_check
    check (status in ('active', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint organization_memberships_pk primary key (organization_id, user_id),
  constraint organization_memberships_organization_fk
    foreign key (organization_id) references public.organizations (id) on delete cascade,
  constraint organization_memberships_user_fk
    foreign key (user_id) references auth.users (id) on delete cascade
);

create trigger organizations_set_updated_at
before update on public.organizations
for each row execute function public.set_updated_at();

create trigger organization_memberships_set_updated_at
before update on public.organization_memberships
for each row execute function public.set_updated_at();

alter table public.organizations enable row level security;
alter table public.organizations force row level security;
alter table public.organization_memberships enable row level security;
alter table public.organization_memberships force row level security;

revoke all on table public.organizations from public, anon, authenticated;
revoke all on table public.organization_memberships from public, anon, authenticated;

create function public.is_active_organization_member(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select exists (
    select 1
    from public.organization_memberships as membership
    inner join public.organizations as organization
      on organization.id = membership.organization_id
    where membership.organization_id = target_organization_id
      and membership.user_id = (select auth.uid())
      and membership.status = 'active'
      and organization.status = 'active'
  );
$$;

comment on function public.is_active_organization_member(uuid) is
  'Narrow RLS predicate bound to auth.uid(); avoids recursive membership policy evaluation and returns no tenant data.';

revoke execute on function public.is_active_organization_member(uuid) from PUBLIC;
revoke execute on function public.is_active_organization_member(uuid) from anon;
grant execute on function public.is_active_organization_member(uuid) to authenticated;

create policy "organizations_select_active_member"
on public.organizations
for select
to authenticated
using (public.is_active_organization_member(id));

create policy "organization_memberships_select_active_organization_member"
on public.organization_memberships
for select
to authenticated
using (public.is_active_organization_member(organization_id));

grant select on table public.organizations to authenticated;
grant select on table public.organization_memberships to authenticated;

create function public.create_organization(organization_name text)
returns public.organizations
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  caller_id uuid := (select auth.uid());
  normalized_name text := btrim(organization_name);
  created_organization public.organizations;
begin
  if caller_id is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;

  if normalized_name is null or char_length(normalized_name) not between 1 and 120 then
    raise exception 'Organization name must contain between 1 and 120 characters.'
      using errcode = '22023';
  end if;

  insert into public.organizations (name, created_by)
  values (normalized_name, caller_id)
  returning * into created_organization;

  insert into public.organization_memberships (organization_id, user_id, role, status)
  values (created_organization.id, caller_id, 'owner', 'active');

  return created_organization;
end;
$$;

revoke execute on function public.create_organization(text) from PUBLIC;
revoke execute on function public.create_organization(text) from anon;
grant execute on function public.create_organization(text) to authenticated;
