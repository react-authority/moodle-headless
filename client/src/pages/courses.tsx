import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, Grid, List, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CourseCard } from "@/components/course-card";
import type { Course, Category } from "@shared/schema";

export default function Courses() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [enrollmentFilter, setEnrollmentFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: courses, isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const filteredCourses = courses?.filter((course) => {
    const matchesSearch =
      course.fullname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.shortname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

    const matchesCategory =
      selectedCategory === "all" || course.categoryid === selectedCategory;

    const matchesEnrollment =
      enrollmentFilter === "all" ||
      (enrollmentFilter === "enrolled" && course.enrolled) ||
      (enrollmentFilter === "available" && !course.enrolled);

    return matchesSearch && matchesCategory && matchesEnrollment;
  });

  const enrolledCount = courses?.filter((c) => c.enrolled).length || 0;
  const availableCount = courses?.filter((c) => !c.enrolled).length || 0;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Courses</h1>
        <p className="text-muted-foreground mt-1">
          Browse and manage your enrolled courses
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-courses"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-[180px]" data-testid="select-category">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories?.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("grid")}
            data-testid="button-view-grid"
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("list")}
            data-testid="button-view-list"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Enrollment Tabs */}
      <Tabs value={enrollmentFilter} onValueChange={setEnrollmentFilter}>
        <TabsList>
          <TabsTrigger value="all" data-testid="tab-all-courses">
            All Courses
            <Badge variant="secondary" className="ml-2">
              {courses?.length || 0}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="enrolled" data-testid="tab-enrolled">
            Enrolled
            <Badge variant="secondary" className="ml-2">
              {enrolledCount}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="available" data-testid="tab-available">
            Available
            <Badge variant="secondary" className="ml-2">
              {availableCount}
            </Badge>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Course Grid/List */}
      {coursesLoading ? (
        <div
          className={
            viewMode === "grid"
              ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              : "space-y-4"
          }
        >
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-lg border bg-card p-4">
              <Skeleton className="h-32 w-full mb-4" />
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </div>
      ) : filteredCourses && filteredCourses.length > 0 ? (
        <div
          className={
            viewMode === "grid"
              ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              : "space-y-4"
          }
        >
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No courses found</h3>
          <p className="text-muted-foreground">
            {searchQuery
              ? "Try adjusting your search or filters"
              : "You don't have any courses yet"}
          </p>
        </div>
      )}
    </div>
  );
}
