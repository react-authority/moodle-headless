import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, FileText, AlertCircle, ExternalLink, CheckCircle, Clock, Download } from "lucide-react";

interface AssignmentInfo {
  id: string;
  cmid: string;
  name: string;
  intro: string;
  dueDate: number | null;
  cutoffDate: number | null;
  maxGrade: number;
  submissionStatus: string;
  gradeStatus: string | null;
  grade: string | null;
  feedback: string | null;
  submittedFiles: { filename: string; fileurl: string; filesize: number }[];
  submittedText: string | null;
}

interface AssignmentViewerProps {
  cmid: string;
  activityUrl?: string;
}

export function AssignmentViewer({ cmid, activityUrl }: AssignmentViewerProps) {
  const { data: assignment, isLoading } = useQuery<AssignmentInfo>({
    queryKey: ["/api/assignment", cmid],
    queryFn: async () => {
      const res = await fetch(`/api/assignment/${cmid}`);
      if (!res.ok) throw new Error("Failed to fetch assignment");
      return res.json();
    },
  });

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString(undefined, {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "submitted":
        return <Badge className="bg-green-500">Submitted</Badge>;
      case "draft":
        return <Badge variant="secondary">Draft</Badge>;
      case "new":
      case "nosubmission":
        return <Badge variant="outline">Not Submitted</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleOpenExternal = () => {
    if (activityUrl) {
      window.open(activityUrl, "_blank", "noopener,noreferrer");
    }
  };

  const isOverdue = assignment?.dueDate && assignment.dueDate * 1000 < Date.now() && assignment.submissionStatus !== "submitted";

  if (isLoading) {
    return (
      <div className="space-y-4 py-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-10 w-32" />
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="font-semibold mb-2">Assignment Not Available</h3>
        <p className="text-muted-foreground mb-4">
          Unable to load assignment information from Moodle.
        </p>
        {activityUrl && (
          <Button onClick={handleOpenExternal} data-testid="button-open-assign-external">
            <ExternalLink className="mr-2 h-4 w-4" />
            Open in Moodle
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="py-4 space-y-6">
      {assignment.intro && (
        <div 
          className="prose prose-sm dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: assignment.intro }}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {assignment.dueDate && (
          <Card className={isOverdue ? "border-destructive" : ""}>
            <CardContent className="py-4 flex items-center gap-3">
              <Calendar className={`h-8 w-8 ${isOverdue ? "text-destructive" : "text-primary"}`} />
              <div>
                <div className="text-sm text-muted-foreground">Due Date</div>
                <div className={`font-medium ${isOverdue ? "text-destructive" : ""}`}>
                  {formatDate(assignment.dueDate)}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="py-4 flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            <div>
              <div className="text-sm text-muted-foreground">Max Grade</div>
              <div className="font-medium">{assignment.maxGrade} points</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4 flex items-center gap-3">
            {assignment.submissionStatus === "submitted" ? (
              <CheckCircle className="h-8 w-8 text-green-500" />
            ) : (
              <Clock className="h-8 w-8 text-muted-foreground" />
            )}
            <div>
              <div className="text-sm text-muted-foreground">Status</div>
              <div>{getStatusBadge(assignment.submissionStatus)}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {assignment.grade && (
        <Card className="border-green-500">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Your Grade</div>
                <div className="text-2xl font-bold text-green-500">{assignment.grade}</div>
              </div>
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
          </CardContent>
        </Card>
      )}

      {assignment.submittedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Submitted Files</h4>
          {assignment.submittedFiles.map((file, index) => (
            <a
              key={index}
              href={file.fileurl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-lg border hover-elevate"
              data-testid={`assignment-file-${index}`}
            >
              <Download className="h-4 w-4 text-primary" />
              <div className="flex-1">
                <div className="font-medium">{file.filename}</div>
                <div className="text-xs text-muted-foreground">{formatFileSize(file.filesize)}</div>
              </div>
            </a>
          ))}
        </div>
      )}

      {assignment.submittedText && (
        <div className="space-y-2">
          <h4 className="font-medium">Submitted Text</h4>
          <Card>
            <CardContent className="py-4">
              <div 
                className="prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: assignment.submittedText }}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {assignment.submissionStatus !== "submitted" && (
        <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            To submit your work, please use Moodle directly where you can upload files or enter your submission.
          </p>
        </div>
      )}

      <div className="flex justify-center pt-4">
        {activityUrl && (
          <Button onClick={handleOpenExternal} data-testid="button-submit-assignment">
            <ExternalLink className="mr-2 h-4 w-4" />
            {assignment.submissionStatus === "submitted" ? "View in Moodle" : "Submit in Moodle"}
          </Button>
        )}
      </div>
    </div>
  );
}
