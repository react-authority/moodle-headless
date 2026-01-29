import { Calendar, BookOpen, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CalendarEvent } from "@shared/schema";

interface CalendarEventCardProps {
  event: CalendarEvent;
}

const eventTypeColors: Record<string, string> = {
  course: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  user: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  site: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  group: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  category: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
};

export function CalendarEventCard({ event }: CalendarEventCardProps) {
  const startDate = new Date(event.timestart * 1000);
  const endDate = new Date((event.timestart + event.timeduration) * 1000);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    }
    if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    }
    return date.toLocaleDateString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const isPast = startDate < new Date();

  return (
    <Card
      className={`hover-elevate cursor-pointer transition-all duration-200 overflow-visible ${
        isPast ? "opacity-60" : ""
      }`}
      data-testid={`event-${event.id}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center justify-center bg-muted rounded-md p-2 min-w-[50px]">
            <span className="text-xs font-medium text-muted-foreground uppercase">
              {startDate.toLocaleDateString([], { month: "short" })}
            </span>
            <span className="text-xl font-bold">{startDate.getDate()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-medium text-sm line-clamp-2">{event.name}</h4>
              <Badge
                variant="secondary"
                className={`text-xs flex-shrink-0 ${eventTypeColors[event.eventtype] || ""}`}
              >
                {event.eventtype}
              </Badge>
            </div>
            {event.coursename && (
              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                <BookOpen className="h-3 w-3" />
                <span>{event.coursename}</span>
              </div>
            )}
            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{formatDate(startDate)}</span>
              <span>at</span>
              <span>{formatTime(startDate)}</span>
              {event.timeduration > 0 && (
                <>
                  <span>-</span>
                  <span>{formatTime(endDate)}</span>
                </>
              )}
            </div>
            {event.description && (
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                {event.description.replace(/<[^>]*>/g, "")}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
