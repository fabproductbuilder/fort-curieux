"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { CultureMasteryStatus, CultureReviewResult } from "@/types/culture";

type CulturePromptForAnswer = {
	id: string;
	item_id: string;
	answer: string;
	answer_aliases: string[];
};

type CultureProgressForUpdate = {
	id: string;
	review_count: number;
	correct_count: number;
	incorrect_count: number;
	streak_count: number;
};

type CultureAnswerResult = {
	status: "success" | "error";
	message: string;
	isCorrect: boolean;
	correctAnswer: string | null;
};

function normalizeAnswer(answer: string): string {
	return answer.trim().replace(/\s+/g, " ").toLocaleLowerCase("fr-FR");
}

function isCorrectAnswer(selectedAnswer: string, prompt: CulturePromptForAnswer): boolean {
	const normalizedSelectedAnswer = normalizeAnswer(selectedAnswer);
	const acceptedAnswers = [prompt.answer, ...prompt.answer_aliases].map(normalizeAnswer);

	return acceptedAnswers.includes(normalizedSelectedAnswer);
}

function getNextReviewAt(isCorrect: boolean, streakCount: number): string {
	const nextReviewAt = new Date();
	const daysToAdd = isCorrect ? (streakCount >= 3 ? 14 : streakCount >= 2 ? 7 : 3) : 1;

	nextReviewAt.setDate(nextReviewAt.getDate() + daysToAdd);

	return nextReviewAt.toISOString();
}

function getMasteryStatus(isCorrect: boolean, correctCount: number, streakCount: number): CultureMasteryStatus {
	if (!isCorrect) {
		return "review";
	}

	if (streakCount >= 3) {
		return "mastered";
	}

	if (correctCount >= 2) {
		return "known";
	}

	return "discovered";
}

export async function recordCultureAnswerAction(promptId: string, selectedAnswer: string): Promise<CultureAnswerResult> {
	const supabase = await createClient();
	const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();

	if (claimsError || !claimsData?.claims.sub) {
		redirect("/connexion?message=connexion_requise");
	}

	const { data: promptData, error: promptError } = await supabase
		.from("culture_prompts")
		.select("id,item_id,answer,answer_aliases,culture_items!inner(id,is_active)")
		.eq("id", promptId)
		.eq("is_active", true)
		.eq("culture_items.is_active", true)
		.maybeSingle();

	if (promptError || !promptData) {
		return {
			status: "error",
			message: "Cette question n'est plus disponible.",
			isCorrect: false,
			correctAnswer: null,
		};
	}

	const prompt = promptData as CulturePromptForAnswer;
	const isCorrect = isCorrectAnswer(selectedAnswer, prompt);
	const { data: existingProgressData, error: progressError } = await supabase
		.from("culture_progress")
		.select("id,review_count,correct_count,incorrect_count,streak_count")
		.eq("user_id", claimsData.claims.sub)
		.eq("prompt_id", prompt.id)
		.maybeSingle();

	if (progressError) {
		return {
			status: "error",
			message: "Votre réponse n'a pas pu être enregistrée.",
			isCorrect: false,
			correctAnswer: prompt.answer,
		};
	}

	const existingProgress = existingProgressData as CultureProgressForUpdate | null;
	const reviewCount = (existingProgress?.review_count ?? 0) + 1;
	const correctCount = (existingProgress?.correct_count ?? 0) + (isCorrect ? 1 : 0);
	const incorrectCount = (existingProgress?.incorrect_count ?? 0) + (isCorrect ? 0 : 1);
	const streakCount = isCorrect ? (existingProgress?.streak_count ?? 0) + 1 : 0;
	const masteryStatus = getMasteryStatus(isCorrect, correctCount, streakCount);
	const lastResult: CultureReviewResult = isCorrect ? "correct" : "incorrect";
	const now = new Date().toISOString();
	const progressPayload = {
		user_id: claimsData.claims.sub,
		item_id: prompt.item_id,
		prompt_id: prompt.id,
		mastery_status: masteryStatus,
		last_seen_at: now,
		next_review_at: getNextReviewAt(isCorrect, streakCount),
		last_result: lastResult,
		review_count: reviewCount,
		correct_count: correctCount,
		incorrect_count: incorrectCount,
		streak_count: streakCount,
	};

	const { error: writeError } = existingProgress
		? await supabase.from("culture_progress").update(progressPayload).eq("id", existingProgress.id).eq("user_id", claimsData.claims.sub)
		: await supabase.from("culture_progress").insert(progressPayload);

	if (writeError) {
		return {
			status: "error",
			message: "Votre réponse n'a pas pu être enregistrée.",
			isCorrect: false,
			correctAnswer: prompt.answer,
		};
	}

	return {
		status: "success",
		message: isCorrect ? "Bonne réponse." : "Mauvaise réponse.",
		isCorrect,
		correctAnswer: prompt.answer,
	};
}
