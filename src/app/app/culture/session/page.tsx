import Link from "next/link";
import { redirect } from "next/navigation";
import { BrandMark } from "@/components/brand/brand-mark";
import { CultureSession, type CultureSessionQuestion } from "@/components/culture/culture-session";
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
	item_id: string;
	question: string;
	answer: string;
	choices: string[];
	culture_items: CultureItemForPrompt | CultureItemForPrompt[] | null;
};

type ActiveCulturePrompt = {
	id: string;
	itemId: string;
	question: string;
	answer: string;
	choices: string[];
	category: CultureCategory;
	collection: CultureCollection | null;
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

function normalizeChoice(choice: string): string {
	return choice.trim().replace(/\s+/g, " ").toLocaleLowerCase("fr-FR");
}

function shuffle<T>(items: T[]): T[] {
	const shuffledItems = [...items];

	for (let index = shuffledItems.length - 1; index > 0; index -= 1) {
		const swapIndex = Math.floor(Math.random() * (index + 1));
		const currentItem = shuffledItems[index];

		shuffledItems[index] = shuffledItems[swapIndex];
		shuffledItems[swapIndex] = currentItem;
	}

	return shuffledItems;
}

function uniqueNonEmptyAnswers(answers: string[], excludedAnswer: string): string[] {
	const seenAnswers = new Set([normalizeChoice(excludedAnswer)]);
	const uniqueAnswers: string[] = [];

	for (const answer of answers) {
		const trimmedAnswer = answer.trim();
		const normalizedAnswer = normalizeChoice(trimmedAnswer);

		if (!trimmedAnswer || seenAnswers.has(normalizedAnswer)) {
			continue;
		}

		seenAnswers.add(normalizedAnswer);
		uniqueAnswers.push(trimmedAnswer);
	}

	return uniqueAnswers;
}

function buildChoices(prompt: ActiveCulturePrompt, allPrompts: ActiveCulturePrompt[]): string[] {
	if (prompt.choices.length > 0) {
		const storedWrongChoices = uniqueNonEmptyAnswers(prompt.choices, prompt.answer);

		return shuffle([prompt.answer, ...shuffle(storedWrongChoices).slice(0, 3)]);
	}

	const wrongChoices: string[] = [];
	const seenChoices = new Set([normalizeChoice(prompt.answer)]);

	function addWrongChoices(candidates: ActiveCulturePrompt[]) {
		for (const candidate of candidates) {
			const candidateAnswer = candidate.answer.trim();
			const normalizedAnswer = normalizeChoice(candidateAnswer);

			if (!candidateAnswer || seenChoices.has(normalizedAnswer)) {
				continue;
			}

			seenChoices.add(normalizedAnswer);
			wrongChoices.push(candidateAnswer);

			if (wrongChoices.length >= 3) {
				return;
			}
		}
	}

	if (prompt.collection) {
		addWrongChoices(shuffle(allPrompts.filter((candidate) => candidate.id !== prompt.id && candidate.collection === prompt.collection)));
	}

	if (wrongChoices.length < 3) {
		addWrongChoices(shuffle(allPrompts.filter((candidate) => candidate.id !== prompt.id && candidate.category === prompt.category)));
	}

	if (wrongChoices.length < 3) {
		addWrongChoices(shuffle(allPrompts.filter((candidate) => candidate.id !== prompt.id)));
	}

	return shuffle([prompt.answer, ...wrongChoices.slice(0, 3)]);
}

function toActivePrompt(prompt: CulturePromptRow): ActiveCulturePrompt | null {
	const item = getPromptItem(prompt);

	if (!item) {
		return null;
	}

	return {
		id: prompt.id,
		itemId: prompt.item_id,
		question: prompt.question,
		answer: prompt.answer,
		choices: Array.isArray(prompt.choices) ? prompt.choices : [],
		category: item.category,
		collection: item.collection,
	};
}

function buildSessionQuestions(prompts: ActiveCulturePrompt[]): CultureSessionQuestion[] {
	const selectedPrompts = shuffle(prompts);

	return selectedPrompts.map((prompt) => ({
		id: prompt.id,
		question: prompt.question,
		categoryLabel: CATEGORY_LABELS[prompt.category],
		collectionLabel: getCollectionLabel(prompt.collection),
		choices: buildChoices(prompt, prompts),
	}));
}

export default async function CultureSessionPage() {
	const supabase = await createClient();
	const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();

	if (claimsError || !claimsData?.claims.sub) {
		redirect("/connexion?message=connexion_requise");
	}

	const { data: promptsData, error: promptsError } = await supabase
		.from("culture_prompts")
		.select("id,item_id,question,answer,choices,culture_items!inner(id,category,collection,title)")
		.eq("is_active", true)
		.eq("culture_items.is_active", true)
		.order("sort_order", { ascending: true });

	const prompts = promptsError ? [] : ((promptsData ?? []) as CulturePromptRow[]).map(toActivePrompt).filter((prompt): prompt is ActiveCulturePrompt => Boolean(prompt));
	const questions = buildSessionQuestions(prompts);

	return (
		<main className="min-h-screen bg-night px-4 py-6 text-ivory sm:px-10 sm:py-8 lg:px-16">
			<section className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-3xl flex-col gap-8 sm:min-h-[calc(100vh-4rem)] sm:gap-10">
				<header className="flex flex-col gap-4 border-b border-ivory/15 pb-5 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<BrandMark href="/app" />
						<p className="mt-2 text-sm text-ivory/58">
							<Link href="/app/culture" className="underline-offset-4 hover:text-accent hover:underline">
								Culture
							</Link>{" "}
							/ Session rapide
						</p>
					</div>
					<Link href="/app/culture" className="inline-flex h-11 w-full items-center justify-center rounded-md border border-ivory/25 px-4 text-sm font-semibold text-ivory transition hover:border-accent hover:text-accent sm:w-auto">
						Retour Culture
					</Link>
				</header>

				<div className="py-2 sm:py-6">
					<h1 className="text-3xl font-semibold sm:text-5xl">Session rapide</h1>
					<p className="mt-5 text-base leading-7 text-ivory/72 sm:text-lg sm:leading-8">Une routine courte pour réviser un mélange de questions issues de tous les univers.</p>
				</div>

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
