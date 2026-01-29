import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FileQuestion,
  ClipboardList,
  MessageSquare,
  BookOpen,
  FileText,
  Link as LinkIcon,
  Folder,
  PlayCircle,
  GraduationCap,
  List,
  Database,
  PenTool,
  Vote,
  FileEdit,
  Users,
  Layers,
  Search,
  ExternalLink,
  Box,
} from "lucide-react";
import { useLocation } from "wouter";

interface Activity {
  id: string;
  cmid: string;
  courseId: string;
  name: string;
  intro: string;
  modname: string;
}

interface AllActivities {
  quizzes: Activity[];
  assignments: Activity[];
  forums: Activity[];
  lessons: Activity[];
  scorms: Activity[];
  h5pactivities: Activity[];
  wikis: Activity[];
  glossaries: Activity[];
  folders: Activity[];
  choices: Activity[];
  feedbacks: Activity[];
  databases: Activity[];
  workshops: Activity[];
  books: Activity[];
  pages: Activity[];
  resources: Activity[];
  urls: Activity[];
}

const activityTypes = [
  { key: "all", label: "All", icon: Layers },
  { key: "quizzes", label: "Quizzes", icon: FileQuestion },
  { key: "assignments", label: "Assignments", icon: ClipboardList },
  { key: "forums", label: "Forums", icon: MessageSquare },
  { key: "lessons", label: "Lessons", icon: GraduationCap },
  { key: "books", label: "Books", icon: BookOpen },
  { key: "pages", label: "Pages", icon: FileText },
  { key: "resources", label: "Files", icon: Folder },
  { key: "urls", label: "URLs", icon: LinkIcon },
  { key: "scorms", label: "SCORM", icon: PlayCircle },
  { key: "h5pactivities", label: "H5P", icon: Box },
  { key: "wikis", label: "Wikis", icon: FileEdit },
  { key: "glossaries", label: "Glossaries", icon: List },
  { key: "folders", label: "Folders", icon: Folder },
  { key: "choices", label: "Choices", icon: Vote },
  { key: "feedbacks", label: "Feedback", icon: PenTool },
  { key: "databases", label: "Databases", icon: Database },
  { key: "workshops", label: "Workshops", icon: Users },
];

const getActivityIcon = (modname: string) => {
  switch (modname) {
    case "quiz": return FileQuestion;
    case "assign": return ClipboardList;
    case "forum": return MessageSquare;
    case "lesson": return GraduationCap;
    case "book": return BookOpen;
    case "page": return FileText;
    case "resource": return Folder;
    case "url": return LinkIcon;
    case "scorm": return PlayCircle;
    case "h5pactivity": return Box;
    case "wiki": return FileEdit;
    case "glossary": return List;
    case "folder": return Folder;
    case "choice": return Vote;
    case "feedback": return PenTool;
    case "data": return Database;
    case "workshop": return Users;
    default: return FileText;
  }
};

const getActivityColor = (modname: string): string => {
  switch (modname) {
    case "quiz": return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300";
    case "assign": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
    case "forum": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
    case "lesson": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300";
    case "book": return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300";
    case "page": return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300";
    case "resource": return "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300";
    case "url": return "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300";
    case "scorm": return "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300";
    case "h5pactivity": return "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300";
    case "wiki": return "bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-300";
    case "glossary": return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";
    case "folder": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300";
    case "choice": return "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300";
    case "feedback": return "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300";
    case "data": return "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300";
    case "workshop": return "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-300";
    default: return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300";
  }
};

function ActivityCard({ activity, onOpen }: { activity: Activity; onOpen: () => void }) {
  const Icon = getActivityIcon(activity.modname);
  const colorClass = getActivityColor(activity.modname);

  // Strip HTML tags from intro for display
  const cleanIntro = activity.intro?.replace(/<[^>]*>/g, "").trim() || "";

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onOpen}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`p-2 rounded-lg shrink-0 ${colorClass}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-base font-medium truncate">{activity.name}</CardTitle>
              <Badge variant="outline" className="mt-1 text-xs capitalize">
                {activity.modname === "assign" ? "Assignment" : 
                 activity.modname === "data" ? "Database" :
                 activity.modname === "h5pactivity" ? "H5P Activity" :
                 activity.modname}
              </Badge>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="shrink-0" onClick={(e) => { e.stopPropagation(); onOpen(); }}>
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      {cleanIntro && (
        <CardContent className="pt-0">
          <CardDescription className="line-clamp-2">{cleanIntro}</CardDescription>
        </CardContent>
      )}
    </Card>
  );
}

function ActivitySkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-5 w-20" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3 mt-2" />
      </CardContent>
    </Card>
  );
}

export default function Activities() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: activities, isLoading, error } = useQuery<AllActivities>({
    queryKey: ["/api/all-activities"],
  });

  const getAllActivities = (): Activity[] => {
    if (!activities) return [];
    
    return [
      ...activities.quizzes,
      ...activities.assignments,
      ...activities.forums,
      ...activities.lessons,
      ...activities.scorms,
      ...activities.h5pactivities,
      ...activities.wikis,
      ...activities.glossaries,
      ...activities.folders,
      ...activities.choices,
      ...activities.feedbacks,
      ...activities.databases,
      ...activities.workshops,
      ...activities.books,
      ...activities.pages,
      ...activities.resources,
      ...activities.urls,
    ];
  };

  const getFilteredActivities = (): Activity[] => {
    let result: Activity[] = [];
    
    if (activeTab === "all") {
      result = getAllActivities();
    } else if (activities) {
      result = activities[activeTab as keyof AllActivities] || [];
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(query) ||
          a.intro?.toLowerCase().includes(query)
      );
    }

    return result;
  };

  const filteredActivities = getFilteredActivities();

  const handleOpenActivity = (activity: Activity) => {
    // Navigate to appropriate page based on activity type
    switch (activity.modname) {
      case "quiz":
        setLocation(`/quizzes?cmid=${activity.cmid}`);
        break;
      case "assign":
        setLocation(`/assignments?cmid=${activity.cmid}`);
        break;
      case "forum":
        setLocation(`/forums?id=${activity.id}`);
        break;
      default:
        // For other activities, open in a generic activity viewer
        setLocation(`/activity/${activity.modname}/${activity.cmid}`);
    }
  };

  const getCounts = () => {
    if (!activities) return {};
    
    return {
      all: getAllActivities().length,
      quizzes: activities.quizzes.length,
      assignments: activities.assignments.length,
      forums: activities.forums.length,
      lessons: activities.lessons.length,
      scorms: activities.scorms.length,
      h5pactivities: activities.h5pactivities.length,
      wikis: activities.wikis.length,
      glossaries: activities.glossaries.length,
      folders: activities.folders.length,
      choices: activities.choices.length,
      feedbacks: activities.feedbacks.length,
      databases: activities.databases.length,
      workshops: activities.workshops.length,
      books: activities.books.length,
      pages: activities.pages.length,
      resources: activities.resources.length,
      urls: activities.urls.length,
    };
  };

  const counts = getCounts();

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Activities</CardTitle>
            <CardDescription>
              There was a problem loading activities. Please try again later.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Activities</h1>
          <p className="text-muted-foreground">
            Browse and access all course activities in one place
          </p>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search activities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <ScrollArea className="w-full whitespace-nowrap pb-2">
          <TabsList className="inline-flex w-auto">
            {activityTypes.map(({ key, label, icon: Icon }) => (
              <TabsTrigger key={key} value={key} className="gap-2">
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
                {counts[key as keyof typeof counts] !== undefined && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {counts[key as keyof typeof counts] || 0}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </ScrollArea>

        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <ActivitySkeleton key={i} />
              ))}
            </div>
          ) : filteredActivities.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">No Activities Found</CardTitle>
                <CardDescription>
                  {searchQuery
                    ? `No activities match "${searchQuery}"`
                    : "There are no activities in this category yet."}
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredActivities.map((activity) => (
                <ActivityCard
                  key={`${activity.modname}-${activity.id}`}
                  activity={activity}
                  onOpen={() => handleOpenActivity(activity)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
