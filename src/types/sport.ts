export type MeasurementType = "repetitions" | "duration_minutes" | "distance_km" | "sets_reps" | "completion";

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

export type SportTemplateFormState = {
	status: "idle" | "success" | "error";
	message: string;
};
