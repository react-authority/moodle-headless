import { useQuery } from "@tanstack/react-query";
import { Award, Calendar, User2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface UserBadge {
  id: string;
  name: string;
  description: string;
  badgeurl: string;
  issuername: string;
  dateissued: number;
}

export default function Badges() {
  const { data: badges, isLoading } = useQuery<UserBadge[]>({
    queryKey: ["/api/badges"],
  });

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Badges</h1>
        <p className="text-muted-foreground mt-1">
          Achievements and certifications earned from your courses
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-20 w-20 rounded-full mx-auto mb-4" />
                <Skeleton className="h-5 w-3/4 mx-auto mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <Skeleton className="h-3 w-24 mx-auto" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : badges && badges.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {badges.map((badge) => (
            <Card key={badge.id} className="hover-elevate" data-testid={`badge-${badge.id}`}>
              <CardContent className="p-6 text-center">
                <div className="relative inline-block mb-4">
                  {badge.badgeurl ? (
                    <img
                      src={badge.badgeurl}
                      alt={badge.name}
                      className="h-20 w-20 rounded-full object-cover mx-auto"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                      <Award className="h-10 w-10 text-primary" />
                    </div>
                  )}
                </div>
                <h3 className="font-semibold mb-2" data-testid="text-badge-name">
                  {badge.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {badge.description.replace(/<[^>]*>/g, "")}
                </p>
                <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User2 className="h-3 w-3" />
                    {badge.issuername}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(badge.dateissued)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Award className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-2">No badges yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Complete course activities and achievements to earn badges.
              They'll appear here once you've earned them.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
