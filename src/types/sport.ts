export type MeasurementType = "repetitions" | "duration_minutes" | "distance_km" | "sets_reps" | "completion";

export type SportOccurrenceStatus = "planned" | "completed" | "skipped" | "cancelled";

export type SportTemplate = {
	id: string;
	user_id: string;
	name: string;
	day_of_week: number;
	measurement_type: MeasurementType;
	target_value: number | null;
	target_sets: number | null;
	target_reps: number | null;
	is_active: boolean;
	created_at: string;
	updated_at: string;
};

export type PerceivedEffort = "easy" | "normal" | "hard";

export type SportOccurrence = {
	id: string;
	user_id: string;
	template_id: string | null;
	scheduled_date: string;
	name_snapshot: string;
	measurement_type: MeasurementType;
	target_value: number | null;
	target_sets: number | null;
	target_reps: number | null;
	status: SportOccurrenceStatus;
	actual_value: number | null;
	actual_sets: number | null;
	actual_reps: number | null;
	perceived_effort: PerceivedEffort | null;
	completed_at: string | null;
	created_at: string;
	updated_at: string;
};

export type SportTemplateFormState = {
	status: "idle" | "success" | "error";
	message: string;
};

export type SportActionState = {
	status: "idle" | "success" | "info" | "error";
	message: string;
};
