"use client";

import { Pause, Play, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import QuickCreateModal from "@/components/QuickCreateModal";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

type TimerMode = "focus" | "break";

interface TimerState {
	mode: TimerMode;
	isRunning: boolean;
	totalSeconds: number;
	remainingSeconds: number;
	focusDuration: number;
	breakDuration: number;
}

const STORAGE_KEY = "pomodoro-timer-state";
const DEFAULT_FOCUS = 25;
const DEFAULT_BREAK = 5;
export default function QuickActionButtons() {
	const [showQuickCreate, setShowQuickCreate] = useState(false);
	const [createType, setCreateType] = useState<"task" | "event" | null>(null);
	const [timer, setTimer] = useState<TimerState>(() => {
		if (typeof window !== "undefined") {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored) {
				try {
					return JSON.parse(stored) as TimerState;
				} catch {
					// ignore corrupt data
				}
			}
		}
		return {
			mode: "focus",
			isRunning: false,
			totalSeconds: DEFAULT_FOCUS * 60,
			remainingSeconds: DEFAULT_FOCUS * 60,
			focusDuration: DEFAULT_FOCUS,
			breakDuration: DEFAULT_BREAK,
		};
	});

	// Keep button state in sync with the shared timer
	useEffect(() => {
		const handleStorage = () => {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (!stored) return;
			try {
				setTimer(JSON.parse(stored) as TimerState);
			} catch {
				// ignore
			}
		};

		const handleCustom = (e: Event) => {
			const evt = e as CustomEvent<{ state: TimerState; source: string }>;
			if (evt.detail?.state) {
				setTimer(evt.detail.state);
			}
		};

		handleStorage();
		window.addEventListener("storage", handleStorage);
		window.addEventListener("timer-sync", handleCustom);
		return () => {
			window.removeEventListener("storage", handleStorage);
			window.removeEventListener("timer-sync", handleCustom);
		};
	}, []);

	const handleNewTask = () => {
		setCreateType("task");
		setShowQuickCreate(true);
	};

	const handleNewEvent = () => {
		setCreateType("event");
		setShowQuickCreate(true);
	};

	const updateTimerState = (next: TimerState) => {
		setTimer(next);
		localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
		window.dispatchEvent(
			new CustomEvent("timer-sync", {
				detail: { state: next, source: "quick-action" },
			}),
		);
	};

	const handleToggleTimer = () => {
		// If timer already finished, reset and start fresh
		const needsReset = !timer.isRunning && timer.remainingSeconds <= 0;
		const base = needsReset
			? {
				...timer,
				mode: "focus" as const,
				totalSeconds: timer.focusDuration * 60,
				remainingSeconds: timer.focusDuration * 60,
			}
			: timer;

		const nextState = { ...base, isRunning: !timer.isRunning };
		updateTimerState(nextState);
	};

	return (
		<>
			<Card id="quick-actions" className="col-span-full">
				<CardHeader>
					<CardTitle>Quick Actions</CardTitle>
					<CardDescription>
						Create items or start a focus session
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
						<Button
							onClick={handleNewTask}
							className="flex items-center justify-center gap-2 h-12"
							variant="outline"
						>
							<Plus className="h-5 w-5" />
							<span>New Task</span>
						</Button>
						<Button
							onClick={handleNewEvent}
							className="flex items-center justify-center gap-2 h-12"
							variant="outline"
						>
							<Plus className="h-5 w-5" />
							<span>New Event</span>
						</Button>
						<Button
							onClick={handleToggleTimer}
							aria-pressed={timer.isRunning}
							aria-label={timer.isRunning ? "Fokus pausieren" : "Fokus starten"}
							className={`flex items-center justify-center gap-2 h-12 transition-all ${
								timer.isRunning
									? "bg-amber-600 hover:bg-amber-700"
									: "bg-blue-600 hover:bg-blue-700"
							}`}
						>
							{timer.isRunning ? (
								<Pause className="h-5 w-5" aria-hidden="true" />
							) : (
								<Play className="h-5 w-5" aria-hidden="true" />
							)}
							<span>{timer.isRunning ? "Pause Focus" : "Start Focus"}</span>
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Inline Quick Create Modal */}
			{showQuickCreate && (
				<QuickCreateModal
					initialType={createType}
					onClose={() => {
						setShowQuickCreate(false);
						setCreateType(null);
					}}
				/>
			)}
		</>
	);
}
