create table public.profiles (
  id uuid primary key,
  display_name text not null default '',
  avatar_url text,
  status text not null default 'pending_verification'
    constraint profiles_status_check
    check (status in ('pending_verification', 'active', 'locked', 'suspended', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_auth_user_fk
    foreign key (id) references auth.users (id) on delete restrict
);

comment on table public.profiles is
  'Application-owned presentation profiles corresponding one-to-one with Supabase Auth subjects.';
comment on column public.profiles.display_name is
  'User presentation data only; never use for authorization.';
comment on column public.profiles.avatar_url is
  'User presentation data only; never use for authorization.';

create function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke execute on function public.set_updated_at() from public;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create function public.provision_user_profile()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  insert into public.profiles (id, display_name, status)
  values (
    new.id,
    coalesce(nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''), split_part(coalesce(new.email, ''), '@', 1)),
    case when new.email_confirmed_at is null then 'pending_verification' else 'active' end
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

revoke execute on function public.provision_user_profile() from public;

create trigger auth_user_profile_provisioning
after insert on auth.users
for each row execute function public.provision_user_profile();

insert into public.profiles (id, display_name, status, created_at, updated_at)
select
  users.id,
  coalesce(nullif(btrim(users.raw_user_meta_data ->> 'full_name'), ''), split_part(coalesce(users.email, ''), '@', 1)),
  case when users.email_confirmed_at is null then 'pending_verification' else 'active' end,
  users.created_at,
  users.created_at
from auth.users as users
on conflict (id) do nothing;

alter table public.profiles enable row level security;
alter table public.profiles force row level security;

revoke all on table public.profiles from anon, authenticated;
grant select on table public.profiles to authenticated;
grant update (display_name, avatar_url) on table public.profiles to authenticated;

create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

create policy "profiles_update_own_presentation"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);
