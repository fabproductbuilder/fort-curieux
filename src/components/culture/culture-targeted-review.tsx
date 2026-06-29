"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { recordCultureAnswerAction } from "@/app/app/culture/session/actions";
import {
	getTargetedCultureBlock,
	getTargetedCultureDirectionOption,
	isTargetedCultureQuestion,
	TARGETED_CULTURE_BLOCKS,
	type TargetedCultureCollection,
	type TargetedCultureDirection,
} from "@/lib/culture/targeted-reviews";
import type { CulturePromptDirection, CulturePromptType } from "@/types/culture";

export type CultureTargetedReviewQuestion = {
	id: string;
	question: string;
	collection: TargetedCultureCollection;
	collectionLabel: string;
	promptDirection: CulturePromptDirection;
	promptType: CulturePromptType;
	choices: string[];
};

type AnswerFeedback = {
	selectedAnswer: string;
	isCorrect: boolean;
	correctAnswer: string;
};

type QuestionAmount = "10" | "20" | "all";

type CultureTargetedReviewProps = {
	questions: CultureTargetedReviewQuestion[];
	initialCollection: TargetedCultureCollection;
};

const QUESTION_AMOUNT_OPTIONS: { value: QuestionAmount; label: string }[] = [
	{ value: "10", label: "10 questions" },
	{ value: "20", label: "20 questions" },
	{ value: "all", label: "Toutes les questions disponibles" },
];

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

function getQuestionTargetCount(amount: QuestionAmount, availableQuestionCount: number): number {
	if (amount === "all") {
		return availableQuestionCount;
	}

	return Math.min(Number(amount), availableQuestionCount);
}

export function CultureTargetedReview({ questions, initialCollection }: CultureTargetedReviewProps) {
	const [selectedCollection, setSelectedCollection] = useState<TargetedCultureCollection>(initialCollection);
	const [selectedDirection, setSelectedDirection] = useState<TargetedCultureDirection>("all");
	const [questionAmount, setQuestionAmount] = useState<QuestionAmount>("10");
	const [sessionQuestions, setSessionQuestions] = useState<CultureTargetedReviewQuestion[]>([]);
	const [hasStarted, setHasStarted] = useState(false);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [feedbackByQuestionId, setFeedbackByQuestionId] = useState<Record<string, AnswerFeedback>>({});
	const [pendingChoice, setPendingChoice] = useState<string | null>(null);
	const [actionError, setActionError] = useState<string | null>(null);
	const [isSummaryVisible, setIsSummaryVisible] = useState(false);
	const pendingQuestionIdRef = useRef<string | null>(null);
	const selectedBlock = getTargetedCultureBlock(selectedCollection);
	const selectedDirectionOption = getTargetedCultureDirectionOption(selectedCollection, selectedDirection);
	const availableQuestions = questions.filter((question) => isTargetedCultureQuestion(question, selectedCollection, selectedDirection));
	const targetCount = getQuestionTargetCount(questionAmount, availableQuestions.length);
	const isLimitedByAvailableQuestions = questionAmount !== "all" && availableQuestions.length > 0 && availableQuestions.length < Number(questionAmount);
	const currentQuestion = sessionQuestions[currentIndex];
	const currentFeedback = currentQuestion ? feedbackByQuestionId[currentQuestion.id] : null;
	const score = Object.values(feedbackByQuestionId).filter((feedback) => feedback.isCorrect).length;
	const answeredCount = Object.keys(feedbackByQuestionId).length;
	const isLastQuestion = currentIndex === sessionQuestions.length - 1;

	function handleSelectCollection(collection: TargetedCultureCollection) {
		setSelectedCollection(collection);
		setSelectedDirection("all");
	}

	function handleStartReview() {
		setSessionQuestions(shuffle(availableQuestions).slice(0, targetCount));
		setCurrentIndex(0);
		setFeedbackByQuestionId({});
		setPendingChoice(null);
		setActionError(null);
		setIsSummaryVisible(false);
		setHasStarted(true);
		pendingQuestionIdRef.current = null;
	}

	function handleResetReview() {
		setSessionQuestions([]);
		setCurrentIndex(0);
		setFeedbackByQuestionId({});
		setPendingChoice(null);
		setActionError(null);
		setIsSummaryVisible(false);
		setHasStarted(false);
		pendingQuestionIdRef.current = null;
	}

	async function handleChoice(selectedAnswer: string) {
		if (!currentQuestion || currentFeedback || pendingChoice || pendingQuestionIdRef.current === currentQuestion.id) {
			return;
		}

		pendingQuestionIdRef.current = currentQuestion.id;
		setPendingChoice(selectedAnswer);
		setActionError(null);

		const result = await recordCultureAnswerAction(currentQuestion.id, selectedAnswer);

		setPendingChoice(null);

		const correctAnswer = result.correctAnswer;

		if (result.status === "error" || !correctAnswer) {
			pendingQuestionIdRef.current = null;
			setActionError(result.message);
			return;
		}

		setFeedbackByQuestionId((currentFeedbackByQuestionId) => ({
			...currentFeedbackByQuestionId,
			[currentQuestion.id]: {
				selectedAnswer,
				isCorrect: result.isCorrect,
				correctAnswer,
			},
		}));
	}

	function handleNextStep() {
		pendingQuestionIdRef.current = null;
		setActionError(null);

		if (isLastQuestion) {
			setIsSummaryVisible(true);
			return;
		}

		setCurrentIndex((index) => index + 1);
	}

	if (questions.length === 0) {
		return (
			<section className="rounded-lg border border-ivory/20 bg-ivory p-4 text-night sm:p-5">
				<h2 className="text-2xl font-semibold">Aucune question disponible</h2>
				<p className="mt-4 text-sm leading-6 text-night/68">Les contenus de Géographie ciblée ne contiennent pas encore de question active.</p>
				<Link href="/app/culture" className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-md border border-night/15 px-4 text-sm font-semibold text-night transition hover:border-accent hover:text-accent sm:w-auto">
					Retour Culture
				</Link>
			</section>
		);
	}

	if (isSummaryVisible) {
		const ratio = sessionQuestions.length > 0 ? score / sessionQuestions.length : 0;
		const message = ratio === 1 ? "Sans faute. Ce bloc commence à bien tenir." : ratio >= 0.6 ? "Bonne révision ciblée. Les repères vont se consolider." : "Révision utile. Ce bloc mérite encore quelques passages.";

		return (
			<section className="rounded-lg border border-ivory/20 bg-ivory p-4 text-night sm:p-5">
				<p className="text-sm font-semibold uppercase tracking-[0.18em] text-night/44">Bilan</p>
				<h2 className="mt-2 text-3xl font-semibold">
					{score} / {sessionQuestions.length}
				</h2>
				<p className="mt-4 text-sm leading-6 text-night/68">{message}</p>
				<p className="mt-2 text-sm leading-6 text-night/56">
					{selectedBlock.label} · {selectedDirectionOption.label}
				</p>
				<div className="mt-6 grid gap-3 sm:grid-cols-2">
					<button type="button" onClick={handleResetReview} className="inline-flex h-12 w-full items-center justify-center rounded-md bg-accent px-4 text-sm font-semibold text-night transition hover:bg-[#dc8440]">
						Refaire une révision
					</button>
					<Link href="/app/culture" className="inline-flex h-12 w-full items-center justify-center rounded-md border border-night/15 px-4 text-sm font-semibold text-night transition hover:border-accent hover:text-accent">
						Retour Culture
					</Link>
				</div>
			</section>
		);
	}

	if (hasStarted && currentQuestion) {
		return (
			<section className="rounded-lg border border-ivory/20 bg-ivory p-4 text-night sm:p-5">
				<div className="flex flex-col gap-3 border-b border-night/10 pb-4 sm:flex-row sm:items-start sm:justify-between">
					<div>
						<p className="text-sm font-semibold uppercase tracking-[0.18em] text-night/44">
							Question {currentIndex + 1} / {sessionQuestions.length}
						</p>
						<p className="mt-2 text-sm font-semibold text-accent">{currentQuestion.collectionLabel}</p>
					</div>
					<p className="text-sm text-night/56">{answeredCount} réponse{answeredCount > 1 ? "s" : ""} enregistrée{answeredCount > 1 ? "s" : ""}</p>
				</div>

				<p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-night/44">{selectedDirectionOption.label}</p>
				<h2 className="mt-3 text-2xl font-semibold leading-tight">{currentQuestion.question}</h2>

				<div className="mt-6 grid gap-3" aria-label="Choix de réponse">
					{currentQuestion.choices.map((choice) => {
						const isSelectedChoice = currentFeedback?.selectedAnswer === choice;
						const isCorrectChoice = currentFeedback?.correctAnswer === choice;
						const choiceStateClass = currentFeedback
							? isCorrectChoice
								? "border-[#2f7d4a] bg-[#e9f7ed] text-[#1d4f30]"
								: isSelectedChoice
									? "border-[#b4532a] bg-[#fff4ed] text-[#7a2e12]"
									: "border-night/10 bg-white text-night/64"
							: "border-night/12 bg-white text-night hover:border-accent";

						return (
							<button
								key={choice}
								type="button"
								disabled={Boolean(currentFeedback) || Boolean(pendingChoice)}
								onClick={() => {
									void handleChoice(choice);
								}}
								className={`min-h-12 w-full rounded-md border px-4 py-3 text-left text-sm font-semibold leading-5 transition disabled:cursor-default ${choiceStateClass}`}
							>
								{choice}
							</button>
						);
					})}
				</div>

				{pendingChoice ? <p className="mt-4 text-sm font-semibold text-night/56">Enregistrement de la réponse...</p> : null}

				{actionError ? (
					<p role="alert" className="mt-4 rounded-md border border-accent/30 bg-[#fff4ed] px-4 py-3 text-sm leading-6 text-[#7a2e12]">
						{actionError}
					</p>
				) : null}

				{currentFeedback ? (
					<div aria-live="polite" className="mt-5 rounded-md border border-night/10 bg-night/[0.03] p-4">
						<p className="text-base font-semibold">{currentFeedback.isCorrect ? "Bonne réponse." : "Mauvaise réponse."}</p>
						{currentFeedback.isCorrect ? null : <p className="mt-2 text-sm leading-6 text-night/68">Bonne réponse : {currentFeedback.correctAnswer}</p>}
						<button type="button" onClick={handleNextStep} className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-md bg-accent px-4 text-sm font-semibold text-night transition hover:bg-[#dc8440] sm:w-auto">
							{isLastQuestion ? "Voir le bilan" : "Question suivante"}
						</button>
					</div>
				) : null}
			</section>
		);
	}

	return (
		<section className="rounded-lg border border-ivory/20 bg-ivory p-4 text-night sm:p-5">
			<p className="text-sm font-semibold uppercase tracking-[0.18em] text-night/44">Configuration</p>
			<h2 className="mt-2 text-2xl font-semibold">Choisir ma révision</h2>
			<p className="mt-4 text-sm leading-6 text-night/68">Sélectionnez un bloc, un sens et le nombre de questions à travailler.</p>

			<div className="mt-6 grid gap-6">
				<fieldset>
					<legend className="text-sm font-semibold text-night">Bloc</legend>
					<div className="mt-3 grid gap-2">
						{TARGETED_CULTURE_BLOCKS.map((block) => {
							const isSelected = selectedCollection === block.collection;

							return (
								<button
									key={block.collection}
									type="button"
									onClick={() => handleSelectCollection(block.collection)}
									className={`min-h-14 rounded-md border px-4 py-3 text-left transition ${
										isSelected ? "border-accent bg-[#fff4ed] text-night" : "border-night/12 bg-white text-night/70 hover:border-accent hover:text-night"
									}`}
								>
									<span className="block text-sm font-semibold">{block.label}</span>
									<span className="mt-1 block text-sm text-night/58">{block.shortDescription}</span>
								</button>
							);
						})}
					</div>
				</fieldset>

				<fieldset>
					<legend className="text-sm font-semibold text-night">Sens</legend>
					<div className="mt-3 grid gap-2">
						{selectedBlock.directions.map((direction) => {
							const isSelected = selectedDirection === direction.value;

							return (
								<button
									key={direction.value}
									type="button"
									onClick={() => setSelectedDirection(direction.value)}
									className={`min-h-12 rounded-md border px-4 py-3 text-left text-sm font-semibold transition ${
										isSelected ? "border-accent bg-[#fff4ed] text-night" : "border-night/12 bg-white text-night/70 hover:border-accent hover:text-night"
									}`}
								>
									{direction.label}
								</button>
							);
						})}
					</div>
				</fieldset>

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
			</div>

			<p className="mt-5 text-sm leading-6 text-night/62">
				{availableQuestions.length} question{availableQuestions.length > 1 ? "s" : ""} disponible{availableQuestions.length > 1 ? "s" : ""} pour cette sélection.
				{isLimitedByAvailableQuestions ? " La révision utilisera toutes celles disponibles." : ""}
			</p>

			{availableQuestions.length === 0 ? (
				<p role="alert" className="mt-4 rounded-md border border-accent/30 bg-[#fff4ed] px-4 py-3 text-sm leading-6 text-[#7a2e12]">
					Aucune question active n&apos;est disponible pour cette sélection.
				</p>
			) : null}

			<button type="button" onClick={handleStartReview} disabled={availableQuestions.length === 0} className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-md bg-accent px-4 text-sm font-semibold text-night transition hover:bg-[#dc8440] disabled:cursor-not-allowed disabled:bg-night/15 disabled:text-night/42 sm:w-auto">
				Lancer la révision
			</button>
		</section>
	);
}
