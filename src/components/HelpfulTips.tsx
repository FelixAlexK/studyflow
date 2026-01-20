"use client";

import { Brain, Clock, Compass, Sparkles, Target } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Tip {
	title: string;
	description: string;
	icon: React.ReactNode;
	actionLabel?: string;
	actionHref?: string;
}

const tips: Tip[] = [
	{
		title: "Probiere den Fokus-Timer",
		description: "Starte eine 25-Minuten-Session und halte dich mit kleinen Pausen frisch.",
		icon: <Clock className="h-5 w-5 text-blue-600" />,
		actionLabel: "Zum Timer",
		actionHref: "/pomodoro",
	},
	{
		title: "Schnell erstellen",
		description: "Nutze die Quick Actions, um Aufgaben oder Events mit einem Klick hinzuzufügen.",
		icon: <Sparkles className="h-5 w-5 text-amber-600" />,
		actionLabel: "Quick Actions",
		actionHref: "#quick-actions",
	},
	{
		title: "Heute im Blick",
		description: "Checke den Bereich \"Was ist heute wichtig?\" für deine Termine, Aufgaben und Prüfungen.",
		icon: <Compass className="h-5 w-5 text-indigo-600" />,
		actionLabel: "Zu Heute",
		actionHref: "#today-important",
	},
	{
		title: "Lernfortschritt tracken",
		description: "Sieh dir die Progress Insights an, um deine erledigten Aufgaben pro Woche zu vergleichen.",
		icon: <Target className="h-5 w-5 text-green-600" />,
		actionLabel: "Insights öffnen",
		actionHref: "#progress-insights",
	},
	{
		title: "Kleine Schritte zählen",
		description: "Erledige erst die kleinste Aufgabe. Momentum hilft dir, mehr zu schaffen.",
		icon: <Brain className="h-5 w-5 text-purple-600" />,
	},
];

export default function HelpfulTips() {
	const [seed, setSeed] = useState(() => Math.random());
	const tip = useMemo(() => {
		const index = Math.floor(seed * tips.length) % tips.length;
		return tips[index];
	}, [seed]);

	return (
		<Card className="col-span-full border-dashed border-muted-foreground/30 bg-muted/30">
			<CardHeader className="flex flex-row items-start justify-between gap-2">
				<div className="flex items-center gap-2">
					<div className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm">
						{tip.icon}
					</div>
					<CardTitle className="text-base">Tipps für dich</CardTitle>
				</div>
				<Button
					variant="ghost"
					size="sm"
					className="text-xs"
					onClick={() => setSeed(Math.random())}
				>
					Neuer Tipp
				</Button>
			</CardHeader>
			<CardContent className="space-y-3">
				<p className="text-sm text-muted-foreground">{tip.description}</p>
				<div className="flex items-center gap-2 text-xs text-muted-foreground">
					<span role="img" aria-label="lightbulb">
						💡
					</span>
					<span>Tipps wechseln dezent, damit nichts stört.</span>
				</div>
				{tip.actionHref ? (
					<Button asChild size="sm" variant="secondary">
						<a href={tip.actionHref}>{tip.actionLabel ?? "Los geht's"}</a>
					</Button>
				) : null}
			</CardContent>
		</Card>
	);
}
