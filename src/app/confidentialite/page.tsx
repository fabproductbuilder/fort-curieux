import type { Metadata } from "next";
import Link from "next/link";
import { BrandMark } from "@/components/brand/brand-mark";

export const metadata: Metadata = {
	title: "Confidentialité - Fort Curieux",
	description: "Données utilisées par Fort Curieux, services techniques et droits des utilisateurs.",
};

const sections = [
	{
		title: "Données collectées",
		content: (
			<>
				<p>Lors de l&apos;utilisation de Fort Curieux, les données suivantes peuvent être enregistrées :</p>
				<ul>
					<li>données de compte : adresse email, identifiant utilisateur, date de création du compte, date de dernière connexion ;</li>
					<li>données Sport : semaines préparées, séances prévues, séances réalisées, notes ou actions associées ;</li>
					<li>données Culture : historique de révisions, progression, réponses ou résultats liés aux sessions si ces informations sont enregistrées ;</li>
					<li>données techniques nécessaires au bon fonctionnement et à la sécurité du service.</li>
				</ul>
				<p>Fort Curieux ne demande pas de données médicales, d&apos;adresse postale, de numéro de téléphone ou de données de paiement.</p>
			</>
		),
	},
	{
		title: "Utilisation des données",
		content: (
			<>
				<p>Ces données sont utilisées uniquement pour faire fonctionner l&apos;application :</p>
				<ul>
					<li>permettre la connexion au compte ;</li>
					<li>enregistrer la progression personnelle ;</li>
					<li>afficher les semaines sportives ;</li>
					<li>suivre les révisions Culture ;</li>
					<li>maintenir la sécurité et la stabilité du service.</li>
				</ul>
				<p>Les données ne sont pas vendues et ne sont pas utilisées à des fins publicitaires.</p>
			</>
		),
	},
	{
		title: "Services techniques utilisés",
		content: (
			<>
				<p>Fort Curieux utilise des services techniques pour fonctionner :</p>
				<ul>
					<li>Supabase pour l&apos;authentification et la base de données ;</li>
					<li>Cloudflare pour l&apos;hébergement, la performance et la sécurité de l&apos;application.</li>
				</ul>
				<p>Ces services peuvent traiter certaines données techniques nécessaires au fonctionnement du service.</p>
			</>
		),
	},
	{
		title: "Cookies et traceurs",
		content: (
			<>
				<p>Fort Curieux n&apos;utilise pas de cookies publicitaires ni de traceurs marketing.</p>
				<p>Des éléments techniques strictement nécessaires peuvent être utilisés pour permettre la connexion, la sécurité et le bon fonctionnement de l&apos;application.</p>
			</>
		),
	},
	{
		title: "Conservation des données",
		content: (
			<p>
				Les données sont conservées tant que le compte utilisateur est actif. L&apos;utilisateur peut demander la suppression de son compte et des données
				associées.
			</p>
		),
	},
	{
		title: "Droits des utilisateurs",
		content: (
			<>
				<p>Conformément au RGPD, un utilisateur peut demander l&apos;accès, la rectification ou la suppression de ses données personnelles.</p>
				<p>
					Pour toute demande, l&apos;utilisateur peut écrire à :{" "}
					<a href="mailto:fabiensacksteder@gmail.com" className="font-semibold text-accent underline-offset-4 hover:underline">
						fabiensacksteder@gmail.com
					</a>
				</p>
			</>
		),
	},
	{
		title: "Mise à jour",
		content: <p>Cette page peut être mise à jour pour refléter l&apos;évolution de Fort Curieux ou des services techniques utilisés.</p>,
	},
];

export default function PrivacyPage() {
	return (
		<main className="min-h-screen bg-night px-6 py-8 text-ivory sm:px-10 lg:px-16">
			<section className="mx-auto flex w-full max-w-3xl flex-col gap-10">
				<header className="flex flex-col gap-4 border-b border-ivory/15 pb-5 sm:flex-row sm:items-center sm:justify-between">
					<BrandMark href="/" priority />
					<Link href="/" className="inline-flex h-11 w-full items-center justify-center rounded-md border border-ivory/25 px-4 text-sm font-semibold text-ivory transition hover:border-accent hover:text-accent sm:w-auto">
						Accueil
					</Link>
				</header>

				<div>
					<p className="text-sm font-semibold uppercase tracking-[0.18em] text-ivory/44">Données personnelles</p>
					<h1 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">Confidentialité</h1>
					<p className="mt-5 text-base leading-7 text-ivory/72 sm:text-lg sm:leading-8">
						Fort Curieux est une web app personnelle qui aide à suivre une routine autour du sport et de la culture. Cette page explique quelles données sont
						utilisées, pourquoi elles le sont, et comment demander leur suppression ou leur accès.
					</p>
					<p className="mt-4 text-sm text-ivory/52">Dernière mise à jour : juillet 2026</p>
				</div>

				<div className="grid gap-6">
					{sections.map((section) => (
						<section key={section.title} className="rounded-lg border border-ivory/15 bg-ivory/[0.04] p-5">
							<h2 className="text-2xl font-semibold">{section.title}</h2>
							<div className="mt-4 space-y-4 text-sm leading-7 text-ivory/70 [&_li]:ml-5 [&_li]:list-disc">{section.content}</div>
						</section>
					))}
				</div>
			</section>
		</main>
	);
}
