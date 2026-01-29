import {
  FileText,
  ClipboardList,
  MessageSquare,
  FileDown,
  Link as LinkIcon,
  BookOpen,
  Video,
  CheckCircle2,
  Circle,
  Clock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Activity, ActivityType } from "@shared/schema";

interface ActivityItemProps {
  activity: Activity;
  showDueDate?: boolean;
}

const activityIcons: Record<ActivityType, typeof FileText> = {
  assign: ClipboardList,
  quiz: FileText,
  forum: MessageSquare,
  resource: FileDown,
  url: LinkIcon,
  page: FileText,
  folder: FileDown,
  label: FileText,
  book: BookOpen,
  lesson: Video,
  workshop: ClipboardList,
  scorm: Video,
  h5pactivity: Video,
  choice: ClipboardList,
  feedback: MessageSquare,
  glossary: BookOpen,
  wiki: BookOpen,
  chat: MessageSquare,
  survey: ClipboardList,
  data: FileText,
  lti: LinkIcon,
};

const activityLabels: Record<ActivityType, string> = {
  assign: "Assignment",
  quiz: "Quiz",
  forum: "Forum",
  resource: "File",
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

export function ActivityItem({ activity, showDueDate = true }: ActivityItemProps) {
  const Icon = activityIcons[activity.modname] || FileText;
  const label = activityLabels[activity.modname] || activity.modname;

  const formatDueDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days < 0) return { text: "Overdue", className: "text-destructive" };
    if (days === 0) return { text: "Due today", className: "text-orange-600 dark:text-orange-400" };
    if (days === 1) return { text: "Due tomorrow", className: "text-orange-600 dark:text-orange-400" };
    if (days <= 7) return { text: `Due in ${days} days`, className: "text-muted-foreground" };
    return { text: date.toLocaleDateString(), className: "text-muted-foreground" };
  };

  const dueInfo = activity.duedate ? formatDueDate(activity.duedate) : null;

  return (
    <Card
      className="hover-elevate cursor-pointer transition-all duration-200 overflow-visible"
      data-testid={`activity-${activity.id}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {activity.completed ? (
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            ) : (
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted">
                <Icon className="h-3 w-3 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h4 className={`font-medium text-sm ${activity.completed ? "line-through text-muted-foreground" : ""}`}>
                  {activity.name}
                </h4>
                {activity.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {activity.description.replace(/<[^>]*>/g, "")}
                  </p>
                )}
              </div>
              <Badge variant="secondary" className="text-xs flex-shrink-0">
                {label}
              </Badge>
            </div>
            {showDueDate && dueInfo && (
              <div className={`flex items-center gap-1 mt-2 text-xs ${dueInfo.className}`}>
                <Clock className="h-3 w-3" />
                <span>{dueInfo.text}</span>
              </div>
            )}
            {activity.grade !== undefined && activity.grademax && (
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <span className="font-medium">
                  Grade: {activity.grade}/{activity.grademax}
                </span>
                <span>({Math.round((activity.grade / activity.grademax) * 100)}%)</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
