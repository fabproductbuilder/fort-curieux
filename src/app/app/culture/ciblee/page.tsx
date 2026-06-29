import Link from "next/link";
import { redirect } from "next/navigation";
import { BrandMark } from "@/components/brand/brand-mark";
import { CultureTargetedReview, type CultureTargetedReviewQuestion } from "@/components/culture/culture-targeted-review";
import { buildMultipleChoiceOptions, type CultureMultipleChoicePrompt } from "@/lib/culture/multiple-choice";
import { createClient } from "@/lib/supabase/server";
import { getTargetedCultureBlock, isTargetedCultureCollection, TARGETED_CULTURE_BLOCKS, type TargetedCultureCollection } from "@/lib/culture/targeted-reviews";
import type { CultureCategory, CultureCollection, CulturePromptDirection, CulturePromptType } from "@/types/culture";

export const dynamic = "force-dynamic";

type CultureTargetedPageProps = {
	searchParams: Promise<{
		bloc?: string | string[];
	}>;
};

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

type ActiveCulturePrompt = CultureMultipleChoicePrompt & {
	itemId: string;
	question: string;
	collection: TargetedCultureCollection;
};

function getPromptItem(prompt: CulturePromptRow): CultureItemForPrompt | null {
	return Array.isArray(prompt.culture_items) ? prompt.culture_items[0] ?? null : prompt.culture_items;
}

function getInitialCollection(bloc: string | string[] | undefined): TargetedCultureCollection {
	const requestedBloc = Array.isArray(bloc) ? bloc[0] : bloc;

	return isTargetedCultureCollection(requestedBloc) ? requestedBloc : TARGETED_CULTURE_BLOCKS[0].collection;
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

function toActivePrompt(prompt: CulturePromptRow): ActiveCulturePrompt | null {
	const item = getPromptItem(prompt);

	if (!item || item.category !== "geography" || !isTargetedCultureCollection(item.collection)) {
		return null;
	}

	return {
		id: prompt.id,
		itemId: prompt.item_id,
		promptDirection: prompt.prompt_direction,
		promptType: prompt.prompt_type,
		question: prompt.question,
		answer: prompt.answer,
		choices: Array.isArray(prompt.choices) ? prompt.choices : [],
		category: item.category,
		collection: item.collection,
	};
}

function buildTargetedQuestions(prompts: ActiveCulturePrompt[]): CultureTargetedReviewQuestion[] {
	const selectedPrompts = shuffle(prompts);

	return selectedPrompts.map((prompt) => ({
		id: prompt.id,
		question: prompt.question,
		collection: prompt.collection,
		collectionLabel: getTargetedCultureBlock(prompt.collection).label,
		promptDirection: prompt.promptDirection,
		promptType: prompt.promptType,
		choices: buildMultipleChoiceOptions(prompt, prompts),
	}));
}

export default async function CultureTargetedPage({ searchParams }: CultureTargetedPageProps) {
	const supabase = await createClient();
	const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();

	if (claimsError || !claimsData?.claims.sub) {
		redirect("/connexion?message=connexion_requise");
	}

	const params = await searchParams;
	const initialCollection = getInitialCollection(params.bloc);
	const { data: promptsData, error: promptsError } = await supabase
		.from("culture_prompts")
		.select("id,item_id,prompt_direction,prompt_type,question,answer,choices,culture_items!inner(id,category,collection,title)")
		.eq("is_active", true)
		.eq("culture_items.is_active", true)
		.eq("culture_items.category", "geography")
		.order("sort_order", { ascending: true });

	const prompts = promptsError ? [] : ((promptsData ?? []) as CulturePromptRow[]).map(toActivePrompt).filter((prompt): prompt is ActiveCulturePrompt => Boolean(prompt));
	const questions = buildTargetedQuestions(prompts);

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
							/ Révisions ciblées
						</p>
					</div>
					<Link href="/app/culture" className="inline-flex h-11 w-full items-center justify-center rounded-md border border-ivory/25 px-4 text-sm font-semibold text-ivory transition hover:border-accent hover:text-accent sm:w-auto">
						Retour Culture
					</Link>
				</header>

				<div className="py-2 sm:py-6">
					<h1 className="text-3xl font-semibold sm:text-5xl">Révisions ciblées</h1>
					<p className="mt-5 text-base leading-7 text-ivory/72 sm:text-lg sm:leading-8">Travaillez un bloc précis quand vous voulez mémoriser une série complète.</p>
				</div>

				{promptsError ? (
					<p role="alert" className="rounded-md border border-accent/35 bg-[#fff4ed] px-4 py-3 text-sm leading-6 text-[#7a2e12]">
						Les questions de Géographie n&apos;ont pas pu être chargées pour le moment.
					</p>
				) : null}

				<CultureTargetedReview questions={questions} initialCollection={initialCollection} />
			</section>
		</main>
	);
}
