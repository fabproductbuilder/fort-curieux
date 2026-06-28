import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function SportPage() {
	const supabase = await createClient();
	const { data, error } = await supabase.auth.getClaims();

	if (error || !data?.claims.sub) {
		redirect("/connexion");
	}

	return (
		<main className="min-h-screen bg-night px-4 py-6 text-ivory sm:px-10 sm:py-8 lg:px-16">
			<section className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-5xl flex-col gap-10 sm:min-h-[calc(100vh-4rem)] sm:gap-12">
				<header className="flex flex-col gap-4 border-b border-ivory/15 pb-5 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<Link href="/app" className="inline-flex min-h-9 items-center text-lg font-semibold underline-offset-4 hover:underline">
							Fort Curieux
						</Link>
						<p className="mt-2 text-sm text-ivory/58">Sport</p>
					</div>
					<Link href="/app" className="inline-flex h-11 w-full items-center justify-center rounded-md border border-ivory/25 px-4 text-sm font-semibold text-ivory transition hover:border-accent hover:text-accent sm:w-auto">
						Mon espace
					</Link>
				</header>

				<div className="max-w-3xl py-4 sm:py-8">
					<h1 className="text-3xl font-semibold sm:text-5xl">Sport</h1>
					<p className="mt-5 text-base leading-7 text-ivory/72 sm:text-lg sm:leading-8">Construisez votre semaine type sportive avant d&apos;enregistrer vos séances.</p>
				</div>

				<div className="grid gap-4 sm:grid-cols-2">
					<Link href="/app/sport/semaine-type" className="rounded-lg border border-ivory/20 bg-ivory p-5 text-night transition hover:border-accent hover:shadow-[0_18px_60px_rgba(0,0,0,0.2)]">
						<span className="text-2xl font-semibold">Semaine type</span>
						<span className="mt-4 block text-sm leading-6 text-night/64">Organiser vos activités habituelles par jour.</span>
					</Link>
					<Link href="/app/sport/semaine-actuelle" className="rounded-lg border border-ivory/20 bg-ivory p-5 text-night transition hover:border-accent hover:shadow-[0_18px_60px_rgba(0,0,0,0.2)]">
						<span className="text-2xl font-semibold">Semaine actuelle</span>
						<span className="mt-4 block text-sm leading-6 text-night/64">Générer et consulter les activités réellement prévues cette semaine.</span>
					</Link>
				</div>
			</section>
		</main>
	);
}
