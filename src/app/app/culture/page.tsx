import Link from "next/link";
import { redirect } from "next/navigation";
import { BrandMark } from "@/components/brand/brand-mark";
import { createClient } from "@/lib/supabase/server";
import { TARGETED_CULTURE_BLOCKS } from "@/lib/culture/targeted-reviews";
import type { CultureCategory, CultureMasteryStatus, CultureReviewResult } from "@/types/culture";

type CultureItemSummaryRow = {
	id: string;
	category: CultureCategory;
};

type CulturePromptSummaryRow = {
	id: string;
	culture_items: CultureItemSummaryRow | CultureItemSummaryRow[] | null;
};

type CultureProgressSummaryRow = {
	prompt_id: string;
	mastery_status: CultureMasteryStatus;
	last_result: CultureReviewResult | null;
	review_count: number;
	correct_count: number;
	incorrect_count: number;
};

const CATEGORY_DETAILS: Record<CultureCategory, { label: string }> = {
	history: {
		label: "Histoire",
	},
	geography: {
		label: "Géographie",
	},
	inventions: {
		label: "Inventions",
	},
	music: {
		label: "Musique",
	},
	cinema: {
		label: "Cinéma",
	},
};

const CATEGORY_ORDER: CultureCategory[] = ["history", "geography", "inventions", "music", "cinema"];

function getPromptCategory(prompt: CulturePromptSummaryRow): CultureCategory | null {
	const item = Array.isArray(prompt.culture_items) ? prompt.culture_items[0] : prompt.culture_items;

	return item?.category ?? null;
}

function isQuestionToReview(progress: CultureProgressSummaryRow): boolean {
	return progress.incorrect_count > 0 || progress.last_result === "incorrect" || progress.mastery_status === "new" || progress.mastery_status === "discovered" || progress.mastery_status === "review";
}

export default async function CulturePage() {
	const supabase = await createClient();
	const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();

	if (claimsError || !claimsData?.claims.sub) {
		redirect("/connexion?message=connexion_requise");
	}

	const [promptsResult, progressResult] = await Promise.all([
		supabase
			.from("culture_prompts")
			.select("id,culture_items!inner(id,category)")
			.eq("is_active", true)
			.eq("culture_items.is_active", true)
			.order("sort_order", { ascending: true }),
		supabase
			.from("culture_progress")
			.select("prompt_id,mastery_status,last_result,review_count,correct_count,incorrect_count")
			.eq("user_id", claimsData.claims.sub)
			.gt("review_count", 0),
	]);

	const prompts = promptsResult.error ? [] : ((promptsResult.data ?? []) as CulturePromptSummaryRow[]);
	const progressRows = progressResult.error ? [] : ((progressResult.data ?? []) as CultureProgressSummaryRow[]);
	const hasError = Boolean(promptsResult.error || progressResult.error);
	const totalPrompts = prompts.length;
	const promptCategoryById = new Map(prompts.map((prompt) => [prompt.id, getPromptCategory(prompt)]));
	const questionsWorked = progressRows.length;
	const correctAnswerCount = progressRows.reduce((total, progress) => total + progress.correct_count, 0);
	const incorrectAnswerCount = progressRows.reduce((total, progress) => total + progress.incorrect_count, 0);
	const totalAnswerCount = correctAnswerCount + incorrectAnswerCount;
	const successRate = totalAnswerCount > 0 ? Math.round((correctAnswerCount / totalAnswerCount) * 100) : null;
	const questionsToReview = progressRows.filter(isQuestionToReview).length;
	const workedByCategory = CATEGORY_ORDER.map((category) => ({
		key: category,
		label: CATEGORY_DETAILS[category].label,
		count: progressRows.filter((progress) => promptCategoryById.get(progress.prompt_id) === category).length,
	}))
		.filter((category) => category.count > 0)
		.sort((firstCategory, secondCategory) => secondCategory.count - firstCategory.count);
	const primaryWorkedCategory = workedByCategory[0] ?? null;
	const availableCategoryCount = new Set(prompts.map((prompt) => getPromptCategory(prompt)).filter(Boolean)).size;

	return (
		<main className="min-h-screen bg-night px-4 py-6 text-ivory sm:px-10 sm:py-8 lg:px-16">
			<section className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-5xl flex-col gap-8 sm:min-h-[calc(100vh-4rem)] sm:gap-10">
				<header className="flex flex-col gap-4 border-b border-ivory/15 pb-5 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<BrandMark href="/app" />
						<p className="mt-2 text-sm text-ivory/58">Culture</p>
					</div>
					<Link href="/app" className="inline-flex h-11 w-full items-center justify-center rounded-md border border-ivory/25 px-4 text-sm font-semibold text-ivory transition hover:border-accent hover:text-accent sm:w-auto">
						Mon espace
					</Link>
				</header>

				<div className="max-w-3xl py-2 sm:py-6">
					<h1 className="text-3xl font-semibold sm:text-5xl">Culture</h1>
					<p className="mt-5 text-base leading-7 text-ivory/72 sm:text-lg sm:leading-8">Révisez vos repères en histoire, géographie, inventions, musique et cinéma.</p>
					{totalPrompts > 0 ? <p className="mt-3 text-sm text-ivory/52">{totalPrompts} questions disponibles dans {availableCategoryCount} univers.</p> : null}
				</div>

				{hasError ? (
					<p role="alert" className="rounded-md border border-accent/35 bg-[#fff4ed] px-4 py-3 text-sm leading-6 text-[#7a2e12]">
						Une partie des contenus Culture n&apos;a pas pu être chargée. Les données disponibles restent affichées ci-dessous.
					</p>
				) : null}

				<section className="grid gap-3 md:grid-cols-2" aria-label="Modes Culture">
					<article className="rounded-lg border border-ivory/20 bg-ivory p-4 text-night sm:p-5">
						<p className="text-sm font-semibold uppercase tracking-[0.18em] text-night/44">Session rapide</p>
						<h2 className="mt-2 text-2xl font-semibold">Révisions personnelles</h2>
						<p className="mt-4 text-sm leading-6 text-night/68">10 ou 20 questions issues de tous les univers, ou d&apos;une sélection d&apos;univers.</p>
						<Link href="/app/culture/session" className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-md bg-accent px-4 text-sm font-semibold text-night transition hover:bg-[#dc8440] sm:w-auto">
							Lancer une session
						</Link>
					</article>

					<article className="rounded-lg border border-ivory/20 bg-ivory p-4 text-night sm:p-5">
						<p className="text-sm font-semibold uppercase tracking-[0.18em] text-night/44">Quiz oral</p>
						<h2 className="mt-2 text-2xl font-semibold">Quiz de culture générale</h2>
						<p className="mt-4 text-sm leading-6 text-night/68">Jouez une série de questions, seul ou entre amis, puis révélez les réponses une par une.</p>
						<Link href="/app/culture/quiz" className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-md border border-night/15 px-4 text-sm font-semibold text-night transition hover:border-accent hover:text-accent sm:w-auto">
							Lancer un quiz oral
						</Link>
					</article>
				</section>

				<section>
					<div className="max-w-2xl">
						<p className="text-sm font-semibold uppercase tracking-[0.18em] text-ivory/44">Géographie</p>
						<h2 className="mt-2 text-2xl font-semibold">Révisions ciblées</h2>
						<p className="mt-3 text-sm leading-6 text-ivory/64">Travaillez un bloc précis quand vous voulez mémoriser une série complète.</p>
					</div>
					<div className="mt-4 grid gap-3 md:grid-cols-3">
						{TARGETED_CULTURE_BLOCKS.map((block) => (
							<Link key={block.collection} href={`/app/culture/ciblee?bloc=${block.collection}`} className="rounded-lg border border-ivory/15 bg-ivory/[0.04] p-4 transition hover:border-accent hover:bg-ivory/[0.07]">
								<h3 className="text-lg font-semibold">{block.label}</h3>
								<p className="mt-2 text-sm font-semibold text-accent">{block.shortDescription}</p>
								<p className="mt-3 text-sm leading-6 text-ivory/64">{block.description}</p>
							</Link>
						))}
					</div>
				</section>

				<section>
					<div className="max-w-2xl">
						<p className="text-sm font-semibold uppercase tracking-[0.18em] text-ivory/44">Progression</p>
						<h2 className="mt-2 text-2xl font-semibold">Votre progression</h2>
					</div>

					{questionsWorked > 0 ? (
						<div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
							<div className="rounded-lg border border-ivory/15 bg-ivory/[0.03] p-4">
								<p className="text-2xl font-semibold">{questionsWorked}</p>
								<p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-ivory/52">Questions vues</p>
							</div>
							<div className="rounded-lg border border-ivory/15 bg-ivory/[0.03] p-4">
								<p className="text-2xl font-semibold">{successRate === null ? "—" : `${successRate} %`}</p>
								<p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-ivory/52">Réussite</p>
							</div>
							<div className="rounded-lg border border-ivory/15 bg-ivory/[0.03] p-4">
								<p className="text-2xl font-semibold">{questionsToReview}</p>
								<p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-ivory/52">À revoir</p>
							</div>
							<div className="rounded-lg border border-ivory/15 bg-ivory/[0.03] p-4">
								<p className="text-xl font-semibold">{primaryWorkedCategory?.label ?? "—"}</p>
								<p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-ivory/52">Univers principal</p>
							</div>
						</div>
					) : (
						<p className="mt-4 rounded-lg border border-ivory/15 bg-ivory/[0.04] p-4 text-sm leading-6 text-ivory/68">Répondez à quelques questions pour faire apparaître vos premiers repères.</p>
					)}
				</section>
			</section>
		</main>
	);
}
