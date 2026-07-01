import Link from "next/link";
import { BrandMark } from "@/components/brand/brand-mark";
import { createClient } from "@/lib/supabase/server";

const pillars = [
	{
		title: "Sport",
		description: "Préparez votre semaine, suivez vos séances et notez ce que vous avez réellement fait.",
	},
	{
		title: "Culture",
		description: "Révisez vos repères en histoire, géographie, musique, cinéma et inventions grâce à des sessions courtes et régulières.",
	},
];

export default async function Home() {
	const supabase = await createClient();
	const { data, error } = await supabase.auth.getClaims();
	const isAuthenticated = !error && Boolean(data?.claims.sub);

	return (
		<main className="min-h-screen bg-night text-ivory">
			<section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-between px-6 py-8 sm:px-10 lg:px-16">
				<header className="flex flex-col gap-4 border-b border-ivory/15 pb-5 sm:flex-row sm:items-center sm:justify-between">
					<BrandMark priority />
					<nav className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center" aria-label="Accès au compte">
						{isAuthenticated ? (
							<Link
								href="/app"
								className="inline-flex h-11 w-full items-center justify-center rounded-md bg-accent px-4 text-sm font-semibold text-night transition hover:bg-[#dc8440] sm:w-auto"
							>
								Mon espace
							</Link>
						) : (
							<>
								<Link
									href="/connexion"
									className="inline-flex h-11 w-full items-center justify-center rounded-md border border-ivory/25 px-4 text-sm font-semibold text-ivory transition hover:border-accent hover:text-accent sm:w-auto"
								>
									Se connecter
								</Link>
								<Link
									href="/inscription"
									className="inline-flex h-11 w-full items-center justify-center rounded-md bg-accent px-4 text-sm font-semibold text-night transition hover:bg-[#dc8440] sm:w-auto"
								>
									Créer un compte
								</Link>
							</>
						)}
					</nav>
				</header>

				<div className="py-16 sm:py-24">
					<h1 className="max-w-3xl text-5xl font-semibold leading-tight sm:text-6xl">Fort Curieux</h1>
					<p className="mt-6 max-w-2xl text-xl leading-8 text-ivory/78 sm:text-2xl">
						Devenez plus fort, plus curieux, jour après jour.
					</p>
					<p className="mt-6 max-w-2xl text-base leading-7 text-ivory/66 sm:text-lg sm:leading-8">
						Une web app personnelle pour construire une routine simple : quelques minutes pour bouger, apprendre, et progresser avec régularité.
					</p>
				</div>

				<div className="grid gap-10 border-t border-ivory/15 py-10 sm:grid-cols-2">
					{pillars.map((pillar) => (
						<article key={pillar.title} className="pt-1">
							<h2 className="text-2xl font-semibold text-ivory">{pillar.title}</h2>
							<p className="mt-4 max-w-md text-base leading-7 text-ivory/68">{pillar.description}</p>
						</article>
					))}
				</div>
			</section>
		</main>
	);
}
