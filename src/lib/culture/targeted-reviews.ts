import type { CultureCollection, CulturePromptDirection, CulturePromptType } from "@/types/culture";

export type TargetedCultureCollection = "country_capitals" | "us_state_capitals" | "french_department_numbers";

export type TargetedCultureDirection = "all" | "forward" | "reverse";

export type TargetedCultureQuestion = {
	collection: CultureCollection | null;
	promptDirection: CulturePromptDirection;
	promptType: CulturePromptType;
};

type TargetedCultureDirectionOption = {
	value: TargetedCultureDirection;
	label: string;
	promptDirection?: CulturePromptDirection;
	promptType?: CulturePromptType;
};

type TargetedCultureBlock = {
	collection: TargetedCultureCollection;
	label: string;
	shortDescription: string;
	description: string;
	directions: TargetedCultureDirectionOption[];
};

export const TARGETED_CULTURE_BLOCKS: TargetedCultureBlock[] = [
	{
		collection: "country_capitals",
		label: "Capitales des pays",
		shortDescription: "Pays ↔ capitales",
		description: "Mémorisez les capitales du monde dans les deux sens.",
		directions: [
			{ value: "all", label: "Tous les sens" },
			{ value: "forward", label: "Pays → capitale", promptDirection: "forward", promptType: "capital" },
			{ value: "reverse", label: "Capitale → pays", promptDirection: "reverse", promptType: "country" },
		],
	},
	{
		collection: "us_state_capitals",
		label: "États américains",
		shortDescription: "États américains ↔ capitales",
		description: "Révisez les capitales des États américains et leur État.",
		directions: [
			{ value: "all", label: "Tous les sens" },
			{ value: "forward", label: "État américain → capitale", promptDirection: "forward", promptType: "state_capital" },
			{ value: "reverse", label: "Capitale → État américain", promptDirection: "reverse", promptType: "us_state" },
		],
	},
	{
		collection: "french_department_numbers",
		label: "Départements français",
		shortDescription: "Départements ↔ numéros",
		description: "Travaillez les départements français et leurs codes.",
		directions: [
			{ value: "all", label: "Tous les sens" },
			{ value: "forward", label: "Département → numéro", promptDirection: "forward", promptType: "department_number" },
			{ value: "reverse", label: "Numéro → département", promptDirection: "reverse", promptType: "department_name" },
		],
	},
];

export function isTargetedCultureCollection(collection: string | null | undefined): collection is TargetedCultureCollection {
	return TARGETED_CULTURE_BLOCKS.some((block) => block.collection === collection);
}

export function getTargetedCultureBlock(collection: TargetedCultureCollection): TargetedCultureBlock {
	return TARGETED_CULTURE_BLOCKS.find((block) => block.collection === collection) ?? TARGETED_CULTURE_BLOCKS[0];
}

export function getTargetedCultureDirectionOption(collection: TargetedCultureCollection, direction: TargetedCultureDirection): TargetedCultureDirectionOption {
	const block = getTargetedCultureBlock(collection);

	return block.directions.find((option) => option.value === direction) ?? block.directions[0];
}

export function isTargetedCultureQuestion(question: TargetedCultureQuestion, collection: TargetedCultureCollection, direction: TargetedCultureDirection): boolean {
	if (question.collection !== collection) {
		return false;
	}

	const directionOption = getTargetedCultureDirectionOption(collection, direction);

	if (!directionOption.promptDirection || !directionOption.promptType) {
		return true;
	}

	return question.promptDirection === directionOption.promptDirection && question.promptType === directionOption.promptType;
}
