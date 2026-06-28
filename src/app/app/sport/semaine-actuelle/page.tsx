import Link from "next/link";
import { redirect } from "next/navigation";
import { CurrentWeekManager, type CurrentWeekDay, type CurrentWeekOccurrence } from "@/components/sport/current-week-manager";
import { createClient } from "@/lib/supabase/server";
import { formatDateForDatabase, formatFrenchDate, getCurrentWeekMonday, getWeekDays } from "@/lib/sport/week";
import { WEEK_DAYS } from "@/lib/sport/constants";
import type { MeasurementType, PerceivedEffort, SportOccurrenceStatus } from "@/types/sport";

type SportOccurrenceRow = Omit<CurrentWeekOccurrence, "measurement_type" | "target_value" | "actual_value" | "perceived_effort" | "status"> & {
	measurement_type: MeasurementType;
	target_value: number | string | null;
	actual_value: number | string | null;
	perceived_effort: PerceivedEffort | null;
	status: SportOccurrenceStatus;
};

function normalizeOccurrence(row: SportOccurrenceRow): CurrentWeekOccurrence {
	return {
		...row,
		target_value: row.target_value === null ? null : Number(row.target_value),
		actual_value: row.actual_value === null ? null : Number(row.actual_value),
	};
}

export default async function SemaineActuellePage() {
	const supabase = await createClient();
	const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();

	if (claimsError || !claimsData?.claims.sub) {
		redirect("/connexion");
	}

	const userId = claimsData.claims.sub;
	const weekStart = getCurrentWeekMonday();
	const weekDays: CurrentWeekDay[] = getWeekDays(weekStart).map((date, index) => ({
		dateKey: formatDateForDatabase(date),
		dateLabel: formatFrenchDate(date),
		label: WEEK_DAYS[index].label,
		value: WEEK_DAYS[index].value,
	}));
	const weekStartKey = weekDays[0].dateKey;
	const weekEndKey = weekDays[6].dateKey;

	const [{ data: templates, error: templatesError }, { data: occurrencesData, error: occurrencesError }] = await Promise.all([
		supabase.from("sport_templates").select("id,day_of_week").eq("user_id", userId).eq("is_active", true),
		supabase
			.from("sport_occurrences")
			.select("id,template_id,scheduled_date,name_snapshot,measurement_type,target_value,target_sets,target_reps,status,actual_value,actual_sets,actual_reps,perceived_effort,created_at")
			.eq("user_id", userId)
			.gte("scheduled_date", weekStartKey)
			.lte("scheduled_date", weekEndKey)
			.order("scheduled_date", { ascending: true })
			.order("created_at", { ascending: true }),
	]);

	const hasTemplates = Boolean(templates?.length);
	const occurrences = occurrencesError ? [] : ((occurrencesData ?? []) as SportOccurrenceRow[]).map(normalizeOccurrence);

	return (
		<main className="min-h-screen bg-night px-4 py-6 text-ivory sm:px-10 sm:py-8 lg:px-16">
			<section className="mx-auto flex w-full max-w-7xl flex-col gap-8 sm:gap-10">
				<header className="flex flex-col gap-4 border-b border-ivory/15 pb-5 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<Link href="/app" className="inline-flex min-h-9 items-center text-lg font-semibold underline-offset-4 hover:underline">
							Fort Curieux
						</Link>
						<p className="mt-2 text-sm text-ivory/58">
							<Link href="/app/sport" className="inline-flex min-h-8 items-center underline-offset-4 hover:underline">
								Sport
							</Link>{" "}
							· Semaine actuelle
						</p>
					</div>
					<Link href="/app" className="inline-flex h-11 w-full items-center justify-center rounded-md border border-ivory/25 px-4 text-sm font-semibold text-ivory transition hover:border-accent hover:text-accent sm:w-auto">
						Mon espace
					</Link>
				</header>

				<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-end">
					<div className="max-w-3xl">
						<h1 className="text-3xl font-semibold sm:text-5xl">Semaine actuelle</h1>
						<p className="mt-4 text-base leading-7 text-ivory/72 sm:mt-5 sm:text-lg sm:leading-8">
							Votre semaine type sert de base. Vous pouvez ensuite indiquer ce que vous avez réellement fait.
						</p>
					</div>
					<div className="rounded-lg border border-ivory/15 p-4 text-sm leading-6 text-ivory/72 sm:p-5">
						<p className="font-semibold text-ivory">Semaine type</p>
						<p className="mt-2">Votre organisation habituelle.</p>
						<p className="mt-4 font-semibold text-ivory">Semaine actuelle</p>
						<p className="mt-2">Les activités prévues cette semaine et vos résultats réels.</p>
					</div>
				</div>

				<CurrentWeekManager
					hasTemplates={hasTemplates}
					loadError={templatesError || occurrencesError ? "Impossible de charger toutes les informations de votre semaine pour le moment." : undefined}
					occurrences={occurrences}
					weekDays={weekDays}
					weekEndLabel={weekDays[6].dateLabel}
					weekStartLabel={formatFrenchDate(weekStart)}
				/>
			</section>
		</main>
	);
}
