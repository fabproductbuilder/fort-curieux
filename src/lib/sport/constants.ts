import type { MeasurementType } from "@/types/sport";

export const WEEK_DAYS = [
	{ value: 1, label: "Lundi" },
	{ value: 2, label: "Mardi" },
	{ value: 3, label: "Mercredi" },
	{ value: 4, label: "Jeudi" },
	{ value: 5, label: "Vendredi" },
	{ value: 6, label: "Samedi" },
	{ value: 7, label: "Dimanche" },
] as const;

export const MEASUREMENT_OPTIONS: Array<{ value: MeasurementType; label: string }> = [
	{ value: "repetitions", label: "Répétitions" },
	{ value: "duration_minutes", label: "Durée en minutes" },
	{ value: "distance_km", label: "Distance en kilomètres" },
	{ value: "sets_reps", label: "Séries × répétitions" },
	{ value: "completion", label: "Simple validation" },
];

export const MEASUREMENT_LABELS: Record<MeasurementType, string> = {
	repetitions: "Répétitions",
	duration_minutes: "Durée en minutes",
	distance_km: "Distance en kilomètres",
	sets_reps: "Séries × répétitions",
	completion: "Simple validation",
};
