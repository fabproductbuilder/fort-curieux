"use client";

import { useActionState, useEffect, useState } from "react";
import { archiveSportTemplateAction, createSportTemplateAction, updateSportTemplateAction } from "@/app/app/sport/semaine-type/actions";
import { MEASUREMENT_OPTIONS, WEEK_DAYS } from "@/lib/sport/constants";
import { formatSportTarget } from "@/lib/sport/format";
import { initialSportTemplateFormState } from "@/lib/sport/state";
import type { MeasurementType, SportTemplate, SportTemplateFormState } from "@/types/sport";

type SportTemplateManagerProps = {
	templates: SportTemplate[];
	loadError?: string;
};

type SportTemplateFormProps = {
	submitLabel: string;
	pendingLabel: string;
	template?: SportTemplate;
	onSuccess?: (message: string) => void;
};

function FormMessage({ state }: { state: SportTemplateFormState }) {
	if (!state.message) {
		return null;
	}

	const tone = state.status === "success" ? "border-emerald-700/20 bg-emerald-50 text-emerald-900" : "border-accent/30 bg-[#fff4ed] text-[#7a2e12]";

	return (
		<p role="status" className={`rounded-md border px-4 py-3 text-sm leading-6 ${tone}`}>
			{state.message}
		</p>
	);
}

function TemplateForm({ submitLabel, pendingLabel, template, onSuccess }: SportTemplateFormProps) {
	const action = template ? updateSportTemplateAction : createSportTemplateAction;
	const [state, formAction, isPending] = useActionState(action, initialSportTemplateFormState);
	const [measurementType, setMeasurementType] = useState<MeasurementType>(template?.measurement_type ?? "repetitions");

	useEffect(() => {
		if (state.status === "success" && onSuccess) {
			onSuccess(state.message);
		}
	}, [onSuccess, state.message, state.status]);

	return (
		<form action={formAction} className="space-y-5">
			<FormMessage state={state} />
			{template ? <input type="hidden" name="id" value={template.id} /> : null}

			<label className="block text-sm font-medium text-night" htmlFor={template ? `name-${template.id}` : "name-new"}>
				<span>Nom de l&apos;activité</span>
				<input
					id={template ? `name-${template.id}` : "name-new"}
					name="name"
					type="text"
					required
					maxLength={120}
					defaultValue={template?.name ?? ""}
					className="mt-2 h-12 w-full rounded-md border border-night/18 bg-white px-4 text-base text-night outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25"
				/>
			</label>

			<div className="grid gap-5 sm:grid-cols-2">
				<label className="block text-sm font-medium text-night" htmlFor={template ? `day-${template.id}` : "day-new"}>
					<span>Jour</span>
					<select
						id={template ? `day-${template.id}` : "day-new"}
						name="day_of_week"
						required
						defaultValue={template?.day_of_week ?? 1}
						className="mt-2 h-12 w-full rounded-md border border-night/18 bg-white px-4 text-base text-night outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25"
					>
						{WEEK_DAYS.map((day) => (
							<option key={day.value} value={day.value}>
								{day.label}
							</option>
						))}
					</select>
				</label>

				<label className="block text-sm font-medium text-night" htmlFor={template ? `measurement-${template.id}` : "measurement-new"}>
					<span>Type de mesure</span>
					<select
						id={template ? `measurement-${template.id}` : "measurement-new"}
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
			</div>

			{measurementType === "sets_reps" ? (
				<div className="grid gap-5 sm:grid-cols-2">
					<label className="block text-sm font-medium text-night" htmlFor={template ? `sets-${template.id}` : "sets-new"}>
						<span>Séries</span>
						<input
							id={template ? `sets-${template.id}` : "sets-new"}
							name="target_sets"
							type="number"
							min="1"
							step="1"
							required
							defaultValue={template?.target_sets ?? ""}
							className="mt-2 h-12 w-full rounded-md border border-night/18 bg-white px-4 text-base text-night outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25"
						/>
					</label>
					<label className="block text-sm font-medium text-night" htmlFor={template ? `reps-${template.id}` : "reps-new"}>
						<span>Répétitions</span>
						<input
							id={template ? `reps-${template.id}` : "reps-new"}
							name="target_reps"
							type="number"
							min="1"
							step="1"
							required
							defaultValue={template?.target_reps ?? ""}
							className="mt-2 h-12 w-full rounded-md border border-night/18 bg-white px-4 text-base text-night outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25"
						/>
					</label>
				</div>
			) : null}

			{measurementType === "repetitions" || measurementType === "duration_minutes" || measurementType === "distance_km" ? (
				<label className="block text-sm font-medium text-night" htmlFor={template ? `target-${template.id}` : "target-new"}>
					<span>Objectif</span>
					<input
						id={template ? `target-${template.id}` : "target-new"}
						name="target_value"
						type="number"
						min={measurementType === "distance_km" ? "0.01" : "1"}
						step={measurementType === "distance_km" ? "0.01" : "1"}
						required
						defaultValue={template?.target_value ?? ""}
						className="mt-2 h-12 w-full rounded-md border border-night/18 bg-white px-4 text-base text-night outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25"
					/>
				</label>
			) : null}

			<button
				type="submit"
				disabled={isPending}
				className="flex h-11 w-full items-center justify-center rounded-md bg-accent px-4 text-sm font-semibold text-night transition hover:bg-[#dc8440] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
				aria-disabled={isPending}
			>
				{isPending ? pendingLabel : submitLabel}
			</button>
		</form>
	);
}

function ArchiveTemplateForm({ template }: { template: SportTemplate }) {
	return (
		<form
			action={archiveSportTemplateAction}
			onSubmit={(event) => {
				if (!window.confirm("Supprimer cette activité de votre semaine type ? Elle ne sera plus proposée dans les prochaines semaines. Les semaines déjà générées ne sont pas modifiées.")) {
					event.preventDefault();
				}
			}}
		>
			<input type="hidden" name="id" value={template.id} />
			<button type="submit" className="h-10 rounded-md border border-night/15 px-4 text-sm font-semibold text-night/72 transition hover:border-accent hover:text-accent">
				Supprimer
			</button>
		</form>
	);
}

export function SportTemplateManager({ templates, loadError }: SportTemplateManagerProps) {
	const hasTemplates = templates.length > 0;
	const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
	const [notice, setNotice] = useState("");

	return (
		<div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem]">
			<section className="space-y-4">
				{notice ? (
					<p role="status" className="rounded-md border border-emerald-700/20 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-900">
						{notice}
					</p>
				) : null}

				{loadError ? (
					<p role="alert" className="rounded-md border border-accent/30 bg-[#fff4ed] px-4 py-3 text-sm leading-6 text-[#7a2e12]">
						{loadError}
					</p>
				) : null}

				{!hasTemplates && !loadError ? (
					<div className="rounded-lg border border-ivory/15 bg-ivory/8 p-6 text-ivory">
						<h2 className="text-xl font-semibold">Semaine type vide</h2>
						<p className="mt-3 max-w-xl text-sm leading-6 text-ivory/68">Ajoutez une première activité pour construire votre rythme hebdomadaire.</p>
					</div>
				) : null}

				<div className="space-y-4">
					{WEEK_DAYS.map((day) => {
						const dayTemplates = templates.filter((template) => template.day_of_week === day.value);

						return (
							<section key={day.value} className="rounded-lg border border-ivory/15 bg-ivory p-5 text-night">
								<div className="flex items-baseline justify-between gap-4 border-b border-night/10 pb-4">
									<h2 className="text-xl font-semibold">{day.label}</h2>
									<p className="text-xs font-semibold uppercase tracking-[0.18em] text-night/44">{dayTemplates.length || "Aucune"}</p>
								</div>

								{dayTemplates.length ? (
									<ul className="divide-y divide-night/10">
										{dayTemplates.map((template) => (
											<li key={template.id} className="py-4">
												<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
													<div>
														<p className="font-semibold">{template.name}</p>
														<p className="mt-1 text-sm text-night/62">{formatSportTarget(template)}</p>
													</div>
													<div className="flex flex-wrap gap-3">
														<div>
															<button
																type="button"
																onClick={() => {
																	setNotice("");
																	setEditingTemplateId((currentId) => (currentId === template.id ? null : template.id));
																}}
																className="flex h-10 items-center rounded-md border border-night/15 px-4 text-sm font-semibold text-night/72 transition hover:border-accent hover:text-accent"
																aria-expanded={editingTemplateId === template.id}
															>
																{editingTemplateId === template.id ? "Fermer" : "Modifier"}
															</button>
															{editingTemplateId === template.id ? (
																<div className="mt-4 rounded-md border border-night/10 bg-night/[0.03] p-4 sm:min-w-96">
																	<TemplateForm
																		submitLabel="Enregistrer"
																		pendingLabel="Enregistrement..."
																		template={template}
																		onSuccess={(message) => {
																			setNotice(message);
																			setEditingTemplateId(null);
																		}}
																	/>
																</div>
															) : null}
														</div>
														<ArchiveTemplateForm template={template} />
													</div>
												</div>
											</li>
										))}
									</ul>
								) : (
									<p className="py-5 text-sm text-night/56">Aucune activité prévue.</p>
								)}
							</section>
						);
					})}
				</div>
			</section>

			<aside className="h-fit rounded-lg border border-ivory/15 bg-ivory p-5 text-night lg:sticky lg:top-8">
				<h2 className="text-xl font-semibold">Ajouter une activité</h2>
				<div className="mt-5">
					<TemplateForm submitLabel="Ajouter" pendingLabel="Ajout..." />
				</div>
			</aside>
		</div>
	);
}
