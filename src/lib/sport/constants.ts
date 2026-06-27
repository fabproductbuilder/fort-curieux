import type { MeasurementType, PerceivedEffort, SportOccurrenceStatus } from "@/types/sport";

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
	{ value: "completion", label: "Activité libre" },
];

export const MEASUREMENT_LABELS: Record<MeasurementType, string> = {
	repetitions: "Répétitions",
	duration_minutes: "Durée en minutes",
	distance_km: "Distance en kilomètres",
	sets_reps: "Séries × répétitions",
	completion: "Activité libre",
};

export const SPORT_OCCURRENCE_STATUS_LABELS: Record<SportOccurrenceStatus, string> = {
	planned: "Prévue",
	completed: "Terminée",
	skipped: "Non réalisée",
	cancelled: "Annulée",
};

export const PERCEIVED_EFFORT_LABELS: Record<PerceivedEffort, string> = {
	easy: "Facile",
	normal: "Normal",
	hard: "Difficile",
};
