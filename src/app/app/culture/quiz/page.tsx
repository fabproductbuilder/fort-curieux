import Link from "next/link";
import { redirect } from "next/navigation";
import { CultureOralQuiz, type CultureOralQuizQuestion } from "@/components/culture/culture-oral-quiz";
import { createClient } from "@/lib/supabase/server";
import type { CultureCategory, CultureCollection } from "@/types/culture";

export const dynamic = "force-dynamic";

type CultureItemForPrompt = {
	id: string;
	category: CultureCategory;
	collection: CultureCollection | null;
	title: string;
};

type CulturePromptRow = {
	id: string;
	question: string;
	answer: string;
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

function getPromptItem(prompt: CulturePromptRow): CultureItemForPrompt | null {
	return Array.isArray(prompt.culture_items) ? prompt.culture_items[0] ?? null : prompt.culture_items;
}

function getCollectionLabel(collection: CultureCollection | null): string | null {
	if (!collection) {
		return null;
	}

	return COLLECTION_LABELS[collection] ?? collection.replaceAll("_", " ");
}

function toQuizQuestion(prompt: CulturePromptRow): CultureOralQuizQuestion | null {
	const item = getPromptItem(prompt);

	if (!item) {
		return null;
	}

	return {
		id: prompt.id,
		question: prompt.question,
		answer: prompt.answer,
		category: item.category,
		categoryLabel: CATEGORY_LABELS[item.category],
		collectionLabel: getCollectionLabel(item.collection),
	};
}

export default async function CultureQuizPage() {
	const supabase = await createClient();
	const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();

	if (claimsError || !claimsData?.claims.sub) {
		redirect("/connexion?message=connexion_requise");
	}

	const { data: promptsData, error: promptsError } = await supabase
		.from("culture_prompts")
		.select("id,question,answer,culture_items!inner(id,category,collection,title)")
		.eq("is_active", true)
		.eq("culture_items.is_active", true)
		.order("sort_order", { ascending: true });

	const questions = promptsError ? [] : ((promptsData ?? []) as CulturePromptRow[]).map(toQuizQuestion).filter((question): question is CultureOralQuizQuestion => Boolean(question));

	return (
		<main className="min-h-screen bg-night px-4 py-6 text-ivory sm:px-10 sm:py-8 lg:px-16">
			<section className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-3xl flex-col gap-8 sm:min-h-[calc(100vh-4rem)] sm:gap-10">
				<header className="flex flex-col gap-4 border-b border-ivory/15 pb-5 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<Link href="/app" className="inline-flex min-h-9 items-center text-lg font-semibold underline-offset-4 hover:underline">
							Fort Curieux
						</Link>
						<p className="mt-2 text-sm text-ivory/58">Culture / Quiz oral</p>
					</div>
					<Link href="/app/culture" className="inline-flex h-11 w-full items-center justify-center rounded-md border border-ivory/25 px-4 text-sm font-semibold text-ivory transition hover:border-accent hover:text-accent sm:w-auto">
						Retour Culture
					</Link>
				</header>

				<div className="py-2 sm:py-6">
					<h1 className="text-3xl font-semibold sm:text-5xl">Quiz oral</h1>
					<p className="mt-5 text-base leading-7 text-ivory/72 sm:text-lg sm:leading-8">Une série de questions à lire à voix haute, seul ou entre amis.</p>
				</div>

				{promptsError ? (
					<p role="alert" className="rounded-md border border-accent/35 bg-[#fff4ed] px-4 py-3 text-sm leading-6 text-[#7a2e12]">
						Les questions Culture n&apos;ont pas pu être chargées pour le moment.
					</p>
				) : null}

				<CultureOralQuiz questions={questions} />
			</section>
		</main>
	);
}
