import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MessageSquare, Users, ChevronRight, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Forum {
  id: string;
  courseId: string;
  name: string;
  intro: string;
  type: string;
  numdiscussions: number;
}

interface Discussion {
  id: string;
  name: string;
  subject: string;
  message: string;
  userfullname: string;
  created: number;
  modified: number;
  numreplies: number;
  pinned: boolean;
}

interface Course {
  id: string;
  fullname: string;
}

export default function Forums() {
  const [selectedForum, setSelectedForum] = useState<Forum | null>(null);

  const { data: forums, isLoading: forumsLoading } = useQuery<Forum[]>({
    queryKey: ["/api/forums"],
  });

  const { data: discussions, isLoading: discussionsLoading } = useQuery<Discussion[]>({
    queryKey: ["/api/forums", selectedForum?.id, "discussions"],
    enabled: !!selectedForum,
  });

  const { data: courses } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const courseMap = new Map((courses || []).map((c) => [c.id, c.fullname]));

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffHours < 48) return "Yesterday";
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (selectedForum) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedForum(null)}
            data-testid="button-back"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Forums
          </Button>
        </div>

        <div>
          <h1 className="text-2xl font-bold">{selectedForum.name}</h1>
          <p className="text-muted-foreground mt-1">
            {courseMap.get(selectedForum.courseId) || "Course"}
          </p>
          {selectedForum.intro && (
            <p className="text-sm text-muted-foreground mt-2">
              {selectedForum.intro.replace(/<[^>]*>/g, "")}
            </p>
          )}
        </div>

        {discussionsLoading ? (
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
        ) : discussions && discussions.length > 0 ? (
          <div className="space-y-4">
            {discussions.map((discussion) => (
              <Card
                key={discussion.id}
                className="hover-elevate"
                data-testid={`discussion-${discussion.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {getInitials(discussion.userfullname)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {discussion.pinned && (
                              <Badge variant="secondary" className="text-xs">Pinned</Badge>
                            )}
                            <h3 className="font-medium truncate" data-testid="text-discussion-subject">
                              {discussion.subject || discussion.name}
                            </h3>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {discussion.message.replace(/<[^>]*>/g, "")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <span>{discussion.userfullname}</span>
                        <span>{formatDate(discussion.created)}</span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {discussion.numreplies} repl{discussion.numreplies === 1 ? "y" : "ies"}
                        </span>
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
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No discussions yet</h3>
              <p className="text-sm text-muted-foreground">
                Be the first to start a discussion in this forum.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Forums</h1>
        <p className="text-muted-foreground mt-1">
          Participate in course discussions
        </p>
      </div>

      {forumsLoading ? (
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
      ) : forums && forums.length > 0 ? (
        <div className="space-y-4">
          {forums.map((forum) => (
            <Card
              key={forum.id}
              className="hover-elevate cursor-pointer"
              onClick={() => setSelectedForum(forum)}
              data-testid={`forum-${forum.id}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate" data-testid="text-forum-name">
                      {forum.name}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {courseMap.get(forum.courseId) || "Course"}
                    </p>
                    {forum.intro && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                        {forum.intro.replace(/<[^>]*>/g, "")}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Badge variant="secondary">
                      {forum.numdiscussions} discussion{forum.numdiscussions !== 1 ? "s" : ""}
                    </Badge>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
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
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-2">No forums</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Forums from your enrolled courses will appear here.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
