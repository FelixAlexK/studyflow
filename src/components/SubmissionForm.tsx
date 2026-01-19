import { useMutation } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "../../convex/_generated/api";

interface SubmissionFormData {
  title: string;
  subject: string;
  dueDate: string;
}

interface SubmissionFormProps {
  onSuccess?: () => void;
}

export default function SubmissionForm({ onSuccess }: SubmissionFormProps) {
  const [formValues, setFormValues] = useState<SubmissionFormData>({
    title: "",
    subject: "",
    dueDate: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const createSubmission = useMutation(api.submissions.createSubmission);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formValues.title.trim()) {
      setError("Titel ist erforderlich.");
      return;
    }

    if (!formValues.subject.trim()) {
      setError("Fach ist erforderlich.");
      return;
    }

    if (!formValues.dueDate) {
      setError("Abgabedatum ist erforderlich.");
      return;
    }

    setIsLoading(true);
    try {
      await createSubmission({
        title: formValues.title.trim(),
        subject: formValues.subject.trim(),
        dueDate: new Date(`${formValues.dueDate}T00:00:00`).toISOString(),
      });

      // Reset form
      setFormValues({
        title: "",
        subject: "",
        dueDate: "",
      });

      toast.success("Abgabe erstellt", {
        description: `${formValues.title.trim()} wurde erfolgreich angelegt.`,
      });

      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Abgabe konnte nicht erstellt werden.";
      setError(errorMessage);
      toast.error("Fehler beim Erstellen", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Neue Abgabe</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Titel *</Label>
            <Input
              id="title"
              type="text"
              placeholder="z. B. Hausarbeit, Projektbericht"
              value={formValues.title}
              onChange={(e) =>
                setFormValues((prev) => ({ ...prev, title: e.target.value }))
              }
              disabled={isLoading}
            />
          </div>

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
            <Label htmlFor="dueDate">Abgabedatum *</Label>
            <Input
              id="dueDate"
              type="date"
              value={formValues.dueDate}
              onChange={(e) =>
                setFormValues((prev) => ({ ...prev, dueDate: e.target.value }))
              }
              disabled={isLoading}
            />
          </div>

          {error && <div className="text-sm text-destructive">{error}</div>}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Erstelle..." : "Abgabe erstellen"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
