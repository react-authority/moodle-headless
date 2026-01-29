import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import {
  ArrowLeft,
  BookOpen,
  Users,
  Calendar,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ActivityItem } from "@/components/activity-item";
import type { Course, Section, Activity } from "@shared/schema";

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();

  const { data: course, isLoading: courseLoading } = useQuery<Course>({
    queryKey: ["/api/courses", id],
  });

  const { data: sections, isLoading: sectionsLoading } = useQuery<Section[]>({
    queryKey: ["/api/courses", id, "sections"],
  });

  const { data: activities, isLoading: activitiesLoading } = useQuery<Activity[]>({
    queryKey: ["/api/courses", id, "activities"],
  });

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getActivitiesForSection = (sectionId: string) => {
    return activities?.filter((a) => a.sectionid === sectionId) || [];
  };

  const totalActivities = activities?.length || 0;
  const completedActivities = activities?.filter((a) => a.completed).length || 0;
  const progressPercent =
    totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0;

  if (courseLoading) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full rounded-lg" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">Course not found</h3>
          <p className="text-muted-foreground mb-4">
            The course you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => setLocation("/courses")}>Back to Courses</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setLocation("/courses")}
        data-testid="button-back"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Courses
      </Button>

      {/* Course Header */}
      <div className="relative rounded-lg overflow-hidden">
        <div
          className="h-48 bg-gradient-to-br from-primary/80 to-primary/40"
          style={{
            backgroundImage: course.imageurl ? `url(${course.imageurl})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <Badge variant="secondary" className="mb-2">
            {course.categoryname || "Course"}
          </Badge>
          <h1 className="text-2xl font-bold text-white mb-1">{course.fullname}</h1>
          <p className="text-white/80 text-sm">{course.shortname}</p>
        </div>
      </div>

      {/* Course Info & Progress */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">About this Course</CardTitle>
            </CardHeader>
            <CardContent>
              {course.summary ? (
                <div
                  className="prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: course.summary }}
                />
              ) : (
                <p className="text-muted-foreground">No description available.</p>
              )}
            </CardContent>
          </Card>

          {/* Course Content */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Course Content</CardTitle>
            </CardHeader>
            <CardContent>
              {sectionsLoading || activitiesLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i}>
                      <Skeleton className="h-6 w-48 mb-2" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  ))}
                </div>
              ) : sections && sections.length > 0 ? (
                <Accordion type="multiple" className="w-full" defaultValue={[sections[0]?.id]}>
                  {sections.map((section) => {
                    const sectionActivities = getActivitiesForSection(section.id);
                    const completedCount = sectionActivities.filter((a) => a.completed).length;

                    return (
                      <AccordionItem key={section.id} value={section.id}>
                        <AccordionTrigger
                          className="hover:no-underline"
                          data-testid={`section-${section.id}`}
                        >
                          <div className="flex items-center gap-3 text-left">
                            <span className="font-medium">{section.name}</span>
                            <Badge variant="secondary" className="text-xs">
                              {completedCount}/{sectionActivities.length}
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          {section.summary && (
                            <p className="text-sm text-muted-foreground mb-4">
                              {section.summary.replace(/<[^>]*>/g, "")}
                            </p>
                          )}
                          <div className="space-y-2">
                            {sectionActivities.length > 0 ? (
                              sectionActivities.map((activity) => (
                                <ActivityItem
                                  key={activity.id}
                                  activity={activity}
                                  showDueDate={false}
                                />
                              ))
                            ) : (
                              <p className="text-sm text-muted-foreground py-4 text-center">
                                No activities in this section
                              </p>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No content available yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Progress Card */}
          {course.enrolled && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium">Your Progress</span>
                  <span className="text-sm font-bold">{progressPercent}%</span>
                </div>
                <Progress value={progressPercent} className="h-2 mb-3" />
                <p className="text-xs text-muted-foreground">
                  {completedActivities} of {totalActivities} activities completed
                </p>
              </CardContent>
            </Card>
          )}

          {/* Course Details */}
          <Card>
            <CardContent className="p-4 space-y-4">
              {course.teachername && (
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Instructor</p>
                    <p className="text-sm font-medium">{course.teachername}</p>
                  </div>
                </div>
              )}
              <Separator />
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Start Date</p>
                  <p className="text-sm font-medium">{formatDate(course.startdate)}</p>
                </div>
              </div>
              {course.enddate && (
                <>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">End Date</p>
                      <p className="text-sm font-medium">{formatDate(course.enddate)}</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          {!course.enrolled && (
            <Button className="w-full" data-testid="button-enroll">
              Enroll in Course
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
