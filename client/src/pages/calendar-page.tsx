import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarEventCard } from "@/components/calendar-event-card";
import type { CalendarEvent } from "@shared/schema";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"month" | "week" | "list">("month");

  const { data: events, isLoading } = useQuery<CalendarEvent[]>({
    queryKey: ["/api/events"],
  });

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: Array<{ date: Date | null; events: CalendarEvent[] }> = [];

    // Add empty cells for days before the first of the month
    for (let i = 0; i < startingDay; i++) {
      days.push({ date: null, events: [] });
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const dayDate = new Date(year, month, i);
      const dayEvents = events?.filter((e) => {
        const eventDate = new Date(e.timestart * 1000);
        return eventDate.toDateString() === dayDate.toDateString();
      }) || [];
      days.push({ date: dayDate, events: dayEvents });
    }

    return days;
  };

  const calendarDays = getDaysInMonth(currentDate);
  const today = new Date();

  const upcomingEvents = events
    ?.filter((e) => new Date(e.timestart * 1000) >= today)
    .sort((a, b) => a.timestart - b.timestart)
    .slice(0, 10);

  const eventTypeColors: Record<string, string> = {
    course: "bg-blue-500",
    user: "bg-purple-500",
    site: "bg-orange-500",
    group: "bg-green-500",
    category: "bg-gray-500",
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Calendar</h1>
          <p className="text-muted-foreground mt-1">
            View your upcoming events and deadlines
          </p>
        </div>
        <Tabs value={view} onValueChange={(v) => setView(v as typeof view)}>
          <TabsList>
            <TabsTrigger value="month" data-testid="tab-month">Month</TabsTrigger>
            <TabsTrigger value="list" data-testid="tab-list">List</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar Grid */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </CardTitle>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigateMonth("prev")}
                    data-testid="button-prev-month"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentDate(new Date())}
                    data-testid="button-today"
                  >
                    Today
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigateMonth("next")}
                    data-testid="button-next-month"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {view === "month" ? (
                <>
                  {/* Day Headers */}
                  <div className="grid grid-cols-7 gap-px mb-2">
                    {daysOfWeek.map((day) => (
                      <div
                        key={day}
                        className="text-center text-xs font-medium text-muted-foreground py-2"
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Grid */}
                  {isLoading ? (
                    <div className="grid grid-cols-7 gap-px">
                      {[...Array(35)].map((_, i) => (
                        <Skeleton key={i} className="h-24 rounded-md" />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
                      {calendarDays.map((day, idx) => {
                        const isToday =
                          day.date?.toDateString() === today.toDateString();
                        const isCurrentMonth =
                          day.date?.getMonth() === currentDate.getMonth();

                        return (
                          <div
                            key={idx}
                            className={`min-h-24 bg-card p-2 ${
                              !day.date ? "bg-muted/30" : ""
                            } ${isToday ? "ring-2 ring-primary ring-inset" : ""}`}
                            data-testid={
                              day.date
                                ? `calendar-day-${day.date.getDate()}`
                                : undefined
                            }
                          >
                            {day.date && (
                              <>
                                <span
                                  className={`text-sm ${
                                    isToday
                                      ? "font-bold text-primary"
                                      : isCurrentMonth
                                      ? "text-foreground"
                                      : "text-muted-foreground"
                                  }`}
                                >
                                  {day.date.getDate()}
                                </span>
                                <div className="mt-1 space-y-1">
                                  {day.events.slice(0, 2).map((event) => (
                                    <div
                                      key={event.id}
                                      className={`text-xs px-1 py-0.5 rounded truncate text-white ${
                                        eventTypeColors[event.eventtype] ||
                                        "bg-gray-500"
                                      }`}
                                      title={event.name}
                                    >
                                      {event.name}
                                    </div>
                                  ))}
                                  {day.events.length > 2 && (
                                    <span className="text-xs text-muted-foreground">
                                      +{day.events.length - 2} more
                                    </span>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-3">
                  {isLoading ? (
                    [...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-12 w-12 rounded-md" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-3/4 mb-1" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    ))
                  ) : upcomingEvents && upcomingEvents.length > 0 ? (
                    upcomingEvents.map((event) => (
                      <CalendarEventCard key={event.id} event={event} />
                    ))
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-semibold mb-2">
                        No upcoming events
                      </h3>
                      <p>Your calendar is clear!</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                [...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-md" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-3/4 mb-1" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))
              ) : upcomingEvents && upcomingEvents.length > 0 ? (
                upcomingEvents.slice(0, 5).map((event) => (
                  <CalendarEventCard key={event.id} event={event} />
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No upcoming events</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Event Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(eventTypeColors).map(([type, color]) => (
                  <div key={type} className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${color}`} />
                    <span className="text-sm capitalize">{type}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
