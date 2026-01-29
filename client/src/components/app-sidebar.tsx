import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  GraduationCap,
  Settings,
  LogOut,
  ChevronUp,
  ClipboardList,
  FileQuestion,
  MessageSquare,
  Bell,
  Award,
} from "lucide-react";
import type { User } from "@shared/schema";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const mainNavItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "My Courses",
    url: "/courses",
    icon: BookOpen,
  },
  {
    title: "Assignments",
    url: "/assignments",
    icon: ClipboardList,
  },
  {
    title: "Quizzes",
    url: "/quizzes",
    icon: FileQuestion,
  },
  {
    title: "Forums",
    url: "/forums",
    icon: MessageSquare,
  },
  {
    title: "Calendar",
    url: "/calendar",
    icon: Calendar,
  },
  {
    title: "Grades",
    url: "/grades",
    icon: GraduationCap,
  },
];

const secondaryNavItems = [
  {
    title: "Notifications",
    url: "/notifications",
    icon: Bell,
  },
  {
    title: "Badges",
    url: "/badges",
    icon: Award,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const [location, setLocation] = useLocation();

  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  const { data: notifCount } = useQuery<{ count: number }>({
    queryKey: ["/api/notifications/count"],
    refetchInterval: 60000,
  });

  const userInitials = user
    ? `${user.firstname?.[0] || ""}${user.lastname?.[0] || ""}`.toUpperCase() || "U"
    : "U";

  const isActive = (url: string) => {
    if (url === "/") return location === "/";
    return location.startsWith(url);
  };

  const handleNavigation = (url: string) => {
    setLocation(url);
  };

  const unreadCount = notifCount?.count || 0;

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary">
            <GraduationCap className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold">MoodleHub</span>
            <span className="text-xs text-muted-foreground">Headless LMS</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Learning</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={isActive(item.url)}
                    onClick={() => handleNavigation(item.url)}
                    data-testid={`nav-${item.title.toLowerCase().replace(/\s/g, "-")}`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={isActive(item.url)}
                    onClick={() => handleNavigation(item.url)}
                    data-testid={`nav-${item.title.toLowerCase().replace(/\s/g, "-")}`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                    {item.url === "/notifications" && unreadCount > 0 && (
                      <SidebarMenuBadge>{unreadCount}</SidebarMenuBadge>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent h-12"
                  data-testid="button-user-menu"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.profileimageurl || ""} alt={user?.fullname || "User"} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start text-left text-sm">
                    <span className="font-medium">{user?.fullname || "User"}</span>
                    <span className="text-xs text-muted-foreground">
                      {user?.email || "Loading..."}
                    </span>
                  </div>
                  <ChevronUp className="ml-auto h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width]"
                side="top"
                align="start"
              >
                <DropdownMenuItem
                  onClick={() => handleNavigation("/badges")}
                  data-testid="menu-item-badges"
                >
                  <Award className="mr-2 h-4 w-4" />
                  My Badges
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleNavigation("/settings")}
                  data-testid="menu-item-settings"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  data-testid="menu-item-logout"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Disconnect
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
