import { redirect } from "next/navigation";
import Link from "next/link";
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
			<section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl flex-col justify-between gap-12">
				<header className="flex flex-col gap-3 border-b border-ivory/15 pb-5 sm:flex-row sm:items-center sm:justify-between">
					<p className="text-lg font-semibold">Fort Curieux</p>
					<p className="text-sm text-ivory/68">{email}</p>
				</header>

				<div className="py-8">
					<h1 className="text-4xl font-semibold sm:text-5xl">Votre espace est prêt.</h1>
					<div className="mt-10 grid gap-4 sm:grid-cols-2">
						<Link href="/app/corps" className="rounded-lg border border-ivory/20 bg-ivory p-5 text-night transition hover:border-accent hover:shadow-[0_18px_60px_rgba(0,0,0,0.2)]">
							<span className="text-2xl font-semibold">Corps</span>
							<span className="mt-4 block text-sm leading-6 text-night/64">Gérer votre semaine type sportive.</span>
						</Link>
						<div className="rounded-lg border border-ivory/15 p-5 text-ivory/54">
							<p className="text-2xl font-semibold text-ivory/72">Culture</p>
							<p className="mt-4 text-sm leading-6">Bientôt</p>
						</div>
					</div>
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
