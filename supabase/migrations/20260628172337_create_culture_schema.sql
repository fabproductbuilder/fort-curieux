create table public.culture_items (
	id uuid primary key default gen_random_uuid(),
	category text not null,
	item_type text not null default 'knowledge_card',
	collection text null,
	title text not null,
	period_label text null,
	location_label text null,
	short_summary text not null,
	sort_order integer not null default 0,
	is_active boolean not null default true,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	constraint culture_items_category_check
		check (category in ('history', 'geography', 'inventions', 'music', 'cinema')),
	constraint culture_items_item_type_check
		check (item_type in ('knowledge_card', 'cultural_marker')),
	constraint culture_items_collection_check
		check (collection is null or char_length(btrim(collection)) > 0),
	constraint culture_items_title_check
		check (char_length(btrim(title)) > 0),
	constraint culture_items_short_summary_check
		check (char_length(btrim(short_summary)) > 0)
);

create trigger culture_items_set_updated_at
	before update on public.culture_items
	for each row
	execute function public.set_current_updated_at();

create table public.culture_prompts (
	id uuid primary key default gen_random_uuid(),
	item_id uuid not null references public.culture_items(id) on delete cascade,
	prompt_direction text not null default 'standard',
	prompt_type text not null,
	question text not null,
	answer text not null,
	answer_aliases text[] not null default '{}',
	choices text[] not null default '{}',
	sort_order integer not null default 0,
	is_active boolean not null default true,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	constraint culture_prompts_prompt_direction_check
		check (prompt_direction in ('standard', 'forward', 'reverse')),
	constraint culture_prompts_prompt_type_check
		check (prompt_type in ('capital', 'country', 'state_capital', 'us_state', 'department_number', 'department_name', 'date', 'period', 'person', 'artist', 'album', 'song', 'film', 'director', 'actor', 'general')),
	constraint culture_prompts_question_check
		check (char_length(btrim(question)) > 0),
	constraint culture_prompts_answer_check
		check (char_length(btrim(answer)) > 0),
	constraint culture_prompts_id_item_unique
		unique (id, item_id)
);

create trigger culture_prompts_set_updated_at
	before update on public.culture_prompts
	for each row
	execute function public.set_current_updated_at();

create table public.culture_progress (
	id uuid primary key default gen_random_uuid(),
	user_id uuid not null references auth.users(id) on delete cascade,
	item_id uuid not null references public.culture_items(id) on delete cascade,
	prompt_id uuid not null,
	mastery_status text not null default 'new',
	last_seen_at timestamptz null,
	next_review_at timestamptz null,
	last_result text null,
	review_count integer not null default 0,
	correct_count integer not null default 0,
	incorrect_count integer not null default 0,
	streak_count integer not null default 0,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	constraint culture_progress_prompt_item_fk
		foreign key (prompt_id, item_id) references public.culture_prompts(id, item_id) on delete cascade,
	constraint culture_progress_user_prompt_unique
		unique (user_id, prompt_id),
	constraint culture_progress_mastery_status_check
		check (mastery_status in ('new', 'discovered', 'review', 'known', 'mastered')),
	constraint culture_progress_last_result_check
		check (last_result is null or last_result in ('correct', 'incorrect', 'known', 'review')),
	constraint culture_progress_review_count_check
		check (review_count >= 0),
	constraint culture_progress_correct_count_check
		check (correct_count >= 0),
	constraint culture_progress_incorrect_count_check
		check (incorrect_count >= 0),
	constraint culture_progress_streak_count_check
		check (streak_count >= 0)
);

create trigger culture_progress_set_updated_at
	before update on public.culture_progress
	for each row
	execute function public.set_current_updated_at();

create index culture_items_active_category_collection_sort_idx
	on public.culture_items (is_active, category, collection, sort_order);

create index culture_prompts_item_active_sort_idx
	on public.culture_prompts (item_id, is_active, sort_order);

create index culture_prompts_type_direction_idx
	on public.culture_prompts (prompt_type, prompt_direction);

create index culture_progress_user_next_review_idx
	on public.culture_progress (user_id, next_review_at);

create index culture_progress_user_status_idx
	on public.culture_progress (user_id, mastery_status);

create index culture_progress_item_id_idx
	on public.culture_progress (item_id);

create index culture_progress_prompt_id_idx
	on public.culture_progress (prompt_id);

alter table public.culture_items enable row level security;
alter table public.culture_prompts enable row level security;
alter table public.culture_progress enable row level security;

revoke all on table public.culture_items from public, anon, authenticated;
revoke all on table public.culture_prompts from public, anon, authenticated;
revoke all on table public.culture_progress from public, anon, authenticated;

grant select on table public.culture_items to authenticated;
grant select on table public.culture_prompts to authenticated;
grant select, insert, update, delete on table public.culture_progress to authenticated;

create policy "culture_items_select_active_authenticated"
	on public.culture_items
	for select
	to authenticated
	using (is_active);

create policy "culture_prompts_select_active_authenticated"
	on public.culture_prompts
	for select
	to authenticated
	using (
		is_active
		and exists (
			select 1
			from public.culture_items
			where culture_items.id = culture_prompts.item_id
				and culture_items.is_active
		)
	);

create policy "culture_progress_select_own"
	on public.culture_progress
	for select
	to authenticated
	using ((select auth.uid()) = user_id);

create policy "culture_progress_insert_own"
	on public.culture_progress
	for insert
	to authenticated
	with check ((select auth.uid()) = user_id);

create policy "culture_progress_update_own"
	on public.culture_progress
	for update
	to authenticated
	using ((select auth.uid()) = user_id)
	with check ((select auth.uid()) = user_id);

create policy "culture_progress_delete_own"
	on public.culture_progress
	for delete
	to authenticated
	using ((select auth.uid()) = user_id);

with seeded_items as (
	insert into public.culture_items (
		category,
		item_type,
		collection,
		title,
		period_label,
		location_label,
		short_summary,
		sort_order
	)
	values
		(
			'history',
			'cultural_marker',
			'history_markers',
			'La chute de Rome',
			'476',
			'Europe occidentale',
			'En 476, le dernier empereur romain d''Occident est déposé. Cet événement sert souvent de repère pour la fin de l''Antiquité en Europe occidentale.',
			10
		),
		(
			'history',
			'cultural_marker',
			'history_markers',
			'La Révolution française',
			'1789',
			'France',
			'La Révolution française commence en 1789 et transforme durablement la vie politique française autour de la souveraineté nationale et des droits des citoyens.',
			20
		),
		(
			'history',
			'cultural_marker',
			'history_markers',
			'Les premiers Jeux olympiques modernes',
			'1896',
			'Athènes',
			'Les premiers Jeux olympiques modernes se tiennent à Athènes en 1896, en référence aux compétitions de la Grèce antique.',
			30
		),
		(
			'geography',
			'cultural_marker',
			'geography_markers',
			'Le Nil',
			null,
			'Afrique du Nord-Est',
			'Le Nil traverse plusieurs pays d''Afrique du Nord-Est et joue un rôle majeur dans l''histoire et l''agriculture de l''Égypte.',
			10
		),
		(
			'geography',
			'cultural_marker',
			'geography_markers',
			'L''Himalaya',
			null,
			'Asie',
			'L''Himalaya est une grande chaîne de montagnes d''Asie. Elle abrite l''Everest, le plus haut sommet du monde.',
			20
		),
		(
			'geography',
			'cultural_marker',
			'geography_markers',
			'Le détroit de Gibraltar',
			null,
			'Europe et Afrique',
			'Le détroit de Gibraltar relie la mer Méditerranée à l''océan Atlantique et sépare l''Espagne du Maroc.',
			30
		),
		(
			'inventions',
			'cultural_marker',
			'invention_dates',
			'L''imprimerie à caractères mobiles',
			'XVe siècle',
			'Europe',
			'L''imprimerie à caractères mobiles se développe en Europe au XVe siècle avec Gutenberg. Elle accélère la diffusion des livres et des idées.',
			10
		),
		(
			'inventions',
			'cultural_marker',
			'invention_dates',
			'L''électricité domestique',
			'XIXe-XXe siècles',
			null,
			'L''électrification des foyers se diffuse progressivement à partir de la fin du XIXe siècle et transforme l''éclairage, le confort et les usages quotidiens.',
			20
		),
		(
			'inventions',
			'cultural_marker',
			'invention_dates',
			'La photographie',
			'XIXe siècle',
			'Europe',
			'La photographie naît au XIXe siècle avec des procédés capables de fixer durablement une image sur un support.',
			30
		),
		(
			'music',
			'cultural_marker',
			'music_markers',
			'Ludwig van Beethoven',
			'1770-1827',
			'Europe',
			'Beethoven est un compositeur majeur entre classicisme et romantisme. Ses symphonies restent des repères essentiels de la musique occidentale.',
			10
		),
		(
			'music',
			'cultural_marker',
			'music_markers',
			'Le jazz',
			'Début du XXe siècle',
			'États-Unis',
			'Le jazz se développe aux États-Unis au début du XXe siècle. Il met en avant l''improvisation, le rythme et le dialogue entre musiciens.',
			20
		),
		(
			'music',
			'cultural_marker',
			'music_markers',
			'La naissance du rock''n''roll',
			'Années 1950',
			'États-Unis',
			'Le rock''n''roll émerge dans les années 1950 aux États-Unis, porté par un mélange de rhythm and blues, de country et d''énergie scénique.',
			30
		),
		(
			'geography',
			'knowledge_card',
			'country_capitals',
			'Italie',
			null,
			'Europe',
			'L''Italie est un pays d''Europe du Sud dont la capitale est Rome.',
			100
		),
		(
			'geography',
			'knowledge_card',
			'country_capitals',
			'Allemagne',
			null,
			'Europe',
			'L''Allemagne est un pays d''Europe centrale dont la capitale est Berlin.',
			110
		),
		(
			'geography',
			'knowledge_card',
			'us_state_capitals',
			'Texas',
			null,
			'États-Unis',
			'Le Texas est un État américain dont la capitale est Austin.',
			120
		),
		(
			'geography',
			'knowledge_card',
			'us_state_capitals',
			'Californie',
			null,
			'États-Unis',
			'La Californie est un État américain dont la capitale est Sacramento.',
			130
		),
		(
			'geography',
			'knowledge_card',
			'french_department_numbers',
			'Moselle',
			null,
			'France',
			'La Moselle est un département français associé au numéro 57.',
			140
		),
		(
			'geography',
			'knowledge_card',
			'french_department_numbers',
			'Rhône',
			null,
			'France',
			'Le Rhône est un département français associé au numéro 69.',
			150
		),
		(
			'inventions',
			'knowledge_card',
			'invention_people',
			'Imprimerie moderne',
			'XVe siècle',
			'Europe',
			'L''imprimerie moderne en Europe est associée à Johannes Gutenberg et se développe au XVe siècle.',
			160
		),
		(
			'inventions',
			'knowledge_card',
			'invention_people',
			'Photographie',
			'XIXe siècle',
			'Europe',
			'La photographie se développe au XIXe siècle ; Nicéphore Niépce est associé aux premiers procédés photographiques durables.',
			170
		),
		(
			'music',
			'knowledge_card',
			'music_album_dates',
			'Thriller',
			'1982',
			'États-Unis',
			'Thriller est un album de Michael Jackson sorti en 1982.',
			180
		),
		(
			'music',
			'knowledge_card',
			'music_album_dates',
			'Abbey Road',
			'1969',
			'Royaume-Uni',
			'Abbey Road est un album des Beatles sorti en 1969.',
			190
		),
		(
			'cinema',
			'knowledge_card',
			'cinema_director_links',
			'Le Parrain',
			'1972',
			'États-Unis',
			'Le Parrain est un film réalisé par Francis Ford Coppola, sorti en 1972.',
			200
		),
		(
			'cinema',
			'knowledge_card',
			'cinema_director_links',
			'Pulp Fiction',
			'1994',
			'États-Unis',
			'Pulp Fiction est un film réalisé par Quentin Tarantino, sorti en 1994.',
			210
		)
	returning id, title
)
insert into public.culture_prompts (
	item_id,
	prompt_direction,
	prompt_type,
	question,
	answer,
	answer_aliases,
	choices,
	sort_order
)
select seeded_items.id, prompt_data.prompt_direction, prompt_data.prompt_type, prompt_data.question, prompt_data.answer, prompt_data.answer_aliases, prompt_data.choices, prompt_data.sort_order
from seeded_items
join (
	values
		('La chute de Rome', 'standard', 'date', 'En quelle année situe-t-on généralement la chute de l''Empire romain d''Occident ?', '476', array[]::text[], array['395', '476', '800', '1453']::text[], 10),
		('La Révolution française', 'standard', 'date', 'En quelle année commence la Révolution française ?', '1789', array[]::text[], array['1492', '1789', '1815', '1914']::text[], 10),
		('Les premiers Jeux olympiques modernes', 'standard', 'general', 'Où ont lieu les premiers Jeux olympiques modernes en 1896 ?', 'Athènes', array['Athenes']::text[], array['Athènes', 'Paris', 'Rome', 'Londres']::text[], 10),
		('Le Nil', 'standard', 'general', 'Quel grand fleuve est associé à l''histoire de l''Égypte antique ?', 'Le Nil', array['Nil']::text[], array['Le Nil', 'Le Danube', 'Le Gange', 'L''Amazone']::text[], 10),
		('L''Himalaya', 'standard', 'general', 'Quelle chaîne de montagnes abrite l''Everest ?', 'L''Himalaya', array['Himalaya']::text[], array['L''Himalaya', 'Les Alpes', 'Les Andes', 'Les Rocheuses']::text[], 10),
		('Le détroit de Gibraltar', 'standard', 'general', 'Quel détroit relie la Méditerranée à l''océan Atlantique ?', 'Le détroit de Gibraltar', array['Gibraltar']::text[], array['Le détroit de Gibraltar', 'Le Bosphore', 'Le canal de Suez', 'Le détroit de Béring']::text[], 10),
		('L''imprimerie à caractères mobiles', 'standard', 'person', 'À quel inventeur associe-t-on souvent l''imprimerie à caractères mobiles en Europe ?', 'Johannes Gutenberg', array['Gutenberg']::text[], array['Johannes Gutenberg', 'Thomas Edison', 'Louis Pasteur', 'Nikola Tesla']::text[], 10),
		('L''électricité domestique', 'standard', 'period', 'À partir de quelle période l''électrification des foyers se diffuse-t-elle progressivement ?', 'La fin du XIXe siècle', array['fin du XIXe siècle', 'XIXe siècle']::text[], array['La fin du XIXe siècle', 'Le Moyen Âge', 'Le XVIe siècle', 'Les années 1980']::text[], 10),
		('La photographie', 'standard', 'period', 'Au cours de quel siècle la photographie se développe-t-elle ?', 'XIXe siècle', array['19e siècle', '19ème siècle']::text[], array['XIXe siècle', 'XVe siècle', 'XVIIe siècle', 'XXIe siècle']::text[], 10),
		('Ludwig van Beethoven', 'standard', 'general', 'Quel compositeur fait le lien entre classicisme et romantisme ?', 'Ludwig van Beethoven', array['Beethoven']::text[], array['Ludwig van Beethoven', 'Wolfgang Amadeus Mozart', 'Claude Debussy', 'Igor Stravinsky']::text[], 10),
		('Le jazz', 'standard', 'general', 'Quel genre musical né aux États-Unis met fortement en avant l''improvisation ?', 'Le jazz', array['jazz']::text[], array['Le jazz', 'Le reggae', 'La bossa nova', 'Le disco']::text[], 10),
		('La naissance du rock''n''roll', 'standard', 'period', 'Dans quelle décennie le rock''n''roll émerge-t-il fortement aux États-Unis ?', 'Les années 1950', array['années 1950', '1950']::text[], array['Les années 1950', 'Les années 1920', 'Les années 1970', 'Les années 1990']::text[], 10),
		('Italie', 'forward', 'capital', 'Quelle est la capitale de l''Italie ?', 'Rome', array[]::text[], array['Rome', 'Milan', 'Naples', 'Turin']::text[], 10),
		('Italie', 'reverse', 'country', 'Rome est la capitale de quel pays ?', 'Italie', array['L''Italie']::text[], array['Italie', 'Espagne', 'Grèce', 'Portugal']::text[], 20),
		('Allemagne', 'forward', 'capital', 'Quelle est la capitale de l''Allemagne ?', 'Berlin', array[]::text[], array['Berlin', 'Munich', 'Hambourg', 'Cologne']::text[], 10),
		('Allemagne', 'reverse', 'country', 'Berlin est la capitale de quel pays ?', 'Allemagne', array['L''Allemagne']::text[], array['Allemagne', 'Autriche', 'Suisse', 'Belgique']::text[], 20),
		('Texas', 'forward', 'state_capital', 'Quelle est la capitale du Texas ?', 'Austin', array[]::text[], array['Austin', 'Dallas', 'Houston', 'San Antonio']::text[], 10),
		('Texas', 'reverse', 'us_state', 'Austin est la capitale de quel État américain ?', 'Texas', array['Le Texas']::text[], array['Texas', 'Arizona', 'Floride', 'Colorado']::text[], 20),
		('Californie', 'forward', 'state_capital', 'Quelle est la capitale de la Californie ?', 'Sacramento', array[]::text[], array['Sacramento', 'Los Angeles', 'San Francisco', 'San Diego']::text[], 10),
		('Californie', 'reverse', 'us_state', 'Sacramento est la capitale de quel État américain ?', 'Californie', array['La Californie']::text[], array['Californie', 'Nevada', 'Oregon', 'Washington']::text[], 20),
		('Moselle', 'forward', 'department_number', 'Quel est le numéro du département de la Moselle ?', '57', array[]::text[], array['57', '54', '67', '69']::text[], 10),
		('Moselle', 'reverse', 'department_name', 'À quel département correspond le numéro 57 ?', 'Moselle', array['La Moselle']::text[], array['Moselle', 'Meurthe-et-Moselle', 'Bas-Rhin', 'Rhône']::text[], 20),
		('Rhône', 'forward', 'department_number', 'Quel est le numéro du département du Rhône ?', '69', array[]::text[], array['69', '57', '75', '13']::text[], 10),
		('Rhône', 'reverse', 'department_name', 'À quel département correspond le numéro 69 ?', 'Rhône', array['Le Rhône']::text[], array['Rhône', 'Moselle', 'Paris', 'Bouches-du-Rhône']::text[], 20),
		('Imprimerie moderne', 'forward', 'person', 'Qui est associé à l''imprimerie moderne en Europe ?', 'Johannes Gutenberg', array['Gutenberg']::text[], array['Johannes Gutenberg', 'James Watt', 'Alexander Fleming', 'Louis Daguerre']::text[], 10),
		('Imprimerie moderne', 'forward', 'period', 'À quelle période l''imprimerie moderne se développe-t-elle en Europe ?', 'XVe siècle', array['15e siècle', '15ème siècle']::text[], array['XVe siècle', 'XIIe siècle', 'XVIIIe siècle', 'XXe siècle']::text[], 20),
		('Photographie', 'forward', 'person', 'Qui est associé aux premiers procédés photographiques durables ?', 'Nicéphore Niépce', array['Nicephore Niepce', 'Niépce', 'Niepce']::text[], array['Nicéphore Niépce', 'Thomas Edison', 'Johannes Gutenberg', 'Guglielmo Marconi']::text[], 10),
		('Photographie', 'forward', 'period', 'Au cours de quel siècle la photographie se développe-t-elle ?', 'XIXe siècle', array['19e siècle', '19ème siècle']::text[], array['XIXe siècle', 'XVe siècle', 'XVIIe siècle', 'XXIe siècle']::text[], 20),
		('Thriller', 'forward', 'artist', 'Quel artiste a sorti l''album Thriller ?', 'Michael Jackson', array[]::text[], array['Michael Jackson', 'Prince', 'Stevie Wonder', 'David Bowie']::text[], 10),
		('Thriller', 'forward', 'date', 'En quelle année est sorti l''album Thriller ?', '1982', array[]::text[], array['1982', '1977', '1991', '1969']::text[], 20),
		('Abbey Road', 'forward', 'artist', 'Quel groupe a sorti l''album Abbey Road ?', 'The Beatles', array['Beatles', 'Les Beatles']::text[], array['The Beatles', 'The Rolling Stones', 'Pink Floyd', 'Queen']::text[], 10),
		('Abbey Road', 'forward', 'date', 'En quelle année est sorti l''album Abbey Road ?', '1969', array[]::text[], array['1969', '1975', '1982', '1959']::text[], 20),
		('Le Parrain', 'forward', 'director', 'Qui a réalisé Le Parrain ?', 'Francis Ford Coppola', array['Coppola']::text[], array['Francis Ford Coppola', 'Martin Scorsese', 'Steven Spielberg', 'Sergio Leone']::text[], 10),
		('Le Parrain', 'forward', 'date', 'En quelle année est sorti Le Parrain ?', '1972', array[]::text[], array['1972', '1969', '1977', '1994']::text[], 20),
		('Le Parrain', 'reverse', 'film', 'Quel film de 1972 est associé à Francis Ford Coppola ?', 'Le Parrain', array['The Godfather']::text[], array['Le Parrain', 'Taxi Driver', 'Apocalypse Now', 'Pulp Fiction']::text[], 30),
		('Pulp Fiction', 'forward', 'director', 'Qui a réalisé Pulp Fiction ?', 'Quentin Tarantino', array['Tarantino']::text[], array['Quentin Tarantino', 'Francis Ford Coppola', 'David Fincher', 'Christopher Nolan']::text[], 10),
		('Pulp Fiction', 'forward', 'date', 'En quelle année est sorti Pulp Fiction ?', '1994', array[]::text[], array['1994', '1989', '1999', '2001']::text[], 20),
		('Pulp Fiction', 'reverse', 'film', 'Quel film de 1994 est associé à Quentin Tarantino ?', 'Pulp Fiction', array[]::text[], array['Pulp Fiction', 'Reservoir Dogs', 'Fight Club', 'Matrix']::text[], 30)
) as prompt_data(item_title, prompt_direction, prompt_type, question, answer, answer_aliases, choices, sort_order)
	on prompt_data.item_title = seeded_items.title;
