"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { parseSportTemplateForm } from "@/lib/sport/validation";
import type { SportTemplateFormState } from "@/types/sport";

async function getAuthenticatedUserId(): Promise<string | null> {
	const supabase = await createClient();
	const { data, error } = await supabase.auth.getClaims();

	if (error || !data?.claims.sub) {
		return null;
	}

	return data.claims.sub;
}

function failure(message: string): SportTemplateFormState {
	return {
		status: "error",
		message,
	};
}

function success(message: string): SportTemplateFormState {
	return {
		status: "success",
		message,
	};
}

function readTemplateId(formData: FormData): string | null {
	const id = formData.get("id");
	return typeof id === "string" && id.trim() ? id.trim() : null;
}

export async function createSportTemplateAction(_state: SportTemplateFormState, formData: FormData): Promise<SportTemplateFormState> {
	const userId = await getAuthenticatedUserId();

	if (!userId) {
		return failure("Connectez-vous pour modifier votre semaine type.");
	}

	const parsed = parseSportTemplateForm(formData);

	if (!parsed.ok) {
		return failure(parsed.message);
	}

	const supabase = await createClient();
	const { error } = await supabase.from("sport_templates").insert({
		...parsed.value,
		user_id: userId,
		is_active: true,
	});

	if (error) {
		return failure("L'activité n'a pas pu être créée. Vérifiez les champs puis réessayez.");
	}

	revalidatePath("/app/sport/semaine-type");
	revalidatePath("/app/sport");

	return success("Activité ajoutée à votre semaine type.");
}

export async function updateSportTemplateAction(_state: SportTemplateFormState, formData: FormData): Promise<SportTemplateFormState> {
	const userId = await getAuthenticatedUserId();
	const id = readTemplateId(formData);

	if (!userId) {
		return failure("Connectez-vous pour modifier votre semaine type.");
	}

	if (!id) {
		return failure("Activité introuvable.");
	}

	const parsed = parseSportTemplateForm(formData);

	if (!parsed.ok) {
		return failure(parsed.message);
	}

	const supabase = await createClient();
	const { error } = await supabase
		.from("sport_templates")
		.update(parsed.value)
		.eq("id", id)
		.eq("user_id", userId)
		.eq("is_active", true);

	if (error) {
		return failure("L'activité n'a pas pu être modifiée. Vérifiez les champs puis réessayez.");
	}

	revalidatePath("/app/sport/semaine-type");
	revalidatePath("/app/sport");

	return success("Activité mise à jour.");
}

export async function archiveSportTemplateAction(formData: FormData): Promise<void> {
	const userId = await getAuthenticatedUserId();
	const id = readTemplateId(formData);

	if (!userId || !id) {
		return;
	}

	const supabase = await createClient();

	await supabase
		.from("sport_templates")
		.update({ is_active: false })
		.eq("id", id)
		.eq("user_id", userId)
		.eq("is_active", true);

	revalidatePath("/app/sport/semaine-type");
	revalidatePath("/app/sport");
}
