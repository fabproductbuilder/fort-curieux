import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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
		<main className="min-h-screen bg-night px-4 py-6 text-ivory sm:px-10 sm:py-8 lg:px-16">
			<section className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-5xl flex-col justify-between gap-10 sm:min-h-[calc(100vh-4rem)] sm:gap-12">
				<header className="flex flex-col gap-3 border-b border-ivory/15 pb-5 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex items-center gap-3">
						<Image src="/icons/icon-192.png" alt="" width={36} height={36} priority className="h-9 w-9 rounded-md border border-ivory/15" />
						<p className="text-lg font-semibold">Fort Curieux</p>
					</div>
					<p className="break-all text-sm text-ivory/68 sm:break-normal">{email}</p>
				</header>

				<div className="py-8">
					<h1 className="text-3xl font-semibold sm:text-5xl">Votre espace est prêt.</h1>
					<div className="mt-10 grid gap-4 sm:grid-cols-2">
						<div className="rounded-lg border border-ivory/20 bg-ivory p-5 text-night">
							<p className="text-2xl font-semibold">Sport</p>
							<p className="mt-4 text-sm leading-6 text-night/64">Organiser votre semaine sportive et consulter ce qui est prévu maintenant.</p>
							<div className="mt-5 flex flex-wrap gap-3">
								<Link href="/app/sport" className="inline-flex min-h-10 items-center text-sm font-semibold text-night underline-offset-4 hover:underline">
									Accueil Sport
								</Link>
								<Link href="/app/sport/semaine-actuelle" className="inline-flex min-h-10 items-center text-sm font-semibold text-night underline-offset-4 hover:underline">
									Semaine actuelle
								</Link>
							</div>
						</div>
						<Link href="/app/culture" className="rounded-lg border border-ivory/15 p-5 text-ivory/72 transition hover:border-accent hover:text-ivory focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-night">
							<p className="text-2xl font-semibold">Culture</p>
							<p className="mt-4 text-sm leading-6 text-ivory/62">Entretenez vos repères en histoire, géographie, inventions, musique et cinéma avec des sessions courtes et régulières.</p>
							<p className="mt-5 inline-flex min-h-10 items-center text-sm font-semibold text-accent underline-offset-4 hover:underline">Ouvrir Culture</p>
						</Link>
					</div>
				</div>

				<form action={signOutAction} className="border-t border-ivory/15 py-8">
					<button
						type="submit"
						className="h-12 w-full rounded-md border border-ivory/25 px-5 text-sm font-semibold text-ivory transition hover:border-accent hover:text-accent sm:w-auto"
					>
						Se déconnecter
					</button>
				</form>
			</section>
		</main>
	);
}
