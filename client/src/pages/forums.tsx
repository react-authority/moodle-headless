import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MessageSquare, ChevronRight, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ForumViewer } from "@/components/forum-viewer";

interface Forum {
  id: string;
  courseId: string;
  name: string;
  intro: string;
  type: string;
  numdiscussions: number;
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

  const { data: courses } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const courseMap = new Map((courses || []).map((c) => [c.id, c.fullname]));

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

      <Dialog open={!!selectedForum} onOpenChange={(open) => !open && setSelectedForum(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="dialog-forum-viewer">
          <DialogHeader>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <DialogTitle className="text-lg">{selectedForum?.name}</DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">Forum</Badge>
                  {selectedForum && courseMap.get(selectedForum.courseId) && (
                    <span className="text-sm text-muted-foreground">
                      {courseMap.get(selectedForum.courseId)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </DialogHeader>
          {selectedForum && (
            <ForumViewer cmid={selectedForum.id} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
