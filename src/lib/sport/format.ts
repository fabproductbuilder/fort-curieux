import type { SportOccurrence, SportTemplate } from "@/types/sport";

function formatNumber(value: number): string {
	return Number.isInteger(value) ? String(value) : String(value).replace(".", ",");
}

export function formatSportTarget(template: Pick<SportTemplate, "measurement_type" | "target_value" | "target_sets" | "target_reps">): string {
	if (template.measurement_type === "repetitions" && template.target_value !== null) {
		return `${formatNumber(template.target_value)} répétitions`;
	}

	if (template.measurement_type === "duration_minutes" && template.target_value !== null) {
		return `${formatNumber(template.target_value)} min`;
	}

	if (template.measurement_type === "distance_km" && template.target_value !== null) {
		return `${formatNumber(template.target_value)} km`;
	}

	if (template.measurement_type === "sets_reps" && template.target_sets !== null && template.target_reps !== null) {
		return `${template.target_sets} × ${template.target_reps}`;
	}

	return "Activité libre";
}

export function formatSportResult(occurrence: Pick<SportOccurrence, "measurement_type" | "actual_value" | "actual_sets" | "actual_reps">): string | null {
	if (occurrence.measurement_type === "repetitions" && occurrence.actual_value !== null) {
		return `${formatNumber(occurrence.actual_value)} répétitions`;
	}

	if (occurrence.measurement_type === "duration_minutes" && occurrence.actual_value !== null) {
		return `${formatNumber(occurrence.actual_value)} min`;
	}

	if (occurrence.measurement_type === "distance_km" && occurrence.actual_value !== null) {
		return `${formatNumber(occurrence.actual_value)} km`;
	}

	if (occurrence.measurement_type === "sets_reps" && occurrence.actual_sets !== null && occurrence.actual_reps !== null) {
		return `${occurrence.actual_sets} × ${occurrence.actual_reps}`;
	}

	if (occurrence.measurement_type === "completion") {
		return "activité effectuée";
	}

	return null;
}
