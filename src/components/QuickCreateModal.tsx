'use client';

import { useConvexMutation } from "@convex-dev/react-query";
import { Plus, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { api } from "../../convex/_generated/api";

type CreateType = "task" | "exam" | "event" | null;

// Helper functions for smart defaults
const getTodayDate = () => {
  return new Date().toISOString().split('T')[0];
};

const getNextFullHour = () => {
  const now = new Date();
  const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
  nextHour.setMinutes(0, 0, 0);
  return nextHour.toTimeString().slice(0, 5);
};

const getReminderLabel = (minutes: number): string => {
  if (minutes === 1440) return '24 Stunden';
  if (minutes === 60) return '1 Stunde';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}min`;
};

export default function QuickCreateModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [createType, setCreateType] = useState<CreateType>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [location, setLocation] = useState("");
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderMinutes, setReminderMinutes] = useState(1440); // 24 hours default
  const [isRecurring, setIsRecurring] = useState(false);

  // Mutations
  const createTask = useConvexMutation(api.tasks.createTask);
  const createExam = useConvexMutation(api.exams.createExam);
  const createEvent = useConvexMutation(api.events.createEvent);

  const resetForm = () => {
    setTitle("");
    setDate("");
    setTime("");
    setDescription("");
    setSubject("");
    setLocation("");
    setShowDetails(false);
    setError(null);
    setReminderEnabled(false);
    setReminderMinutes(1440);
    setIsRecurring(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    setCreateType(null);
    resetForm();
  };

  const handleSelectType = (type: CreateType) => {
    setCreateType(type);
    setError(null);
    
    // Set smart defaults based on type
    setDate(getTodayDate());
    
    if (type === "exam") {
      setTime(getNextFullHour());
      setReminderEnabled(true); // Auto-enable reminder for exams
      setReminderMinutes(1440); // 24 hours before
    } else if (type === "event") {
      setTime("");
      setIsRecurring(false); // Can be changed by user
    } else if (type === "task") {
      setTime("");
      setReminderEnabled(false);
    }
  };

  const handleCreate = async () => {
    setError(null);

    try {
      setIsLoading(true);

      if (createType === "task") {
        if (!title.trim()) {
          setError("Titel ist erforderlich.");
          return;
        }
        if (!date) {
          setError("Datum ist erforderlich.");
          return;
        }

        const dueDate = new Date(`${date}T00:00:00`).toISOString();
        await createTask({
          title: title.trim(),
          description: description.trim() || undefined,
          dueDate,
          status: "todo",
        });
      } else if (createType === "exam") {
        if (!subject.trim()) {
          setError("Fach ist erforderlich.");
          return;
        }
        if (!date) {
          setError("Datum ist erforderlich.");
          return;
        }

        const dateTime = time
          ? new Date(`${date}T${time}`).toISOString()
          : new Date(`${date}T${getNextFullHour()}`).toISOString();

        await createExam({
          subject: subject.trim(),
          dateTime,
          location: location.trim() || undefined,
          learningGoal: description.trim() || undefined,
        });
      } else if (createType === "event") {
        if (!title.trim()) {
          setError("Titel ist erforderlich.");
          return;
        }
        if (!date) {
          setError("Datum ist erforderlich.");
          return;
        }

        const startDate = new Date(`${date}T00:00:00`).toISOString();
        await createEvent({
          title: title.trim(),
          description: description.trim() || undefined,
          startDate,
          type: "sonstiges",
          allDay: true,
          isRecurring: isRecurring,
          recurrenceFrequency: isRecurring ? "weekly" : undefined,
        });
      }

      handleClose();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erstellung fehlgeschlagen.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const typeLabels = {
    task: "Aufgabe",
    exam: "Prüfung",
    event: "Termin",
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center z-40 hover:shadow-xl"
        title="Schnell erstellen"
        aria-label="Neue Aufgabe, Prüfung oder Termin erstellen"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Modal Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          {createType === null ? (
            <>
              <DialogHeader>
                <DialogTitle>Was möchtest du erstellen?</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => handleSelectType("task")}
                  className="p-4 rounded-lg border-2 border-gray-200 hover:border-blue-600 hover:bg-blue-50 transition-all text-center"
                >
                  <div className="text-2xl mb-2">✓</div>
                  <div className="font-semibold text-sm">Aufgabe</div>
                </button>
                <button
                  onClick={() => handleSelectType("exam")}
                  className="p-4 rounded-lg border-2 border-gray-200 hover:border-blue-600 hover:bg-blue-50 transition-all text-center"
                >
                  <div className="text-2xl mb-2">📝</div>
                  <div className="font-semibold text-sm">Prüfung</div>
                </button>
                <button
                  onClick={() => handleSelectType("event")}
                  className="p-4 rounded-lg border-2 border-gray-200 hover:border-blue-600 hover:bg-blue-50 transition-all text-center"
                >
                  <div className="text-2xl mb-2">📅</div>
                  <div className="font-semibold text-sm">Termin</div>
                </button>
              </div>
            </>
          ) : (
            <>
              <DialogHeader className="flex flex-row items-center justify-between">
                <DialogTitle>Neue {typeLabels[createType]}</DialogTitle>
                <button
                  onClick={() => setCreateType(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </DialogHeader>

              <div className="space-y-4">
                {/* Error Message */}
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                    {error}
                  </div>
                )}

                {/* Minimal Fields */}
                {createType === "task" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="task-title">Titel *</Label>
                      <Input
                        id="task-title"
                        placeholder="z. B. Mathe Hausaufgaben"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="task-date">Fälligkeitsdatum *</Label>
                      <Input
                        id="task-date"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                  </>
                )}

                {createType === "exam" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="exam-subject">Fach *</Label>
                      <Input
                        id="exam-subject"
                        placeholder="z. B. Mathematik"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="exam-date">Prüfungsdatum *</Label>
                      <Input
                        id="exam-date"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                    {/* Auto-enable reminder for exams */}
                    <div className="bg-blue-50 border border-blue-200 rounded p-3 flex items-start gap-3">
                      <Checkbox
                        id="exam-reminder"
                        checked={reminderEnabled}
                        onCheckedChange={(checked) => setReminderEnabled(checked === true)}
                        disabled={isLoading}
                      />
                      <div className="flex-1">
                        <Label htmlFor="exam-reminder" className="font-medium text-sm cursor-pointer">
                          Erinnerung aktiviert
                        </Label>
                        <p className="text-xs text-gray-600 mt-1">
                          {getReminderLabel(reminderMinutes)} vor der Prüfung
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {createType === "event" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="event-title">Titel *</Label>
                      <Input
                        id="event-title"
                        placeholder="z. B. Vorlesung Physik"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="event-date">Datum *</Label>
                      <Input
                        id="event-date"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                    {/* Auto-suggest recurring for events (typical for lectures) */}
                    <div className="bg-amber-50 border border-amber-200 rounded p-3 flex items-start gap-3">
                      <Checkbox
                        id="event-recurring"
                        checked={isRecurring}
                        onCheckedChange={(checked) => setIsRecurring(checked === true)}
                        disabled={isLoading}
                      />
                      <div className="flex-1">
                        <Label htmlFor="event-recurring" className="font-medium text-sm cursor-pointer">
                          Wöchentlich wiederkehrend
                        </Label>
                        <p className="text-xs text-gray-600 mt-1">
                          Perfekt für regelmäßige Vorlesungen oder Übungen
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {/* Expandable Details Section */}
                <Separator className="my-2" />
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {showDetails ? "▼ Weniger Details" : "▶ Mehr Details"}
                </button>

                {showDetails && (
                  <div className="space-y-4 pt-2">
                    {createType === "task" && (
                      <div className="space-y-2">
                        <Label htmlFor="task-desc">Beschreibung</Label>
                        <Textarea
                          id="task-desc"
                          placeholder="Zusätzliche Informationen..."
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          disabled={isLoading}
                          className="resize-none h-20"
                        />
                      </div>
                    )}

                    {createType === "exam" && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="exam-time">Uhrzeit</Label>
                          <Input
                            id="exam-time"
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            disabled={isLoading}
                          />
                          <p className="text-xs text-gray-500">
                            Standardwert: {getNextFullHour()} Uhr
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="exam-location">Ort</Label>
                          <Input
                            id="exam-location"
                            placeholder="z. B. Hörsaal 101"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            disabled={isLoading}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="exam-goal">Lernziele</Label>
                          <Textarea
                            id="exam-goal"
                            placeholder="Was sollte ich lernen?"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            disabled={isLoading}
                            className="resize-none h-20"
                          />
                        </div>
                        {reminderEnabled && (
                          <div className="space-y-2">
                            <Label htmlFor="reminder-minutes">Erinnerung vorher (Minuten)</Label>
                            <Input
                              id="reminder-minutes"
                              type="number"
                              min="15"
                              step="15"
                              value={reminderMinutes}
                              onChange={(e) => setReminderMinutes(parseInt(e.target.value) || 1440)}
                              disabled={isLoading}
                            />
                            <p className="text-xs text-gray-500">
                              {getReminderLabel(reminderMinutes)} vor der Prüfung
                            </p>
                          </div>
                        )}
                      </>
                    )}

                    {createType === "event" && (
                      <div className="space-y-2">
                        <Label htmlFor="event-desc">Beschreibung</Label>
                        <Textarea
                          id="event-desc"
                          placeholder="Weitere Details..."
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          disabled={isLoading}
                          className="resize-none h-20"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 justify-end pt-4">
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    disabled={isLoading}
                  >
                    Abbrechen
                  </Button>
                  <Button
                    onClick={handleCreate}
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isLoading ? "Erstelle..." : "Erstellen"}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
