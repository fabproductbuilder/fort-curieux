import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { CultureCategory, CultureCollection } from "@/types/culture";

type CultureItemSummaryRow = {
	id: string;
	category: CultureCategory;
	collection: CultureCollection | null;
};

type CulturePromptSummaryRow = {
	id: string;
	culture_items: CultureItemSummaryRow | CultureItemSummaryRow[] | null;
};

type CategorySummary = {
	key: CultureCategory;
	label: string;
	description: string;
	itemCount: number;
	promptCount: number;
};

const CATEGORY_DETAILS: Record<CultureCategory, { label: string; description: string }> = {
	history: {
		label: "Histoire",
		description: "Dates, périodes et grands repères.",
	},
	geography: {
		label: "Géographie",
		description: "Capitales, départements et repères du monde.",
	},
	inventions: {
		label: "Inventions",
		description: "Inventeurs, découvertes et périodes clés.",
	},
	music: {
		label: "Musique",
		description: "Albums, artistes, chansons et années.",
	},
	cinema: {
		label: "Cinéma",
		description: "Films, réalisateurs et années de sortie.",
	},
};

const CATEGORY_ORDER: CultureCategory[] = ["history", "geography", "inventions", "music", "cinema"];

const COLLECTION_LABELS: Partial<Record<CultureCollection, string>> = {
	country_capitals: "Capitales des pays",
	us_state_capitals: "Capitales des États américains",
	french_department_numbers: "Départements français",
	history_markers: "Grands repères historiques",
	geography_markers: "Repères géographiques",
	invention_dates: "Inventions et dates",
	invention_people: "Inventeurs et découvertes",
	music_album_dates: "Albums et années",
	music_song_dates: "Chansons et années",
	music_artist_links: "Artistes et œuvres",
	music_markers: "Repères musicaux",
	cinema_markers: "Repères cinéma",
	cinema_film_dates: "Films et années",
	cinema_director_links: "Films et réalisateurs",
	cinema_actor_links: "Acteurs et films",
};

function getPromptCategory(prompt: CulturePromptSummaryRow): CultureCategory | null {
	const item = Array.isArray(prompt.culture_items) ? prompt.culture_items[0] : prompt.culture_items;

	return item?.category ?? null;
}

function getCollectionLabel(collection: CultureCollection): string {
	return COLLECTION_LABELS[collection] ?? collection.replaceAll("_", " ");
}

export default async function CulturePage() {
	const supabase = await createClient();
	const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();

	if (claimsError || !claimsData?.claims.sub) {
		redirect("/connexion?message=connexion_requise");
	}

	const [itemsResult, promptsResult] = await Promise.all([
		supabase
			.from("culture_items")
			.select("id,category,collection")
			.eq("is_active", true)
			.order("sort_order", { ascending: true })
			.order("title", { ascending: true }),
		supabase
			.from("culture_prompts")
			.select("id,culture_items!inner(id,category,collection)")
			.eq("is_active", true)
			.eq("culture_items.is_active", true)
			.order("sort_order", { ascending: true }),
	]);

	const items = itemsResult.error ? [] : ((itemsResult.data ?? []) as CultureItemSummaryRow[]);
	const prompts = promptsResult.error ? [] : ((promptsResult.data ?? []) as CulturePromptSummaryRow[]);
	const hasError = Boolean(itemsResult.error || promptsResult.error);
	const totalItems = items.length;
	const totalPrompts = prompts.length;
	const collectionNames = Array.from(new Set(items.map((item) => item.collection).filter((collection): collection is CultureCollection => Boolean(collection)))).sort();
	const categorySummaries: CategorySummary[] = CATEGORY_ORDER.map((category) => ({
		key: category,
		label: CATEGORY_DETAILS[category].label,
		description: CATEGORY_DETAILS[category].description,
		itemCount: items.filter((item) => item.category === category).length,
		promptCount: prompts.filter((prompt) => getPromptCategory(prompt) === category).length,
	}));
	const availableCategoryCount = categorySummaries.filter((category) => category.itemCount > 0 || category.promptCount > 0).length;
	const hasContent = totalItems > 0 || totalPrompts > 0;

	return (
		<main className="min-h-screen bg-night px-4 py-6 text-ivory sm:px-10 sm:py-8 lg:px-16">
			<section className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-5xl flex-col gap-8 sm:min-h-[calc(100vh-4rem)] sm:gap-10">
				<header className="flex flex-col gap-4 border-b border-ivory/15 pb-5 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<Link href="/app" className="inline-flex min-h-9 items-center text-lg font-semibold underline-offset-4 hover:underline">
							Fort Curieux
						</Link>
						<p className="mt-2 text-sm text-ivory/58">Culture</p>
					</div>
					<Link href="/app" className="inline-flex h-11 w-full items-center justify-center rounded-md border border-ivory/25 px-4 text-sm font-semibold text-ivory transition hover:border-accent hover:text-accent sm:w-auto">
						Mon espace
					</Link>
				</header>

				<div className="max-w-3xl py-2 sm:py-6">
					<h1 className="text-3xl font-semibold sm:text-5xl">Culture</h1>
					<p className="mt-5 text-base leading-7 text-ivory/72 sm:text-lg sm:leading-8">Révisez vos repères en histoire, géographie, inventions, musique et cinéma.</p>
				</div>

				{hasError ? (
					<p role="alert" className="rounded-md border border-accent/35 bg-[#fff4ed] px-4 py-3 text-sm leading-6 text-[#7a2e12]">
						Une partie des contenus Culture n&apos;a pas pu être chargée. Les données disponibles restent affichées ci-dessous.
					</p>
				) : null}

				<section className="grid gap-3 md:grid-cols-2" aria-label="Modes Culture">
					<article className="rounded-lg border border-ivory/20 bg-ivory p-4 text-night sm:p-5">
						<p className="text-sm font-semibold uppercase tracking-[0.18em] text-night/44">Session rapide</p>
						<h2 className="mt-2 text-2xl font-semibold">Révision personnelle</h2>
						<p className="mt-4 text-sm leading-6 text-night/68">5 questions en choix multiples issues de toutes les catégories pour entretenir vos repères.</p>
						<Link href="/app/culture/session" className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-md bg-accent px-4 text-sm font-semibold text-night transition hover:bg-[#dc8440] sm:w-auto">
							Lancer une session rapide
						</Link>
					</article>

					<article className="rounded-lg border border-ivory/20 bg-ivory p-4 text-night sm:p-5">
						<p className="text-sm font-semibold uppercase tracking-[0.18em] text-night/44">Quiz oral</p>
						<h2 className="mt-2 text-2xl font-semibold">Culture à voix haute</h2>
						<p className="mt-4 text-sm leading-6 text-night/68">Lancez une série de questions à lire à voix haute, seul ou entre amis.</p>
						<Link href="/app/culture/quiz" className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-md border border-night/15 px-4 text-sm font-semibold text-night transition hover:border-accent hover:text-accent sm:w-auto">
							Lancer un quiz oral
						</Link>
					</article>
				</section>

				<section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Statistiques Culture">
					<div className="rounded-lg border border-ivory/15 p-4">
						<p className="text-2xl font-semibold">{totalItems}</p>
						<p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-ivory/52">Repères à réviser</p>
					</div>
					<div className="rounded-lg border border-ivory/15 p-4">
						<p className="text-2xl font-semibold">{totalPrompts}</p>
						<p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-ivory/52">Questions</p>
					</div>
					<div className="rounded-lg border border-ivory/15 p-4">
						<p className="text-2xl font-semibold">{collectionNames.length}</p>
						<p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-ivory/52">Thèmes de révision</p>
					</div>
					<div className="rounded-lg border border-ivory/15 p-4">
						<p className="text-2xl font-semibold">{availableCategoryCount}</p>
						<p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-ivory/52">Univers</p>
					</div>
				</section>

				<section>
					<div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
						<div>
							<p className="text-sm font-semibold uppercase tracking-[0.18em] text-ivory/44">Univers</p>
							<h2 className="mt-2 text-2xl font-semibold">Univers de culture</h2>
						</div>
					</div>

					{hasContent ? (
						<div className="mt-4 grid gap-3 sm:grid-cols-2">
							{categorySummaries.map((category) => (
								<article key={category.key} className="rounded-lg border border-ivory/15 bg-ivory/[0.04] p-4">
									<div className="flex items-start justify-between gap-3">
										<h3 className="text-xl font-semibold">{category.label}</h3>
										<p className="shrink-0 rounded-full border border-accent/40 px-3 py-1 text-xs font-semibold text-accent">{category.promptCount} question{category.promptCount > 1 ? "s" : ""}</p>
									</div>
									<p className="mt-3 text-sm leading-6 text-ivory/64">{category.description}</p>
									<p className="mt-4 text-sm font-semibold text-ivory/78">
										{category.itemCount} repère{category.itemCount > 1 ? "s" : ""}
									</p>
								</article>
							))}
						</div>
					) : (
						<p className="mt-4 rounded-lg border border-ivory/15 p-4 text-sm leading-6 text-ivory/68">Aucun contenu Culture actif n&apos;est disponible pour le moment.</p>
					)}
				</section>

				<section className="pb-8">
					<p className="text-sm font-semibold uppercase tracking-[0.18em] text-ivory/44">Thèmes de révision</p>
					{collectionNames.length > 0 ? (
						<ul className="mt-4 flex flex-wrap gap-2">
							{collectionNames.map((collection) => (
								<li key={collection} className="rounded-full border border-ivory/18 px-3 py-2 text-sm text-ivory/72">
									{getCollectionLabel(collection)}
								</li>
							))}
						</ul>
					) : (
						<p className="mt-4 rounded-lg border border-ivory/15 p-4 text-sm leading-6 text-ivory/68">Aucune collection active n&apos;est encore disponible.</p>
					)}
				</section>
			</section>
		</main>
	);
}
