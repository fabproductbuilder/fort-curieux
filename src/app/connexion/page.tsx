import { AuthShell } from "@/components/auth/auth-shell";
import { SignInForm } from "@/components/auth/sign-in-form";

type ConnexionPageProps = {
	searchParams: Promise<{
		message?: string;
	}>;
};

function getNotice(message?: string): string | undefined {
	if (message === "connexion_requise") {
		return "Connectez-vous pour accéder à votre espace.";
	}

	if (message === "confirmation_invalide") {
		return "Le lien de confirmation est invalide ou expiré. Vous pouvez vous connecter ou demander un nouveau lien.";
	}

	return undefined;
}

export default async function ConnexionPage({ searchParams }: ConnexionPageProps) {
	const params = await searchParams;

	return (
		<AuthShell title="Connexion" subtitle="Accédez à votre espace Fort Curieux.">
			<SignInForm notice={getNotice(params.message)} />
		</AuthShell>
	);
}
