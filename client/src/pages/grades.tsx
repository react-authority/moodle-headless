import { useQuery } from "@tanstack/react-query";
import {
  GraduationCap,
  TrendingUp,
  TrendingDown,
  Award,
  BookOpen,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatsCard } from "@/components/stats-card";
import type { GradeItem, Course } from "@shared/schema";

export default function Grades() {
  const { data: grades, isLoading: gradesLoading } = useQuery<GradeItem[]>({
    queryKey: ["/api/grades"],
  });

  const { data: courses } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  // Group grades by course
  const gradesByCourse = grades?.reduce((acc, grade) => {
    if (!acc[grade.courseid]) {
      acc[grade.courseid] = {
        coursename: grade.coursename,
        items: [],
      };
    }
    acc[grade.courseid].items.push(grade);
    return acc;
  }, {} as Record<string, { coursename: string; items: GradeItem[] }>);

  // Calculate overall stats
  const overallAverage =
    grades && grades.length > 0
      ? Math.round(
          grades.reduce((acc, g) => acc + (g.percentage || 0), 0) / grades.length
        )
      : 0;

  const totalGradedItems = grades?.filter((g) => g.grade !== undefined).length || 0;
  const highestGrade = grades?.reduce(
    (max, g) => ((g.percentage || 0) > max ? g.percentage || 0 : max),
    0
  );

  const getGradeColor = (percentage?: number) => {
    if (percentage === undefined) return "text-muted-foreground";
    if (percentage >= 90) return "text-green-600 dark:text-green-400";
    if (percentage >= 80) return "text-blue-600 dark:text-blue-400";
    if (percentage >= 70) return "text-yellow-600 dark:text-yellow-400";
    if (percentage >= 60) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  };

  const getLetterGrade = (percentage?: number) => {
    if (percentage === undefined) return "-";
    if (percentage >= 90) return "A";
    if (percentage >= 80) return "B";
    if (percentage >= 70) return "C";
    if (percentage >= 60) return "D";
    return "F";
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "-";
    return new Date(timestamp * 1000).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Grades</h1>
        <p className="text-muted-foreground mt-1">
          View your academic performance across all courses
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        {gradesLoading ? (
          [...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <StatsCard
              title="Overall Average"
              value={`${overallAverage}%`}
              description={`Letter grade: ${getLetterGrade(overallAverage)}`}
              icon={GraduationCap}
            />
            <StatsCard
              title="Graded Items"
              value={totalGradedItems}
              description="Assignments, quizzes & exams"
              icon={BookOpen}
            />
            <StatsCard
              title="Highest Grade"
              value={`${highestGrade}%`}
              description="Your best performance"
              icon={Award}
            />
          </>
        )}
      </div>

      {/* Overall Progress */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Academic Standing</h3>
              <p className="text-sm text-muted-foreground">
                Based on your overall performance
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{getLetterGrade(overallAverage)}</div>
              <div className="text-sm text-muted-foreground">{overallAverage}%</div>
            </div>
          </div>
          <Progress value={overallAverage} className="h-3" />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </CardContent>
      </Card>

      {/* Grades by Course */}
      {gradesLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : gradesByCourse && Object.keys(gradesByCourse).length > 0 ? (
        <div className="space-y-4">
          {Object.entries(gradesByCourse).map(([courseId, { coursename, items }]) => {
            const courseAverage =
              items.length > 0
                ? Math.round(
                    items.reduce((acc, g) => acc + (g.percentage || 0), 0) /
                      items.length
                  )
                : 0;

            return (
              <Card key={courseId}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <CardTitle className="text-base">{coursename}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className={getGradeColor(courseAverage)}
                      >
                        {getLetterGrade(courseAverage)} ({courseAverage}%)
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Activity</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-center">Grade</TableHead>
                        <TableHead className="text-center">Percentage</TableHead>
                        <TableHead className="text-right">Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow key={item.id} data-testid={`grade-${item.id}`}>
                          <TableCell className="font-medium">
                            {item.itemname}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-xs">
                              {item.itemtype}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            {item.grade !== undefined ? (
                              <span className={getGradeColor(item.percentage)}>
                                {item.grade}/{item.grademax}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {item.percentage !== undefined ? (
                              <span
                                className={`font-medium ${getGradeColor(
                                  item.percentage
                                )}`}
                              >
                                {item.percentage}%
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {formatDate(item.gradedategraded)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No grades yet</h3>
              <p>Your grades will appear here once activities are graded.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
