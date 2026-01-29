import { useQuery } from "@tanstack/react-query";
import {
  Settings as SettingsIcon,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

interface ConnectionStatus {
  connected: boolean;
  siteUrl: string;
}

export default function Settings() {
  const { data: status, isLoading } = useQuery<ConnectionStatus>({
    queryKey: ["/api/status"],
  });

  const isConnected = status?.connected || false;
  const siteUrl = status?.siteUrl || "";

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure your Moodle connection and preferences
        </p>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <LinkIcon className="h-4 w-4" />
                Moodle Connection
              </CardTitle>
              <CardDescription>
                Connection to your Moodle instance
              </CardDescription>
            </div>
            {isLoading ? (
              <Skeleton className="h-6 w-24" />
            ) : (
              <Badge variant={isConnected ? "default" : "secondary"} data-testid="badge-connection-status">
                {isConnected ? (
                  <>
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Connected
                  </>
                ) : (
                  "Not Connected"
                )}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-20 w-full" />
            </div>
          ) : isConnected ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium" data-testid="text-connection-status">Connected to Moodle</p>
                    <p className="text-sm text-muted-foreground" data-testid="text-site-url">
                      {siteUrl}
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Your courses and data are synced automatically from your Moodle instance.
                Connection is configured via environment variables.
              </p>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Server-side Configuration</AlertTitle>
                <AlertDescription>
                  The Moodle connection is configured using environment variables (MOODLE_URL and MOODLE_TOKEN).
                  To change the connection, update these variables in your server configuration.
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Demo Mode Active</AlertTitle>
                <AlertDescription className="mt-2 space-y-2">
                  <p>MoodleHub is running in demo mode with sample data.</p>
                  <p className="text-sm">
                    To connect to a real Moodle instance, set the following environment variables:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm mt-2">
                    <li><code className="bg-muted px-1 rounded">MOODLE_URL</code> - Your Moodle site URL</li>
                    <li><code className="bg-muted px-1 rounded">MOODLE_TOKEN</code> - Web service token</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>How to get a Web Service Token</AlertTitle>
                <AlertDescription className="mt-2 space-y-2">
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Log in to your Moodle site as an admin</li>
                    <li>Go to Site administration - Plugins - Web services - Manage tokens</li>
                    <li>Create a new token with the "Moodle mobile web service" or a custom service</li>
                    <li>Copy the token and set it as the MOODLE_TOKEN environment variable</li>
                  </ol>
                </AlertDescription>
              </Alert>
            </>
          )}
        </CardContent>
      </Card>

      {/* Documentation Links */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ExternalLink className="h-4 w-4" />
            Resources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Learn more about Moodle Web Services and explore demo instances.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm" asChild>
              <a
                href="https://moodledev.io/docs/5.2/apis/subsystems/external"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Moodle API Docs
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a
                href="https://sandbox.moodledemo.net/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Try Moodle Sandbox
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Preferences</CardTitle>
          <CardDescription>Customize your MoodleHub experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive email reminders for upcoming deadlines
              </p>
            </div>
            <Switch id="notifications" data-testid="switch-notifications" />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto-sync">Auto-sync Data</Label>
              <p className="text-sm text-muted-foreground">
                Automatically refresh course data every 5 minutes
              </p>
            </div>
            <Switch id="auto-sync" defaultChecked data-testid="switch-auto-sync" />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="compact-view">Compact View</Label>
              <p className="text-sm text-muted-foreground">
                Show more content with reduced spacing
              </p>
            </div>
            <Switch id="compact-view" data-testid="switch-compact-view" />
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">About MoodleHub</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            MoodleHub is a headless frontend for Moodle LMS, built with modern web technologies.
            It provides a beautiful, responsive interface to access your Moodle courses, assignments,
            quizzes, forums, and grades.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">React</Badge>
            <Badge variant="secondary">TypeScript</Badge>
            <Badge variant="secondary">Tailwind CSS</Badge>
            <Badge variant="secondary">Moodle Web Services</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
