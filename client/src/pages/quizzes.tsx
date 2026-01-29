import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileQuestion, Calendar, Clock, CheckCircle2, Play, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { QuizViewer } from "@/components/quiz-viewer";

interface Quiz {
  id: string;
  courseId: string;
  name: string;
  intro: string;
  timeopen: number;
  timeclose: number;
  timelimit: number;
  grade: number;
  attempts: number;
}

interface Course {
  id: string;
  fullname: string;
}

export default function Quizzes() {
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);

  const { data: quizzes, isLoading } = useQuery<Quiz[]>({
    queryKey: ["/api/quizzes"],
  });

  const { data: courses } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const courseMap = new Map((courses || []).map((c) => [c.id, c.fullname]));

  const formatDate = (timestamp: number) => {
    if (!timestamp) return null;
    return new Date(timestamp * 1000).toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return "No time limit";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMins = minutes % 60;
    return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
  };

  const now = Math.floor(Date.now() / 1000);
  
  const availableQuizzes = (quizzes || []).filter((q) => {
    const isOpen = !q.timeopen || q.timeopen <= now;
    const isNotClosed = !q.timeclose || q.timeclose > now;
    return isOpen && isNotClosed;
  });
  
  const upcomingQuizzes = (quizzes || []).filter((q) => q.timeopen && q.timeopen > now);
  const closedQuizzes = (quizzes || []).filter((q) => q.timeclose && q.timeclose <= now);

  const getQuizStatus = (quiz: Quiz) => {
    if (quiz.timeclose && quiz.timeclose <= now) return { text: "Closed", variant: "secondary" as const };
    if (quiz.timeopen && quiz.timeopen > now) return { text: "Opens soon", variant: "outline" as const };
    return { text: "Available", variant: "default" as const };
  };

  const QuizCard = ({ quiz }: { quiz: Quiz }) => {
    const status = getQuizStatus(quiz);
    const isClosed = quiz.timeclose && quiz.timeclose <= now;

    return (
      <Card 
        className="hover-elevate cursor-pointer" 
        data-testid={`quiz-${quiz.id}`}
        onClick={() => setSelectedQuiz(quiz)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-3 flex-1">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                isClosed ? "bg-muted" : "bg-primary/10"
              }`}>
                <FileQuestion className={`h-5 w-5 ${isClosed ? "text-muted-foreground" : "text-primary"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate" data-testid="text-quiz-name">
                  {quiz.name}
                </h3>
                <p className="text-sm text-muted-foreground truncate">
                  {courseMap.get(quiz.courseId) || "Course"}
                </p>
                {quiz.intro && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {quiz.intro.replace(/<[^>]*>/g, "")}
                  </p>
                )}
                <div className="flex flex-wrap gap-3 mt-3 text-xs text-muted-foreground">
                  {quiz.timelimit > 0 && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDuration(quiz.timelimit)}
                    </span>
                  )}
                  {quiz.grade > 0 && (
                    <span>Max: {quiz.grade} points</span>
                  )}
                  {quiz.attempts > 0 && (
                    <span>{quiz.attempts} attempt{quiz.attempts > 1 ? "s" : ""} allowed</span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right flex-shrink-0 space-y-2">
              <Badge variant={status.variant}>{status.text}</Badge>
              {quiz.timeclose && (
                <p className="text-xs text-muted-foreground">
                  Closes: {formatDate(quiz.timeclose)}
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
        <h1 className="text-2xl font-bold">Quizzes</h1>
        <p className="text-muted-foreground mt-1">
          View and take quizzes from your courses
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
                  <Skeleton className="h-6 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : quizzes && quizzes.length > 0 ? (
        <Tabs defaultValue="available">
          <TabsList className="mb-4">
            <TabsTrigger value="available" data-testid="tab-available">
              Available ({availableQuizzes.length})
            </TabsTrigger>
            <TabsTrigger value="upcoming" data-testid="tab-upcoming">
              Upcoming ({upcomingQuizzes.length})
            </TabsTrigger>
            <TabsTrigger value="closed" data-testid="tab-closed">
              Closed ({closedQuizzes.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="available">
            {availableQuizzes.length > 0 ? (
              <div className="space-y-4">
                {availableQuizzes.map((quiz) => (
                  <QuizCard key={quiz.id} quiz={quiz} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileQuestion className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">No available quizzes</h3>
                  <p className="text-sm text-muted-foreground">
                    Check back later for new quizzes.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="upcoming">
            {upcomingQuizzes.length > 0 ? (
              <div className="space-y-4">
                {upcomingQuizzes
                  .sort((a, b) => a.timeopen - b.timeopen)
                  .map((quiz) => (
                    <QuizCard key={quiz.id} quiz={quiz} />
                  ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">No upcoming quizzes</h3>
                  <p className="text-sm text-muted-foreground">
                    No quizzes scheduled to open soon.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="closed">
            {closedQuizzes.length > 0 ? (
              <div className="space-y-4">
                {closedQuizzes
                  .sort((a, b) => b.timeclose - a.timeclose)
                  .map((quiz) => (
                    <QuizCard key={quiz.id} quiz={quiz} />
                  ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">No closed quizzes</h3>
                  <p className="text-sm text-muted-foreground">
                    Closed quizzes will appear here.
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
              <FileQuestion className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-2">No quizzes</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Quizzes from your enrolled courses will appear here.
            </p>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!selectedQuiz} onOpenChange={(open) => !open && setSelectedQuiz(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="dialog-quiz-viewer">
          <DialogHeader>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <DialogTitle className="text-lg">{selectedQuiz?.name}</DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">Quiz</Badge>
                  {selectedQuiz && courseMap.get(selectedQuiz.courseId) && (
                    <span className="text-sm text-muted-foreground">
                      {courseMap.get(selectedQuiz.courseId)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </DialogHeader>
          {selectedQuiz && (
            <QuizViewer cmid={selectedQuiz.id} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
