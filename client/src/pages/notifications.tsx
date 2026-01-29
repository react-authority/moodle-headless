import { useQuery } from "@tanstack/react-query";
import { Bell, CheckCircle2, ExternalLink, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface Notification {
  id: string;
  subject: string;
  text: string;
  timecreated: number;
  read: boolean;
  component: string;
  contexturl: string;
  userfromfullname: string;
}

export default function Notifications() {
  const { data: notifications, isLoading } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
  });

  const { data: countData } = useQuery<{ count: number }>({
    queryKey: ["/api/notifications/count"],
  });

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffHours < 1) {
      return "Just now";
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    } else if (diffHours < 48) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      });
    }
  };

  const getComponentIcon = (component: string) => {
    if (component.includes("assign")) return "assignment";
    if (component.includes("quiz")) return "quiz";
    if (component.includes("forum")) return "forum";
    if (component.includes("grade")) return "grade";
    return "notification";
  };

  const unreadCount = countData?.count || 0;
  const sortedNotifications = [...(notifications || [])].sort((a, b) => b.timecreated - a.timecreated);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            Stay updated with your course activities
          </p>
        </div>
        {unreadCount > 0 && (
          <Badge variant="default" data-testid="badge-unread-count">
            {unreadCount} unread
          </Badge>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : sortedNotifications.length > 0 ? (
        <div className="space-y-4">
          {sortedNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={notification.read ? "opacity-75" : ""}
              data-testid={`notification-${notification.id}`}
            >
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate" data-testid="text-notification-subject">
                          {notification.subject}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {notification.text.replace(/<[^>]*>/g, "")}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="text-xs text-muted-foreground">
                        {formatDate(notification.timecreated)}
                      </span>
                      {notification.userfromfullname && (
                        <span className="text-xs text-muted-foreground">
                          from {notification.userfromfullname}
                        </span>
                      )}
                      {notification.contexturl && (
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 text-xs"
                          asChild
                        >
                          <a
                            href={notification.contexturl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View <ExternalLink className="ml-1 h-3 w-3" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Bell className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-2">No notifications</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              You're all caught up! New notifications from your courses will appear here.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
