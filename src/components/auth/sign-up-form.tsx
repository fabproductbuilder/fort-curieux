"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signUpAction } from "@/lib/auth/actions";
import { initialAuthFormState } from "@/lib/auth/state";
import { FormMessage } from "./form-message";
import { SubmitButton } from "./submit-button";
import { TextField } from "./text-field";

export function SignUpForm() {
	const [state, formAction] = useActionState(signUpAction, initialAuthFormState);

	return (
		<form action={formAction} className="space-y-5">
			<FormMessage state={state} />
			<TextField label="Prénom" name="first_name" type="text" autoComplete="given-name" />
			<TextField label="Email" name="email" type="email" autoComplete="email" required />
			<TextField label="Mot de passe" name="password" type="password" autoComplete="new-password" required />
			<TextField label="Confirmation du mot de passe" name="password_confirmation" type="password" autoComplete="new-password" required />
			<SubmitButton pendingLabel="Création en cours...">Créer mon compte</SubmitButton>
			<p className="pt-2 text-sm text-night/68">
				Déjà inscrit ?{" "}
				<Link href="/connexion" className="font-semibold text-night underline-offset-4 hover:underline">
					Se connecter
				</Link>
			</p>
		</form>
	);
}
