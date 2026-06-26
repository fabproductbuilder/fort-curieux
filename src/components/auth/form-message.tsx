import type { AuthFormState } from "@/lib/auth/state";

type FormMessageProps = {
	state: AuthFormState;
};

export function FormMessage({ state }: FormMessageProps) {
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
