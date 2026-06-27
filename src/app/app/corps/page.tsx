import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function CorpsPage() {
	const supabase = await createClient();
	const { data, error } = await supabase.auth.getClaims();

	if (error || !data?.claims.sub) {
		redirect("/connexion");
	}

	return (
		<main className="min-h-screen bg-night px-6 py-8 text-ivory sm:px-10 lg:px-16">
			<section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl flex-col gap-12">
				<header className="flex flex-col gap-4 border-b border-ivory/15 pb-5 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<Link href="/app" className="text-lg font-semibold underline-offset-4 hover:underline">
							Fort Curieux
						</Link>
						<p className="mt-2 text-sm text-ivory/58">Corps</p>
					</div>
					<Link href="/app/corps/semaine-type" className="inline-flex h-11 items-center justify-center rounded-md bg-accent px-4 text-sm font-semibold text-night transition hover:bg-[#dc8440]">
						Semaine type
					</Link>
				</header>

				<div className="max-w-3xl py-8">
					<h1 className="text-4xl font-semibold sm:text-5xl">Corps</h1>
					<p className="mt-6 text-lg leading-8 text-ivory/72">Construisez votre semaine type sportive avant d&apos;enregistrer vos séances.</p>
				</div>

				<div className="grid gap-4 sm:grid-cols-2">
					<Link href="/app/corps/semaine-type" className="rounded-lg border border-ivory/20 bg-ivory p-5 text-night transition hover:border-accent hover:shadow-[0_18px_60px_rgba(0,0,0,0.2)]">
						<span className="text-2xl font-semibold">Semaine type</span>
						<span className="mt-4 block text-sm leading-6 text-night/64">Ajouter, modifier et archiver vos activités hebdomadaires.</span>
					</Link>
				</div>
			</section>
		</main>
	);
}
