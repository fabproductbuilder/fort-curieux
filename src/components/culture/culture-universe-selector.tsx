"use client";

import { CULTURE_CATEGORY_OPTIONS } from "@/lib/culture/categories";
import type { CultureCategory } from "@/types/culture";

type CultureUniverseSelectorProps = {
	selectedCategories: CultureCategory[];
	onChange: (categories: CultureCategory[]) => void;
};

function toggleCategory(selectedCategories: CultureCategory[], category: CultureCategory): CultureCategory[] {
	const nextCategories = selectedCategories.includes(category) ? selectedCategories.filter((selectedCategory) => selectedCategory !== category) : [...selectedCategories, category];

	return nextCategories.length === CULTURE_CATEGORY_OPTIONS.length ? [] : nextCategories;
}

export function CultureUniverseSelector({ selectedCategories, onChange }: CultureUniverseSelectorProps) {
	return (
		<div className="grid gap-2 sm:grid-cols-2">
			<button
				type="button"
				onClick={() => onChange([])}
				aria-pressed={selectedCategories.length === 0}
				className={`min-h-12 rounded-md border px-4 py-3 text-left text-sm font-semibold transition ${
					selectedCategories.length === 0 ? "border-accent bg-[#fff4ed] text-night" : "border-night/12 bg-white text-night/70 hover:border-accent hover:text-night"
				}`}
			>
				Tous les univers
			</button>

			{CULTURE_CATEGORY_OPTIONS.map((option) => {
				const isSelected = selectedCategories.includes(option.value);

				return (
					<button
						key={option.value}
						type="button"
						onClick={() => onChange(toggleCategory(selectedCategories, option.value))}
						aria-pressed={isSelected}
						className={`min-h-12 rounded-md border px-4 py-3 text-left text-sm font-semibold transition ${
							isSelected ? "border-accent bg-[#fff4ed] text-night" : "border-night/12 bg-white text-night/70 hover:border-accent hover:text-night"
						}`}
					>
						{option.label}
					</button>
				);
			})}
		</div>
	);
}
