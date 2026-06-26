import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseConfig } from "./env";

function copyResponseCookies(source: NextResponse, target: NextResponse) {
	source.cookies.getAll().forEach((cookie) => {
		target.cookies.set(cookie);
	});
}

function redirectToConnexion(request: NextRequest, response: NextResponse) {
	const redirectUrl = request.nextUrl.clone();
	redirectUrl.pathname = "/connexion";
	redirectUrl.searchParams.set("message", "connexion_requise");

	const redirectResponse = NextResponse.redirect(redirectUrl);
	copyResponseCookies(response, redirectResponse);

	return redirectResponse;
}

export async function updateSession(request: NextRequest): Promise<NextResponse> {
	let response = NextResponse.next({
		request,
	});

	const { url, publishableKey } = getSupabaseConfig();

	const supabase = createServerClient(url, publishableKey, {
		cookies: {
			getAll() {
				return request.cookies.getAll();
			},
			setAll(cookiesToSet, headers) {
				cookiesToSet.forEach(({ name, value }) => {
					request.cookies.set(name, value);
				});

				response = NextResponse.next({
					request,
				});

				cookiesToSet.forEach(({ name, value, options }) => {
					response.cookies.set(name, value, options);
				});

				Object.entries(headers).forEach(([key, value]) => {
					response.headers.set(key, value);
				});
			},
		},
	});

	const { data, error } = await supabase.auth.getClaims();

	const hasIdentity = !error && Boolean(data?.claims.sub);

	if (request.nextUrl.pathname.startsWith("/app") && !hasIdentity) {
		return redirectToConnexion(request, response);
	}

	return response;
}
