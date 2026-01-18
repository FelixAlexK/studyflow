import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import type { DateSelectArg, EventClickArg, EventDropArg } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

interface CalendarComponentProps {
  userId: string;
}

interface EventFormData {
  title: string;
  description: string;
  type: "vorlesung" | "übung" | "praktikum" | "sonstiges";
  startDate: string;
  endDate: string;
  allDay: boolean;
  isRecurring: boolean;
  recurrenceFrequency: "weekly" | "";
  recurrenceEndDate: string;
}

interface CalendarEvent {
  _id: Id<"events">;
  userId: string;
  title: string;
  description?: string;
  type: "vorlesung" | "übung" | "praktikum" | "sonstiges";
  startDate: string;
  endDate?: string;
  color?: string;
  allDay?: boolean;
  isRecurring?: boolean;
  recurrenceFrequency?: "weekly";
  recurrenceEndDate?: string;
  parentEventId?: Id<"events">;
}
// Helper function to format date for datetime-local input
const formatDateTimeLocal = (dateStr: string): string => {
  if (!dateStr) return "";
  
  // If it's already in the correct format (yyyy-MM-ddThh:mm), return it
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(dateStr)) {
    return dateStr.slice(0, 16); // Keep only yyyy-MM-ddThh:mm
  }
  
  // If it's a date only (yyyy-MM-dd), add default time
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return `${dateStr}T09:00`;
  }
  
  // Try to parse as ISO string
  try {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch {
    return "";
  }
};
const CalendarComponent = ({ userId }: CalendarComponentProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventClickArg["event"] | null>(null);
  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    description: "",
    type: "vorlesung",
    startDate: "",
    endDate: "",
    allDay: false,
    isRecurring: false,
    recurrenceFrequency: "",
    recurrenceEndDate: "",
  });

  // Query to fetch events
  const { data: events = [], refetch } = useQuery(
    convexQuery(api.events.listEvents, { userId })
  );

  // Mutations
  const createEvent = useConvexMutation(api.events.createEvent);
  const updateEvent = useConvexMutation(api.events.updateEvent);
  const deleteEvent = useConvexMutation(api.events.deleteEvent);

  // Transform Convex events to FullCalendar format
  const calendarEvents = events.map((event: CalendarEvent) => ({
    id: event._id,
    title: event.title,
    start: event.startDate,
    end: event.endDate,
    backgroundColor: event.color,
    borderColor: event.color,
    allDay: event.allDay,
    extendedProps: {
      description: event.description,
      type: event.type,
    },
  }));

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    setSelectedEvent(null);
    setFormData({
      title: "",
      description: "",
      type: "vorlesung",
      startDate: formatDateTimeLocal(selectInfo.startStr),
      endDate: formatDateTimeLocal(selectInfo.endStr),
      allDay: selectInfo.allDay,
      isRecurring: false,
      recurrenceFrequency: "",
      recurrenceEndDate: "",
    });
    setIsDialogOpen(true);
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = clickInfo.event;
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      description: event.extendedProps.description || "",
      type: event.extendedProps.type,
      startDate: formatDateTimeLocal(event.startStr),
      endDate: formatDateTimeLocal(event.endStr || event.startStr),
      allDay: event.allDay,
      isRecurring: event.extendedProps.isRecurring || false,
      recurrenceFrequency: event.extendedProps.recurrenceFrequency || "",
      recurrenceEndDate: event.extendedProps.recurrenceEndDate
        ? formatDateTimeLocal(event.extendedProps.recurrenceEndDate)
        : "",
    });
    setIsDialogOpen(true);
  };

  const handleEventDrop = async (dropInfo: EventDropArg) => {
    const event = dropInfo.event;
    await updateEvent({
      eventId: event.id as Id<"events">,
      startDate: event.startStr,
      endDate: event.endStr,
    });
    refetch();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedEvent) {
      // Update existing event
      await updateEvent({
        eventId: selectedEvent.id as Id<"events">,
        title: formData.title,
        description: formData.description,
        type: formData.type,
        startDate: formData.startDate,
        endDate: formData.endDate,
        allDay: formData.allDay,
        isRecurring: formData.isRecurring,
        recurrenceFrequency: formData.recurrenceFrequency || undefined,
        recurrenceEndDate: formData.recurrenceEndDate || undefined,
      });
    } else {
      // Create new event
      await createEvent({
        userId,
        title: formData.title,
        description: formData.description,
        type: formData.type,
        startDate: formData.startDate,
        endDate: formData.endDate,
        allDay: formData.allDay,
        isRecurring: formData.isRecurring,
        recurrenceFrequency: formData.recurrenceFrequency || undefined,
        recurrenceEndDate: formData.recurrenceEndDate || undefined,
      });
    }
    
    refetch();
    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = async () => {
    if (selectedEvent) {
      await deleteEvent({
        eventId: selectedEvent.id as Id<"events">,
      });
      refetch();
      setIsDialogOpen(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      type: "vorlesung",
      startDate: "",
      endDate: "",
      allDay: false,
      isRecurring: false,
      recurrenceFrequency: "",
      recurrenceEndDate: "",
    });
    setSelectedEvent(null);
  };

  return (
    <div className="w-full h-full p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "timeGridWeek,dayGridMonth,timeGridDay",
        }}
        events={calendarEvents}
        editable={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
        select={handleDateSelect}
        eventClick={handleEventClick}
        eventDrop={handleEventDrop}
        height="auto"
        contentHeight="auto"
        firstDay={1}
        now={new Date()}
        scrollTime="09:00:00"
        slotDuration="01:00:00"
        slotLabelInterval="01:00:00"
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedEvent ? "Edit Event" : "Create Event"}
            </DialogTitle>
            <DialogDescription>
              {selectedEvent
                ? "Update the details of your event."
                : "Add a new class or deadline to your calendar."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: "vorlesung" | "übung" | "praktikum" | "sonstiges") =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vorlesung">
                      <span className="flex items-center gap-2">
                        📚 Vorlesung (Blue)
                      </span>
                    </SelectItem>
                    <SelectItem value="übung">
                      <span className="flex items-center gap-2">
                        ✏️ Übung (Green)
                      </span>
                    </SelectItem>
                    <SelectItem value="praktikum">
                      <span className="flex items-center gap-2">
                        🛠️ Praktikum (Amber)
                      </span>
                    </SelectItem>
                    <SelectItem value="sonstiges">
                      <span className="flex items-center gap-2">
                        📝 Sonstiges (Purple)
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center gap-2">
                  <input
                    id="isRecurring"
                    type="checkbox"
                    checked={formData.isRecurring}
                    onChange={(e) =>
                      setFormData({ ...formData, isRecurring: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="isRecurring" className="font-semibold">
                    Recurring Event
                  </Label>
                </div>
              </div>
              {formData.isRecurring && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="recurrenceFrequency">Frequency</Label>
                    <Select
                      value={formData.recurrenceFrequency}
                      onValueChange={(value) =>
                        setFormData({ ...formData, recurrenceFrequency: value as "weekly" | "" })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="recurrenceEndDate">Recurrence End Date (Optional)</Label>
                    <Input
                      id="recurrenceEndDate"
                      type="datetime-local"
                      value={formData.recurrenceEndDate}
                      onChange={(e) =>
                        setFormData({ ...formData, recurrenceEndDate: e.target.value })
                      }
                    />
                    <p className="text-xs text-gray-500">
                      Leave empty for infinite recurrence
                    </p>
                  </div>
                </>
              )}
            </div>
            <DialogFooter className="gap-2">
              {selectedEvent && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                >
                  Delete
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {selectedEvent ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <style>{`
        .fc-shadcn.fc {
          font-family: inherit;
          color: hsl(var(--foreground));
        }

        .fc-shadcn .fc-toolbar {
          padding: 0.25rem 0;
          gap: 0.5rem;
        }

        .fc-shadcn .fc-toolbar-title {
          font-size: 1.125rem;
          font-weight: 600;
        }

        .fc-shadcn .fc-button {
          border-radius: 0.5rem;
          border: 1px solid hsl(var(--border));
          background: hsl(var(--card));
          color: hsl(var(--foreground));
          padding: 0.35rem 0.7rem;
          box-shadow: none;
        }

        .fc-shadcn .fc-button-primary,
        .fc-shadcn .fc-button-primary:disabled {
          background: hsl(var(--primary));
          border-color: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
        }

        .fc-shadcn .fc-button-primary:hover:not(:disabled),
        .fc-shadcn .fc-button-primary:focus-visible {
          filter: brightness(0.96);
        }

        .fc-shadcn .fc-button:focus-visible {
          outline: 2px solid hsl(var(--ring));
          outline-offset: 2px;
        }

        .fc-shadcn .fc-daygrid-day,
        .fc-shadcn .fc-timegrid-slot {
          border-color: hsl(var(--border));
        }

        .fc-shadcn .fc-daygrid-day.fc-day-other {
          background-color: hsl(var(--muted) / 0.5);
        }

        .fc-shadcn .fc-day-today {
          background-color: hsl(var(--primary) / 0.08);
        }

        .fc-shadcn .fc-col-header-cell-cushion,
        .fc-shadcn .fc-daygrid-day-number {
          color: hsl(var(--muted-foreground));
          padding: 0.35rem;
        }

        /* Highlight current day in week view */
        .fc-shadcn .fc-col-header-cell.fc-day-today {
          background-color: hsl(var(--primary) / 0.15) !important;
          border-color: hsl(var(--primary)) !important;
        }

        .fc-shadcn .fc-col-header-cell.fc-day-today .fc-col-header-cell-cushion {
          color: hsl(var(--primary));
          font-weight: 700;
        }

        .fc-shadcn .fc-daygrid-day.fc-day-today {
          background-color: hsl(var(--primary) / 0.12) !important;
          border-color: hsl(var(--primary)) !important;
        }

        .fc-shadcn .fc-daygrid-day-number.fc-day-today {
          color: hsl(var(--primary));
          font-weight: 700;
        }

        /* Time grid styling for week view */
        .fc-shadcn .fc-timegrid-slot {
          height: 3rem;
        }

        .fc-shadcn .fc-col-header-cell {
          padding: 0.75rem 0.25rem;
          font-weight: 500;
        }

        /* Event type colors */
        .fc-event[data-event-type="vorlesung"] {
          background-color: #3b82f6 !important;
          border-color: #1d4ed8 !important;
        }

        .fc-event[data-event-type="übung"] {
          background-color: #10b981 !important;
          border-color: #059669 !important;
        }

        .fc-event[data-event-type="praktikum"] {
          background-color: #f59e0b !important;
          border-color: #d97706 !important;
        }

        .fc-event[data-event-type="sonstiges"] {
          background-color: #8b5cf6 !important;
          border-color: #7c3aed !important;
        }

        /* Event styling */
        .fc-event {
          border-radius: 0.375rem;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }

        .fc-event-title {
          font-weight: 600;
          font-size: 0.875rem;
        }

        /* Mobile responsive */
        @media (max-width: 768px) {
          .fc-shadcn .fc-toolbar {
            flex-direction: column;
            gap: 0.75rem;
            padding: 0.5rem 0;
          }

          .fc-shadcn .fc-toolbar-title {
            font-size: 1rem;
            margin: 0.5rem 0;
          }

          .fc-shadcn .fc-button {
            padding: 0.3rem 0.6rem;
            font-size: 0.85rem;
          }

          .fc-shadcn .fc-timegrid-slot {
            height: 2.5rem;
          }

          .fc-shadcn .fc-col-header-cell {
            padding: 0.5rem 0.1rem;
            font-size: 0.85rem;
          }

          .fc-shadcn .fc-daygrid-day-number,
          .fc-shadcn .fc-col-header-cell-cushion {
            padding: 0.25rem;
          }

          .fc-shadcn .fc-event {
            padding: 0.1rem 0.25rem;
            font-size: 0.75rem;
          }

          .fc-shadcn .fc-event-title {
            font-size: 0.7rem;
          }
        }

        /* Extra small devices */
        @media (max-width: 480px) {
          .fc-shadcn .fc-timegrid-slot {
            height: 2rem;
          }

          .fc-shadcn .fc-col-header-cell {
            padding: 0.4rem 0;
            font-size: 0.75rem;
          }

          .fc-shadcn .fc-toolbar {
            gap: 0.5rem;
          }

          .fc-shadcn .fc-button {
            padding: 0.25rem 0.4rem;
            font-size: 0.75rem;
          }
        }

        .fc-shadcn .fc-event {
          border-radius: 0.5rem;
          border: 1px solid currentColor;
          padding: 0.25rem 0.4rem;
          font-weight: 600;
        }

        .fc-shadcn .fc-event-title {
          padding: 0;
        }

        .fc-shadcn .fc-scrollgrid, .fc-shadcn .fc-scrollgrid-section > td {
          border: 1px solid hsl(var(--border));
        }
      `}</style>
    </div>
  );
};

export default CalendarComponent;