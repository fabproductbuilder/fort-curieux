import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOutAction } from "./actions";

type ClaimsWithEmail = {
	email?: string;
};

export default async function AppPage() {
	const supabase = await createClient();
	const { data, error } = await supabase.auth.getClaims();

	if (error || !data?.claims.sub) {
		redirect("/connexion");
	}

	const email = (data.claims as ClaimsWithEmail).email ?? "Adresse email indisponible";

	return (
		<main className="min-h-screen bg-night px-6 py-8 text-ivory sm:px-10 lg:px-16">
			<section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl flex-col justify-between">
				<header className="border-b border-ivory/15 pb-5">
					<p className="text-lg font-semibold">Fort Curieux</p>
				</header>

				<div className="py-16">
					<h1 className="text-4xl font-semibold sm:text-5xl">Votre espace est prêt.</h1>
					<p className="mt-6 text-lg text-ivory/72">{email}</p>
				</div>

				<form action={signOutAction} className="border-t border-ivory/15 py-8">
					<button
						type="submit"
						className="h-12 rounded-md border border-ivory/25 px-5 text-sm font-semibold text-ivory transition hover:border-accent hover:text-accent"
					>
						Se déconnecter
					</button>
				</form>
			</section>
		</main>
	);
}
