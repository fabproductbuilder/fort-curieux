const pillars = [
	{
		title: "Corps",
		description: "Un espace en préparation pour composer son planning sportif, définir ses objectifs et noter ses résultats.",
	},
	{
		title: "Culture",
		description: "Des sessions courtes en préparation autour de repères solides en histoire, sciences, géographie et musique.",
	},
];

export default function Home() {
	return (
		<main className="min-h-screen bg-night text-ivory">
			<section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-between px-6 py-8 sm:px-10 lg:px-16">
				<header className="flex items-center justify-between border-b border-ivory/15 pb-5">
					<p className="text-lg font-semibold">Fort Curieux</p>
					<p className="text-xs font-semibold uppercase text-accent tracking-[0.26em]">V1</p>
				</header>

				<div className="py-16 sm:py-24">
					<p className="mb-5 text-sm font-semibold uppercase text-accent tracking-[0.22em]">Fondation en cours</p>
					<h1 className="max-w-3xl text-5xl font-semibold leading-tight sm:text-6xl">Fort Curieux</h1>
					<p className="mt-6 max-w-2xl text-xl leading-8 text-ivory/78 sm:text-2xl">
						Entraînez votre corps. Entretenez votre culture.
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
