import { AuthShell } from "@/components/auth/auth-shell";
import { SignUpForm } from "@/components/auth/sign-up-form";

export default function InscriptionPage() {
	return (
		<AuthShell title="Inscription" subtitle="Créez votre compte avant de construire votre parcours.">
			<SignUpForm />
		</AuthShell>
	);
}
