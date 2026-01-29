import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Play, CheckCircle, AlertCircle, FileText, ExternalLink } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface QuizInfo {
  id: string;
  name: string;
  intro: string;
  timeOpen: number | null;
  timeClose: number | null;
  timeLimit: number;
  maxGrade: number;
  attemptsAllowed: number;
  questionsCount: number;
}

interface QuizAttempt {
  id: string;
  attempt: number;
  state: string;
  grade?: number;
  timestart: number;
  timefinish: number;
}

interface QuizViewerProps {
  cmid: string;
  activityUrl?: string;
}

export function QuizViewer({ cmid, activityUrl }: QuizViewerProps) {
  const [activeAttemptId, setActiveAttemptId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const { data: quizInfo, isLoading: loadingInfo } = useQuery<QuizInfo>({
    queryKey: ["/api/quiz", cmid],
    queryFn: async () => {
      const res = await fetch(`/api/quiz/${cmid}`);
      if (!res.ok) throw new Error("Failed to fetch quiz");
      return res.json();
    },
  });

  const { data: attemptsData, isLoading: loadingAttempts } = useQuery<{ attempts: QuizAttempt[] }>({
    queryKey: ["/api/quiz", quizInfo?.id, "attempts"],
    queryFn: async () => {
      const res = await fetch(`/api/quiz/${quizInfo?.id}/attempts`);
      if (!res.ok) throw new Error("Failed to fetch attempts");
      return res.json();
    },
    enabled: !!quizInfo?.id,
  });

  const { data: attemptData, isLoading: loadingAttemptData } = useQuery({
    queryKey: ["/api/quiz/attempt", activeAttemptId, currentPage],
    queryFn: async () => {
      const res = await fetch(`/api/quiz/attempt/${activeAttemptId}?page=${currentPage}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: !!activeAttemptId,
  });

  const startAttemptMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/quiz/${quizInfo?.id}/start`);
      return res.json();
    },
    onSuccess: (data) => {
      setActiveAttemptId(data.attemptId);
      queryClient.invalidateQueries({ queryKey: ["/api/quiz", quizInfo?.id, "attempts"] });
    },
  });

  const finishAttemptMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/quiz/attempt/${activeAttemptId}/finish`);
      return res.json();
    },
    onSuccess: () => {
      setActiveAttemptId(null);
      queryClient.invalidateQueries({ queryKey: ["/api/quiz", quizInfo?.id, "attempts"] });
    },
  });

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins} minutes`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const handleOpenExternal = () => {
    if (activityUrl) {
      window.open(activityUrl, "_blank", "noopener,noreferrer");
    }
  };

  if (loadingInfo) {
    return (
      <div className="space-y-4 py-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-10 w-32" />
      </div>
    );
  }

  if (!quizInfo) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="font-semibold mb-2">Quiz Not Available</h3>
        <p className="text-muted-foreground mb-4">
          Unable to load quiz information from Moodle.
        </p>
        {activityUrl && (
          <Button onClick={handleOpenExternal} data-testid="button-open-quiz-external">
            <ExternalLink className="mr-2 h-4 w-4" />
            Open in Moodle
          </Button>
        )}
      </div>
    );
  }

  if (activeAttemptId && attemptData) {
    return (
      <div className="py-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Quiz Preview</h3>
          <Badge variant="secondary">
            Page {currentPage + 1}
          </Badge>
        </div>
        
        <div className="p-4 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800 mb-4">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            This is a preview of the quiz questions. To answer and submit your responses, please complete the quiz in Moodle.
          </p>
        </div>
        
        <div className="space-y-4">
          {attemptData.questions?.map((q: any, idx: number) => (
            <Card key={idx} data-testid={`quiz-question-${idx}`}>
              <CardContent className="pt-4">
                <div 
                  className="prose prose-sm dark:prose-invert max-w-none [&_input]:pointer-events-none [&_select]:pointer-events-none"
                  dangerouslySetInnerHTML={{ __html: q.html }}
                />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-center gap-3 pt-4 border-t">
          <Button 
            variant="outline"
            onClick={() => setActiveAttemptId(null)}
            data-testid="button-back-to-info"
          >
            Back to Quiz Info
          </Button>
          {activityUrl && (
            <Button onClick={handleOpenExternal} data-testid="button-complete-in-moodle">
              <ExternalLink className="mr-2 h-4 w-4" />
              Complete in Moodle
            </Button>
          )}
        </div>
      </div>
    );
  }

  const attempts = attemptsData?.attempts || [];
  const canStartNewAttempt = quizInfo.attemptsAllowed === 0 || attempts.length < quizInfo.attemptsAllowed;

  return (
    <div className="py-4 space-y-6">
      {quizInfo.intro && (
        <div 
          className="prose prose-sm dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: quizInfo.intro }}
        />
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-muted rounded-lg">
          <FileText className="h-5 w-5 mx-auto mb-1 text-primary" />
          <div className="text-lg font-semibold">{quizInfo.questionsCount || "?"}</div>
          <div className="text-xs text-muted-foreground">Questions</div>
        </div>
        {quizInfo.timeLimit > 0 && (
          <div className="text-center p-3 bg-muted rounded-lg">
            <Clock className="h-5 w-5 mx-auto mb-1 text-primary" />
            <div className="text-lg font-semibold">{formatTime(quizInfo.timeLimit)}</div>
            <div className="text-xs text-muted-foreground">Time Limit</div>
          </div>
        )}
        <div className="text-center p-3 bg-muted rounded-lg">
          <div className="text-lg font-semibold">{quizInfo.maxGrade}</div>
          <div className="text-xs text-muted-foreground">Max Grade</div>
        </div>
        <div className="text-center p-3 bg-muted rounded-lg">
          <div className="text-lg font-semibold">
            {quizInfo.attemptsAllowed === 0 ? "Unlimited" : quizInfo.attemptsAllowed}
          </div>
          <div className="text-xs text-muted-foreground">Attempts Allowed</div>
        </div>
      </div>

      {attempts.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Previous Attempts</h4>
          {attempts.map((attempt) => (
            <Card key={attempt.id} data-testid={`quiz-attempt-${attempt.id}`}>
              <CardContent className="py-3 flex items-center justify-between">
                <div>
                  <span className="font-medium">Attempt {attempt.attempt}</span>
                  <span className="text-sm text-muted-foreground ml-2">
                    {formatDate(attempt.timestart)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {attempt.grade !== undefined && (
                    <Badge variant="secondary">{attempt.grade} / {quizInfo.maxGrade}</Badge>
                  )}
                  <Badge variant={attempt.state === "finished" ? "default" : "secondary"}>
                    {attempt.state}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex gap-3 justify-center">
        {canStartNewAttempt && (
          <Button 
            onClick={() => startAttemptMutation.mutate()}
            disabled={startAttemptMutation.isPending}
            data-testid="button-start-quiz"
          >
            <Play className="mr-2 h-4 w-4" />
            {attempts.length > 0 ? "Start New Attempt" : "Start Quiz"}
          </Button>
        )}
        {activityUrl && (
          <Button variant="outline" onClick={handleOpenExternal} data-testid="button-open-quiz-moodle">
            <ExternalLink className="mr-2 h-4 w-4" />
            Open in Moodle
          </Button>
        )}
      </div>
    </div>
  );
}
