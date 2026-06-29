"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { translateAuthError } from "@/lib/auth/messages";
import { createClient } from "@/lib/supabase/client";
import { TextField } from "./text-field";

export function NewPasswordForm() {
	const router = useRouter();
	const [message, setMessage] = useState("");
	const [isError, setIsError] = useState(false);
	const [isPending, setIsPending] = useState(false);

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setIsPending(true);
		setMessage("");
		setIsError(false);

		const formData = new FormData(event.currentTarget);
		const password = String(formData.get("password") ?? "");
		const passwordConfirmation = String(formData.get("password_confirmation") ?? "");

		if (!password || password !== passwordConfirmation) {
			setIsPending(false);
			setIsError(true);
			setMessage("Les deux mots de passe ne correspondent pas.");
			return;
		}

		const supabase = createClient();
		const { error } = await supabase.auth.updateUser({ password });

		if (error) {
			setIsPending(false);
			setIsError(true);
			setMessage(translateAuthError(error));
			return;
		}

		router.replace("/app");
		router.refresh();
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-5">
			{message ? (
				<p role="status" className={`rounded-md border px-4 py-3 text-sm leading-6 ${isError ? "border-accent/30 bg-[#fff4ed] text-[#7a2e12]" : "border-emerald-700/20 bg-emerald-50 text-emerald-900"}`}>
					{message}
				</p>
			) : null}
			<TextField label="Nouveau mot de passe" name="password" type="password" autoComplete="new-password" required />
			<TextField label="Confirmation du mot de passe" name="password_confirmation" type="password" autoComplete="new-password" required />
			<button
				type="submit"
				disabled={isPending}
				className="mt-2 flex h-12 w-full items-center justify-center rounded-md bg-accent px-4 text-sm font-semibold text-night transition hover:bg-[#dc8440] disabled:cursor-not-allowed disabled:opacity-70"
				aria-disabled={isPending}
			>
				{isPending ? "Mise à jour..." : "Mettre à jour le mot de passe"}
			</button>
		</form>
	);
}
