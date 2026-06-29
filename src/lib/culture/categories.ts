import type { CultureCategory } from "@/types/culture";

export const CULTURE_CATEGORY_OPTIONS: { value: CultureCategory; label: string }[] = [
	{ value: "history", label: "Histoire" },
	{ value: "geography", label: "Géographie" },
	{ value: "inventions", label: "Inventions" },
	{ value: "music", label: "Musique" },
	{ value: "cinema", label: "Cinéma" },
];

export function getCultureCategorySelectionLabel(selectedCategories: CultureCategory[]): string {
	if (selectedCategories.length === 0) {
		return "Tous les univers";
	}

	return CULTURE_CATEGORY_OPTIONS.filter((option) => selectedCategories.includes(option.value))
		.map((option) => option.label)
		.join(" + ");
}
