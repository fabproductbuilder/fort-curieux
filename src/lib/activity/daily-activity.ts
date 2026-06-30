import type { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

type DailyActivityKind = "sport" | "culture";

type DailyActivityRow = {
	activity_date: string;
	sport_done: boolean;
	culture_done: boolean;
};

export type DailyActivitySummary = {
	streakDays: number;
	hasActivityToday: boolean;
};

const ACTIVITY_TIME_ZONE = "Europe/Paris";
const DAY_IN_MS = 24 * 60 * 60 * 1000;

export function getActivityDateForFrance(date = new Date()): string {
	const parts = new Intl.DateTimeFormat("en-CA", {
		timeZone: ACTIVITY_TIME_ZONE,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).formatToParts(date);
	const year = parts.find((part) => part.type === "year")?.value;
	const month = parts.find((part) => part.type === "month")?.value;
	const day = parts.find((part) => part.type === "day")?.value;

	if (!year || !month || !day) {
		return date.toISOString().slice(0, 10);
	}

	return `${year}-${month}-${day}`;
}

function shiftDate(dateString: string, dayOffset: number): string {
	const [year, month, day] = dateString.split("-").map(Number);
	const date = new Date(Date.UTC(year, month - 1, day) + dayOffset * DAY_IN_MS);

	return date.toISOString().slice(0, 10);
}

function isActiveDay(row: DailyActivityRow): boolean {
	return row.sport_done || row.culture_done;
}

export async function markDailyActivity(supabase: SupabaseServerClient, userId: string, kind: DailyActivityKind): Promise<boolean> {
	const activityDate = getActivityDateForFrance();

	if (kind === "sport") {
		const { error } = await supabase.from("daily_activity").upsert(
			{
				user_id: userId,
				activity_date: activityDate,
				sport_done: true,
			},
			{
				onConflict: "user_id,activity_date",
			},
		);

		return !error;
	}

	const { error } = await supabase.from("daily_activity").upsert(
		{
			user_id: userId,
			activity_date: activityDate,
			culture_done: true,
		},
		{
			onConflict: "user_id,activity_date",
		},
	);

	return !error;
}

export async function getDailyActivitySummary(supabase: SupabaseServerClient, userId: string): Promise<DailyActivitySummary> {
	const today = getActivityDateForFrance();
	const { data, error } = await supabase
		.from("daily_activity")
		.select("activity_date,sport_done,culture_done")
		.eq("user_id", userId)
		.order("activity_date", { ascending: false })
		.limit(370);

	if (error) {
		return {
			streakDays: 0,
			hasActivityToday: false,
		};
	}

	const activeDates = new Set(((data ?? []) as DailyActivityRow[]).filter(isActiveDay).map((row) => row.activity_date));
	const hasActivityToday = activeDates.has(today);
	let dateCursor = hasActivityToday ? today : shiftDate(today, -1);

	if (!activeDates.has(dateCursor)) {
		return {
			streakDays: 0,
			hasActivityToday,
		};
	}

	let streakDays = 0;

	while (activeDates.has(dateCursor)) {
		streakDays += 1;
		dateCursor = shiftDate(dateCursor, -1);
	}

	return {
		streakDays,
		hasActivityToday,
	};
}
