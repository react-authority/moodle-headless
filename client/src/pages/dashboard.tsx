import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  BookOpen,
  GraduationCap,
  Calendar,
  TrendingUp,
  ArrowRight,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { StatsCard } from "@/components/stats-card";
import { CourseCard } from "@/components/course-card";
import { ActivityItem } from "@/components/activity-item";
import { CalendarEventCard } from "@/components/calendar-event-card";
import type { Course, Activity, CalendarEvent, User } from "@shared/schema";

export default function Dashboard() {
  const [, setLocation] = useLocation();

  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  const { data: courses, isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const { data: upcomingActivities, isLoading: activitiesLoading } = useQuery<Activity[]>({
    queryKey: ["/api/activities/upcoming"],
  });

  const { data: upcomingEvents, isLoading: eventsLoading } = useQuery<CalendarEvent[]>({
    queryKey: ["/api/events/upcoming"],
  });

  const { data: stats, isLoading: statsLoading } = useQuery<{
    totalCourses: number;
    completedActivities: number;
    averageGrade: number;
    upcomingDeadlines: number;
  }>({
    queryKey: ["/api/stats"],
  });

  const enrolledCourses = courses?.filter((c) => c.enrolled) || [];
  const overallProgress =
    enrolledCourses.length > 0
      ? Math.round(
          enrolledCourses.reduce((acc, c) => acc + (c.progress || 0), 0) /
            enrolledCourses.length
        )
      : 0;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {user?.firstname || "Learner"}!</h1>
        <p className="text-muted-foreground mt-1">
          Here's an overview of your learning progress
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <StatsCard
              title="Enrolled Courses"
              value={stats?.totalCourses || 0}
              description="Active this semester"
              icon={BookOpen}
            />
            <StatsCard
              title="Completed Activities"
              value={stats?.completedActivities || 0}
              description="Assignments & quizzes"
              icon={CheckCircle2}
              trend={{ value: 12, isPositive: true }}
            />
            <StatsCard
              title="Average Grade"
              value={`${stats?.averageGrade || 0}%`}
              description="Across all courses"
              icon={GraduationCap}
            />
            <StatsCard
              title="Upcoming Deadlines"
              value={stats?.upcomingDeadlines || 0}
              description="In the next 7 days"
              icon={Clock}
            />
          </>
        )}
      </div>

      {/* Overall Progress */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Overall Learning Progress</h3>
              <p className="text-sm text-muted-foreground">
                {enrolledCourses.length} courses in progress
              </p>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              <span className="text-2xl font-bold">{overallProgress}%</span>
            </div>
          </div>
          <Progress value={overallProgress} className="h-3" />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Courses */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Continue Learning</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/courses")}
              data-testid="link-all-courses"
            >
              View all
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {coursesLoading ? (
              <>
                {[...Array(4)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <Skeleton className="h-32 w-full mb-4" />
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </>
            ) : (
              enrolledCourses.slice(0, 4).map((course) => (
                <CourseCard key={course.id} course={course} />
              ))
            )}
          </div>
        </div>

        {/* Sidebar: Upcoming & Events */}
        <div className="space-y-6">
          {/* Upcoming Activities */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base">Upcoming Activities</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setLocation("/calendar")}
                  data-testid="link-calendar"
                >
                  <Calendar className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {activitiesLoading ? (
                <>
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-3/4 mb-1" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </>
              ) : upcomingActivities && upcomingActivities.length > 0 ? (
                upcomingActivities.slice(0, 4).map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No upcoming activities</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Calendar Events</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {eventsLoading ? (
                <>
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-12 w-12 rounded-md" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-3/4 mb-1" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </>
              ) : upcomingEvents && upcomingEvents.length > 0 ? (
                upcomingEvents.slice(0, 3).map((event) => (
                  <CalendarEventCard key={event.id} event={event} />
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No upcoming events</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
