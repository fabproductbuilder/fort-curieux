import { BrandMark } from "@/components/brand/brand-mark";

type AuthShellProps = {
	title: string;
	subtitle: string;
	children: React.ReactNode;
};

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
	return (
		<main className="min-h-screen bg-night px-6 py-8 text-ivory sm:px-10 lg:px-16">
			<section className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-12 lg:grid-cols-[0.85fr_1fr]">
				<div className="max-w-xl">
					<BrandMark priority />
					<p className="mt-6 max-w-lg text-4xl font-semibold leading-tight sm:text-5xl">
						Entraînez votre corps. Entretenez votre culture.
					</p>
				</div>

				<div className="w-full max-w-md justify-self-end rounded-lg border border-ivory/20 bg-ivory p-6 text-night shadow-[0_24px_80px_rgba(0,0,0,0.22)] sm:p-8">
					<div className="mb-8">
						<h1 className="text-3xl font-semibold">{title}</h1>
						<p className="mt-3 text-sm leading-6 text-night/68">{subtitle}</p>
					</div>
					{children}
				</div>
			</section>
		</main>
	);
}
