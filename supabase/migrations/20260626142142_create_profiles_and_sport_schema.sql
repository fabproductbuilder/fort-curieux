create table public.profiles (
	id uuid primary key references auth.users(id) on delete cascade,
	display_name text null,
	onboarding_completed boolean not null default false,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	constraint profiles_display_name_length_check
		check (display_name is null or char_length(display_name) <= 80)
);

create or replace function public.set_current_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
	new.updated_at = now();
	return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
	insert into public.profiles (id, display_name)
	values (
		new.id,
		nullif(left(btrim(coalesce(new.raw_user_meta_data ->> 'first_name', '')), 80), '')
	)
	on conflict (id) do nothing;

	return new;
end;
$$;

revoke execute on function public.set_current_updated_at() from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger profiles_set_updated_at
	before update on public.profiles
	for each row
	execute function public.set_current_updated_at();

create trigger on_auth_user_created_create_profile
	after insert on auth.users
	for each row
	execute function public.handle_new_user();

insert into public.profiles (id, display_name)
select
	users.id,
	nullif(left(btrim(coalesce(users.raw_user_meta_data ->> 'first_name', '')), 80), '')
from auth.users
on conflict (id) do nothing;

create table public.sport_templates (
	id uuid primary key default gen_random_uuid(),
	user_id uuid not null references public.profiles(id) on delete cascade,
	name text not null,
	day_of_week smallint not null,
	measurement_type text not null,
	target_value numeric(10, 2) null,
	target_sets smallint null,
	target_reps integer null,
	is_active boolean not null default true,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	constraint sport_templates_name_check
		check (char_length(btrim(name)) > 0 and char_length(name) <= 120),
	constraint sport_templates_day_of_week_check
		check (day_of_week between 1 and 7),
	constraint sport_templates_measurement_type_check
		check (measurement_type in ('repetitions', 'duration_minutes', 'distance_km', 'sets_reps', 'completion')),
	constraint sport_templates_target_consistency_check
		check (
			(
				measurement_type in ('repetitions', 'duration_minutes', 'distance_km')
				and target_value is not null
				and target_value > 0
				and target_sets is null
				and target_reps is null
			)
			or (
				measurement_type = 'sets_reps'
				and target_value is null
				and target_sets is not null
				and target_sets > 0
				and target_reps is not null
				and target_reps > 0
			)
			or (
				measurement_type = 'completion'
				and target_value is null
				and target_sets is null
				and target_reps is null
			)
		)
);

create trigger sport_templates_set_updated_at
	before update on public.sport_templates
	for each row
	execute function public.set_current_updated_at();

create table public.sport_occurrences (
	id uuid primary key default gen_random_uuid(),
	user_id uuid not null references public.profiles(id) on delete cascade,
	template_id uuid null references public.sport_templates(id) on delete set null,
	scheduled_date date not null,
	name_snapshot text not null,
	measurement_type text not null,
	target_value numeric(10, 2) null,
	target_sets smallint null,
	target_reps integer null,
	status text not null default 'planned',
	actual_value numeric(10, 2) null,
	actual_sets smallint null,
	actual_reps integer null,
	perceived_effort text null,
	completed_at timestamptz null,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	constraint sport_occurrences_name_snapshot_check
		check (char_length(btrim(name_snapshot)) > 0 and char_length(name_snapshot) <= 120),
	constraint sport_occurrences_measurement_type_check
		check (measurement_type in ('repetitions', 'duration_minutes', 'distance_km', 'sets_reps', 'completion')),
	constraint sport_occurrences_target_consistency_check
		check (
			(
				measurement_type in ('repetitions', 'duration_minutes', 'distance_km')
				and target_value is not null
				and target_value > 0
				and target_sets is null
				and target_reps is null
			)
			or (
				measurement_type = 'sets_reps'
				and target_value is null
				and target_sets is not null
				and target_sets > 0
				and target_reps is not null
				and target_reps > 0
			)
			or (
				measurement_type = 'completion'
				and target_value is null
				and target_sets is null
				and target_reps is null
			)
		),
	constraint sport_occurrences_status_check
		check (status in ('planned', 'completed', 'skipped', 'cancelled')),
	constraint sport_occurrences_perceived_effort_check
		check (perceived_effort is null or perceived_effort in ('easy', 'normal', 'hard')),
	constraint sport_occurrences_result_consistency_check
		check (
			(
				status = 'completed'
				and completed_at is not null
				and (
					(
						measurement_type in ('repetitions', 'duration_minutes', 'distance_km')
						and actual_value is not null
						and actual_value > 0
						and actual_sets is null
						and actual_reps is null
					)
					or (
						measurement_type = 'sets_reps'
						and actual_value is null
						and actual_sets is not null
						and actual_sets > 0
						and actual_reps is not null
						and actual_reps > 0
					)
					or (
						measurement_type = 'completion'
						and actual_value is null
						and actual_sets is null
						and actual_reps is null
					)
				)
			)
			or (
				status <> 'completed'
				and completed_at is null
				and actual_value is null
				and actual_sets is null
				and actual_reps is null
				and perceived_effort is null
			)
		)
);

create trigger sport_occurrences_set_updated_at
	before update on public.sport_occurrences
	for each row
	execute function public.set_current_updated_at();

create index sport_templates_user_active_day_idx
	on public.sport_templates (user_id, is_active, day_of_week);

create index sport_occurrences_user_scheduled_date_idx
	on public.sport_occurrences (user_id, scheduled_date);

create index sport_occurrences_user_status_scheduled_date_idx
	on public.sport_occurrences (user_id, status, scheduled_date);

create index sport_occurrences_template_id_idx
	on public.sport_occurrences (template_id);

create unique index sport_occurrences_unique_template_date_idx
	on public.sport_occurrences (user_id, template_id, scheduled_date)
	where template_id is not null;

alter table public.profiles enable row level security;
alter table public.sport_templates enable row level security;
alter table public.sport_occurrences enable row level security;

revoke all on table public.profiles from anon;
revoke all on table public.sport_templates from anon;
revoke all on table public.sport_occurrences from anon;

grant select on table public.profiles to authenticated;
grant update (display_name, onboarding_completed) on table public.profiles to authenticated;
grant select, insert, update, delete on table public.sport_templates to authenticated;
grant select, insert, update, delete on table public.sport_occurrences to authenticated;

create policy "profiles_select_own"
	on public.profiles
	for select
	to authenticated
	using ((select auth.uid()) = id);

create policy "profiles_update_own"
	on public.profiles
	for update
	to authenticated
	using ((select auth.uid()) = id)
	with check ((select auth.uid()) = id);

create policy "sport_templates_select_own"
	on public.sport_templates
	for select
	to authenticated
	using ((select auth.uid()) = user_id);

create policy "sport_templates_insert_own"
	on public.sport_templates
	for insert
	to authenticated
	with check ((select auth.uid()) = user_id);

create policy "sport_templates_update_own"
	on public.sport_templates
	for update
	to authenticated
	using ((select auth.uid()) = user_id)
	with check ((select auth.uid()) = user_id);

create policy "sport_templates_delete_own"
	on public.sport_templates
	for delete
	to authenticated
	using ((select auth.uid()) = user_id);

create policy "sport_occurrences_select_own"
	on public.sport_occurrences
	for select
	to authenticated
	using ((select auth.uid()) = user_id);

create policy "sport_occurrences_insert_own"
	on public.sport_occurrences
	for insert
	to authenticated
	with check ((select auth.uid()) = user_id);

create policy "sport_occurrences_update_own"
	on public.sport_occurrences
	for update
	to authenticated
	using ((select auth.uid()) = user_id)
	with check ((select auth.uid()) = user_id);

create policy "sport_occurrences_delete_own"
	on public.sport_occurrences
	for delete
	to authenticated
	using ((select auth.uid()) = user_id);
