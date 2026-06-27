import { MEASUREMENT_OPTIONS } from "@/lib/sport/constants";
import type { MeasurementType } from "@/types/sport";

type ParsedTemplatePayload =
	| {
			ok: true;
			value: {
				name: string;
				day_of_week: number;
				measurement_type: MeasurementType;
				target_value: number | null;
				target_sets: number | null;
				target_reps: number | null;
			};
	  }
	| {
			ok: false;
			message: string;
	  };

const measurementTypes = new Set<MeasurementType>(MEASUREMENT_OPTIONS.map((option) => option.value));

function readText(formData: FormData, name: string): string {
	const value = formData.get(name);
	return typeof value === "string" ? value.trim() : "";
}

function readNumber(formData: FormData, name: string): number | null {
	const text = readText(formData, name).replace(",", ".");

	if (!text) {
		return null;
	}

	const value = Number(text);

	return Number.isFinite(value) ? value : Number.NaN;
}

function readPositiveNumber(formData: FormData, name: string, label: string): { ok: true; value: number } | { ok: false; message: string } {
	const value = readNumber(formData, name);

	if (value === null || Number.isNaN(value)) {
		return { ok: false, message: `Renseignez une valeur valide pour ${label}.` };
	}

	if (value <= 0) {
		return { ok: false, message: `${label} doit être strictement positif.` };
	}

	return { ok: true, value };
}

function readPositiveInteger(formData: FormData, name: string, label: string): { ok: true; value: number } | { ok: false; message: string } {
	const parsed = readPositiveNumber(formData, name, label);

	if (!parsed.ok) {
		return parsed;
	}

	if (!Number.isInteger(parsed.value)) {
		return { ok: false, message: `${label} doit être un nombre entier.` };
	}

	return parsed;
}

export function parseSportTemplateForm(formData: FormData): ParsedTemplatePayload {
	const name = readText(formData, "name");
	const day = readNumber(formData, "day_of_week");
	const measurementType = readText(formData, "measurement_type") as MeasurementType;

	if (!name) {
		return { ok: false, message: "Renseignez le nom de l'activité." };
	}

	if (name.length > 120) {
		return { ok: false, message: "Le nom de l'activité ne peut pas dépasser 120 caractères." };
	}

	if (day === null || Number.isNaN(day) || !Number.isInteger(day) || day < 1 || day > 7) {
		return { ok: false, message: "Choisissez un jour de la semaine valide." };
	}

	if (!measurementTypes.has(measurementType)) {
		return { ok: false, message: "Choisissez un type de mesure valide." };
	}

	if (measurementType === "sets_reps") {
		const sets = readPositiveInteger(formData, "target_sets", "Le nombre de séries");
		const reps = readPositiveInteger(formData, "target_reps", "Le nombre de répétitions");

		if (!sets.ok) {
			return sets;
		}

		if (!reps.ok) {
			return reps;
		}

		return {
			ok: true,
			value: {
				name,
				day_of_week: day,
				measurement_type: measurementType,
				target_value: null,
				target_sets: sets.value,
				target_reps: reps.value,
			},
		};
	}

	if (measurementType === "completion") {
		return {
			ok: true,
			value: {
				name,
				day_of_week: day,
				measurement_type: measurementType,
				target_value: null,
				target_sets: null,
				target_reps: null,
			},
		};
	}

	const targetValue = readPositiveNumber(formData, "target_value", "L'objectif");

	if (!targetValue.ok) {
		return targetValue;
	}

	return {
		ok: true,
		value: {
			name,
			day_of_week: day,
			measurement_type: measurementType,
			target_value: targetValue.value,
			target_sets: null,
			target_reps: null,
		},
	};
}
