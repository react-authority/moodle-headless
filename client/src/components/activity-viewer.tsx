import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ExternalLink,
  FileText,
  BookOpen,
  Link as LinkIcon,
  Download,
  AlertCircle,
} from "lucide-react";
import type { Activity } from "@shared/schema";

interface ActivityViewerProps {
  activity: Activity | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ModuleContent {
  type: string;
  id: string;
  name: string;
  intro: string;
  content?: string;
  files?: { filename: string; fileurl: string; filesize: number; mimetype: string }[];
  externalurl?: string;
}

const supportedModules = ["page", "resource", "url", "label"];
const embeddableModules = ["quiz", "assign", "forum", "book", "choice", "feedback", "lesson", "scorm", "h5pactivity"];

const activityLabels: Record<string, string> = {
  assign: "Assignment",
  quiz: "Quiz",
  forum: "Forum",
  resource: "Resource",
  url: "URL",
  page: "Page",
  folder: "Folder",
  label: "Label",
  book: "Book",
  lesson: "Lesson",
  workshop: "Workshop",
  scorm: "SCORM",
  h5pactivity: "H5P",
  choice: "Choice",
  feedback: "Feedback",
  glossary: "Glossary",
  wiki: "Wiki",
  chat: "Chat",
  survey: "Survey",
  data: "Database",
  lti: "External Tool",
};

export function ActivityViewer({ activity, open, onOpenChange }: ActivityViewerProps) {
  const isSupported = activity ? supportedModules.includes(activity.modname) : false;
  const isEmbeddable = activity ? embeddableModules.includes(activity.modname) : false;

  const { data: content, isLoading, error } = useQuery<ModuleContent>({
    queryKey: ["/api/modules", activity?.id, "content", activity?.modname],
    queryFn: async () => {
      const res = await fetch(`/api/modules/${activity?.id}/content?modname=${activity?.modname}`);
      if (!res.ok) throw new Error("Failed to load content");
      return res.json();
    },
    enabled: open && !!activity && isSupported,
  });

  const getActivityUrl = () => {
    if (activity?.url) return activity.url;
    // Construct fallback URL from module info if available
    return null;
  };

  const handleOpenExternal = () => {
    const url = getActivityUrl();
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const hasExternalUrl = !!getActivityUrl();

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const renderContent = () => {
    if (!activity) return null;

    // For embeddable interactive content, show in iframe
    if (isEmbeddable && hasExternalUrl) {
      return (
        <div className="py-2">
          <div className="relative w-full" style={{ height: "70vh" }}>
            <iframe
              src={activity.url}
              className="w-full h-full border-0 rounded-md"
              title={activity.name}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
              data-testid="iframe-activity-content"
            />
          </div>
          <div className="flex justify-center mt-4">
            <Button variant="outline" onClick={handleOpenExternal} data-testid="button-open-fullscreen">
              <ExternalLink className="mr-2 h-4 w-4" />
              Open in Full Window
            </Button>
          </div>
        </div>
      );
    }

    if (!isSupported && !isEmbeddable) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">Interactive Content</h3>
          <p className="text-muted-foreground mb-4 max-w-md">
            This {activityLabels[activity.modname] || activity.modname} requires interactive features 
            that are best experienced directly in Moodle.
          </p>
          {hasExternalUrl ? (
            <Button onClick={handleOpenExternal} data-testid="button-open-external">
              <ExternalLink className="mr-2 h-4 w-4" />
              Open in Moodle
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">
              Please access this content through Moodle directly.
            </p>
          )}
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="space-y-4 py-4">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-32 w-full" />
        </div>
      );
    }

    if (error || !content) {
      // Show the activity description if available as fallback
      if (activity.description) {
        return (
          <div className="py-4">
            <div 
              className="prose prose-sm dark:prose-invert max-w-none mb-6"
              dangerouslySetInnerHTML={{ __html: activity.description }}
            />
            {hasExternalUrl && (
              <div className="flex justify-center">
                <Button onClick={handleOpenExternal} data-testid="button-open-external-fallback">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Full Content in Moodle
                </Button>
              </div>
            )}
          </div>
        );
      }
      
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">Content Preview</h3>
          <p className="text-muted-foreground mb-4">
            {hasExternalUrl 
              ? "View the full content in Moodle for the best experience."
              : "This content is available in Moodle."
            }
          </p>
          {hasExternalUrl && (
            <Button onClick={handleOpenExternal} data-testid="button-open-external-fallback">
              <ExternalLink className="mr-2 h-4 w-4" />
              Open in Moodle
            </Button>
          )}
        </div>
      );
    }

    switch (content.type) {
      case "page":
      case "label":
        return (
          <div className="py-4">
            {content.intro && (
              <div 
                className="prose prose-sm dark:prose-invert max-w-none mb-4 text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: content.intro }}
              />
            )}
            {content.content && (
              <div 
                className="prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: content.content }}
              />
            )}
            {!content.content && !content.intro && (
              <p className="text-muted-foreground">No content available.</p>
            )}
          </div>
        );

      case "resource":
        return (
          <div className="py-4">
            {content.intro && (
              <div 
                className="prose prose-sm dark:prose-invert max-w-none mb-4"
                dangerouslySetInnerHTML={{ __html: content.intro }}
              />
            )}
            {content.files && content.files.length > 0 ? (
              <div className="space-y-2">
                <h4 className="font-medium text-sm mb-3">Files</h4>
                {content.files.map((file, index) => (
                  <a
                    key={index}
                    href={file.fileurl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-md border hover:bg-muted transition-colors"
                    data-testid={`link-file-${index}`}
                  >
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{file.filename}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.filesize)} - {file.mimetype}
                      </p>
                    </div>
                    <Download className="h-4 w-4 text-muted-foreground" />
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No files available.</p>
            )}
          </div>
        );

      case "url":
        return (
          <div className="py-4">
            {content.intro && (
              <div 
                className="prose prose-sm dark:prose-invert max-w-none mb-4"
                dangerouslySetInnerHTML={{ __html: content.intro }}
              />
            )}
            {content.externalurl && (
              <a
                href={content.externalurl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-md border hover:bg-muted transition-colors"
                data-testid="link-external-url"
              >
                <LinkIcon className="h-5 w-5 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{content.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{content.externalurl}</p>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </a>
            )}
          </div>
        );

      default:
        return (
          <div className="py-4 text-center">
            <p className="text-muted-foreground">Content preview not available.</p>
            <Button onClick={handleOpenExternal} className="mt-4">
              <ExternalLink className="mr-2 h-4 w-4" />
              Open in Moodle
            </Button>
          </div>
        );
    }
  };

  const dialogSize = isEmbeddable ? "max-w-5xl" : "max-w-2xl";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${dialogSize} max-h-[90vh] overflow-y-auto`} data-testid="dialog-activity-viewer">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-lg">{activity?.name}</DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {activity ? activityLabels[activity.modname] || activity.modname : ""}
                </Badge>
                {hasExternalUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={handleOpenExternal}
                    data-testid="button-open-in-moodle"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Open in Moodle
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
