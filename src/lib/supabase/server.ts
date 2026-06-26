import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { getSupabaseConfig } from "./env";

export async function createClient(): Promise<SupabaseClient> {
	const cookieStore = await cookies();
	const { url, publishableKey } = getSupabaseConfig();

	return createServerClient(url, publishableKey, {
		cookies: {
			getAll() {
				return cookieStore.getAll();
			},
			setAll(cookiesToSet) {
				try {
					cookiesToSet.forEach(({ name, value, options }) => {
						cookieStore.set(name, value, options);
					});
				} catch {
					// Server Components cannot write cookies; proxy.ts refreshes sessions.
				}
			},
		},
	});
}
