"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "./env";

let browserClient: SupabaseClient | undefined;

export function createClient(): SupabaseClient {
	if (browserClient) {
		return browserClient;
	}

	const { url, publishableKey } = getSupabaseConfig();

	browserClient = createBrowserClient(url, publishableKey);

	return browserClient;
}
