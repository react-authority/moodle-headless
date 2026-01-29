import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
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
  Download,
  ExternalLink,
  Box,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { useLocation } from "wouter";

interface LessonInfo {
  id: string;
  cmid: string;
  name: string;
  intro: string;
  grade: number;
  timelimit: number;
  retake: number;
  maxattempts: number;
  available: number | null;
  deadline: number | null;
  progressbar: boolean;
  ongoing: boolean;
}

interface ScormInfo {
  id: string;
  cmid: string;
  name: string;
  intro: string;
  maxgrade: number;
  maxattempt: number;
  timeopen: number | null;
  timeclose: number | null;
  width: number;
  height: number;
  popup: boolean;
}

interface H5pActivityInfo {
  id: string;
  cmid: string;
  name: string;
  intro: string;
  grade: number;
  enabletracking: boolean;
  grademethod: number;
  packageUrl?: string;
}

interface WikiInfo {
  id: string;
  cmid: string;
  name: string;
  intro: string;
  firstpagetitle: string;
  wikimode: string;
  defaultformat: string;
  cancreatepages: boolean;
}

interface GlossaryInfo {
  id: string;
  cmid: string;
  name: string;
  intro: string;
  displayformat: string;
  canaddentry: boolean;
  allowcomments: boolean;
  showalphabet: boolean;
  showall: boolean;
  showspecial: boolean;
  entbypage: number;
}

interface GlossaryEntry {
  id: string;
  concept: string;
  definition: string;
  userfullname: string;
  userpictureurl: string;
  timecreated: number;
  timemodified: number;
  approved: boolean;
}

interface FolderInfo {
  id: string;
  cmid: string;
  name: string;
  intro: string;
  display: number;
  showexpanded: boolean;
  showdownloadfolder: boolean;
  files: { filename: string; filepath: string; filesize: number; fileurl: string; mimetype: string }[];
}

interface ChoiceInfo {
  id: string;
  cmid: string;
  name: string;
  intro: string;
  allowupdate: boolean;
  allowmultiple: boolean;
  limitanswers: boolean;
  showresults: number;
  timeopen: number | null;
  timeclose: number | null;
  publish: boolean;
}

interface ChoiceOption {
  id: string;
  text: string;
  maxanswers: number;
  countanswers: number;
  checked: boolean;
  disabled: boolean;
}

interface FeedbackInfo {
  id: string;
  cmid: string;
  name: string;
  intro: string;
  anonymous: boolean;
  multipleSubmit: boolean;
  timeopen: number | null;
  timeclose: number | null;
  pageAfterSubmit: string;
}

interface DataInfo {
  id: string;
  cmid: string;
  name: string;
  intro: string;
  approval: boolean;
  requiredentries: number;
  maxentries: number;
  timeavailablefrom: number | null;
  timeavailableto: number | null;
}

interface WorkshopInfo {
  id: string;
  cmid: string;
  name: string;
  intro: string;
  phase: number;
  grade: number;
  gradinggrade: number;
  strategy: string;
  submissionstart: number | null;
  submissionend: number | null;
  assessmentstart: number | null;
  assessmentend: number | null;
  usepeerassessment: boolean;
  useselfassessment: boolean;
}

interface BookInfo {
  id: string;
  name: string;
  intro: string;
  chapters: { id: string; title: string; content: string; pagenum: number }[];
}

interface PageInfo {
  id: string;
  name: string;
  intro: string;
  content: string;
}

interface ResourceInfo {
  id: string;
  name: string;
  intro: string;
  files: { filename: string; fileurl: string; filesize: number; mimetype: string }[];
}

interface UrlInfo {
  id: string;
  name: string;
  intro: string;
  externalurl: string;
}

const formatDate = (timestamp: number | null) => {
  if (!timestamp) return "Not set";
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

function LessonViewer({ data }: { data: LessonInfo }) {
  return (
    <div className="space-y-6">
      <div dangerouslySetInnerHTML={{ __html: data.intro }} className="prose dark:prose-invert max-w-none" />
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Max Grade:</span>
              <span>{data.grade}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Time Limit:</span>
              <span>{data.timelimit ? `${Math.floor(data.timelimit / 60)} min` : "No limit"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Max Attempts:</span>
              <span>{data.maxattempts || "Unlimited"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Retakes Allowed:</span>
              <span>{data.retake ? "Yes" : "No"}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Availability</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Opens:</span>
              <span>{formatDate(data.available)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Closes:</span>
              <span>{formatDate(data.deadline)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Button className="w-full sm:w-auto">
        <PlayCircle className="h-4 w-4 mr-2" />
        Start Lesson
      </Button>
    </div>
  );
}

function ScormViewer({ data }: { data: ScormInfo }) {
  return (
    <div className="space-y-6">
      <div dangerouslySetInnerHTML={{ __html: data.intro }} className="prose dark:prose-invert max-w-none" />
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Max Grade:</span>
              <span>{data.maxgrade}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Max Attempts:</span>
              <span>{data.maxattempt || "Unlimited"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Opens in Popup:</span>
              <span>{data.popup ? "Yes" : "No"}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Availability</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Opens:</span>
              <span>{formatDate(data.timeopen)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Closes:</span>
              <span>{formatDate(data.timeclose)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Button className="w-full sm:w-auto">
        <PlayCircle className="h-4 w-4 mr-2" />
        Launch SCORM Package
      </Button>
    </div>
  );
}

function H5pViewer({ data }: { data: H5pActivityInfo }) {
  return (
    <div className="space-y-6">
      <div dangerouslySetInnerHTML={{ __html: data.intro }} className="prose dark:prose-invert max-w-none" />
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Activity Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Max Grade:</span>
            <span>{data.grade}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tracking Enabled:</span>
            <span>{data.enabletracking ? "Yes" : "No"}</span>
          </div>
        </CardContent>
      </Card>
      
      {data.packageUrl && (
        <div className="rounded-lg border bg-card p-4">
          <iframe
            src={data.packageUrl}
            className="w-full h-[500px] rounded"
            title={data.name}
          />
        </div>
      )}
      
      {!data.packageUrl && (
        <Button className="w-full sm:w-auto">
          <Box className="h-4 w-4 mr-2" />
          Start H5P Activity
        </Button>
      )}
    </div>
  );
}

function WikiViewer({ data }: { data: WikiInfo }) {
  return (
    <div className="space-y-6">
      <div dangerouslySetInnerHTML={{ __html: data.intro }} className="prose dark:prose-invert max-w-none" />
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Wiki Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">First Page:</span>
            <span>{data.firstpagetitle}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Mode:</span>
            <Badge variant="outline" className="capitalize">{data.wikimode}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Default Format:</span>
            <Badge variant="secondary">{data.defaultformat}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Can Create Pages:</span>
            <span>{data.cancreatepages ? "Yes" : "No"}</span>
          </div>
        </CardContent>
      </Card>
      
      <Button className="w-full sm:w-auto">
        <FileEdit className="h-4 w-4 mr-2" />
        Open Wiki
      </Button>
    </div>
  );
}

function GlossaryViewer({ cmid, data }: { cmid: string; data: GlossaryInfo }) {
  const { data: entries } = useQuery<{ entries: GlossaryEntry[]; count: number }>({
    queryKey: [`/api/glossary/${data.id}/entries`],
    enabled: !!data.id,
  });

  return (
    <div className="space-y-6">
      <div dangerouslySetInnerHTML={{ __html: data.intro }} className="prose dark:prose-invert max-w-none" />
      
      <div className="flex items-center gap-2">
        {data.canaddentry && (
          <Button variant="outline" size="sm">Add Entry</Button>
        )}
        <Badge variant="secondary">{entries?.count || 0} entries</Badge>
      </div>
      
      <ScrollArea className="h-[400px] rounded-md border">
        <div className="p-4 space-y-4">
          {entries?.entries.map((entry) => (
            <Card key={entry.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{entry.concept}</CardTitle>
                <CardDescription>
                  By {entry.userfullname} · {formatDate(entry.timecreated)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div dangerouslySetInnerHTML={{ __html: entry.definition }} className="prose dark:prose-invert prose-sm max-w-none" />
              </CardContent>
            </Card>
          ))}
          
          {(!entries || entries.entries.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              No entries in this glossary yet.
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function FolderViewer({ data }: { data: FolderInfo }) {
  return (
    <div className="space-y-6">
      <div dangerouslySetInnerHTML={{ __html: data.intro }} className="prose dark:prose-invert max-w-none" />
      
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Folder className="h-5 w-5" />
            Files ({data.files.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.files.length === 0 ? (
            <p className="text-muted-foreground text-sm">This folder is empty.</p>
          ) : (
            <div className="space-y-2">
              {data.files.map((file, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{file.filename}</span>
                    <Badge variant="outline" className="text-xs">{formatFileSize(file.filesize)}</Badge>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <a href={file.fileurl} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ChoiceViewer({ data }: { data: ChoiceInfo }) {
  const { data: options } = useQuery<ChoiceOption[]>({
    queryKey: [`/api/choice/${data.id}/options`],
    enabled: !!data.id,
  });

  return (
    <div className="space-y-6">
      <div dangerouslySetInnerHTML={{ __html: data.intro }} className="prose dark:prose-invert max-w-none" />
      
      <div className="flex flex-wrap gap-2">
        {data.allowmultiple && <Badge variant="outline">Multiple choices allowed</Badge>}
        {data.allowupdate && <Badge variant="outline">Can change answer</Badge>}
        {data.limitanswers && <Badge variant="outline">Limited answers</Badge>}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {options?.map((option) => (
              <div 
                key={option.id} 
                className={`flex items-center justify-between p-3 rounded-md border ${option.checked ? 'bg-primary/10 border-primary' : 'hover:bg-muted'}`}
              >
                <span>{option.text}</span>
                {option.checked && <CheckCircle2 className="h-5 w-5 text-primary" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FeedbackViewer({ data }: { data: FeedbackInfo }) {
  return (
    <div className="space-y-6">
      <div dangerouslySetInnerHTML={{ __html: data.intro }} className="prose dark:prose-invert max-w-none" />
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Feedback Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Anonymous:</span>
            <span>{data.anonymous ? "Yes" : "No"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Multiple Submissions:</span>
            <span>{data.multipleSubmit ? "Allowed" : "Not allowed"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Opens:</span>
            <span>{formatDate(data.timeopen)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Closes:</span>
            <span>{formatDate(data.timeclose)}</span>
          </div>
        </CardContent>
      </Card>
      
      <Button className="w-full sm:w-auto">
        <PenTool className="h-4 w-4 mr-2" />
        Answer Questions
      </Button>
    </div>
  );
}

function DataViewer({ data }: { data: DataInfo }) {
  return (
    <div className="space-y-6">
      <div dangerouslySetInnerHTML={{ __html: data.intro }} className="prose dark:prose-invert max-w-none" />
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Database Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Approval Required:</span>
            <span>{data.approval ? "Yes" : "No"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Required Entries:</span>
            <span>{data.requiredentries || "None"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Max Entries:</span>
            <span>{data.maxentries || "Unlimited"}</span>
          </div>
        </CardContent>
      </Card>
      
      <Button className="w-full sm:w-auto">
        <Database className="h-4 w-4 mr-2" />
        View Entries
      </Button>
    </div>
  );
}

function WorkshopViewer({ data }: { data: WorkshopInfo }) {
  const phaseLabels = ["Setup", "Submission", "Assessment", "Grading Evaluation", "Closed"];
  
  return (
    <div className="space-y-6">
      <div dangerouslySetInnerHTML={{ __html: data.intro }} className="prose dark:prose-invert max-w-none" />
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Current Phase</CardTitle>
        </CardHeader>
        <CardContent>
          <Badge variant="default" className="text-sm">{phaseLabels[data.phase] || "Unknown"}</Badge>
        </CardContent>
      </Card>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Grades</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Submission Grade:</span>
              <span>{data.grade}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Assessment Grade:</span>
              <span>{data.gradinggrade}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Grading Strategy:</span>
              <Badge variant="outline" className="capitalize">{data.strategy}</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Submission Start:</span>
              <span className="text-xs">{formatDate(data.submissionstart)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Submission End:</span>
              <span className="text-xs">{formatDate(data.submissionend)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Assessment Start:</span>
              <span className="text-xs">{formatDate(data.assessmentstart)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Assessment End:</span>
              <span className="text-xs">{formatDate(data.assessmentend)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function BookViewer({ data }: { data: BookInfo }) {
  return (
    <div className="space-y-6">
      <div dangerouslySetInnerHTML={{ __html: data.intro }} className="prose dark:prose-invert max-w-none" />
      
      {data.chapters.length > 0 ? (
        <Tabs defaultValue={data.chapters[0]?.id}>
          <TabsList className="w-full justify-start overflow-x-auto">
            {data.chapters.map((chapter) => (
              <TabsTrigger key={chapter.id} value={chapter.id}>
                {chapter.title}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {data.chapters.map((chapter) => (
            <TabsContent key={chapter.id} value={chapter.id}>
              <Card>
                <CardHeader>
                  <CardTitle>{chapter.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div dangerouslySetInnerHTML={{ __html: chapter.content }} className="prose dark:prose-invert max-w-none" />
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Book chapters are not available for viewing. Please access this book through Moodle.
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function PageViewer({ data }: { data: PageInfo }) {
  return (
    <div className="space-y-6">
      {data.intro && (
        <div dangerouslySetInnerHTML={{ __html: data.intro }} className="prose dark:prose-invert max-w-none" />
      )}
      
      <Card>
        <CardContent className="pt-6">
          <div dangerouslySetInnerHTML={{ __html: data.content }} className="prose dark:prose-invert max-w-none" />
        </CardContent>
      </Card>
    </div>
  );
}

function ResourceViewer({ data }: { data: ResourceInfo }) {
  return (
    <div className="space-y-6">
      <div dangerouslySetInnerHTML={{ __html: data.intro }} className="prose dark:prose-invert max-w-none" />
      
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Folder className="h-5 w-5" />
            Files
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.files.map((file, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-md border hover:bg-muted">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{file.filename}</p>
                    <p className="text-sm text-muted-foreground">{formatFileSize(file.filesize)}</p>
                  </div>
                </div>
                <Button asChild>
                  <a href={file.fileurl} target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </a>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function UrlViewer({ data }: { data: UrlInfo }) {
  return (
    <div className="space-y-6">
      <div dangerouslySetInnerHTML={{ __html: data.intro }} className="prose dark:prose-invert max-w-none" />
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <LinkIcon className="h-5 w-5 text-muted-foreground shrink-0" />
              <p className="text-sm truncate">{data.externalurl}</p>
            </div>
            <Button asChild>
              <a href={data.externalurl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Link
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ActivityPage() {
  const { modname, cmid } = useParams<{ modname: string; cmid: string }>();
  const [, setLocation] = useLocation();

  const getEndpoint = () => {
    switch (modname) {
      case "lesson": return `/api/lesson/${cmid}`;
      case "scorm": return `/api/scorm/${cmid}`;
      case "h5pactivity": return `/api/h5p/${cmid}`;
      case "wiki": return `/api/wiki/${cmid}`;
      case "glossary": return `/api/glossary/${cmid}`;
      case "folder": return `/api/folder/${cmid}`;
      case "choice": return `/api/choice/${cmid}`;
      case "feedback": return `/api/feedback/${cmid}`;
      case "data": return `/api/data/${cmid}`;
      case "workshop": return `/api/workshop/${cmid}`;
      case "book": return `/api/book/${cmid}`;
      case "page": return `/api/page/${cmid}`;
      case "resource": return `/api/resource/${cmid}`;
      case "url": return `/api/url/${cmid}`;
      default: return null;
    }
  };

  const endpoint = getEndpoint();

  const { data, isLoading, error } = useQuery({
    queryKey: [endpoint],
    enabled: !!endpoint,
  });

  const getIcon = () => {
    switch (modname) {
      case "lesson": return GraduationCap;
      case "scorm": return PlayCircle;
      case "h5pactivity": return Box;
      case "wiki": return FileEdit;
      case "glossary": return List;
      case "folder": return Folder;
      case "choice": return Vote;
      case "feedback": return PenTool;
      case "data": return Database;
      case "workshop": return Users;
      case "book": return BookOpen;
      case "page": return FileText;
      case "resource": return Folder;
      case "url": return LinkIcon;
      default: return FileText;
    }
  };

  const Icon = getIcon();

  const renderViewer = () => {
    if (!data) return null;

    switch (modname) {
      case "lesson": return <LessonViewer data={data as LessonInfo} />;
      case "scorm": return <ScormViewer data={data as ScormInfo} />;
      case "h5pactivity": return <H5pViewer data={data as H5pActivityInfo} />;
      case "wiki": return <WikiViewer data={data as WikiInfo} />;
      case "glossary": return <GlossaryViewer cmid={cmid!} data={data as GlossaryInfo} />;
      case "folder": return <FolderViewer data={data as FolderInfo} />;
      case "choice": return <ChoiceViewer data={data as ChoiceInfo} />;
      case "feedback": return <FeedbackViewer data={data as FeedbackInfo} />;
      case "data": return <DataViewer data={data as DataInfo} />;
      case "workshop": return <WorkshopViewer data={data as WorkshopInfo} />;
      case "book": return <BookViewer data={data as BookInfo} />;
      case "page": return <PageViewer data={data as PageInfo} />;
      case "resource": return <ResourceViewer data={data as ResourceInfo} />;
      case "url": return <UrlViewer data={data as UrlInfo} />;
      default: return null;
    }
  };

  if (!endpoint) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Unknown Activity Type</CardTitle>
            <CardDescription>
              This activity type is not supported: {modname}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Button variant="ghost" onClick={() => setLocation("/activities")} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Activities
      </Button>

      {isLoading ? (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Activity</CardTitle>
            <CardDescription>
              There was a problem loading this activity. Please try again later.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : data ? (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>{(data as any).name}</CardTitle>
                <Badge variant="outline" className="mt-1 capitalize">
                  {modname === "h5pactivity" ? "H5P Activity" : modname}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6">
            {renderViewer()}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
