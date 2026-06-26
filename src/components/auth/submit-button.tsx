"use client";

import { useFormStatus } from "react-dom";

type SubmitButtonProps = {
	children: React.ReactNode;
	pendingLabel: string;
};

export function SubmitButton({ children, pendingLabel }: SubmitButtonProps) {
	const { pending } = useFormStatus();

	return (
		<button
			type="submit"
			disabled={pending}
			className="mt-2 flex h-12 w-full items-center justify-center rounded-md bg-accent px-4 text-sm font-semibold text-night transition hover:bg-[#dc8440] disabled:cursor-not-allowed disabled:opacity-70"
			aria-disabled={pending}
		>
			{pending ? pendingLabel : children}
		</button>
	);
}
