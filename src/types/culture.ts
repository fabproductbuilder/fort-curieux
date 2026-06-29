export type CultureCategory = "history" | "geography" | "inventions" | "music" | "cinema";

export type CultureItemType = "knowledge_card" | "cultural_marker";

export type CultureCollection =
	| "country_capitals"
	| "us_state_capitals"
	| "french_department_numbers"
	| "history_markers"
	| "geography_markers"
	| "invention_dates"
	| "invention_people"
	| "music_album_dates"
	| "music_song_dates"
	| "music_artist_links"
	| "music_markers"
	| "cinema_markers"
	| "cinema_film_dates"
	| "cinema_director_links"
	| "cinema_actor_links"
	| (string & {});

export type CulturePromptDirection = "standard" | "forward" | "reverse";

export type CulturePromptType =
	| "capital"
	| "country"
	| "state_capital"
	| "us_state"
	| "department_number"
	| "department_name"
	| "date"
	| "period"
	| "person"
	| "artist"
	| "album"
	| "song"
	| "film"
	| "director"
	| "actor"
	| "general";

export type CultureMasteryStatus = "new" | "discovered" | "review" | "known" | "mastered";

export type CultureReviewResult = "correct" | "incorrect" | "known" | "review";

export type CultureSessionScope = "all" | "category" | "collection";

export type CultureSessionMode = "quick_mix" | "review_due" | "category_focus" | "collection_focus";

export type CultureItem = {
	id: string;
	category: CultureCategory;
	item_type: CultureItemType;
	collection: CultureCollection | null;
	title: string;
	period_label: string | null;
	location_label: string | null;
	short_summary: string;
	sort_order: number;
	is_active: boolean;
	created_at: string;
	updated_at: string;
};

export type CulturePrompt = {
	id: string;
	item_id: string;
	prompt_direction: CulturePromptDirection;
	prompt_type: CulturePromptType;
	question: string;
	answer: string;
	answer_aliases: string[];
	choices: string[];
	sort_order: number;
	is_active: boolean;
	created_at: string;
	updated_at: string;
};

export type CultureProgress = {
	id: string;
	user_id: string;
	item_id: string;
	prompt_id: string;
	mastery_status: CultureMasteryStatus;
	last_seen_at: string | null;
	next_review_at: string | null;
	last_result: CultureReviewResult | null;
	review_count: number;
	correct_count: number;
	incorrect_count: number;
	streak_count: number;
	created_at: string;
	updated_at: string;
};
