create table public.daily_activity (
	id uuid primary key default gen_random_uuid(),
	user_id uuid not null references auth.users(id) on delete cascade,
	activity_date date not null,
	sport_done boolean not null default false,
	culture_done boolean not null default false,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	constraint daily_activity_user_date_unique
		unique (user_id, activity_date),
	constraint daily_activity_has_activity_check
		check (sport_done or culture_done)
);

create trigger daily_activity_set_updated_at
	before update on public.daily_activity
	for each row
	execute function public.set_current_updated_at();

create index daily_activity_user_activity_date_idx
	on public.daily_activity (user_id, activity_date desc);

alter table public.daily_activity enable row level security;

revoke all on table public.daily_activity from public, anon, authenticated;

grant select, insert, update on table public.daily_activity to authenticated;

create policy "daily_activity_select_own"
	on public.daily_activity
	for select
	to authenticated
	using ((select auth.uid()) = user_id);

create policy "daily_activity_insert_own"
	on public.daily_activity
	for insert
	to authenticated
	with check ((select auth.uid()) = user_id);

create policy "daily_activity_update_own"
	on public.daily_activity
	for update
	to authenticated
	using ((select auth.uid()) = user_id)
	with check ((select auth.uid()) = user_id);
