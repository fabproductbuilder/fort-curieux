const frenchDateFormatter = new Intl.DateTimeFormat("fr-FR", {
	day: "numeric",
	month: "long",
	year: "numeric",
});

function atLocalMidnight(date: Date): Date {
	const nextDate = new Date(date);
	nextDate.setHours(0, 0, 0, 0);

	return nextDate;
}

export function getCurrentWeekMonday(date = new Date()): Date {
	const monday = atLocalMidnight(date);
	const dayOfWeek = monday.getDay();
	const offsetToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

	monday.setDate(monday.getDate() + offsetToMonday);

	return monday;
}

export function getWeekDays(monday = getCurrentWeekMonday()): Date[] {
	const weekStart = atLocalMidnight(monday);

	return Array.from({ length: 7 }, (_, index) => {
		const date = new Date(weekStart);
		date.setDate(weekStart.getDate() + index);

		return date;
	});
}

export function getDateForIsoWeekDay(dayOfWeek: number, monday = getCurrentWeekMonday()): Date {
	if (!Number.isInteger(dayOfWeek) || dayOfWeek < 1 || dayOfWeek > 7) {
		throw new RangeError("dayOfWeek must be an ISO day between 1 and 7.");
	}

	const date = atLocalMidnight(monday);
	date.setDate(date.getDate() + dayOfWeek - 1);

	return date;
}

export function formatDateForDatabase(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");

	return `${year}-${month}-${day}`;
}

export function formatFrenchDate(date: Date): string {
	return frenchDateFormatter.format(date);
}
