"use client";

import { Info } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const STORAGE_KEY = "onboarding-hint-dismissed";

export default function OnboardingHint() {
	const [dismissed, setDismissed] = useState(true);

	useEffect(() => {
		if (typeof window === "undefined") return;
		const stored = localStorage.getItem(STORAGE_KEY);
		setDismissed(stored === "true");
	}, []);

	const handleDismiss = () => {
		setDismissed(true);
		localStorage.setItem(STORAGE_KEY, "true");
	};

	if (dismissed) return null;

	return (
		<Card
			className="border-dashed border-muted-foreground/30 bg-muted/30"
			role="status"
			aria-live="polite"
		>
			<CardHeader className="flex flex-row items-start justify-between gap-3">
				<div className="flex items-center gap-2">
					<span className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm" aria-hidden="true">
						<Info className="h-5 w-5 text-primary" />
					</span>
					<div>
						<CardTitle className="text-base">Starte schnell</CardTitle>
						<CardDescription className="text-sm">
							Füge deine erste Aufgabe hinzu oder starte eine Fokus-Session, um loszulegen.
						</CardDescription>
					</div>
				</div>
				<Button variant="ghost" size="sm" onClick={handleDismiss} aria-label="Hinweis schließen">
					Überspringen
				</Button>
			</CardHeader>
			<CardContent className="flex flex-wrap gap-2">
				<Button asChild size="sm" variant="secondary">
					<a href="#quick-actions">Aufgabe hinzufügen</a>
				</Button>
				<Button asChild size="sm" variant="outline">
					<a href="/pomodoro">Fokus starten</a>
				</Button>
			</CardContent>
		</Card>
	);
}
