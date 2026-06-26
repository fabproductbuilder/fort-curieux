import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type EmailOtpType = "signup" | "invite" | "magiclink" | "recovery" | "email_change" | "email" | (string & {});

function safeRedirectPath(next: string | null): string {
	if (!next || !next.startsWith("/") || next.startsWith("//")) {
		return "/app";
	}

	return next;
}

export async function GET(request: Request) {
	const requestUrl = new URL(request.url);
	const tokenHash = requestUrl.searchParams.get("token_hash");
	const type = requestUrl.searchParams.get("type") as EmailOtpType | null;
	const next = safeRedirectPath(requestUrl.searchParams.get("next"));

	if (tokenHash && type) {
		const supabase = await createClient();
		const { error } = await supabase.auth.verifyOtp({
			token_hash: tokenHash,
			type,
		});

		if (!error) {
			return NextResponse.redirect(new URL(next, requestUrl.origin));
		}
	}

	return NextResponse.redirect(new URL("/connexion?message=confirmation_invalide", requestUrl.origin));
}
