type SupabaseConfig = {
	url: string;
	publishableKey: string;
};

function readRequiredEnv(name: string): string {
	const value = process.env[name];

	if (!value) {
		throw new Error(`Variable d'environnement manquante: ${name}`);
	}

	return value;
}

export function getSupabaseConfig(): SupabaseConfig {
	return {
		url: readRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
		publishableKey: readRequiredEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
	};
}

export function getSiteUrl(): string {
	return readRequiredEnv("NEXT_PUBLIC_SITE_URL").replace(/\/$/, "");
}
