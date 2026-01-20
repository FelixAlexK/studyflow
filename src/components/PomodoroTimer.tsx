"use client";

import { useConvexMutation } from "@convex-dev/react-query";
import { Loader2, Pause, Play, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

const DEFAULT_FOCUS = 25;
const DEFAULT_BREAK = 5;
const STORAGE_KEY = "pomodoro-timer-state";

export default function PomodoroTimer() {
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
		const focusDuration = DEFAULT_FOCUS;
		return {
			mode: "focus",
			isRunning: false,
			totalSeconds: focusDuration * 60,
			remainingSeconds: focusDuration * 60,
			focusDuration,
			breakDuration: DEFAULT_BREAK,
		};
	});

	const [focusInput, setFocusInput] = useState<string>(() => {
		// Try to load from localStorage synchronously
		if (typeof window !== "undefined") {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored) {
				try {
					const parsed = JSON.parse(stored) as TimerState;
					return String(parsed.focusDuration);
				} catch {
					// Fall through
				}
			}
		}
		return String(DEFAULT_FOCUS);
	});

	const [breakInput, setBreakInput] = useState<string>(() => {
		// Try to load from localStorage synchronously
		if (typeof window !== "undefined") {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored) {
				try {
					const parsed = JSON.parse(stored) as TimerState;
					return String(parsed.breakDuration);
				} catch {
					// Fall through
				}
			}
		}
		return String(DEFAULT_BREAK);
	});

	const [editMode, setEditMode] = useState(false);

	// Persist to localStorage whenever timer changes
	useEffect(() => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(timer));
		// Dispatch custom event for same-page sync
		window.dispatchEvent(new CustomEvent("timer-sync", { detail: { state: timer, source: "pomodoro" } }));
	}, [timer]);

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
					// Ignore invalid data
				}
			}
		};

		const handleCustomSync = (e: Event) => {
			const customEvent = e as CustomEvent<{ state: TimerState; source: string }>;
			if (customEvent.detail && customEvent.detail.source !== "pomodoro") {
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
					// Ignore invalid data
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

	// Timer tick effect
	useEffect(() => {
		if (!timer.isRunning || timer.remainingSeconds <= 0) {
			if (timer.remainingSeconds <= 0 && timer.isRunning) {
				// Focus session just completed, log it to backend
				if (timer.mode === "focus") {
					void logFocusSession({ duration: timer.focusDuration }).catch(
						(err) => {
							console.error("Failed to log focus session:", err);
						},
					);
				}

				// Timer finished, switch modes
				const newMode = timer.mode === "focus" ? "break" : "focus";
				const newDuration =
					newMode === "focus" ? timer.focusDuration : timer.breakDuration;
				setTimer((prev) => ({
					...prev,
					mode: newMode,
					totalSeconds: newDuration * 60,
					remainingSeconds: newDuration * 60,
					isRunning: true, // Keep running on mode switch
				}));
				// Play a subtle notification sound if available
				if (typeof window !== "undefined" && "Audio" in window) {
					const audioContext = new (
						window.AudioContext || (window as any).webkitAudioContext
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
		timer.breakDuration,
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
			isRunning: false,
			remainingSeconds: prev.totalSeconds,
		}));
	};

	const handleApplySettings = () => {
		const newFocus = Math.max(1, parseInt(focusInput, 10) || DEFAULT_FOCUS);
		const newBreak = Math.max(1, parseInt(breakInput, 10) || DEFAULT_BREAK);

		setTimer((prev) => ({
			...prev,
			isRunning: false,
			focusDuration: newFocus,
			breakDuration: newBreak,
			mode: "focus",
			totalSeconds: newFocus * 60,
			remainingSeconds: newFocus * 60,
		}));
		setEditMode(false);
	};

	const handleResetSettings = () => {
		setFocusInput(String(timer.focusDuration));
		setBreakInput(String(timer.breakDuration));
	};

	const percentage =
		(timer.totalSeconds > 0 ? timer.remainingSeconds / timer.totalSeconds : 0) *
		100;
	const circumference = 2 * Math.PI * 45;
	const strokeDashoffset = circumference - (percentage / 100) * circumference;

	return (
		<Card className="w-full max-w-md">
			<CardHeader>
				<CardTitle>Focus Timer</CardTitle>
				<CardDescription>
					{timer.mode === "focus" ? "Focus Time" : "Break Time"}
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Circular Timer Display */}
				<div className="flex flex-col items-center justify-center space-y-4">
					<div className="relative h-48 w-48">
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
								strokeWidth="2"
								className="text-muted"
							/>
							<circle
								cx="50"
								cy="50"
								r="45"
								fill="none"
								stroke="currentColor"
								strokeWidth="3"
								strokeDasharray={circumference}
								strokeDashoffset={strokeDashoffset}
								strokeLinecap="round"
								className={`transition-all duration-1000 ${
									timer.mode === "focus" ? "text-primary" : "text-amber-500"
								}`}
							/>
						</svg>
						<div className="absolute inset-0 flex flex-col items-center justify-center">
							<div className="text-4xl font-bold tabular-nums">
								{formatTime(timer.remainingSeconds)}
							</div>
							<div className="text-sm text-muted-foreground">
								{timer.mode === "focus" ? "Focus" : "Break"}
							</div>
						</div>
					</div>
				</div>

				{/* Controls */}
				<div className="flex gap-2 justify-center">
					{!timer.isRunning ? (
						<Button
							onClick={handleStart}
							size="lg"
							className="gap-2"
							disabled={timer.remainingSeconds === 0}
						>
							<Play className="h-4 w-4" />
							Start
						</Button>
					) : (
						<Button
							onClick={handlePause}
							size="lg"
							variant="secondary"
							className="gap-2"
						>
							<Pause className="h-4 w-4" />
							Pause
						</Button>
					)}
					<Button
						onClick={handleReset}
						size="lg"
						variant="outline"
						className="gap-2"
					>
						<RotateCcw className="h-4 w-4" />
						Reset
					</Button>
				</div>

				{/* Settings Toggle */}
				<div className="flex justify-center">
					<Button
						onClick={() => {
							if (editMode) {
								handleResetSettings();
							}
							setEditMode(!editMode);
						}}
						variant="ghost"
						size="sm"
					>
						{editMode ? "Cancel" : "Settings"}
					</Button>
				</div>

				{/* Settings Panel */}
				{editMode && (
					<div className="space-y-3 rounded-md border bg-muted/30 p-3">
						<div className="space-y-2">
							<label htmlFor="focus-duration" className="text-sm font-medium">
								Focus Duration (minutes)
							</label>
							<Input
								id="focus-duration"
								type="number"
								min="1"
								max="60"
								value={focusInput}
								onChange={(e) => setFocusInput(e.target.value)}
							/>
						</div>
						<div className="space-y-2">
							<label htmlFor="break-duration" className="text-sm font-medium">
								Break Duration (minutes)
							</label>
							<Input
								id="break-duration"
								type="number"
								min="1"
								max="30"
								value={breakInput}
								onChange={(e) => setBreakInput(e.target.value)}
							/>
						</div>
						<Button onClick={handleApplySettings} className="w-full" size="sm">
							Apply Settings
						</Button>
					</div>
				)}

				{/* Status Info */}
				<div className="rounded-md bg-muted/50 p-3 text-center text-sm text-muted-foreground">
					{timer.isRunning && (
						<div className="flex items-center justify-center gap-2">
							<Loader2 className="h-4 w-4 animate-spin" />
							Timer running...
						</div>
					)}
					{!timer.isRunning && timer.remainingSeconds === 0 && (
						<div>Session complete! Reset to start again.</div>
					)}
					{!timer.isRunning && timer.remainingSeconds > 0 && (
						<div>Ready to start. Click "Start" to begin.</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
