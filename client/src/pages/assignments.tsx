import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ClipboardList, Calendar, Clock, CheckCircle2, AlertCircle, ExternalLink, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AssignmentViewer } from "@/components/assignment-viewer";

interface Assignment {
  id: string;
  courseId: string;
  name: string;
  intro: string;
  duedate: number;
  allowsubmissionsfromdate: number;
  grade: number;
}

interface Course {
  id: string;
  fullname: string;
}

export default function Assignments() {
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  const { data: assignments, isLoading } = useQuery<Assignment[]>({
    queryKey: ["/api/assignments"],
  });

  const { data: courses } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const courseMap = new Map((courses || []).map((c) => [c.id, c.fullname]));

  const formatDate = (timestamp: number) => {
    if (!timestamp) return "No due date";
    return new Date(timestamp * 1000).toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const now = Math.floor(Date.now() / 1000);
  
  const upcomingAssignments = (assignments || []).filter((a) => a.duedate > now || !a.duedate);
  const pastAssignments = (assignments || []).filter((a) => a.duedate && a.duedate <= now);

  const getDaysUntilDue = (duedate: number) => {
    if (!duedate) return null;
    const days = Math.ceil((duedate - now) / (24 * 60 * 60));
    if (days < 0) return { text: "Overdue", urgent: true };
    if (days === 0) return { text: "Due today", urgent: true };
    if (days === 1) return { text: "Due tomorrow", urgent: true };
    if (days <= 3) return { text: `Due in ${days} days`, urgent: true };
    return { text: `Due in ${days} days`, urgent: false };
  };

  const AssignmentCard = ({ assignment }: { assignment: Assignment }) => {
    const dueInfo = assignment.duedate ? getDaysUntilDue(assignment.duedate) : null;
    const isPast = assignment.duedate && assignment.duedate <= now;

    return (
      <Card 
        className="hover-elevate cursor-pointer" 
        data-testid={`assignment-${assignment.id}`}
        onClick={() => setSelectedAssignment(assignment)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-3 flex-1">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                isPast ? "bg-muted" : dueInfo?.urgent ? "bg-orange-100 dark:bg-orange-900/30" : "bg-primary/10"
              }`}>
                <ClipboardList className={`h-5 w-5 ${
                  isPast ? "text-muted-foreground" : dueInfo?.urgent ? "text-orange-600" : "text-primary"
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate" data-testid="text-assignment-name">
                  {assignment.name}
                </h3>
                <p className="text-sm text-muted-foreground truncate">
                  {courseMap.get(assignment.courseId) || "Course"}
                </p>
                {assignment.intro && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {assignment.intro.replace(/<[^>]*>/g, "")}
                  </p>
                )}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              {dueInfo && (
                <Badge variant={dueInfo.urgent ? "destructive" : "secondary"} className="mb-2">
                  {dueInfo.text}
                </Badge>
              )}
              <p className="text-xs text-muted-foreground">
                {formatDate(assignment.duedate)}
              </p>
              {assignment.grade > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Max: {assignment.grade} points
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Assignments</h1>
        <p className="text-muted-foreground mt-1">
          View and manage your course assignments
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <Skeleton className="h-6 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : assignments && assignments.length > 0 ? (
        <Tabs defaultValue="upcoming">
          <TabsList className="mb-4">
            <TabsTrigger value="upcoming" data-testid="tab-upcoming">
              Upcoming ({upcomingAssignments.length})
            </TabsTrigger>
            <TabsTrigger value="past" data-testid="tab-past">
              Past ({pastAssignments.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming">
            {upcomingAssignments.length > 0 ? (
              <div className="space-y-4">
                {upcomingAssignments
                  .sort((a, b) => (a.duedate || Infinity) - (b.duedate || Infinity))
                  .map((assignment) => (
                    <AssignmentCard key={assignment.id} assignment={assignment} />
                  ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">All caught up!</h3>
                  <p className="text-sm text-muted-foreground">
                    No upcoming assignments at the moment.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="past">
            {pastAssignments.length > 0 ? (
              <div className="space-y-4">
                {pastAssignments
                  .sort((a, b) => b.duedate - a.duedate)
                  .map((assignment) => (
                    <AssignmentCard key={assignment.id} assignment={assignment} />
                  ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">No past assignments</h3>
                  <p className="text-sm text-muted-foreground">
                    Past assignments will appear here.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <ClipboardList className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-2">No assignments</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Assignments from your enrolled courses will appear here.
            </p>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!selectedAssignment} onOpenChange={(open) => !open && setSelectedAssignment(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="dialog-assignment-viewer">
          <DialogHeader>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <DialogTitle className="text-lg">{selectedAssignment?.name}</DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">Assignment</Badge>
                  {selectedAssignment && courseMap.get(selectedAssignment.courseId) && (
                    <span className="text-sm text-muted-foreground">
                      {courseMap.get(selectedAssignment.courseId)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </DialogHeader>
          {selectedAssignment && (
            <AssignmentViewer cmid={selectedAssignment.id} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
