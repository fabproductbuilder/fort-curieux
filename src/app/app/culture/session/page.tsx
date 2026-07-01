import Link from "next/link";
import { redirect } from "next/navigation";
import { BrandMark } from "@/components/brand/brand-mark";
import { CultureSession, type CultureSessionPrompt } from "@/components/culture/culture-session";
import { createClient } from "@/lib/supabase/server";
import type { CultureCategory, CultureCollection, CulturePromptDirection, CulturePromptType } from "@/types/culture";

export const dynamic = "force-dynamic";

type CultureItemForPrompt = {
	id: string;
	category: CultureCategory;
	collection: CultureCollection | null;
	title: string;
};

type CulturePromptRow = {
	id: string;
	item_id: string;
	prompt_direction: CulturePromptDirection;
	prompt_type: CulturePromptType;
	question: string;
	answer: string;
	choices: string[];
	culture_items: CultureItemForPrompt | CultureItemForPrompt[] | null;
};

const CATEGORY_LABELS: Record<CultureCategory, string> = {
	history: "Histoire",
	geography: "Géographie",
	inventions: "Inventions",
	music: "Musique",
	cinema: "Cinéma",
};

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

const CULTURE_PROMPTS_PAGE_SIZE = 1000;

function getPromptItem(prompt: CulturePromptRow): CultureItemForPrompt | null {
	return Array.isArray(prompt.culture_items) ? prompt.culture_items[0] ?? null : prompt.culture_items;
}

function getCollectionLabel(collection: CultureCollection | null): string | null {
	if (!collection) {
		return null;
	}

	return COLLECTION_LABELS[collection] ?? collection.replaceAll("_", " ");
}

function toSessionPrompt(prompt: CulturePromptRow): CultureSessionPrompt | null {
	const item = getPromptItem(prompt);

	if (!item) {
		return null;
	}

	return {
		id: prompt.id,
		promptDirection: prompt.prompt_direction,
		promptType: prompt.prompt_type,
		question: prompt.question,
		answer: prompt.answer,
		choices: Array.isArray(prompt.choices) ? prompt.choices : [],
		category: item.category,
		categoryLabel: CATEGORY_LABELS[item.category],
		collection: item.collection,
		collectionLabel: getCollectionLabel(item.collection),
	};
}

async function fetchActiveCulturePrompts(supabase: Awaited<ReturnType<typeof createClient>>) {
	const prompts: CulturePromptRow[] = [];

	for (let page = 0; ; page += 1) {
		const from = page * CULTURE_PROMPTS_PAGE_SIZE;
		const to = from + CULTURE_PROMPTS_PAGE_SIZE - 1;
		const { data, error } = await supabase
			.from("culture_prompts")
			.select("id,item_id,prompt_direction,prompt_type,question,answer,choices,culture_items!inner(id,category,collection,title)")
			.eq("is_active", true)
			.eq("culture_items.is_active", true)
			.order("sort_order", { ascending: true })
			.order("id", { ascending: true })
			.range(from, to);

		if (error) {
			return { data: prompts, error };
		}

		const batch = (data ?? []) as CulturePromptRow[];
		prompts.push(...batch);

		if (batch.length < CULTURE_PROMPTS_PAGE_SIZE) {
			return { data: prompts, error: null };
		}
	}
}

export default async function CultureSessionPage() {
	const supabase = await createClient();
	const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();

	if (claimsError || !claimsData?.claims.sub) {
		redirect("/connexion?message=connexion_requise");
	}

	const { data: promptsData, error: promptsError } = await fetchActiveCulturePrompts(supabase);
	const questions = promptsError ? [] : ((promptsData ?? []) as CulturePromptRow[]).map(toSessionPrompt).filter((prompt): prompt is CultureSessionPrompt => Boolean(prompt));

	return (
		<main className="min-h-screen bg-night px-4 py-6 text-ivory sm:px-10 sm:py-8 lg:px-16">
			<section className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-3xl flex-col gap-5 sm:min-h-[calc(100vh-4rem)] sm:gap-10">
				<header className="flex flex-col gap-3 border-b border-ivory/15 pb-4 sm:flex-row sm:items-center sm:justify-between sm:pb-5">
					<div>
						<BrandMark href="/app" />
						<p className="mt-2 text-sm text-ivory/58">
							<Link href="/app/culture" className="underline-offset-4 hover:text-accent hover:underline">
								Culture
							</Link>{" "}
							/ Session rapide
						</p>
					</div>
					<Link href="/app/culture" className="inline-flex h-10 w-full items-center justify-center rounded-md border border-ivory/25 px-4 text-sm font-semibold text-ivory transition hover:border-accent hover:text-accent sm:h-11 sm:w-auto">
						Retour Culture
					</Link>
				</header>

				{promptsError ? (
					<p role="alert" className="rounded-md border border-accent/35 bg-[#fff4ed] px-4 py-3 text-sm leading-6 text-[#7a2e12]">
						Les questions Culture n&apos;ont pas pu être chargées pour le moment.
					</p>
				) : null}

				<CultureSession questions={questions} />
			</section>
		</main>
	);
}
