import Link from "next/link";
import { redirect } from "next/navigation";
import { BrandMark } from "@/components/brand/brand-mark";
import { PERCEIVED_EFFORT_LABELS, SPORT_OCCURRENCE_STATUS_LABELS, WEEK_DAYS } from "@/lib/sport/constants";
import { formatSportResult, formatSportTarget } from "@/lib/sport/format";
import { formatDateForDatabase, getCurrentWeekMonday, getWeekDays } from "@/lib/sport/week";
import { createClient } from "@/lib/supabase/server";
import type { MeasurementType, PerceivedEffort, SportOccurrence, SportOccurrenceStatus } from "@/types/sport";

const MAX_HISTORY_WEEKS = 12;

const shortDateFormatter = new Intl.DateTimeFormat("fr-FR", {
	day: "numeric",
	month: "long",
});

const longDateFormatter = new Intl.DateTimeFormat("fr-FR", {
	day: "numeric",
	month: "long",
	year: "numeric",
});

type SportHistoryOccurrenceRow = Omit<SportOccurrence, "measurement_type" | "target_value" | "actual_value" | "perceived_effort" | "status"> & {
	measurement_type: MeasurementType;
	target_value: number | string | null;
	actual_value: number | string | null;
	perceived_effort: PerceivedEffort | null;
	status: SportOccurrenceStatus;
};

type SportHistoryOccurrence = SportOccurrence;

type HistoryDayGroup = {
	date: Date;
	dateKey: string;
	dayLabel: string;
	occurrences: SportHistoryOccurrence[];
};

type HistoryWeekGroup = {
	weekStart: Date;
	weekEnd: Date;
	weekStartKey: string;
	occurrences: SportHistoryOccurrence[];
	days: HistoryDayGroup[];
};

function parseDatabaseDate(dateKey: string): Date {
	return new Date(`${dateKey}T00:00:00`);
}

function normalizeOccurrence(row: SportHistoryOccurrenceRow): SportHistoryOccurrence {
	return {
		...row,
		target_value: row.target_value === null ? null : Number(row.target_value),
		actual_value: row.actual_value === null ? null : Number(row.actual_value),
	};
}

function formatWeekTitle(week: HistoryWeekGroup): string {
	return `Semaine du ${shortDateFormatter.format(week.weekStart)} au ${longDateFormatter.format(week.weekEnd)}`;
}

function getDayLabel(date: Date): string {
	const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1;

	return `${WEEK_DAYS[dayIndex].label} ${shortDateFormatter.format(date)}`;
}

function groupOccurrencesByWeek(occurrences: SportHistoryOccurrence[]): HistoryWeekGroup[] {
	const weeks = new Map<string, HistoryWeekGroup>();

	for (const occurrence of occurrences) {
		const scheduledDate = parseDatabaseDate(occurrence.scheduled_date);
		const weekStart = getCurrentWeekMonday(scheduledDate);
		const weekDays = getWeekDays(weekStart);
		const weekStartKey = formatDateForDatabase(weekStart);
		const existingWeek = weeks.get(weekStartKey);

		if (existingWeek) {
			existingWeek.occurrences.push(occurrence);
		} else {
			weeks.set(weekStartKey, {
				weekStart,
				weekEnd: weekDays[6],
				weekStartKey,
				occurrences: [occurrence],
				days: [],
			});
		}
	}

	return Array.from(weeks.values())
		.sort((firstWeek, secondWeek) => secondWeek.weekStartKey.localeCompare(firstWeek.weekStartKey))
		.slice(0, MAX_HISTORY_WEEKS)
		.map((week) => {
			const days = new Map<string, HistoryDayGroup>();

			for (const occurrence of week.occurrences.sort((firstOccurrence, secondOccurrence) => {
				const dateComparison = firstOccurrence.scheduled_date.localeCompare(secondOccurrence.scheduled_date);

				return dateComparison === 0 ? firstOccurrence.created_at.localeCompare(secondOccurrence.created_at) : dateComparison;
			})) {
				const dateKey = occurrence.scheduled_date;
				const existingDay = days.get(dateKey);

				if (existingDay) {
					existingDay.occurrences.push(occurrence);
				} else {
					const date = parseDatabaseDate(dateKey);

					days.set(dateKey, {
						date,
						dateKey,
						dayLabel: getDayLabel(date),
						occurrences: [occurrence],
					});
				}
			}

			return {
				...week,
				days: Array.from(days.values()).sort((firstDay, secondDay) => firstDay.dateKey.localeCompare(secondDay.dateKey)),
			};
		});
}

function countByStatus(occurrences: SportHistoryOccurrence[], status: SportOccurrenceStatus): number {
	return occurrences.filter((occurrence) => occurrence.status === status).length;
}

function formatPlannedTarget(occurrence: SportHistoryOccurrence): string {
	const target = formatSportTarget(occurrence);

	return occurrence.measurement_type === "completion" ? target.toLowerCase() : target;
}

function formatHistoryResult(occurrence: SportHistoryOccurrence): string | null {
	if (occurrence.measurement_type === "completion" && occurrence.status !== "completed") {
		return null;
	}

	return formatSportResult(occurrence);
}

export default async function SportHistoryPage() {
	const supabase = await createClient();
	const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();

	if (claimsError || !claimsData?.claims.sub) {
		redirect("/connexion?message=connexion_requise");
	}

	const { data: occurrencesData, error: occurrencesError } = await supabase
		.from("sport_occurrences")
		.select("id,user_id,template_id,scheduled_date,name_snapshot,measurement_type,target_value,target_sets,target_reps,status,actual_value,actual_sets,actual_reps,perceived_effort,completed_at,created_at,updated_at")
		.eq("user_id", claimsData.claims.sub)
		.order("scheduled_date", { ascending: false })
		.order("created_at", { ascending: true });

	const occurrences = occurrencesError ? [] : ((occurrencesData ?? []) as SportHistoryOccurrenceRow[]).map(normalizeOccurrence);
	const weeks = groupOccurrencesByWeek(occurrences);

	return (
		<main className="min-h-screen bg-night px-4 py-6 text-ivory sm:px-10 sm:py-8 lg:px-16">
			<section className="mx-auto flex w-full max-w-5xl flex-col gap-8 sm:gap-10">
				<header className="flex flex-col gap-4 border-b border-ivory/15 pb-5 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<BrandMark href="/app" />
						<p className="mt-2 text-sm text-ivory/58">
							<Link href="/app/sport" className="inline-flex min-h-8 items-center underline-offset-4 hover:underline">
								Sport
							</Link>{" "}
							· Historique
						</p>
					</div>
					<Link href="/app" className="inline-flex h-11 w-full items-center justify-center rounded-md border border-ivory/25 px-4 text-sm font-semibold text-ivory transition hover:border-accent hover:text-accent sm:w-auto">
						Mon espace
					</Link>
				</header>

				<div className="max-w-3xl">
					<h1 className="text-3xl font-semibold sm:text-5xl">Historique Sport</h1>
					<p className="mt-4 text-base leading-7 text-ivory/72 sm:mt-5 sm:text-lg sm:leading-8">Retrouvez vos semaines passées, ce qui était prévu et ce que vous avez réellement fait.</p>
				</div>

				{occurrencesError ? (
					<p role="alert" className="rounded-lg border border-accent/30 bg-[#fff4ed] px-4 py-3 text-sm leading-6 text-[#7a2e12]">
						Impossible de charger votre historique pour le moment.
					</p>
				) : weeks.length === 0 ? (
					<section className="rounded-lg border border-ivory/20 bg-ivory p-5 text-night">
						<h2 className="text-2xl font-semibold">Aucun historique pour le moment.</h2>
						<p className="mt-3 text-sm leading-6 text-night/64">Votre historique se construira à mesure que vous utiliserez votre semaine actuelle.</p>
						<Link href="/app/sport/semaine-actuelle" className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-md bg-accent px-4 text-sm font-semibold text-night transition hover:bg-[#dc8440] sm:w-auto">
							Voir ma semaine actuelle
						</Link>
					</section>
				) : (
					<div className="grid gap-5">
						{weeks.map((week) => {
							const totalCount = week.occurrences.length;
							const completedCount = countByStatus(week.occurrences, "completed");
							const skippedCount = countByStatus(week.occurrences, "skipped");
							const cancelledCount = countByStatus(week.occurrences, "cancelled");
							const plannedCount = countByStatus(week.occurrences, "planned");

							return (
								<article key={week.weekStartKey} className="rounded-lg border border-ivory/20 bg-ivory p-4 text-night sm:p-5">
									<div className="border-b border-night/10 pb-4">
										<h2 className="text-2xl font-semibold">{formatWeekTitle(week)}</h2>
										<div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
											<div className="rounded-md border border-night/10 bg-white p-3">
												<p className="text-2xl font-semibold">{totalCount}</p>
												<p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-night/46">Activités</p>
											</div>
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
									</div>

									<details className="mt-4 group">
										<summary className="flex min-h-12 cursor-pointer list-none items-center justify-between rounded-md border border-night/10 px-4 text-sm font-semibold transition hover:border-accent">
											Voir le détail
											<span aria-hidden="true" className="text-lg text-night/46 group-open:rotate-45">
												+
											</span>
										</summary>

										<div className="mt-4 grid gap-4">
											{week.days.map((day) => (
												<section key={day.dateKey} className="rounded-md border border-night/10 bg-white p-4">
													<h3 className="text-base font-semibold">{day.dayLabel}</h3>
													<div className="mt-3 grid gap-3">
														{day.occurrences.map((occurrence) => {
															const result = formatHistoryResult(occurrence);

															return (
																<div key={occurrence.id} className="rounded-md bg-night/[0.03] p-3 text-sm leading-6 text-night/68">
																	<p className="text-base font-semibold text-night">{occurrence.name_snapshot}</p>
																	<p className="mt-2">Prévu : {formatPlannedTarget(occurrence)}</p>
																	{result ? <p>Réalisé : {result}</p> : null}
																	{occurrence.perceived_effort ? <p>Ressenti : {PERCEIVED_EFFORT_LABELS[occurrence.perceived_effort]}</p> : null}
																	<p>Statut : {SPORT_OCCURRENCE_STATUS_LABELS[occurrence.status]}</p>
																</div>
															);
														})}
													</div>
												</section>
											))}
										</div>
									</details>
								</article>
							);
						})}
					</div>
				)}
			</section>
		</main>
	);
}
