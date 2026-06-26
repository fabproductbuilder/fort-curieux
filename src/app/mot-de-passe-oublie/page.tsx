import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function MotDePasseOubliePage() {
	return (
		<AuthShell title="Mot de passe oublié" subtitle="Recevez un lien pour choisir un nouveau mot de passe.">
			<ForgotPasswordForm />
		</AuthShell>
	);
}
