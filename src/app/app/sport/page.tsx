import Link from "next/link";
import { redirect } from "next/navigation";
import { BrandMark } from "@/components/brand/brand-mark";
import { WEEK_DAYS } from "@/lib/sport/constants";
import { formatDateForDatabase, formatFrenchDate, getCurrentWeekMonday, getWeekDays } from "@/lib/sport/week";
import { createClient } from "@/lib/supabase/server";
import type { SportOccurrenceStatus } from "@/types/sport";

type SportWeekOccurrenceRow = {
	id: string;
	name_snapshot: string;
	scheduled_date: string;
	status: SportOccurrenceStatus;
	created_at: string;
};

function getDayLabel(dateKey: string, todayKey: string, weekDays: Date[]): string {
	if (dateKey === todayKey) {
		return "aujourd'hui";
	}

	const dayIndex = weekDays.findIndex((date) => formatDateForDatabase(date) === dateKey);

	return dayIndex >= 0 ? WEEK_DAYS[dayIndex].label.toLowerCase() : dateKey;
}

function getNextPlannedOccurrence(occurrences: SportWeekOccurrenceRow[], todayKey: string): SportWeekOccurrenceRow | null {
	const plannedOccurrences = occurrences.filter((occurrence) => occurrence.status === "planned");

	return plannedOccurrences.find((occurrence) => occurrence.scheduled_date >= todayKey) ?? plannedOccurrences[0] ?? null;
}

export default async function SportPage() {
	const supabase = await createClient();
	const { data, error } = await supabase.auth.getClaims();

	if (error || !data?.claims.sub) {
		redirect("/connexion");
	}

	const weekStart = getCurrentWeekMonday();
	const weekDays = getWeekDays(weekStart);
	const weekStartKey = formatDateForDatabase(weekDays[0]);
	const weekEndKey = formatDateForDatabase(weekDays[6]);
	const todayKey = formatDateForDatabase(new Date());
	const { data: occurrencesData, error: occurrencesError } = await supabase
		.from("sport_occurrences")
		.select("id,name_snapshot,scheduled_date,status,created_at")
		.eq("user_id", data.claims.sub)
		.gte("scheduled_date", weekStartKey)
		.lte("scheduled_date", weekEndKey)
		.order("scheduled_date", { ascending: true })
		.order("created_at", { ascending: true });

	const occurrences = occurrencesError ? [] : ((occurrencesData ?? []) as SportWeekOccurrenceRow[]);
	const totalCount = occurrences.length;
	const completedCount = occurrences.filter((occurrence) => occurrence.status === "completed").length;
	const skippedCount = occurrences.filter((occurrence) => occurrence.status === "skipped").length;
	const cancelledCount = occurrences.filter((occurrence) => occurrence.status === "cancelled").length;
	const plannedCount = occurrences.filter((occurrence) => occurrence.status === "planned").length;
	const nextPlannedOccurrence = getNextPlannedOccurrence(occurrences, todayKey);

	return (
		<main className="min-h-screen bg-night px-4 py-6 text-ivory sm:px-10 sm:py-8 lg:px-16">
			<section className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-5xl flex-col gap-10 sm:min-h-[calc(100vh-4rem)] sm:gap-12">
				<header className="flex flex-col gap-4 border-b border-ivory/15 pb-5 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<BrandMark href="/app" />
						<p className="mt-2 text-sm text-ivory/58">Sport</p>
					</div>
					<Link href="/app" className="inline-flex h-11 w-full items-center justify-center rounded-md border border-ivory/25 px-4 text-sm font-semibold text-ivory transition hover:border-accent hover:text-accent sm:w-auto">
						Mon espace
					</Link>
				</header>

				<div className="max-w-3xl py-4 sm:py-8">
					<h1 className="text-3xl font-semibold sm:text-5xl">Sport</h1>
					<p className="mt-5 text-base leading-7 text-ivory/72 sm:text-lg sm:leading-8">Suivez votre semaine sportive et gardez vos activités à portée de main.</p>
				</div>

				<div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
					<section className="rounded-lg border border-ivory/20 bg-ivory p-4 text-night sm:p-5">
						<div className="flex flex-col gap-2 border-b border-night/10 pb-4 sm:flex-row sm:items-baseline sm:justify-between">
							<div>
								<p className="text-sm font-semibold uppercase tracking-[0.18em] text-night/44">Cette semaine</p>
								<h2 className="mt-2 text-2xl font-semibold">{totalCount} activité{totalCount > 1 ? "s" : ""} cette semaine</h2>
							</div>
							<p className="text-sm text-night/56">
								Du {formatFrenchDate(weekDays[0])} au {formatFrenchDate(weekDays[6])}
							</p>
						</div>

						{occurrencesError ? (
							<p role="alert" className="mt-4 rounded-md border border-accent/30 bg-[#fff4ed] px-4 py-3 text-sm leading-6 text-[#7a2e12]">
								Impossible de charger le résumé de votre semaine pour le moment.
							</p>
						) : totalCount === 0 ? (
							<div className="mt-5 space-y-4">
								<p className="text-base font-semibold">Aucune activité générée pour cette semaine.</p>
								<Link href="/app/sport/semaine-actuelle" className="inline-flex h-12 w-full items-center justify-center rounded-md bg-accent px-4 text-sm font-semibold text-night transition hover:bg-[#dc8440] sm:w-auto">
									Préparer ma semaine actuelle
								</Link>
							</div>
						) : (
							<>
								<div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
									<div className="rounded-md border border-night/10 bg-white p-3">
										<p className="text-2xl font-semibold">{completedCount}</p>
										<p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-night/46">Terminées</p>
									</div>
									<div className="rounded-md border border-night/10 bg-white p-3">
										<p className="text-2xl font-semibold">{skippedCount}</p>
										<p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-night/46">Non réalisées</p>
									</div>
									<div className="rounded-md border border-night/10 bg-white p-3">
										<p className="text-2xl font-semibold">{cancelledCount}</p>
										<p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-night/46">Annulées</p>
									</div>
									<div className="rounded-md border border-night/10 bg-white p-3">
										<p className="text-2xl font-semibold">{plannedCount}</p>
										<p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-night/46">Encore prévues</p>
									</div>
								</div>

								<div className="mt-5 rounded-md border border-night/10 bg-night/[0.03] p-4">
									{nextPlannedOccurrence ? (
										<p className="text-sm leading-6 text-night/68">
											<span className="font-semibold text-night">Prochaine activité :</span> {nextPlannedOccurrence.name_snapshot} — {getDayLabel(nextPlannedOccurrence.scheduled_date, todayKey, weekDays)}
										</p>
									) : (
										<p className="text-sm leading-6 text-night/68">Toutes les activités maintenues sont traitées pour cette semaine.</p>
									)}
								</div>
							</>
						)}
					</section>

					<nav className="grid gap-3" aria-label="Actions Sport">
						<Link href="/app/sport/semaine-actuelle" className="inline-flex h-12 w-full items-center justify-center rounded-md bg-accent px-4 text-sm font-semibold text-night transition hover:bg-[#dc8440]">
							Voir ma semaine actuelle
						</Link>
						<Link href="/app/sport/semaine-type" className="inline-flex h-12 w-full items-center justify-center rounded-md border border-ivory/25 px-4 text-sm font-semibold text-ivory transition hover:border-accent hover:text-accent">
							Modifier ma semaine type
						</Link>
						<Link href="/app/sport/historique" className="inline-flex h-12 w-full items-center justify-center rounded-md border border-ivory/25 px-4 text-sm font-semibold text-ivory transition hover:border-accent hover:text-accent">
							Voir mon historique
						</Link>
					</nav>
				</div>
			</section>
		</main>
	);
}
