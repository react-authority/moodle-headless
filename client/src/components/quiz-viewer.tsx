import { useState, useRef, useCallback, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Play, CheckCircle, AlertCircle, FileText, Save, ChevronLeft, ChevronRight, Trophy } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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

interface QuizQuestion {
  slot: number;
  type: string;
  html: string;
  number: number;
  state: string;
  flagged: boolean;
}

interface QuizAttemptData {
  attemptId: string;
  state: string;
  currentPage: number;
  questions: QuizQuestion[];
}

interface QuizReview {
  grade?: number;
  questions: { slot: number; html: string; mark: string; maxmark: number; state: string }[];
}

interface QuizViewerProps {
  cmid: string;
  activityUrl?: string;
}

export function QuizViewer({ cmid, activityUrl }: QuizViewerProps) {
  const [activeAttemptId, setActiveAttemptId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [showReview, setShowReview] = useState<string | null>(null);
  const questionsRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

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

  const { data: attemptData, isLoading: loadingAttemptData, refetch: refetchAttempt } = useQuery<QuizAttemptData>({
    queryKey: ["/api/quiz/attempt", activeAttemptId, currentPage],
    queryFn: async () => {
      const res = await fetch(`/api/quiz/attempt/${activeAttemptId}?page=${currentPage}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: !!activeAttemptId && !showReview,
  });

  const { data: reviewData, isLoading: loadingReview } = useQuery<QuizReview>({
    queryKey: ["/api/quiz/attempt", showReview, "review"],
    queryFn: async () => {
      const res = await fetch(`/api/quiz/attempt/${showReview}/review`);
      if (!res.ok) throw new Error("Failed to fetch review");
      return res.json();
    },
    enabled: !!showReview,
  });

  const extractAnswers = useCallback(() => {
    if (!questionsRef.current) return [];
    
    const answers: { slot: number; name: string; value: string }[] = [];
    const container = questionsRef.current;
    
    const inputs = container.querySelectorAll('input[type="text"], input[type="radio"]:checked, input[type="checkbox"]:checked, textarea, select');
    inputs.forEach((input: Element) => {
      const el = input as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      const name = el.name;
      if (name) {
        const slotMatch = name.match(/q\d+:(\d+)/);
        const slot = slotMatch ? parseInt(slotMatch[1]) : 0;
        answers.push({ slot, name, value: el.value });
      }
    });
    
    return answers;
  }, []);

  const startAttemptMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/quiz/${quizInfo?.id}/start`);
      return res.json();
    },
    onSuccess: (data) => {
      setActiveAttemptId(data.attemptId);
      setCurrentPage(0);
      setShowReview(null);
      queryClient.invalidateQueries({ queryKey: ["/api/quiz", quizInfo?.id, "attempts"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start quiz attempt. Please try again.",
        variant: "destructive",
      });
    },
  });

  const saveAnswersMutation = useMutation({
    mutationFn: async () => {
      const answers = extractAnswers();
      const res = await apiRequest("POST", `/api/quiz/attempt/${activeAttemptId}/save`, { data: answers });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Saved",
        description: "Your answers have been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save answers. Please try again.",
        variant: "destructive",
      });
    },
  });

  const finishAttemptMutation = useMutation({
    mutationFn: async () => {
      const answers = extractAnswers();
      if (answers.length > 0) {
        await apiRequest("POST", `/api/quiz/attempt/${activeAttemptId}/save`, { data: answers });
      }
      const res = await apiRequest("POST", `/api/quiz/attempt/${activeAttemptId}/finish`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Quiz Completed",
        description: "Your quiz has been submitted successfully!",
      });
      setShowReview(activeAttemptId);
      setActiveAttemptId(null);
      queryClient.invalidateQueries({ queryKey: ["/api/quiz", quizInfo?.id, "attempts"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to finish quiz. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handlePageChange = async (newPage: number) => {
    await saveAnswersMutation.mutateAsync();
    setCurrentPage(newPage);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins} minutes`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
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
      </div>
    );
  }

  if (showReview && reviewData) {
    return (
      <div className="py-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Quiz Review</h3>
          {reviewData.grade !== undefined && (
            <Badge variant="default" className="text-lg px-3 py-1">
              <Trophy className="mr-2 h-4 w-4" />
              Score: {reviewData.grade} / {quizInfo.maxGrade}
            </Badge>
          )}
        </div>

        <div className="space-y-4">
          {reviewData.questions.map((q, idx) => (
            <Card key={idx} data-testid={`quiz-review-question-${idx}`}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={q.state === "gradedright" ? "default" : q.state === "gradedwrong" ? "destructive" : "secondary"}>
                    {q.mark} / {q.maxmark}
                  </Badge>
                  <span className="text-sm text-muted-foreground capitalize">{q.state.replace("graded", "")}</span>
                </div>
                <div 
                  className="prose prose-sm dark:prose-invert max-w-none [&_input]:pointer-events-none [&_select]:pointer-events-none [&_textarea]:pointer-events-none"
                  dangerouslySetInnerHTML={{ __html: q.html }}
                />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-center pt-4 border-t">
          <Button 
            variant="outline"
            onClick={() => setShowReview(null)}
            data-testid="button-back-to-quiz"
          >
            Back to Quiz Info
          </Button>
        </div>
      </div>
    );
  }

  if (activeAttemptId && attemptData) {
    const isSaving = saveAnswersMutation.isPending;
    const isFinishing = finishAttemptMutation.isPending;

    return (
      <div className="py-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">{quizInfo.name}</h3>
          <div className="flex items-center gap-2">
            {quizInfo.timeLimit > 0 && (
              <Badge variant="secondary">
                <Clock className="mr-1 h-3 w-3" />
                {formatTime(quizInfo.timeLimit)}
              </Badge>
            )}
            <Badge variant="outline">
              Page {currentPage + 1}
            </Badge>
          </div>
        </div>
        
        <div ref={questionsRef} className="space-y-4">
          {loadingAttemptData ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : (
            attemptData.questions?.map((q, idx) => (
              <Card key={q.slot} data-testid={`quiz-question-${idx}`}>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline">Question {q.number || idx + 1}</Badge>
                    {q.flagged && <Badge variant="secondary">Flagged</Badge>}
                  </div>
                  <div 
                    className="prose prose-sm dark:prose-invert max-w-none quiz-question-content [&_input[type='text']]:bg-background [&_input[type='text']]:border [&_input[type='text']]:rounded-md [&_input[type='text']]:px-3 [&_input[type='text']]:py-2 [&_textarea]:bg-background [&_textarea]:border [&_textarea]:rounded-md [&_textarea]:p-3 [&_select]:bg-background [&_select]:border [&_select]:rounded-md [&_select]:px-3 [&_select]:py-2"
                    dangerouslySetInnerHTML={{ __html: q.html }}
                  />
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="flex flex-col gap-3 pt-4 border-t">
          <div className="flex justify-between items-center">
            <Button 
              variant="outline"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0 || isSaving}
              data-testid="button-prev-page"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Previous
            </Button>

            <Button 
              variant="secondary"
              onClick={() => saveAnswersMutation.mutate()}
              disabled={isSaving}
              data-testid="button-save-answers"
            >
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Saving..." : "Save Answers"}
            </Button>

            <Button 
              variant="outline"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={isSaving}
              data-testid="button-next-page"
            >
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>

          <div className="flex justify-center gap-3">
            <Button 
              variant="outline"
              onClick={() => {
                setActiveAttemptId(null);
                setCurrentPage(0);
              }}
              disabled={isSaving || isFinishing}
              data-testid="button-back-to-info"
            >
              Back to Quiz Info
            </Button>
            <Button 
              onClick={() => finishAttemptMutation.mutate()}
              disabled={isSaving || isFinishing}
              data-testid="button-finish-quiz"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              {isFinishing ? "Submitting..." : "Finish Quiz"}
            </Button>
          </div>
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
          <h4 className="font-medium">Your Attempts</h4>
          {attempts.map((attempt) => (
            <Card key={attempt.id} className="hover-elevate cursor-pointer" data-testid={`quiz-attempt-${attempt.id}`}>
              <CardContent 
                className="py-3 flex items-center justify-between"
                onClick={() => {
                  if (attempt.state === "finished") {
                    setShowReview(attempt.id);
                  } else {
                    setActiveAttemptId(attempt.id);
                  }
                }}
              >
                <div>
                  <span className="font-medium">Attempt {attempt.attempt}</span>
                  <span className="text-sm text-muted-foreground ml-2">
                    {formatDate(attempt.timestart)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {attempt.grade !== undefined && attempt.state === "finished" && (
                    <Badge variant="secondary">{attempt.grade} / {quizInfo.maxGrade}</Badge>
                  )}
                  <Badge variant={attempt.state === "finished" ? "default" : "secondary"}>
                    {attempt.state === "finished" ? "Completed" : "In Progress"}
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
            {startAttemptMutation.isPending ? "Starting..." : attempts.length > 0 ? "Start New Attempt" : "Start Quiz"}
          </Button>
        )}
      </div>
    </div>
  );
}
