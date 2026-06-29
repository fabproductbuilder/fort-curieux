import { CULTURE_CATEGORY_OPTIONS } from "@/lib/culture/categories";
import type { CultureCategory } from "@/types/culture";

type CultureQuestionWithCategory = {
	category: CultureCategory;
};

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

export function filterCultureQuestionsByCategories<TQuestion extends CultureQuestionWithCategory>(questions: TQuestion[], selectedCategories: CultureCategory[]): TQuestion[] {
	return selectedCategories.length === 0 ? questions : questions.filter((question) => selectedCategories.includes(question.category));
}

export function selectBalancedCultureQuestions<TQuestion extends CultureQuestionWithCategory>(questions: TQuestion[], selectedCategories: CultureCategory[], requestedCount: number | null): TQuestion[] {
	const availableQuestions = filterCultureQuestionsByCategories(questions, selectedCategories);
	const targetCount = requestedCount === null ? availableQuestions.length : Math.min(requestedCount, availableQuestions.length);
	const activeCategories = shuffle(
		CULTURE_CATEGORY_OPTIONS.map((option) => option.value).filter((category) => selectedCategories.length === 0 || selectedCategories.includes(category)),
	).filter((category) => availableQuestions.some((question) => question.category === category));
	const buckets = new Map<CultureCategory, TQuestion[]>();

	for (const category of activeCategories) {
		buckets.set(
			category,
			shuffle(availableQuestions.filter((question) => question.category === category)),
		);
	}

	const selectedQuestions: TQuestion[] = [];

	while (selectedQuestions.length < targetCount) {
		let hasPickedQuestion = false;

		for (const category of activeCategories) {
			const bucket = buckets.get(category);
			const question = bucket?.shift();

			if (!question) {
				continue;
			}

			selectedQuestions.push(question);
			hasPickedQuestion = true;

			if (selectedQuestions.length === targetCount) {
				break;
			}
		}

		if (!hasPickedQuestion) {
			break;
		}
	}

	return selectedQuestions;
}
