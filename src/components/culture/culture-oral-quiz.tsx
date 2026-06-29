"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CultureUniverseSelector } from "@/components/culture/culture-universe-selector";
import { getCultureCategorySelectionLabel } from "@/lib/culture/categories";
import { filterCultureQuestionsByCategories, selectBalancedCultureQuestions } from "@/lib/culture/question-selection";
import type { CultureCategory } from "@/types/culture";

export type CultureOralQuizQuestion = {
	id: string;
	question: string;
	answer: string;
	category: CultureCategory;
	categoryLabel: string;
	collectionLabel: string | null;
};

type QuestionAmount = "10" | "20" | "all";

type CultureOralQuizProps = {
	questions: CultureOralQuizQuestion[];
};

const QUESTION_AMOUNT_OPTIONS: { value: QuestionAmount; label: string }[] = [
	{ value: "10", label: "10 questions" },
	{ value: "20", label: "20 questions" },
	{ value: "all", label: "Toutes les questions disponibles" },
];

function getRequestedAmount(amount: QuestionAmount): number | null {
	return amount === "all" ? null : Number(amount);
}

export function CultureOralQuiz({ questions }: CultureOralQuizProps) {
	const [questionAmount, setQuestionAmount] = useState<QuestionAmount>("10");
	const [selectedCategories, setSelectedCategories] = useState<CultureCategory[]>([]);
	const [sessionQuestions, setSessionQuestions] = useState<CultureOralQuizQuestion[]>([]);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [isAnswerVisible, setIsAnswerVisible] = useState(false);
	const [isSummaryVisible, setIsSummaryVisible] = useState(false);
	const [hasStarted, setHasStarted] = useState(false);
	const currentQuestion = sessionQuestions[currentIndex];
	const selectedUniverseLabel = getCultureCategorySelectionLabel(selectedCategories);
	const availableQuestions = useMemo(() => filterCultureQuestionsByCategories(questions, selectedCategories), [selectedCategories, questions]);
	const requestedAmount = getRequestedAmount(questionAmount);
	const isLimitedByAvailableQuestions = requestedAmount !== null && availableQuestions.length > 0 && availableQuestions.length < requestedAmount;

	function handleStartQuiz() {
		setSessionQuestions(selectBalancedCultureQuestions(questions, selectedCategories, requestedAmount));
		setCurrentIndex(0);
		setIsAnswerVisible(false);
		setIsSummaryVisible(false);
		setHasStarted(true);
	}

	function handleNextQuestion() {
		setIsAnswerVisible(false);

		if (currentIndex === sessionQuestions.length - 1) {
			setIsSummaryVisible(true);
			return;
		}

		setCurrentIndex((index) => index + 1);
	}

	function handleResetQuiz() {
		setSessionQuestions([]);
		setCurrentIndex(0);
		setIsAnswerVisible(false);
		setIsSummaryVisible(false);
		setHasStarted(false);
	}

	if (questions.length === 0) {
		return (
			<section className="rounded-lg border border-ivory/20 bg-ivory p-4 text-night sm:p-5">
				<h2 className="text-2xl font-semibold">Aucune question disponible</h2>
				<p className="mt-4 text-sm leading-6 text-night/68">Les contenus Culture actifs ne contiennent pas encore de question à proposer pour un quiz oral.</p>
				<Link href="/app/culture" className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-md border border-night/15 px-4 text-sm font-semibold text-night transition hover:border-accent hover:text-accent sm:w-auto">
					Retour Culture
				</Link>
			</section>
		);
	}

	if (isSummaryVisible) {
		return (
			<section className="rounded-lg border border-ivory/20 bg-ivory p-4 text-night sm:p-5">
				<p className="text-sm font-semibold uppercase tracking-[0.18em] text-night/44">Bilan</p>
				<h2 className="mt-2 text-3xl font-semibold">{sessionQuestions.length} question{sessionQuestions.length > 1 ? "s" : ""} parcourue{sessionQuestions.length > 1 ? "s" : ""}</h2>
				<p className="mt-4 text-sm leading-6 text-night/68">
					Univers utilisés : <span className="font-semibold text-night">{selectedUniverseLabel}</span>.
				</p>
				<p className="mt-2 text-sm leading-6 text-night/68">Aucun score n&apos;est affiché : ce mode est pensé pour des réponses orales, seul ou entre amis.</p>
				<div className="mt-6 grid gap-3 sm:grid-cols-2">
					<button type="button" onClick={handleResetQuiz} className="inline-flex h-12 w-full items-center justify-center rounded-md bg-accent px-4 text-sm font-semibold text-night transition hover:bg-[#dc8440]">
						Refaire un quiz
					</button>
					<Link href="/app/culture" className="inline-flex h-12 w-full items-center justify-center rounded-md border border-night/15 px-4 text-sm font-semibold text-night transition hover:border-accent hover:text-accent">
						Retour Culture
					</Link>
				</div>
			</section>
		);
	}

	if (hasStarted && currentQuestion) {
		const isLastQuestion = currentIndex === sessionQuestions.length - 1;

		return (
			<section className="rounded-lg border border-ivory/20 bg-ivory p-4 text-night sm:p-5">
				<div className="flex flex-col gap-3 border-b border-night/10 pb-4 sm:flex-row sm:items-start sm:justify-between">
					<div>
						<p className="text-sm font-semibold uppercase tracking-[0.18em] text-night/44">
							Question {currentIndex + 1} / {sessionQuestions.length}
						</p>
						<p className="mt-2 text-sm font-semibold text-accent">{currentQuestion.categoryLabel}</p>
					</div>
					<p className="text-sm text-night/56">{selectedUniverseLabel}</p>
				</div>

				{currentQuestion.collectionLabel ? <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-night/44">{currentQuestion.collectionLabel}</p> : null}
				<h2 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">{currentQuestion.question}</h2>

				{isAnswerVisible ? (
					<div aria-live="polite" className="mt-6 rounded-md border border-night/10 bg-night/[0.03] p-4">
						<p className="text-xs font-semibold uppercase tracking-[0.16em] text-night/44">Réponse à lire à voix haute.</p>
						<p className="mt-3 text-2xl font-semibold leading-tight">{currentQuestion.answer}</p>
						<button type="button" onClick={handleNextQuestion} className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-md bg-accent px-4 text-sm font-semibold text-night transition hover:bg-[#dc8440] sm:w-auto">
							{isLastQuestion ? "Voir le bilan" : "Question suivante"}
						</button>
					</div>
				) : (
					<button type="button" onClick={() => setIsAnswerVisible(true)} className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-md bg-accent px-4 text-sm font-semibold text-night transition hover:bg-[#dc8440] sm:w-auto">
						Voir la réponse
					</button>
				)}
			</section>
		);
	}

	return (
		<section className="rounded-lg border border-ivory/20 bg-ivory p-4 text-night sm:p-5">
			<p className="text-sm font-semibold uppercase tracking-[0.18em] text-night/44">Configuration</p>
			<h2 className="mt-2 text-2xl font-semibold">Préparer le quiz oral</h2>
			<p className="mt-4 text-sm leading-6 text-night/68">Choisissez un nombre de questions et un ou plusieurs univers, puis révélez les réponses une par une.</p>

			<div className="mt-6 grid gap-6">
				<fieldset>
					<legend className="text-sm font-semibold text-night">Nombre de questions</legend>
					<div className="mt-3 grid gap-2 sm:grid-cols-3">
						{QUESTION_AMOUNT_OPTIONS.map((option) => {
							const isSelected = questionAmount === option.value;

							return (
								<button
									key={option.value}
									type="button"
									onClick={() => setQuestionAmount(option.value)}
									className={`min-h-12 rounded-md border px-4 py-3 text-left text-sm font-semibold transition ${
										isSelected ? "border-accent bg-[#fff4ed] text-night" : "border-night/12 bg-white text-night/70 hover:border-accent hover:text-night"
									}`}
								>
									{option.label}
								</button>
							);
						})}
					</div>
				</fieldset>

				<fieldset>
					<legend className="text-sm font-semibold text-night">Périmètre</legend>
					<div className="mt-3">
						<CultureUniverseSelector selectedCategories={selectedCategories} onChange={setSelectedCategories} />
					</div>
				</fieldset>
			</div>

			<p className="mt-5 text-sm leading-6 text-night/62">
				{availableQuestions.length} question{availableQuestions.length > 1 ? "s" : ""} disponible{availableQuestions.length > 1 ? "s" : ""} pour ce périmètre.
				{isLimitedByAvailableQuestions ? " Le quiz utilisera toutes celles disponibles." : ""}
			</p>

			{availableQuestions.length === 0 ? (
				<p role="alert" className="mt-4 rounded-md border border-accent/30 bg-[#fff4ed] px-4 py-3 text-sm leading-6 text-[#7a2e12]">
					Aucune question active n&apos;est disponible pour ce périmètre.
				</p>
			) : null}

			<button type="button" onClick={handleStartQuiz} disabled={availableQuestions.length === 0} className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-md bg-accent px-4 text-sm font-semibold text-night transition hover:bg-[#dc8440] disabled:cursor-not-allowed disabled:bg-night/15 disabled:text-night/42 sm:w-auto">
				Démarrer le quiz
			</button>
		</section>
	);
}
