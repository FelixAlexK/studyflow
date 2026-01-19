// Error logging utility
export const logError = (
	error: unknown,
	context?: string,
	severity: "info" | "warning" | "error" = "error",
) => {
	const errorMessage = error instanceof Error ? error.message : String(error);
	const errorStack = error instanceof Error ? error.stack : undefined;

	const logData = {
		timestamp: new Date().toISOString(),
		context,
		message: errorMessage,
		stack: errorStack,
		severity,
	};

	// Log to console in development
	if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
		const consoleMethod = severity === "warning" ? "warn" : severity;
		(console[consoleMethod as keyof Console] as any)(
			`[${context}]`,
			errorMessage,
			errorStack,
		);
	}

	// In production, could send to error tracking service
	// e.g., Sentry, LogRocket, etc.
	if (typeof window !== "undefined" && process.env.NODE_ENV === "production") {
		// Example: sendToErrorService(logData)
		console.error("[Error Logged]", logData);
	}
};

// User-friendly error messages in German
export const getUserFriendlyMessage = (error: unknown): string => {
	if (error instanceof Error) {
		const msg = error.message.toLowerCase();

		// Network errors
		if (
			msg.includes("network") ||
			msg.includes("fetch") ||
			msg.includes("connection")
		) {
			return "Netzwerkverbindung unterbrochen. Bitte überprüfe deine Internetverbindung und versuche es erneut.";
		}

		// Authentication errors
		if (
			msg.includes("auth") ||
			msg.includes("unauthorized") ||
			msg.includes("not authenticated")
		) {
			return "Deine Sitzung ist abgelaufen. Bitte melde dich erneut an.";
		}

		// Validation errors - check for common patterns
		if (msg.includes("title cannot be empty") || msg.includes("titel")) {
			return "Titel darf nicht leer sein.";
		}

		if (msg.includes("subject cannot be empty") || msg.includes("fach")) {
			return "Fach darf nicht leer sein.";
		}

		if (msg.includes("invalid date") || msg.includes("invalid datetime")) {
			return "Ungültiges Datum. Bitte gib ein gültiges Datum ein.";
		}

		if (msg.includes("due date") || msg.includes("duedate")) {
			return "Fälligkeitsdatum ist erforderlich.";
		}

		if (msg.includes("not found") || msg.includes("access denied")) {
			return "Eintrag nicht gefunden oder Zugriff verweigert.";
		}

		// If the error message is already in German and user-friendly, use it
		if (
			error.message.includes("erforderlich") ||
			error.message.includes("ungültig")
		) {
			return error.message;
		}

		// Generic fallback
		return "Ein Fehler ist aufgetreten. Bitte versuche es erneut.";
	}

	return "Ein unerwarteter Fehler ist aufgetreten. Bitte lade die Seite neu.";
};
