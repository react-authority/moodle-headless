import { useLocation } from "wouter";
import { BookOpen, Clock, Users } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Course } from "@shared/schema";

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  const [, setLocation] = useLocation();
  const progressValue = course.progress ?? 0;
  const isCompleted = progressValue >= 100;

  const handleClick = () => {
    setLocation(`/courses/${course.id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <Card
      className="group cursor-pointer transition-all duration-200 hover-elevate overflow-visible"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="link"
      data-testid={`card-course-${course.id}`}
    >
      <CardHeader className="p-0">
        <div className="relative h-36 overflow-hidden rounded-t-md">
          <div
            className="absolute inset-0 bg-gradient-to-br from-primary/80 to-primary/40"
            style={{
              backgroundImage: course.imageurl
                ? `url(${course.imageurl})`
                : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3">
            <Badge variant="secondary" className="text-xs">
              {course.categoryname || "Course"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <h3 className="font-semibold text-base line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {course.fullname}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {course.summary || "No description available"}
        </p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {course.teachername && (
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{course.teachername}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            <span>{course.shortname}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex-col items-stretch gap-2">
        {course.enrolled && (
          <>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span className={isCompleted ? "text-green-600 dark:text-green-400 font-medium" : ""}>
                {progressValue}%
              </span>
            </div>
            <Progress value={progressValue} className="h-1.5" />
          </>
        )}
        {!course.enrolled && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Not enrolled</span>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
