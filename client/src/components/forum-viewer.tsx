import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { MessageSquare, Plus, ArrowLeft, AlertCircle, ExternalLink, Send, Pin } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface ForumInfo {
  id: string;
  cmid: string;
  name: string;
  intro: string;
  type: string;
}

interface ForumDiscussion {
  id: string;
  name: string;
  authorName: string;
  authorAvatar: string;
  message: string;
  timeModified: number;
  numReplies: number;
  numUnread: number;
  pinned: boolean;
  locked: boolean;
}

interface ForumPost {
  id: string;
  discussionId: string;
  parentId: string | null;
  authorName: string;
  authorAvatar: string;
  subject: string;
  message: string;
  created: number;
  modified: number;
  canReply: boolean;
}

interface ForumViewerProps {
  cmid: string;
  activityUrl?: string;
}

export function ForumViewer({ cmid, activityUrl }: ForumViewerProps) {
  const [selectedDiscussion, setSelectedDiscussion] = useState<ForumDiscussion | null>(null);
  const [showNewDiscussion, setShowNewDiscussion] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [replyTo, setReplyTo] = useState<ForumPost | null>(null);
  const [replyMessage, setReplyMessage] = useState("");

  const { data: forumInfo, isLoading: loadingInfo } = useQuery<ForumInfo>({
    queryKey: ["/api/forum", cmid],
    queryFn: async () => {
      const res = await fetch(`/api/forum/${cmid}`);
      if (!res.ok) throw new Error("Failed to fetch forum");
      return res.json();
    },
  });

  const { data: discussions, isLoading: loadingDiscussions } = useQuery<ForumDiscussion[]>({
    queryKey: ["/api/forum", forumInfo?.id, "discussions"],
    queryFn: async () => {
      const res = await fetch(`/api/forum/${forumInfo?.id}/discussions`);
      if (!res.ok) throw new Error("Failed to fetch discussions");
      return res.json();
    },
    enabled: !!forumInfo?.id,
  });

  const { data: posts, isLoading: loadingPosts } = useQuery<ForumPost[]>({
    queryKey: ["/api/forum/discussion", selectedDiscussion?.id, "posts"],
    queryFn: async () => {
      const res = await fetch(`/api/forum/discussion/${selectedDiscussion?.id}/posts`);
      if (!res.ok) throw new Error("Failed to fetch posts");
      return res.json();
    },
    enabled: !!selectedDiscussion?.id,
  });

  const addDiscussionMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/forum/${forumInfo?.id}/discussions`, {
        subject: newSubject,
        message: newMessage,
      });
      return res.json();
    },
    onSuccess: () => {
      setShowNewDiscussion(false);
      setNewSubject("");
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/forum", forumInfo?.id, "discussions"] });
    },
  });

  const addReplyMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/forum/discussion/${selectedDiscussion?.id}/posts`, {
        parentId: replyTo?.id,
        subject: `Re: ${replyTo?.subject}`,
        message: replyMessage,
      });
      return res.json();
    },
    onSuccess: () => {
      setReplyTo(null);
      setReplyMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/forum/discussion", selectedDiscussion?.id, "posts"] });
    },
  });

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return "just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    
    return date.toLocaleDateString();
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
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
      </div>
    );
  }

  if (!forumInfo) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="font-semibold mb-2">Forum Not Available</h3>
        <p className="text-muted-foreground mb-4">
          Unable to load forum information from Moodle.
        </p>
        {activityUrl && (
          <Button onClick={handleOpenExternal} data-testid="button-open-forum-external">
            <ExternalLink className="mr-2 h-4 w-4" />
            Open in Moodle
          </Button>
        )}
      </div>
    );
  }

  if (showNewDiscussion) {
    return (
      <div className="py-4 space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setShowNewDiscussion(false)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h3 className="font-semibold">New Discussion</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Subject</label>
            <Input
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              placeholder="Enter discussion subject..."
              data-testid="input-discussion-subject"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Message</label>
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Write your message..."
              className="min-h-32"
              data-testid="input-discussion-message"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowNewDiscussion(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => addDiscussionMutation.mutate()}
              disabled={!newSubject.trim() || !newMessage.trim() || addDiscussionMutation.isPending}
              data-testid="button-post-discussion"
            >
              <Send className="mr-2 h-4 w-4" />
              Post Discussion
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (selectedDiscussion) {
    return (
      <div className="py-4 space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setSelectedDiscussion(null)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h3 className="font-semibold flex-1 truncate">{selectedDiscussion.name}</h3>
        </div>

        {loadingPosts ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {posts?.map((post) => (
              <Card key={post.id} data-testid={`forum-post-${post.id}`}>
                <CardContent className="py-4">
                  <div className="flex gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={post.authorAvatar} />
                      <AvatarFallback>{getInitials(post.authorName)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">{post.authorName}</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            {formatDate(post.created)}
                          </span>
                        </div>
                        {post.canReply && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setReplyTo(post)}
                            data-testid={`button-reply-${post.id}`}
                          >
                            Reply
                          </Button>
                        )}
                      </div>
                      <div 
                        className="prose prose-sm dark:prose-invert max-w-none mt-2"
                        dangerouslySetInnerHTML={{ __html: post.message }}
                      />
                    </div>
                  </div>

                  {replyTo?.id === post.id && (
                    <div className="mt-4 ml-13 space-y-2">
                      <Textarea
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        placeholder="Write your reply..."
                        className="min-h-20"
                        data-testid="input-reply-message"
                      />
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => setReplyTo(null)}>
                          Cancel
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => addReplyMutation.mutate()}
                          disabled={!replyMessage.trim() || addReplyMutation.isPending}
                          data-testid="button-send-reply"
                        >
                          <Send className="mr-2 h-4 w-4" />
                          Reply
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="py-4 space-y-4">
      {forumInfo.intro && (
        <div 
          className="prose prose-sm dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: forumInfo.intro }}
        />
      )}

      <div className="flex items-center justify-between">
        <h4 className="font-medium">Discussions</h4>
        <Button size="sm" onClick={() => setShowNewDiscussion(true)} data-testid="button-new-discussion">
          <Plus className="mr-2 h-4 w-4" />
          New Discussion
        </Button>
      </div>

      {loadingDiscussions ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : discussions?.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No discussions yet. Start the first one!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {discussions?.map((discussion) => (
            <Card 
              key={discussion.id} 
              className="cursor-pointer hover-elevate"
              onClick={() => setSelectedDiscussion(discussion)}
              data-testid={`forum-discussion-${discussion.id}`}
            >
              <CardContent className="py-3">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={discussion.authorAvatar} />
                    <AvatarFallback>{getInitials(discussion.authorName)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {discussion.pinned && (
                        <Pin className="h-3 w-3 text-primary" />
                      )}
                      <span className="font-medium truncate">{discussion.name}</span>
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <span>{discussion.authorName}</span>
                      <span>•</span>
                      <span>{formatDate(discussion.timeModified)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      {discussion.numReplies}
                    </Badge>
                    {discussion.numUnread > 0 && (
                      <Badge className="bg-primary text-xs">
                        {discussion.numUnread} new
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activityUrl && (
        <div className="flex justify-center pt-4">
          <Button variant="outline" onClick={handleOpenExternal} data-testid="button-open-forum-moodle">
            <ExternalLink className="mr-2 h-4 w-4" />
            Open in Moodle
          </Button>
        </div>
      )}
    </div>
  );
}
