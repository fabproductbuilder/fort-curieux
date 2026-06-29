"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signInAction } from "@/lib/auth/actions";
import { initialAuthFormState } from "@/lib/auth/state";
import { FormMessage } from "./form-message";
import { SubmitButton } from "./submit-button";
import { TextField } from "./text-field";

type SignInFormProps = {
	notice?: string;
};

export function SignInForm({ notice }: SignInFormProps) {
	const [state, formAction] = useActionState(signInAction, initialAuthFormState);

	return (
		<form action={formAction} className="space-y-5">
			{notice ? (
				<p role="status" className="rounded-md border border-accent/25 bg-[#fff4ed] px-4 py-3 text-sm leading-6 text-[#7a2e12]">
					{notice}
				</p>
			) : null}
			<FormMessage state={state} />
			<TextField label="Email" name="email" type="email" autoComplete="email" required />
			<TextField label="Mot de passe" name="password" type="password" autoComplete="current-password" required />
			<SubmitButton pendingLabel="Connexion...">Se connecter</SubmitButton>
			<div className="flex flex-col gap-3 pt-2 text-sm text-night/68 sm:flex-row sm:items-center sm:justify-between">
				<Link href="/inscription" className="font-semibold text-night underline-offset-4 hover:underline">
					Créer un compte
				</Link>
				<Link href="/mot-de-passe-oublie" className="font-semibold text-night underline-offset-4 hover:underline">
					Mot de passe oublié
				</Link>
			</div>
		</form>
	);
}
