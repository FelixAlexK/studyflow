import { useMutation } from "convex/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "../../convex/_generated/api";

interface ExamFormData {
  subject: string;
  dateTime: string;
  location: string;
  learningGoal: string;
}

interface ExamFormProps {
  onSuccess?: () => void;
}

const getNextFullHour = (): string => {
  const now = new Date();
  const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
  nextHour.setMinutes(0, 0, 0);
  return nextHour.toISOString().slice(0, 16);
};

export default function ExamForm({ onSuccess }: ExamFormProps) {
  const [formValues, setFormValues] = useState<ExamFormData>({
    subject: "",
    dateTime: getNextFullHour(),
    location: "",
    learningGoal: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const createExam = useMutation(api.exams.createExam);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formValues.subject.trim()) {
      setError("Fach ist erforderlich.");
      return;
    }

    if (!formValues.dateTime) {
      setError("Datum und Uhrzeit sind erforderlich.");
      return;
    }

    setIsLoading(true);
    try {
      await createExam({
        subject: formValues.subject.trim(),
        dateTime: new Date(formValues.dateTime).toISOString(),
        location: formValues.location.trim() || undefined,
        learningGoal: formValues.learningGoal.trim() || undefined,
      });

      // Reset form
      setFormValues({
        subject: "",
        dateTime: getNextFullHour(),
        location: "",
        learningGoal: "",
      });

      onSuccess?.();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Prüfung konnte nicht erstellt werden.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Neue Prüfung</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="subject">Fach *</Label>
            <Input
              id="subject"
              type="text"
              placeholder="z. B. Mathematik, Englisch"
              value={formValues.subject}
              onChange={(e) =>
                setFormValues((prev) => ({ ...prev, subject: e.target.value }))
              }
              disabled={isLoading}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="dateTime">Datum & Uhrzeit *</Label>
            <Input
              id="dateTime"
              type="datetime-local"
              value={formValues.dateTime}
              onChange={(e) =>
                setFormValues((prev) => ({ ...prev, dateTime: e.target.value }))
              }
              disabled={isLoading}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="location">Ort</Label>
            <Input
              id="location"
              type="text"
              placeholder="z. B. Raum 101, Gebäude A"
              value={formValues.location}
              onChange={(e) =>
                setFormValues((prev) => ({ ...prev, location: e.target.value }))
              }
              disabled={isLoading}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="learningGoal">Lernziel</Label>
            <Input
              id="learningGoal"
              type="text"
              placeholder="z. B. Kapitel 1–5, Formeln, Vokabeln"
              value={formValues.learningGoal}
              onChange={(e) =>
                setFormValues((prev) => ({
                  ...prev,
                  learningGoal: e.target.value,
                }))
              }
              disabled={isLoading}
            />
          </div>

          {error && <div className="text-sm text-destructive">{error}</div>}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Erstelle..." : "Prüfung erstellen"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
