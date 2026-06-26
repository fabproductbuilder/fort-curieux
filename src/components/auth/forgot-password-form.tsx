"use client";

import Link from "next/link";
import { useActionState } from "react";
import { forgotPasswordAction } from "@/lib/auth/actions";
import { initialAuthFormState } from "@/lib/auth/state";
import { FormMessage } from "./form-message";
import { SubmitButton } from "./submit-button";
import { TextField } from "./text-field";

export function ForgotPasswordForm() {
	const [state, formAction] = useActionState(forgotPasswordAction, initialAuthFormState);

	return (
		<form action={formAction} className="space-y-5">
			<FormMessage state={state} />
			<TextField label="Email" name="email" type="email" autoComplete="email" required />
			<SubmitButton pendingLabel="Envoi en cours...">Recevoir le lien</SubmitButton>
			<p className="pt-2 text-sm text-night/68">
				Retour à{" "}
				<Link href="/connexion" className="font-semibold text-night underline-offset-4 hover:underline">
					la connexion
				</Link>
			</p>
		</form>
	);
}
