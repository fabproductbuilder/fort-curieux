import Link from "next/link";
import { redirect } from "next/navigation";
import { BrandMark } from "@/components/brand/brand-mark";
import { SportTemplateManager } from "@/components/sport/sport-template-manager";
import { createClient } from "@/lib/supabase/server";
import type { MeasurementType, SportTemplate } from "@/types/sport";

type SportTemplateRow = Omit<SportTemplate, "measurement_type" | "target_value" | "target_sets" | "target_reps"> & {
	measurement_type: MeasurementType;
	target_value: number | string | null;
	target_sets: number | null;
	target_reps: number | null;
};

function normalizeTemplate(row: SportTemplateRow): SportTemplate {
	return {
		...row,
		target_value: row.target_value === null ? null : Number(row.target_value),
		target_sets: row.target_sets,
		target_reps: row.target_reps,
	};
}

export default async function SemaineTypePage() {
	const supabase = await createClient();
	const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();

	if (claimsError || !claimsData?.claims.sub) {
		redirect("/connexion");
	}

	const { data, error } = await supabase
		.from("sport_templates")
		.select("id,user_id,name,day_of_week,measurement_type,target_value,target_sets,target_reps,is_active,created_at,updated_at")
		.eq("user_id", claimsData.claims.sub)
		.eq("is_active", true)
		.order("day_of_week", { ascending: true })
		.order("created_at", { ascending: true });

	const templates = error ? [] : ((data ?? []) as SportTemplateRow[]).map(normalizeTemplate);

	return (
		<main className="min-h-screen bg-night px-4 py-6 text-ivory sm:px-10 sm:py-8 lg:px-16">
			<section className="mx-auto flex w-full max-w-7xl flex-col gap-8 sm:gap-10">
				<header className="flex flex-col gap-4 border-b border-ivory/15 pb-5 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<BrandMark href="/app" />
						<p className="mt-2 text-sm text-ivory/58">
							<Link href="/app/sport" className="inline-flex min-h-8 items-center underline-offset-4 hover:underline">
								Sport
							</Link>{" "}
							· Semaine type
						</p>
					</div>
					<Link href="/app" className="inline-flex h-11 w-full items-center justify-center rounded-md border border-ivory/25 px-4 text-sm font-semibold text-ivory transition hover:border-accent hover:text-accent sm:w-auto">
						Mon espace
					</Link>
				</header>

				<div className="max-w-3xl">
					<h1 className="text-3xl font-semibold sm:text-5xl">Semaine type</h1>
					<p className="mt-4 text-base leading-7 text-ivory/72 sm:mt-5 sm:text-lg sm:leading-8">Organisez vos activités sportives personnelles par jour.</p>
				</div>

				<SportTemplateManager templates={templates} loadError={error ? "Impossible de charger votre semaine type pour le moment." : undefined} />
			</section>
		</main>
	);
}
