import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useNotification } from "@/components/NotificationProvider";
import { api } from "../../convex/_generated/api";

export default function ReminderChecker() {
  const { addNotification } = useNotification();

  const { data: upcomingReminders = [] } = useQuery(
    convexQuery(api.reminders.getUpcomingReminders, {}),
  );

  useEffect(() => {
    upcomingReminders.forEach((task) => {
      addNotification({
        title: "Upcoming Deadline",
        message: `${task.title} is due soon!`,
        type: "warning",
        duration: 7000,
      });

      // Mark as notified (silent, no await)
      fetch("/api/reminders/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: task._id }),
      }).catch((err) => console.error("Failed to mark reminder notified:", err));
    });
  }, [upcomingReminders, addNotification]);

  return null;
}
