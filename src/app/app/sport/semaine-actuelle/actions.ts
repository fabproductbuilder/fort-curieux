"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { parseSportTemplateForm } from "@/lib/sport/validation";
import { formatDateForDatabase, getCurrentWeekMonday, getDateForIsoWeekDay } from "@/lib/sport/week";
import type { MeasurementType, PerceivedEffort, SportActionState } from "@/types/sport";

type SportTemplateForOccurrence = {
	id: string;
	name: string;
	day_of_week: number;
	measurement_type: MeasurementType;
	target_value: number | string | null;
	target_sets: number | null;
	target_reps: number | null;
};

type ExistingOccurrenceKey = {
	template_id: string | null;
	scheduled_date: string;
};

type SportOccurrenceForCompletion = {
	id: string;
	measurement_type: MeasurementType;
};

function getOccurrenceKey(templateId: string | null, scheduledDate: string): string {
	return `${templateId ?? "none"}:${scheduledDate}`;
}

function success(message: string): SportActionState {
	return {
		status: "success",
		message,
	};
}

function info(message: string): SportActionState {
	return {
		status: "info",
		message,
	};
}

function failure(message: string): SportActionState {
	return {
		status: "error",
		message,
	};
}

function readText(formData: FormData, name: string): string {
	const value = formData.get(name);
	return typeof value === "string" ? value.trim() : "";
}

function readOccurrenceId(formData: FormData): string | null {
	const id = readText(formData, "id");

	return id || null;
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

function readPerceivedEffort(formData: FormData): PerceivedEffort | null {
	const effort = readText(formData, "perceived_effort");

	if (effort === "easy" || effort === "normal" || effort === "hard") {
		return effort;
	}

	return null;
}

async function getAuthenticatedUserId(): Promise<string | null> {
	const supabase = await createClient();
	const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();

	if (claimsError || !claimsData?.claims.sub) {
		return null;
	}

	return claimsData.claims.sub;
}

async function getOccurrenceForUser(id: string, userId: string): Promise<SportOccurrenceForCompletion | null> {
	const supabase = await createClient();
	const { data, error } = await supabase.from("sport_occurrences").select("id,measurement_type").eq("id", id).eq("user_id", userId).maybeSingle();

	if (error || !data) {
		return null;
	}

	return data as SportOccurrenceForCompletion;
}

export async function generateCurrentWeekOccurrencesAction(_state: SportActionState, _formData: FormData): Promise<SportActionState> {
	void _state;
	void _formData;

	const userId = await getAuthenticatedUserId();

	if (!userId) {
		redirect("/connexion");
	}

	const supabase = await createClient();
	const weekStart = getCurrentWeekMonday();
	const weekEnd = getDateForIsoWeekDay(7, weekStart);
	const weekStartKey = formatDateForDatabase(weekStart);
	const weekEndKey = formatDateForDatabase(weekEnd);

	const { data: templates, error: templatesError } = await supabase
		.from("sport_templates")
		.select("id,name,day_of_week,measurement_type,target_value,target_sets,target_reps")
		.eq("user_id", userId)
		.eq("is_active", true);

	if (templatesError || !templates?.length) {
		revalidatePath("/app/sport/semaine-actuelle");
		return failure("Créez d'abord votre semaine type avant de générer la semaine actuelle.");
	}

	const typedTemplates = templates as SportTemplateForOccurrence[];
	const templateIds = typedTemplates.map((template) => template.id);
	const { data: existingOccurrences } = await supabase
		.from("sport_occurrences")
		.select("template_id,scheduled_date")
		.eq("user_id", userId)
		.gte("scheduled_date", weekStartKey)
		.lte("scheduled_date", weekEndKey)
		.in("template_id", templateIds);

	const existingKeys = new Set(
		((existingOccurrences ?? []) as ExistingOccurrenceKey[]).map((occurrence) => getOccurrenceKey(occurrence.template_id, occurrence.scheduled_date)),
	);

	const occurrencesToCreate = typedTemplates
		.map((template) => {
			const scheduledDate = formatDateForDatabase(getDateForIsoWeekDay(template.day_of_week, weekStart));
			const occurrenceKey = getOccurrenceKey(template.id, scheduledDate);

			if (existingKeys.has(occurrenceKey)) {
				return null;
			}

			return {
				user_id: userId,
				template_id: template.id,
				scheduled_date: scheduledDate,
				name_snapshot: template.name,
				measurement_type: template.measurement_type,
				target_value: template.target_value === null ? null : Number(template.target_value),
				target_sets: template.target_sets,
				target_reps: template.target_reps,
				status: "planned",
			};
		})
		.filter((occurrence) => occurrence !== null);

	if (occurrencesToCreate.length === 0) {
		revalidatePath("/app/sport/semaine-actuelle");
		return info("Aucune nouvelle activité à ajouter depuis votre semaine type.");
	}

	if (occurrencesToCreate.length > 0) {
		const { error: insertError } = await supabase.from("sport_occurrences").insert(occurrencesToCreate);

		if (insertError && insertError.code !== "23505") {
			return failure("Les activités de la semaine n'ont pas pu être générées.");
		}

		if (insertError?.code === "23505") {
			return info("Aucune nouvelle activité à ajouter depuis votre semaine type.");
		}
	}

	revalidatePath("/app/sport/semaine-actuelle");
	return success("Votre semaine a été complétée.");
}

export async function createSportOccurrenceAction(_state: SportActionState, formData: FormData): Promise<SportActionState> {
	const userId = await getAuthenticatedUserId();

	if (!userId) {
		redirect("/connexion");
	}

	const parsed = parseSportTemplateForm(formData);

	if (!parsed.ok) {
		return failure(parsed.message);
	}

	const weekStart = getCurrentWeekMonday();
	const scheduledDate = formatDateForDatabase(getDateForIsoWeekDay(parsed.value.day_of_week, weekStart));
	const supabase = await createClient();
	const { error } = await supabase.from("sport_occurrences").insert({
		user_id: userId,
		template_id: null,
		scheduled_date: scheduledDate,
		name_snapshot: parsed.value.name,
		measurement_type: parsed.value.measurement_type,
		target_value: parsed.value.target_value,
		target_sets: parsed.value.target_sets,
		target_reps: parsed.value.target_reps,
		status: "planned",
	});

	if (error) {
		return failure("L'activité ponctuelle n'a pas pu être ajoutée. Vérifiez les champs puis réessayez.");
	}

	revalidatePath("/app/sport/semaine-actuelle");
	return success("Activité ponctuelle ajoutée à cette semaine.");
}

export async function completeSportOccurrenceAction(_state: SportActionState, formData: FormData): Promise<SportActionState> {
	const userId = await getAuthenticatedUserId();

	if (!userId) {
		redirect("/connexion");
	}

	const id = readOccurrenceId(formData);

	if (!id) {
		return failure("Activité introuvable.");
	}

	const occurrence = await getOccurrenceForUser(id, userId);

	if (!occurrence) {
		return failure("Activité introuvable.");
	}

	const perceivedEffort = readPerceivedEffort(formData);
	const payload = {
		status: "completed",
		completed_at: new Date().toISOString(),
		actual_value: null as number | null,
		actual_sets: null as number | null,
		actual_reps: null as number | null,
		perceived_effort: perceivedEffort,
	};

	if (occurrence.measurement_type === "repetitions" || occurrence.measurement_type === "duration_minutes" || occurrence.measurement_type === "distance_km") {
		const actualValue = readPositiveNumber(formData, "actual_value", "le résultat réalisé");

		if (!actualValue.ok) {
			return failure(actualValue.message);
		}

		payload.actual_value = actualValue.value;
	}

	if (occurrence.measurement_type === "sets_reps") {
		const actualSets = readPositiveInteger(formData, "actual_sets", "le nombre de séries réalisées");
		const actualReps = readPositiveInteger(formData, "actual_reps", "le nombre de répétitions réalisées");

		if (!actualSets.ok) {
			return failure(actualSets.message);
		}

		if (!actualReps.ok) {
			return failure(actualReps.message);
		}

		payload.actual_sets = actualSets.value;
		payload.actual_reps = actualReps.value;
	}

	const supabase = await createClient();
	const { error } = await supabase.from("sport_occurrences").update(payload).eq("id", id).eq("user_id", userId);

	if (error) {
		return failure("L'activité n'a pas pu être terminée. Vérifiez les champs puis réessayez.");
	}

	revalidatePath("/app/sport/semaine-actuelle");
	return success("Activité terminée.");
}

export async function skipSportOccurrenceAction(_state: SportActionState, formData: FormData): Promise<SportActionState> {
	const userId = await getAuthenticatedUserId();

	if (!userId) {
		redirect("/connexion");
	}

	const id = readOccurrenceId(formData);

	if (!id) {
		return failure("Activité introuvable.");
	}

	const supabase = await createClient();
	const { error } = await supabase
		.from("sport_occurrences")
		.update({
			status: "skipped",
			completed_at: null,
			actual_value: null,
			actual_sets: null,
			actual_reps: null,
			perceived_effort: null,
		})
		.eq("id", id)
		.eq("user_id", userId);

	if (error) {
		return failure("L'activité n'a pas pu être marquée comme non réalisée. Réessayez dans un instant.");
	}

	revalidatePath("/app/sport/semaine-actuelle");
	return success("Activité marquée comme non réalisée.");
}

export async function cancelSportOccurrenceAction(_state: SportActionState, formData: FormData): Promise<SportActionState> {
	const userId = await getAuthenticatedUserId();

	if (!userId) {
		redirect("/connexion");
	}

	const id = readOccurrenceId(formData);

	if (!id) {
		return failure("Activité introuvable.");
	}

	const supabase = await createClient();
	const { error } = await supabase
		.from("sport_occurrences")
		.update({
			status: "cancelled",
			completed_at: null,
			actual_value: null,
			actual_sets: null,
			actual_reps: null,
			perceived_effort: null,
		})
		.eq("id", id)
		.eq("user_id", userId);

	if (error) {
		return failure("L'activité n'a pas pu être annulée. Réessayez dans un instant.");
	}

	revalidatePath("/app/sport/semaine-actuelle");
	return success("Activité annulée.");
}

export async function resetSportOccurrenceAction(_state: SportActionState, formData: FormData): Promise<SportActionState> {
	const userId = await getAuthenticatedUserId();

	if (!userId) {
		redirect("/connexion");
	}

	const id = readOccurrenceId(formData);

	if (!id) {
		return failure("Activité introuvable.");
	}

	const supabase = await createClient();
	const { error } = await supabase
		.from("sport_occurrences")
		.update({
			status: "planned",
			completed_at: null,
			actual_value: null,
			actual_sets: null,
			actual_reps: null,
			perceived_effort: null,
		})
		.eq("id", id)
		.eq("user_id", userId);

	if (error) {
		return failure("L'activité n'a pas pu être remise en prévue. Réessayez dans un instant.");
	}

	revalidatePath("/app/sport/semaine-actuelle");
	return success("Activité remise en prévue.");
}
