"use client";

import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
	cancelSportOccurrenceAction,
	completeSportOccurrenceAction,
	createSportOccurrenceAction,
	generateCurrentWeekOccurrencesAction,
	resetSportOccurrenceAction,
	skipSportOccurrenceAction,
} from "@/app/app/sport/semaine-actuelle/actions";
import { RestTimer } from "@/components/sport/rest-timer";
import { MEASUREMENT_OPTIONS, PERCEIVED_EFFORT_LABELS, SPORT_OCCURRENCE_STATUS_LABELS } from "@/lib/sport/constants";
import { formatSportResult, formatSportTarget } from "@/lib/sport/format";
import { initialSportActionState } from "@/lib/sport/state";
import type { MeasurementType, PerceivedEffort, SportActionState, SportOccurrence, SportOccurrenceStatus } from "@/types/sport";

export type CurrentWeekDay = {
	dateKey: string;
	dateLabel: string;
	label: string;
	value: number;
};

export type CurrentWeekOccurrence = Pick<
	SportOccurrence,
	| "id"
	| "template_id"
	| "scheduled_date"
	| "name_snapshot"
	| "measurement_type"
	| "target_value"
	| "target_sets"
	| "target_reps"
	| "status"
	| "actual_value"
	| "actual_sets"
	| "actual_reps"
	| "perceived_effort"
	| "created_at"
>;

type CurrentWeekManagerProps = {
	hasTemplates: boolean;
	occurrences: CurrentWeekOccurrence[];
	loadError?: string;
	weekDays: CurrentWeekDay[];
	weekEndLabel: string;
	weekStartLabel: string;
};

type Notice = Pick<SportActionState, "message" | "status">;

function ActionFeedback({ state }: { state: Notice }) {
	if (!state.message) {
		return null;
	}

	const tone =
		state.status === "error"
			? "border-accent/30 bg-[#fff4ed] text-[#7a2e12]"
			: state.status === "info"
				? "border-night/10 bg-night/[0.04] text-night/72"
				: "border-emerald-700/20 bg-emerald-50 text-emerald-900";

	return (
		<p role={state.status === "error" ? "alert" : "status"} className={`rounded-md border px-4 py-3 text-sm leading-6 ${tone}`}>
			{state.message}
		</p>
	);
}

function GenerateWeekForm({
	onMessage,
	variant,
}: {
	onMessage: (state: SportActionState) => void;
	variant: "primary" | "secondary";
}) {
	const router = useRouter();
	const [state, formAction, isPending] = useActionState(generateCurrentWeekOccurrencesAction, initialSportActionState);
	const className =
		variant === "primary"
			? "inline-flex h-11 items-center justify-center rounded-md bg-accent px-4 text-sm font-semibold text-night transition hover:bg-[#dc8440] disabled:cursor-not-allowed disabled:opacity-70"
			: "inline-flex h-11 items-center justify-center rounded-md border border-night/15 px-4 text-sm font-semibold text-night/72 transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-70";

	useEffect(() => {
		if (!state.message) {
			return;
		}

		onMessage(state);

		if (state.status === "success" || state.status === "info") {
			router.refresh();
		}
	}, [onMessage, router, state]);

	return (
		<form action={formAction}>
			<button type="submit" disabled={isPending} className={className} aria-disabled={isPending}>
				{isPending ? "Vérification..." : variant === "primary" ? "Générer ma semaine" : "Compléter depuis ma semaine type"}
			</button>
		</form>
	);
}

function CreateOccurrenceForm({ onMessage, weekDays }: { onMessage: (state: SportActionState) => void; weekDays: CurrentWeekDay[] }) {
	const router = useRouter();
	const formRef = useRef<HTMLFormElement>(null);
	const [state, formAction, isPending] = useActionState(createSportOccurrenceAction, initialSportActionState);
	const [measurementType, setMeasurementType] = useState<MeasurementType>("repetitions");

	useEffect(() => {
		if (!state.message) {
			return;
		}

		onMessage(state);

		if (state.status === "success") {
			formRef.current?.reset();
			router.refresh();
		}
	}, [onMessage, router, state]);

	return (
		<aside className="h-fit rounded-lg border border-ivory/15 bg-ivory p-5 text-night">
			<h2 className="text-xl font-semibold">Ajouter une activité ponctuelle</h2>
			<p className="mt-3 text-sm leading-6 text-night/62">Cette activité sera ajoutée seulement à cette semaine. Elle ne modifiera pas votre semaine type.</p>
			<form ref={formRef} action={formAction} className="mt-5 space-y-5">
				<label className="block text-sm font-medium text-night" htmlFor="occurrence-name-new">
					<span>Nom de l&apos;activité</span>
					<input
						id="occurrence-name-new"
						name="name"
						type="text"
						required
						maxLength={120}
						className="mt-2 h-12 w-full rounded-md border border-night/18 bg-white px-4 text-base text-night outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25"
					/>
				</label>

				<label className="block text-sm font-medium text-night" htmlFor="occurrence-day-new">
					<span>Jour</span>
					<select
						id="occurrence-day-new"
						name="day_of_week"
						required
						className="mt-2 h-12 w-full rounded-md border border-night/18 bg-white px-4 text-base text-night outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25"
					>
						{weekDays.map((day) => (
							<option key={day.dateKey} value={day.value}>
								{day.label} · {day.dateLabel}
							</option>
						))}
					</select>
				</label>

				<label className="block text-sm font-medium text-night" htmlFor="occurrence-measurement-new">
					<span>Type de mesure</span>
					<select
						id="occurrence-measurement-new"
						name="measurement_type"
						required
						value={measurementType}
						onChange={(event) => setMeasurementType(event.target.value as MeasurementType)}
						className="mt-2 h-12 w-full rounded-md border border-night/18 bg-white px-4 text-base text-night outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25"
					>
						{MEASUREMENT_OPTIONS.map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>
				</label>

				{measurementType === "sets_reps" ? (
					<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
						<label className="block text-sm font-medium text-night" htmlFor="occurrence-sets-new">
							<span>Séries</span>
							<input
								id="occurrence-sets-new"
								name="target_sets"
								type="number"
								min="1"
								step="1"
								required
								className="mt-2 h-12 w-full rounded-md border border-night/18 bg-white px-4 text-base text-night outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25"
							/>
						</label>
						<label className="block text-sm font-medium text-night" htmlFor="occurrence-reps-new">
							<span>Répétitions</span>
							<input
								id="occurrence-reps-new"
								name="target_reps"
								type="number"
								min="1"
								step="1"
								required
								className="mt-2 h-12 w-full rounded-md border border-night/18 bg-white px-4 text-base text-night outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25"
							/>
						</label>
					</div>
				) : null}

				{measurementType === "repetitions" || measurementType === "duration_minutes" || measurementType === "distance_km" ? (
					<label className="block text-sm font-medium text-night" htmlFor="occurrence-target-new">
						<span>Objectif</span>
						<input
							id="occurrence-target-new"
							name="target_value"
							type="number"
							min={measurementType === "distance_km" ? "0.01" : "1"}
							step={measurementType === "distance_km" ? "0.01" : "1"}
							required
							className="mt-2 h-12 w-full rounded-md border border-night/18 bg-white px-4 text-base text-night outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25"
						/>
					</label>
				) : null}

				{measurementType === "completion" ? <p className="text-sm leading-6 text-night/62">Aucun objectif chiffré : vous confirmerez simplement que l&apos;activité a été effectuée.</p> : null}

				<ActionFeedback state={state} />
				<button
					type="submit"
					disabled={isPending}
					className="flex h-11 w-full items-center justify-center rounded-md bg-accent px-4 text-sm font-semibold text-night transition hover:bg-[#dc8440] disabled:cursor-not-allowed disabled:opacity-70"
					aria-disabled={isPending}
				>
					{isPending ? "Ajout..." : "Ajouter à cette semaine"}
				</button>
			</form>
		</aside>
	);
}

function EffortSelect({ defaultValue = "", id }: { defaultValue?: PerceivedEffort | ""; id: string }) {
	return (
		<label className="block text-sm font-medium text-night" htmlFor={id}>
			<span>Ressenti</span>
			<select
				id={id}
				name="perceived_effort"
				defaultValue={defaultValue}
				className="mt-2 h-11 w-full rounded-md border border-night/18 bg-white px-3 text-sm text-night outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25"
			>
				<option value="">Non renseigné</option>
				{Object.entries(PERCEIVED_EFFORT_LABELS).map(([value, label]) => (
					<option key={value} value={value}>
						{label}
					</option>
				))}
			</select>
		</label>
	);
}

function RepetitionResultInput({
	defaultValue,
	id,
}: {
	defaultValue: number | null;
	id: string;
}) {
	const [value, setValue] = useState(defaultValue === null ? "" : String(defaultValue));

	function adjust(delta: number) {
		setValue((current) => {
			const parsed = Number.parseInt(current, 10);
			const baseValue = Number.isFinite(parsed) ? parsed : 1;

			return String(Math.max(1, baseValue + delta));
		});
	}

	return (
		<div className="space-y-3">
			<label className="block text-sm font-medium text-night" htmlFor={id}>
				<span>Réalisé</span>
				<input
					id={id}
					name="actual_value"
					type="number"
					min="1"
					step="1"
					required
					value={value}
					onChange={(event) => setValue(event.target.value)}
					className="mt-2 h-11 w-full rounded-md border border-night/18 bg-white px-3 text-sm text-night outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25"
				/>
			</label>
			<div>
				<p className="text-xs font-semibold uppercase tracking-[0.16em] text-night/44">Compteur rapide</p>
				<div className="mt-2 flex gap-2">
					<button
						type="button"
						onClick={() => adjust(-1)}
						className="flex h-10 w-10 items-center justify-center rounded-md border border-night/15 text-lg font-semibold text-night/72 transition hover:border-accent hover:text-accent"
					>
						-
					</button>
					<button
						type="button"
						onClick={() => adjust(1)}
						className="flex h-10 w-10 items-center justify-center rounded-md border border-night/15 text-lg font-semibold text-night/72 transition hover:border-accent hover:text-accent"
					>
						+
					</button>
				</div>
			</div>
		</div>
	);
}

function CompleteOccurrenceForm({
	occurrence,
	onClose,
	onMessage,
}: {
	occurrence: CurrentWeekOccurrence;
	onClose: () => void;
	onMessage: (state: SportActionState) => void;
}) {
	const router = useRouter();
	const [state, formAction, isPending] = useActionState(completeSportOccurrenceAction, initialSportActionState);

	useEffect(() => {
		if (!state.message) {
			return;
		}

		onMessage(state);

		if (state.status === "success") {
			onClose();
			router.refresh();
		}
	}, [onClose, onMessage, router, state]);

	return (
		<form action={formAction} className="mt-4 space-y-4 rounded-md border border-night/10 bg-night/[0.03] p-4">
			<input type="hidden" name="id" value={occurrence.id} />
			<div>
				<p className="text-sm font-semibold text-night">Objectif prévu</p>
				<p className="mt-1 text-sm text-night/62">{formatSportTarget(occurrence)}</p>
			</div>

			{occurrence.measurement_type === "repetitions" ? (
				<RepetitionResultInput defaultValue={occurrence.actual_value ?? occurrence.target_value} id={`actual-value-${occurrence.id}`} />
			) : null}

			{occurrence.measurement_type === "duration_minutes" || occurrence.measurement_type === "distance_km" ? (
				<label className="block text-sm font-medium text-night" htmlFor={`actual-value-${occurrence.id}`}>
					<span>Réalisé</span>
					<input
						id={`actual-value-${occurrence.id}`}
						name="actual_value"
						type="number"
						min={occurrence.measurement_type === "distance_km" ? "0.01" : "1"}
						step={occurrence.measurement_type === "distance_km" ? "0.01" : "1"}
						required
						defaultValue={occurrence.actual_value ?? occurrence.target_value ?? ""}
						className="mt-2 h-11 w-full rounded-md border border-night/18 bg-white px-3 text-sm text-night outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25"
					/>
				</label>
			) : null}

			{occurrence.measurement_type === "sets_reps" ? (
				<div className="grid gap-4 sm:grid-cols-2">
					<label className="block text-sm font-medium text-night" htmlFor={`actual-sets-${occurrence.id}`}>
						<span>Séries réalisées</span>
						<input
							id={`actual-sets-${occurrence.id}`}
							name="actual_sets"
							type="number"
							min="1"
							step="1"
							required
							defaultValue={occurrence.actual_sets ?? occurrence.target_sets ?? ""}
							className="mt-2 h-11 w-full rounded-md border border-night/18 bg-white px-3 text-sm text-night outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25"
						/>
					</label>
					<label className="block text-sm font-medium text-night" htmlFor={`actual-reps-${occurrence.id}`}>
						<span>Répétitions réalisées</span>
						<input
							id={`actual-reps-${occurrence.id}`}
							name="actual_reps"
							type="number"
							min="1"
							step="1"
							required
							defaultValue={occurrence.actual_reps ?? occurrence.target_reps ?? ""}
							className="mt-2 h-11 w-full rounded-md border border-night/18 bg-white px-3 text-sm text-night outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25"
						/>
					</label>
				</div>
			) : null}

			{occurrence.measurement_type === "completion" ? <p className="text-sm leading-6 text-night/64">Confirmez simplement que l&apos;activité libre a été effectuée.</p> : null}

			<EffortSelect defaultValue={occurrence.perceived_effort ?? ""} id={`perceived-effort-${occurrence.id}`} />
			<ActionFeedback state={state} />

			<div className="flex flex-wrap gap-3">
				<button
					type="submit"
					disabled={isPending}
					className="h-10 rounded-md bg-accent px-4 text-sm font-semibold text-night transition hover:bg-[#dc8440] disabled:cursor-not-allowed disabled:opacity-70"
					aria-disabled={isPending}
				>
					{isPending ? "Enregistrement..." : occurrence.status === "completed" ? "Enregistrer" : "Confirmer"}
				</button>
				<button type="button" onClick={onClose} className="h-10 rounded-md border border-night/15 px-4 text-sm font-semibold text-night/72 transition hover:border-accent hover:text-accent">
					Fermer
				</button>
			</div>
		</form>
	);
}

function StatusActionForm({
	action,
	confirmationText,
	id,
	label,
	onMessage,
}: {
	action: (state: SportActionState, formData: FormData) => Promise<SportActionState>;
	confirmationText: string;
	id: string;
	label: string;
	onMessage: (state: SportActionState) => void;
}) {
	const router = useRouter();
	const [isConfirming, setIsConfirming] = useState(false);
	const [state, formAction, isPending] = useActionState(action, initialSportActionState);

	useEffect(() => {
		if (!state.message) {
			return;
		}

		onMessage(state);

		if (state.status === "success") {
			router.refresh();
		}
	}, [onMessage, router, state]);

	if (!isConfirming) {
		return (
			<button
				type="button"
				onClick={() => setIsConfirming(true)}
				className="h-10 rounded-md border border-night/15 px-4 text-sm font-semibold text-night/72 transition hover:border-accent hover:text-accent"
			>
				{label}
			</button>
		);
	}

	return (
		<form action={formAction} className="flex flex-col gap-2 rounded-md border border-night/10 bg-night/[0.03] p-3">
			<input type="hidden" name="id" value={id} />
			<p className="text-xs leading-5 text-night/60">{confirmationText}</p>
			<div className="flex flex-wrap gap-2">
				<button
					type="submit"
					disabled={isPending}
					className="h-9 rounded-md bg-accent px-3 text-xs font-semibold text-night transition hover:bg-[#dc8440] disabled:cursor-not-allowed disabled:opacity-70"
					aria-disabled={isPending}
				>
					{isPending ? "Envoi..." : "Confirmer"}
				</button>
				<button type="button" onClick={() => setIsConfirming(false)} className="h-9 rounded-md border border-night/15 px-3 text-xs font-semibold text-night/72 transition hover:border-accent hover:text-accent">
					Fermer
				</button>
			</div>
		</form>
	);
}

function OccurrenceItem({
	occurrence,
	onMessage,
}: {
	occurrence: CurrentWeekOccurrence;
	onMessage: (state: SportActionState) => void;
}) {
	const [isCompleting, setIsCompleting] = useState(false);
	const result = occurrence.status === "completed" ? formatSportResult(occurrence) : null;
	const plannedTarget = occurrence.measurement_type === "completion" ? "activité libre" : formatSportTarget(occurrence);

	return (
		<li className="py-4">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<p className="font-semibold">{occurrence.name_snapshot}</p>
					<div className="mt-2 space-y-1 text-sm leading-6 text-night/64">
						<p>Prévu : {plannedTarget}</p>
						{result ? <p>Réalisé : {result}</p> : null}
						{occurrence.status === "completed" && occurrence.perceived_effort ? <p>Ressenti : {PERCEIVED_EFFORT_LABELS[occurrence.perceived_effort as PerceivedEffort]}</p> : null}
						<p>Statut : {SPORT_OCCURRENCE_STATUS_LABELS[occurrence.status]}</p>
					</div>
				</div>

				{occurrence.status === "planned" ? (
					<div className="flex flex-wrap gap-3">
						<button
							type="button"
							onClick={() => setIsCompleting((current) => !current)}
							className="h-10 rounded-md bg-accent px-4 text-sm font-semibold text-night transition hover:bg-[#dc8440]"
							aria-expanded={isCompleting}
						>
							Terminer
						</button>
						<StatusActionForm action={skipSportOccurrenceAction} confirmationText="Confirmer que cette activité était prévue mais n'a pas été faite ?" id={occurrence.id} label="Non réalisée" onMessage={onMessage} />
						<StatusActionForm action={cancelSportOccurrenceAction} confirmationText="Confirmer que cette activité ne devait finalement plus être faite ?" id={occurrence.id} label="Annuler" onMessage={onMessage} />
					</div>
				) : null}
				{occurrence.status === "completed" ? (
					<button
						type="button"
						onClick={() => setIsCompleting((current) => !current)}
						className="h-10 rounded-md border border-night/15 px-4 text-sm font-semibold text-night/72 transition hover:border-accent hover:text-accent"
						aria-expanded={isCompleting}
					>
						Corriger
					</button>
				) : null}
				{occurrence.status === "skipped" || occurrence.status === "cancelled" ? (
					<div className="flex flex-col gap-2 sm:items-end">
						<p className="text-xs leading-5 text-night/50">
							{occurrence.status === "skipped" ? "Non réalisée : prévue mais pas faite." : "Annulée : retirée de la semaine."}
						</p>
						<StatusActionForm action={resetSportOccurrenceAction} confirmationText="Remettre cette activité parmi les activités prévues ?" id={occurrence.id} label="Remettre en prévue" onMessage={onMessage} />
					</div>
				) : null}
			</div>

			{isCompleting && (occurrence.status === "planned" || occurrence.status === "completed") ? <CompleteOccurrenceForm occurrence={occurrence} onClose={() => setIsCompleting(false)} onMessage={onMessage} /> : null}
		</li>
	);
}

export function CurrentWeekManager({
	hasTemplates,
	loadError,
	occurrences,
	weekDays,
	weekEndLabel,
	weekStartLabel,
}: CurrentWeekManagerProps) {
	const [notice, setNotice] = useState<Notice | null>(null);
	const previousStatusesRef = useRef<Map<string, SportOccurrenceStatus> | null>(null);
	const hasOccurrences = occurrences.length > 0;
	const occurrencesByDate = new Map<string, CurrentWeekOccurrence[]>();

	occurrences.forEach((occurrence) => {
		const dayOccurrences = occurrencesByDate.get(occurrence.scheduled_date) ?? [];
		dayOccurrences.push(occurrence);
		occurrencesByDate.set(occurrence.scheduled_date, dayOccurrences);
	});

	const handleMessage = useCallback((state: SportActionState) => {
		if (state.message) {
			setNotice({ message: state.message, status: state.status });
		}
	}, []);

	useEffect(() => {
		const previousStatuses = previousStatusesRef.current;
		const nextStatuses = new Map(occurrences.map((occurrence) => [occurrence.id, occurrence.status]));

		if (previousStatuses) {
			const changedOccurrence = occurrences.find((occurrence) => {
				const previousStatus = previousStatuses.get(occurrence.id);

				return previousStatus && previousStatus !== occurrence.status;
			});

			if (changedOccurrence?.status === "completed") {
				setNotice({ message: "Activité terminée.", status: "success" });
			}

			if (changedOccurrence?.status === "skipped") {
				setNotice({ message: "Activité marquée comme non réalisée.", status: "success" });
			}

			if (changedOccurrence?.status === "cancelled") {
				setNotice({ message: "Activité annulée.", status: "success" });
			}

			if (changedOccurrence?.status === "planned") {
				setNotice({ message: "Activité remise en prévue.", status: "success" });
			}
		}

		previousStatusesRef.current = nextStatuses;
	}, [occurrences]);

	return (
		<div className="space-y-5">
			{notice ? <ActionFeedback state={notice} /> : null}
			{loadError ? (
				<p role="alert" className="rounded-md border border-accent/30 bg-[#fff4ed] px-4 py-3 text-sm leading-6 text-[#7a2e12]">
					{loadError}
				</p>
			) : null}

			<div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
				<div className="order-2 space-y-5 lg:order-1">
					{!hasTemplates && !hasOccurrences ? (
						<div className="rounded-lg border border-ivory/15 bg-ivory p-6 text-night">
							<h2 className="text-2xl font-semibold">Créez d&apos;abord votre semaine type.</h2>
							<p className="mt-3 max-w-2xl text-sm leading-6 text-night/64">
								La semaine actuelle se construit à partir de vos activités habituelles.
							</p>
							<a href="/app/sport/semaine-type" className="mt-5 inline-flex h-11 items-center justify-center rounded-md bg-accent px-4 text-sm font-semibold text-night transition hover:bg-[#dc8440]">
								Aller à la semaine type
							</a>
						</div>
					) : null}

					{hasTemplates && !hasOccurrences ? (
						<div className="rounded-lg border border-ivory/15 bg-ivory p-6 text-night">
							<h2 className="text-2xl font-semibold">Aucune activité générée cette semaine.</h2>
							<p className="mt-3 max-w-2xl text-sm leading-6 text-night/64">
								Générez votre semaine actuelle depuis votre semaine type. Les résultats que vous indiquerez ensuite resteront propres à cette semaine.
							</p>
							<div className="mt-5">
								<GenerateWeekForm onMessage={handleMessage} variant="primary" />
							</div>
						</div>
					) : null}

					{hasOccurrences ? (
						<>
							<div className="flex flex-col gap-4 rounded-lg border border-ivory/15 bg-ivory p-5 text-night sm:flex-row sm:items-center sm:justify-between">
								<div>
									<p className="text-lg font-semibold">Activités de la semaine</p>
									<p className="mt-1 text-sm leading-6 text-night/64">
										Du {weekStartLabel} au {weekEndLabel}.
									</p>
								</div>
								<GenerateWeekForm onMessage={handleMessage} variant="secondary" />
							</div>

							<div className="grid gap-4">
								{weekDays.map((day) => {
									const dayOccurrences = occurrencesByDate.get(day.dateKey) ?? [];

									return (
										<section key={day.dateKey} className="rounded-lg border border-ivory/15 bg-ivory p-5 text-night">
											<div className="flex flex-col gap-1 border-b border-night/10 pb-4 sm:flex-row sm:items-baseline sm:justify-between">
												<h2 className="text-xl font-semibold">{day.label}</h2>
												<p className="text-sm text-night/56">{day.dateLabel}</p>
											</div>

											{dayOccurrences.length ? (
												<ul className="divide-y divide-night/10">
													{dayOccurrences.map((occurrence) => (
														<OccurrenceItem key={occurrence.id} occurrence={occurrence} onMessage={handleMessage} />
													))}
												</ul>
											) : (
												<p className="py-5 text-sm text-night/56">Aucune activité prévue.</p>
											)}
										</section>
									);
								})}
							</div>
						</>
					) : null}
				</div>

				<div className="order-1 space-y-5 lg:order-2 lg:sticky lg:top-8">
					<RestTimer />
					{hasTemplates || hasOccurrences ? <CreateOccurrenceForm onMessage={handleMessage} weekDays={weekDays} /> : null}
				</div>
			</div>
		</div>
	);
}
