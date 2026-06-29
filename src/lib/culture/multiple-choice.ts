import type { CultureCategory, CultureCollection, CulturePromptDirection, CulturePromptType } from "@/types/culture";

export type CultureMultipleChoicePrompt = {
	id: string;
	answer: string;
	choices: string[];
	category: CultureCategory;
	collection: CultureCollection | null;
	promptDirection: CulturePromptDirection;
	promptType: CulturePromptType;
};

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

function isCompatiblePrompt(prompt: CultureMultipleChoicePrompt, candidate: CultureMultipleChoicePrompt): boolean {
	return candidate.id !== prompt.id && candidate.promptType === prompt.promptType && candidate.promptDirection === prompt.promptDirection;
}

export function buildMultipleChoiceOptions(prompt: CultureMultipleChoicePrompt, allPrompts: CultureMultipleChoicePrompt[]): string[] {
	const wrongChoices: string[] = [];
	const seenChoices = new Set([normalizeChoice(prompt.answer)]);

	function addWrongChoice(answer: string) {
		const trimmedAnswer = answer.trim();
		const normalizedAnswer = normalizeChoice(trimmedAnswer);

		if (!trimmedAnswer || seenChoices.has(normalizedAnswer) || wrongChoices.length >= 3) {
			return;
		}

		seenChoices.add(normalizedAnswer);
		wrongChoices.push(trimmedAnswer);
	}

	function addPromptAnswers(candidates: CultureMultipleChoicePrompt[]) {
		for (const candidate of candidates) {
			addWrongChoice(candidate.answer);

			if (wrongChoices.length >= 3) {
				return;
			}
		}
	}

	const compatiblePrompts = allPrompts.filter((candidate) => isCompatiblePrompt(prompt, candidate));

	for (const choice of prompt.choices) {
		addWrongChoice(choice);
	}

	if (prompt.collection && wrongChoices.length < 3) {
		addPromptAnswers(shuffle(compatiblePrompts.filter((candidate) => candidate.collection === prompt.collection)));
	}

	if (wrongChoices.length < 3) {
		addPromptAnswers(shuffle(compatiblePrompts.filter((candidate) => candidate.category === prompt.category)));
	}

	return shuffle([prompt.answer, ...wrongChoices.slice(0, 3)]);
}
