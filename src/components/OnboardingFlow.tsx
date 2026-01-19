import { useConvexMutation } from "@convex-dev/react-query";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "../../convex/_generated/api";

type OnboardingStep = "lecture" | "exam" | "today-view" | "complete";

interface OnboardingFlowProps {
	onComplete: () => void;
}

const ONBOARDING_KEY = "studyflow_onboarding_completed";

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
	const [currentStep, setCurrentStep] = useState<OnboardingStep>("lecture");
	const [isOpen, setIsOpen] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Convex mutations
	const createEvent = useConvexMutation(api.events.createEvent);
	const createExam = useConvexMutation(api.exams.createExam);

	// Lecture form
	const [lectureTitle, setLectureTitle] = useState("");
	const [lectureDate, setLectureDate] = useState("");
	const [lectureTime, setLectureTime] = useState("09:00");

	// Exam form
	const [examSubject, setExamSubject] = useState("");
	const [examDate, setExamDate] = useState("");
	const [examTime, setExamTime] = useState("09:00");

	const handleSkip = () => {
		localStorage.setItem(ONBOARDING_KEY, "skipped");
		setIsOpen(false);
		onComplete();
		toast.info("Onboarding übersprungen", {
			description: "Du kannst jederzeit loslegen!",
		});
	};

	const handleLectureSubmit = async () => {
		if (!lectureTitle.trim()) {
			toast.error("Bitte gib einen Titel ein");
			return;
		}

		setIsSubmitting(true);

		try {
			// Get next Monday for the date
			const today = new Date();
			const nextMonday = new Date(today);
			nextMonday.setDate(today.getDate() + ((1 + 7 - today.getDay()) % 7 || 7));

			// Map weekday to days offset
			const weekdayOffset: Record<string, number> = {
				monday: 0,
				tuesday: 1,
				wednesday: 2,
				thursday: 3,
				friday: 4,
			};

			const offset = lectureDate ? weekdayOffset[lectureDate] : 0;
			const eventDate = new Date(nextMonday);
			eventDate.setDate(nextMonday.getDate() + offset);

			// Set the time
			const [hours, minutes] = lectureTime.split(":");
			eventDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

			// Create event in Convex
			await createEvent({
				title: lectureTitle,
				type: "vorlesung",
				startDate: eventDate.toISOString(),
				allDay: false,
				isRecurring: true,
				recurrenceFrequency: "weekly",
			});

			toast.success("Erste Vorlesung angelegt!", {
				description: "Weiter zur Prüfung",
			});

			setCurrentStep("exam");
		} catch (err: unknown) {
			toast.error("Fehler beim Erstellen", {
				description: "Bitte versuche es erneut.",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleExamSubmit = async () => {
		if (!examSubject.trim()) {
			toast.error("Bitte gib ein Fach ein");
			return;
		}

		setIsSubmitting(true);

		try {
			// Create exam date/time
			let examDateTime: Date;

			if (examDate) {
				examDateTime = new Date(examDate);
				const [hours, minutes] = examTime.split(":");
				examDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
			} else {
				// Default to 2 weeks from now at 9 AM
				examDateTime = new Date();
				examDateTime.setDate(examDateTime.getDate() + 14);
				examDateTime.setHours(9, 0, 0, 0);
			}

			// Create exam in Convex
			await createExam({
				subject: examSubject,
				dateTime: examDateTime.toISOString(),
			});

			toast.success("Erste Prüfung angelegt!", {
				description: "Jetzt zeigen wir dir die Heute-Ansicht",
			});

			setCurrentStep("today-view");
		} catch (err: unknown) {
			toast.error("Fehler beim Erstellen", {
				description: "Bitte versuche es erneut.",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleComplete = () => {
		localStorage.setItem(ONBOARDING_KEY, "completed");
		setIsOpen(false);
		onComplete();
		toast.success("Perfekt! Du bist startklar 🎉", {
			description: "Viel Erfolg mit StudyFlow!",
		});
	};

	const getStepNumber = () => {
		switch (currentStep) {
			case "lecture":
				return 1;
			case "exam":
				return 2;
			case "today-view":
				return 3;
			default:
				return 3;
		}
	};

	if (!isOpen) return null;

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogContent className="sm:max-w-md">
				<button
					type="button"
					onClick={handleSkip}
					className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
				>
					<X className="h-4 w-4" />
					<span className="sr-only">Skip</span>
				</button>

				<DialogHeader>
					<div className="flex items-center justify-between">
						<DialogTitle>Willkommen bei StudyFlow! 👋</DialogTitle>
						<span className="text-sm text-muted-foreground">
							Schritt {getStepNumber()}/3
						</span>
					</div>
				</DialogHeader>

				{currentStep === "lecture" && (
					<div className="space-y-4">
						<p className="text-sm text-muted-foreground">
							Lass uns deine erste Vorlesung anlegen. Das dauert nur 10
							Sekunden!
						</p>

						<div className="space-y-3">
							<div className="space-y-2">
								<Label htmlFor="lecture-title">Vorlesungsname *</Label>
								<Input
									id="lecture-title"
									placeholder="z. B. Mathematik 1"
									value={lectureTitle}
									onChange={(e) => setLectureTitle(e.target.value)}
									autoFocus
								/>
							</div>

							<div className="grid grid-cols-2 gap-3">
								<div className="space-y-2">
									<Label htmlFor="lecture-date">Wochentag</Label>
									<select
										id="lecture-date"
										className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
										value={lectureDate}
										onChange={(e) => setLectureDate(e.target.value)}
									>
										<option value="">Optional</option>
										<option value="monday">Montag</option>
										<option value="tuesday">Dienstag</option>
										<option value="wednesday">Mittwoch</option>
										<option value="thursday">Donnerstag</option>
										<option value="friday">Freitag</option>
									</select>
								</div>

								<div className="space-y-2">
									<Label htmlFor="lecture-time">Uhrzeit</Label>
									<Input
										id="lecture-time"
										type="time"
										value={lectureTime}
										onChange={(e) => setLectureTime(e.target.value)}
									/>
								</div>
							</div>
						</div>

						<div className="flex gap-2">
							<Button
								onClick={handleLectureSubmit}
								className="flex-1"
								disabled={isSubmitting}
							>
								{isSubmitting ? "Wird erstellt..." : "Weiter"}
							</Button>
							<Button
								onClick={handleSkip}
								variant="ghost"
								disabled={isSubmitting}
							>
								Überspringen
							</Button>
						</div>
					</div>
				)}

				{currentStep === "exam" && (
					<div className="space-y-4">
						<p className="text-sm text-muted-foreground">
							Super! Jetzt legen wir deine erste Prüfung an.
						</p>

						<div className="space-y-3">
							<div className="space-y-2">
								<Label htmlFor="exam-subject">Fach *</Label>
								<Input
									id="exam-subject"
									placeholder="z. B. Mathematik 1"
									value={examSubject}
									onChange={(e) => setExamSubject(e.target.value)}
									autoFocus
								/>
							</div>

							<div className="grid grid-cols-2 gap-3">
								<div className="space-y-2">
									<Label htmlFor="exam-date">Datum</Label>
									<Input
										id="exam-date"
										type="date"
										value={examDate}
										onChange={(e) => setExamDate(e.target.value)}
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="exam-time">Uhrzeit</Label>
									<Input
										id="exam-time"
										type="time"
										value={examTime}
										onChange={(e) => setExamTime(e.target.value)}
									/>
								</div>
							</div>
						</div>

						<div className="flex gap-2">
							<Button
								onClick={handleExamSubmit}
								className="flex-1"
								disabled={isSubmitting}
							>
								{isSubmitting ? "Wird erstellt..." : "Weiter"}
							</Button>
							<Button
								onClick={handleSkip}
								variant="ghost"
								disabled={isSubmitting}
							>
								Überspringen
							</Button>
						</div>
					</div>
				)}

				{currentStep === "today-view" && (
					<div className="space-y-4">
						<div className="rounded-lg border bg-muted/50 p-4 space-y-3">
							<div className="flex items-start gap-3">
								<div className="rounded-full bg-blue-600 text-white w-8 h-8 flex items-center justify-center text-sm font-bold">
									1
								</div>
								<div className="flex-1">
									<h4 className="font-semibold text-sm">Heute-Ansicht</h4>
									<p className="text-xs text-muted-foreground mt-1">
										Hier siehst du alle wichtigen Termine und Aufgaben für heute
										auf einen Blick.
									</p>
								</div>
							</div>

							<div className="flex items-start gap-3">
								<div className="rounded-full bg-purple-600 text-white w-8 h-8 flex items-center justify-center text-sm font-bold">
									2
								</div>
								<div className="flex-1">
									<h4 className="font-semibold text-sm">Kalender</h4>
									<p className="text-xs text-muted-foreground mt-1">
										Im Kalender planst du deine Vorlesungen und Termine.
									</p>
								</div>
							</div>

							<div className="flex items-start gap-3">
								<div className="rounded-full bg-green-600 text-white w-8 h-8 flex items-center justify-center text-sm font-bold">
									+
								</div>
								<div className="flex-1">
									<h4 className="font-semibold text-sm">Schnell erstellen</h4>
									<p className="text-xs text-muted-foreground mt-1">
										Mit dem blauen Plus-Button unten rechts kannst du jederzeit
										schnell etwas anlegen.
									</p>
								</div>
							</div>
						</div>

						<div className="flex gap-2">
							<Button onClick={handleComplete} className="flex-1">
								Los geht's! 🚀
							</Button>
							<Button onClick={handleSkip} variant="ghost">
								Überspringen
							</Button>
						</div>
					</div>
				)}

				<div className="flex gap-1 justify-center">
					<div
						className={`h-1.5 w-8 rounded-full transition-colors ${currentStep === "lecture" ? "bg-blue-600" : "bg-muted"}`}
					/>
					<div
						className={`h-1.5 w-8 rounded-full transition-colors ${currentStep === "exam" ? "bg-blue-600" : "bg-muted"}`}
					/>
					<div
						className={`h-1.5 w-8 rounded-full transition-colors ${currentStep === "today-view" ? "bg-blue-600" : "bg-muted"}`}
					/>
				</div>
			</DialogContent>
		</Dialog>
	);
}

export function useOnboarding() {
	const [shouldShowOnboarding, setShouldShowOnboarding] = useState(false);

	useEffect(() => {
		const completed = localStorage.getItem(ONBOARDING_KEY);
		setShouldShowOnboarding(!completed);
	}, []);

	const markAsComplete = () => {
		localStorage.setItem(ONBOARDING_KEY, "completed");
		setShouldShowOnboarding(false);
	};

	const resetOnboarding = () => {
		localStorage.removeItem(ONBOARDING_KEY);
		setShouldShowOnboarding(true);
	};

	return { shouldShowOnboarding, markAsComplete, resetOnboarding };
}
