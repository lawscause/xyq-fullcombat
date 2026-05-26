import { format, formatDistanceToNow, isToday, isThisWeek } from "date-fns";

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "MMM d, yyyy");
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "MMM d, yyyy 'at' h:mm a");
}

export function formatRelative(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;

  if (isToday(d)) {
    return "Today";
  }

  if (isThisWeek(d)) {
    return format(d, "EEEE");
  }

  return formatDistanceToNow(d, { addSuffix: true });
}

export function formatEventDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "EEEE, MMMM d");
}

export function formatEventTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "h:mm a");
}
