import { useState } from "react";
import { toast } from "sonner";

type SuccessType = "task" | "exam" | "event" | "submission";

const STORAGE_KEY = "studyflow_first_success";

interface FirstSuccessState {
	task?: boolean;
	exam?: boolean;
	event?: boolean;
	submission?: boolean;
}

const successMessages: Record<
	SuccessType,
	{ title: string; description: string }
> = {
	task: {
		title: "Nice, du bist organisiert! 💪",
		description: "Deine erste Aufgabe ist erfasst. Weiter so!",
	},
	exam: {
		title: "Perfekt vorbereitet! 🎯",
		description: "Deine erste Prüfung ist eingetragen. Du hast den Überblick!",
	},
	event: {
		title: "Super strukturiert! 📅",
		description: "Dein erster Termin steht. So behältst du alles im Blick!",
	},
	submission: {
		title: "Top organisiert! 📝",
		description:
			"Deine erste Abgabe ist erfasst. Keine Deadline mehr verpassen!",
	},
};

function getFirstSuccessState(): FirstSuccessState {
	if (typeof window === "undefined") return {};

	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		return stored ? JSON.parse(stored) : {};
	} catch {
		return {};
	}
}

function saveFirstSuccessState(state: FirstSuccessState) {
	if (typeof window === "undefined") return;

	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
	} catch {
		// Ignore errors
	}
}

export function useFirstSuccess() {
	const [state, setState] = useState<FirstSuccessState>(getFirstSuccessState);

	const celebrateFirstSuccess = (type: SuccessType) => {
		const currentState = getFirstSuccessState();

		// Check if this is truly the first time
		if (currentState[type]) {
			return; // Already celebrated this type
		}

		// Mark as completed
		const newState = { ...currentState, [type]: true };
		saveFirstSuccessState(newState);
		setState(newState);

		// Show celebration toast with confetti emoji
		const message = successMessages[type];

		setTimeout(() => {
			toast.success(message.title, {
				description: message.description,
				duration: 5000,
				className: "first-success-toast",
			});
		}, 500); // Small delay for better UX
	};

	const hasSeenSuccess = (type: SuccessType): boolean => {
		return !!state[type];
	};

	const resetAllSuccess = () => {
		if (typeof window !== "undefined") {
			localStorage.removeItem(STORAGE_KEY);
			setState({});
		}
	};

	return {
		celebrateFirstSuccess,
		hasSeenSuccess,
		resetAllSuccess,
	};
}
