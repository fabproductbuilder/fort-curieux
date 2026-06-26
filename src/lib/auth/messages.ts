type AuthErrorLike = {
	message?: string;
	code?: string;
	status?: number;
};

const AUTH_ERROR_MESSAGES: Record<string, string> = {
	"Invalid login credentials": "Email ou mot de passe incorrect.",
	"Email not confirmed": "Votre adresse email doit être confirmée avant la connexion.",
	"User already registered": "Un compte existe déjà avec cette adresse email.",
	"Unable to validate email address: invalid format": "L'adresse email n'est pas valide.",
	"Password should be at least 6 characters.": "Le mot de passe doit contenir au moins 6 caractères.",
	"Auth session missing!": "Votre session a expiré. Ouvrez à nouveau le lien reçu par email.",
	"New password should be different from the old password.": "Le nouveau mot de passe doit être différent de l'ancien.",
};

export function translateAuthError(error: AuthErrorLike): string {
	if (error.message && AUTH_ERROR_MESSAGES[error.message]) {
		return AUTH_ERROR_MESSAGES[error.message];
	}

	if (error.code === "email_not_confirmed") {
		return "Votre adresse email doit être confirmée avant la connexion.";
	}

	if (error.status === 429) {
		return "Trop de tentatives. Réessayez dans quelques instants.";
	}

	return "Une erreur est survenue. Réessayez dans quelques instants.";
}
