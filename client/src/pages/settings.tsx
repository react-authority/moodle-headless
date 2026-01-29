import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Settings as SettingsIcon,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Info,
  Eye,
  EyeOff,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

const connectionSchema = z.object({
  siteUrl: z.string().url("Please enter a valid URL"),
  token: z.string().min(1, "Token is required"),
});

type ConnectionFormValues = z.infer<typeof connectionSchema>;

export default function Settings() {
  const [showToken, setShowToken] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const { toast } = useToast();

  const form = useForm<ConnectionFormValues>({
    resolver: zodResolver(connectionSchema),
    defaultValues: {
      siteUrl: "",
      token: "",
    },
  });

  const onSubmit = async (data: ConnectionFormValues) => {
    setIsTestingConnection(true);
    // Simulate connection test
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsTestingConnection(false);
    setIsConnected(true);
    toast({
      title: "Connection successful",
      description: "Your Moodle instance has been connected.",
    });
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    form.reset();
    toast({
      title: "Disconnected",
      description: "Your Moodle connection has been removed.",
    });
  };

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
                Connect to your Moodle instance to sync courses and data
              </CardDescription>
            </div>
            <Badge variant={isConnected ? "default" : "secondary"}>
              {isConnected ? (
                <>
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Connected
                </>
              ) : (
                "Not Connected"
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isConnected ? (
            <>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>How to get a Web Service Token</AlertTitle>
                <AlertDescription className="mt-2 space-y-2">
                  <p>To connect MoodleHub to your Moodle instance, you need a web service token:</p>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Log in to your Moodle site as an admin</li>
                    <li>Go to Site administration → Plugins → Web services → Manage tokens</li>
                    <li>Create a new token with the "Moodle mobile web service" or a custom service</li>
                    <li>Copy the token and paste it below</li>
                  </ol>
                </AlertDescription>
              </Alert>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="siteUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Moodle Site URL</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://moodle.example.com"
                            {...field}
                            data-testid="input-site-url"
                          />
                        </FormControl>
                        <FormDescription>
                          The base URL of your Moodle installation
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="token"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Web Service Token</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showToken ? "text" : "password"}
                              placeholder="Enter your Moodle token"
                              {...field}
                              className="pr-10"
                              data-testid="input-token"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full"
                              onClick={() => setShowToken(!showToken)}
                            >
                              {showToken ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Your Moodle web service token for API access
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={isTestingConnection}
                    data-testid="button-connect"
                  >
                    {isTestingConnection ? "Testing Connection..." : "Connect to Moodle"}
                  </Button>
                </form>
              </Form>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium">Connected to Moodle</p>
                    <p className="text-sm text-muted-foreground">
                      {form.getValues("siteUrl") || "demo.moodle.net"}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDisconnect}
                  data-testid="button-disconnect"
                >
                  Disconnect
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Your courses and data are synced automatically. Last sync: Just now
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Demo Mode Notice */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-orange-500" />
            Demo Mode
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            MoodleHub is currently running in demo mode with sample data. Connect to a real 
            Moodle instance to see your actual courses, grades, and calendar events.
          </p>
          <div className="flex items-center gap-4">
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
            and grades.
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
