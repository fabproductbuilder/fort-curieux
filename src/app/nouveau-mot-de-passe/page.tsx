import { AuthShell } from "@/components/auth/auth-shell";
import { NewPasswordForm } from "@/components/auth/new-password-form";

export default function NouveauMotDePassePage() {
	return (
		<AuthShell title="Nouveau mot de passe" subtitle="Choisissez un mot de passe neuf pour votre compte.">
			<NewPasswordForm />
		</AuthShell>
	);
}
