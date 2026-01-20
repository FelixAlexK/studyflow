"use client";

import { useConvexMutation } from "@convex-dev/react-query";
import { Link } from "@tanstack/react-router";
import { Clock, Pause, Play, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "../../convex/_generated/api";

type TimerMode = "focus" | "break";

interface TimerState {
	mode: TimerMode;
	isRunning: boolean;
	totalSeconds: number;
	remainingSeconds: number;
	focusDuration: number;
	breakDuration: number;
}

const DEFAULT_DURATION = 25; // 25 minutes default
const DEFAULT_BREAK = 5;
const STORAGE_KEY = "pomodoro-timer-state"; // Shared with PomodoroTimer

export default function QuickFocusTimer() {
	const logFocusSession = useConvexMutation(api.stats.logFocusSession);

	const [timer, setTimer] = useState<TimerState>(() => {
		// Try to load from localStorage synchronously
		if (typeof window !== "undefined") {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored) {
				try {
					const parsed = JSON.parse(stored) as TimerState;
					return parsed;
				} catch {
					// Fall through to defaults
				}
			}
		}
		return {
			mode: "focus",
			isRunning: false,
			totalSeconds: DEFAULT_DURATION * 60,
			remainingSeconds: DEFAULT_DURATION * 60,
			focusDuration: DEFAULT_DURATION,
			breakDuration: DEFAULT_BREAK,
		};
	});

	// Listen for storage changes from other tabs and poll localStorage
	useEffect(() => {
		let lastStoredValue = localStorage.getItem(STORAGE_KEY);

		const handleStorageChange = (e: StorageEvent) => {
			if (e.key === STORAGE_KEY && e.newValue) {
				try {
					const parsed = JSON.parse(e.newValue) as TimerState;
					setTimer(parsed);
					lastStoredValue = e.newValue;
				} catch {
					// Ignore corrupted data
				}
			}
		};

		const handleCustomSync = (e: Event) => {
			const customEvent = e as CustomEvent<{ state: TimerState; source: string }>;
			if (customEvent.detail && customEvent.detail.source !== "quick") {
				setTimer(customEvent.detail.state);
			}
		};

		// Poll localStorage every 500ms for changes from other pages
		const pollInterval = setInterval(() => {
			const currentValue = localStorage.getItem(STORAGE_KEY);
			if (currentValue && currentValue !== lastStoredValue) {
				try {
					const parsed = JSON.parse(currentValue) as TimerState;
					setTimer(parsed);
					lastStoredValue = currentValue;
				} catch {
					// Ignore corrupted data
				}
			}
		}, 500);

		window.addEventListener("storage", handleStorageChange);
		window.addEventListener("timer-sync", handleCustomSync);
		return () => {
			clearInterval(pollInterval);
			window.removeEventListener("storage", handleStorageChange);
			window.removeEventListener("timer-sync", handleCustomSync);
		};
	}, []);

	// Persist to localStorage whenever timer changes
	useEffect(() => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(timer));
		// Dispatch custom event for same-page sync
		window.dispatchEvent(new CustomEvent("timer-sync", { detail: { state: timer, source: "quick" } }));
	}, [timer]);

	// Timer tick effect
	useEffect(() => {
		if (!timer.isRunning || timer.remainingSeconds <= 0) {
			// Timer completed
			if (timer.remainingSeconds <= 0 && timer.isRunning) {
				// Only log focus sessions, not breaks
				if (timer.mode === "focus") {
					void logFocusSession({ duration: timer.focusDuration }).catch(
						(err) => {
							console.error("Failed to log focus session:", err);
						},
					);
				}

				// Stop the timer
				setTimer((prev) => ({
					...prev,
					isRunning: false,
				}));

				// Play a subtle notification sound
				if (typeof window !== "undefined" && "Audio" in window) {
					try {
						const audioContext = new (
							window.AudioContext ||
							(
								window as typeof window & {
									webkitAudioContext: typeof AudioContext;
								}
							).webkitAudioContext
						)();
						const oscillator = audioContext.createOscillator();
						const gain = audioContext.createGain();
						oscillator.connect(gain);
						gain.connect(audioContext.destination);
						oscillator.frequency.value = 800;
						gain.gain.setValueAtTime(0.1, audioContext.currentTime);
						gain.gain.exponentialRampToValueAtTime(
							0.01,
							audioContext.currentTime + 0.5,
						);
						oscillator.start(audioContext.currentTime);
						oscillator.stop(audioContext.currentTime + 0.5);
					} catch {
						// Ignore audio errors
					}
				}
			}
			return;
		}

		const interval = setInterval(() => {
			setTimer((prev) => ({
				...prev,
				remainingSeconds: Math.max(0, prev.remainingSeconds - 1),
			}));
		}, 1000);

		return () => clearInterval(interval);
	}, [
		timer.isRunning,
		timer.remainingSeconds,
		timer.mode,
		timer.focusDuration,
		logFocusSession,
	]);

	const formatTime = (seconds: number): string => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
	};

	const handleStart = () => {
		setTimer((prev) => ({ ...prev, isRunning: true }));
	};

	const handlePause = () => {
		setTimer((prev) => ({ ...prev, isRunning: false }));
	};

	const handleReset = () => {
		setTimer((prev) => ({
			...prev,
			mode: "focus",
			isRunning: false,
			totalSeconds: prev.focusDuration * 60,
			remainingSeconds: prev.focusDuration * 60,
		}));
	};

	const progress =
		timer.totalSeconds > 0
			? ((timer.totalSeconds - timer.remainingSeconds) / timer.totalSeconds) *
				100
			: 0;

	const circumference = 2 * Math.PI * 45;
	const strokeDashoffset = circumference - (progress / 100) * circumference;

	const isCompleted = timer.remainingSeconds === 0;

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<Clock className="h-5 w-5" />
						Quick Focus
					</CardTitle>
					<Link
						to="/pomodoro"
						className="text-sm font-medium text-primary hover:underline"
					>
						Full timer →
					</Link>
				</div>
			</CardHeader>
			<CardContent>
				<div className="flex flex-col items-center space-y-4">
					{/* Circular Timer Display */}
					<div className="relative h-32 w-32">
						<svg
							className="h-full w-full -rotate-90 transform"
							viewBox="0 0 100 100"
							aria-label="Timer progress"
						>
							<title>Timer progress</title>
							<circle
								cx="50"
								cy="50"
								r="45"
								fill="none"
								stroke="currentColor"
								strokeWidth="3"
								className="text-muted opacity-20"
							/>
							<circle
								cx="50"
								cy="50"
								r="45"
								fill="none"
								stroke="currentColor"
								strokeWidth="4"
								strokeDasharray={circumference}
								strokeDashoffset={strokeDashoffset}
								strokeLinecap="round"
								className={`transition-all duration-1000 ${
									isCompleted
										? "text-green-600"
										: timer.isRunning
											? "text-primary"
											: "text-muted-foreground"
								}`}
							/>
						</svg>
						<div className="absolute inset-0 flex flex-col items-center justify-center">
							<div className="text-2xl font-bold tabular-nums">
								{formatTime(timer.remainingSeconds)}
							</div>
							<div className="text-xs text-muted-foreground">
								{isCompleted
									? "Complete!"
									: timer.isRunning
										? "Focus..."
										: "Ready"}
							</div>
						</div>
					</div>

					{/* Controls */}
					<div className="flex gap-2">
						{!timer.isRunning ? (
							<Button
								onClick={handleStart}
								size="sm"
								className="gap-2"
								disabled={isCompleted}
							>
								<Play className="h-4 w-4" />
								Start
							</Button>
						) : (
							<Button
								onClick={handlePause}
								size="sm"
								variant="outline"
								className="gap-2"
							>
								<Pause className="h-4 w-4" />
								Pause
							</Button>
						)}
						<Button
							onClick={handleReset}
							size="sm"
							variant="outline"
							className="gap-2"
						>
							<RotateCcw className="h-4 w-4" />
							Reset
						</Button>
					</div>

					{/* Status Text */}
					<div className="text-center text-sm text-muted-foreground">
						{isCompleted ? (
							<span className="font-medium text-green-600">
								🎉 Session complete! Great work!
							</span>
						) : timer.isRunning ? (
							<span>Stay focused on your task</span>
						) : timer.remainingSeconds < timer.totalSeconds ? (
							<span>Paused - Click Start to resume</span>
						) : (
							<span>
								Click Start to begin a {timer.focusDuration}-min session
							</span>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
