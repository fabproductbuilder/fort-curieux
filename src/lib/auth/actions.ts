"use server";

import { redirect } from "next/navigation";
import { translateAuthError } from "@/lib/auth/messages";
import type { AuthFormState } from "@/lib/auth/state";
import { getSiteUrl } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

function readText(formData: FormData, name: string): string {
	const value = formData.get(name);
	return typeof value === "string" ? value.trim() : "";
}

function readPassword(formData: FormData, name: string): string {
	const value = formData.get(name);
	return typeof value === "string" ? value : "";
}

function validateEmailAndPassword(email: string, password: string): AuthFormState | null {
	if (!email || !password) {
		return {
			status: "error",
			message: "Renseignez votre email et votre mot de passe.",
		};
	}

	if (!email.includes("@")) {
		return {
			status: "error",
			message: "L'adresse email n'est pas valide.",
		};
	}

	return null;
}

export async function signInAction(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
	const email = readText(formData, "email").toLowerCase();
	const password = readPassword(formData, "password");
	const validationError = validateEmailAndPassword(email, password);

	if (validationError) {
		return validationError;
	}

	const supabase = await createClient();
	const { error } = await supabase.auth.signInWithPassword({
		email,
		password,
	});

	if (error) {
		return {
			status: "error",
			message: translateAuthError(error),
		};
	}

	redirect("/app");
}

export async function signUpAction(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
	const firstName = readText(formData, "first_name");
	const email = readText(formData, "email").toLowerCase();
	const password = readPassword(formData, "password");
	const passwordConfirmation = readPassword(formData, "password_confirmation");
	const validationError = validateEmailAndPassword(email, password);

	if (validationError) {
		return validationError;
	}

	if (password !== passwordConfirmation) {
		return {
			status: "error",
			message: "Les deux mots de passe ne correspondent pas.",
		};
	}

	const supabase = await createClient();
	const { data, error } = await supabase.auth.signUp({
		email,
		password,
		options: {
			emailRedirectTo: `${getSiteUrl()}/auth/confirm`,
			data: firstName ? { first_name: firstName } : undefined,
		},
	});

	if (error) {
		return {
			status: "error",
			message: translateAuthError(error),
		};
	}

	if (data.session) {
		redirect("/app");
	}

	if (!data.user) {
		return {
			status: "error",
			message: "L'inscription n'a pas pu être finalisée. Réessayez dans un instant.",
		};
	}

	return {
		status: "success",
		message: "Votre inscription est enregistrée. Un email de confirmation a été envoyé ou peut être nécessaire avant la connexion.",
	};
}

export async function forgotPasswordAction(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
	const email = readText(formData, "email").toLowerCase();

	if (!email || !email.includes("@")) {
		return {
			status: "error",
			message: "Renseignez une adresse email valide.",
		};
	}

	const supabase = await createClient();

	await supabase.auth.resetPasswordForEmail(email, {
		redirectTo: `${getSiteUrl()}/nouveau-mot-de-passe`,
	});

	return {
		status: "success",
		message: "Si un compte existe avec cette adresse, un email de réinitialisation vient d'être envoyé.",
	};
}
