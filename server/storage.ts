import type {
  User,
  Course,
  Category,
  Section,
  Activity,
  CalendarEvent,
  GradeItem,
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getCurrentUser(): Promise<User>;

  // Categories
  getCategories(): Promise<Category[]>;

  // Courses
  getCourses(): Promise<Course[]>;
  getCourse(id: string): Promise<Course | undefined>;
  getCourseSections(courseId: string): Promise<Section[]>;
  getCourseActivities(courseId: string): Promise<Activity[]>;

  // Activities
  getUpcomingActivities(): Promise<Activity[]>;

  // Calendar Events
  getEvents(): Promise<CalendarEvent[]>;
  getUpcomingEvents(): Promise<CalendarEvent[]>;

  // Grades
  getGrades(): Promise<GradeItem[]>;

  // Stats
  getStats(): Promise<{
    totalCourses: number;
    completedActivities: number;
    averageGrade: number;
    upcomingDeadlines: number;
  }>;
}

// Demo data for the headless Moodle frontend
const demoUser: User = {
  id: "1",
  username: "john.student",
  firstname: "John",
  lastname: "Student",
  fullname: "John Student",
  email: "john.student@example.com",
  description: "A dedicated learner exploring new horizons",
};

const demoCategories: Category[] = [
  { id: "1", name: "Computer Science", coursecount: 4, description: "Programming and software development" },
  { id: "2", name: "Mathematics", coursecount: 2, description: "Mathematical foundations" },
  { id: "3", name: "Business", coursecount: 2, description: "Business and management courses" },
  { id: "4", name: "Languages", coursecount: 1, description: "Language learning" },
];

const demoCourses: Course[] = [
  {
    id: "1",
    shortname: "CS101",
    fullname: "Introduction to Computer Science",
    summary: "Learn the fundamentals of programming and computational thinking. This course covers basic algorithms, data structures, and problem-solving techniques using Python.",
    categoryid: "1",
    categoryname: "Computer Science",
    startdate: Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60,
    enddate: Math.floor(Date.now() / 1000) + 60 * 24 * 60 * 60,
    progress: 65,
    enrolled: true,
    teachername: "Dr. Sarah Chen",
  },
  {
    id: "2",
    shortname: "WEB301",
    fullname: "Modern Web Development",
    summary: "Master modern web technologies including React, TypeScript, and Node.js. Build full-stack applications with best practices.",
    categoryid: "1",
    categoryname: "Computer Science",
    startdate: Math.floor(Date.now() / 1000) - 15 * 24 * 60 * 60,
    enddate: Math.floor(Date.now() / 1000) + 75 * 24 * 60 * 60,
    progress: 42,
    enrolled: true,
    teachername: "Prof. Michael Torres",
  },
  {
    id: "3",
    shortname: "DATA200",
    fullname: "Data Science Fundamentals",
    summary: "Introduction to data science concepts, statistical analysis, and machine learning basics. Learn to work with real-world datasets.",
    categoryid: "1",
    categoryname: "Computer Science",
    startdate: Math.floor(Date.now() / 1000) - 45 * 24 * 60 * 60,
    enddate: Math.floor(Date.now() / 1000) + 45 * 24 * 60 * 60,
    progress: 88,
    enrolled: true,
    teachername: "Dr. Emily Watson",
  },
  {
    id: "4",
    shortname: "MATH201",
    fullname: "Linear Algebra for Computing",
    summary: "Essential linear algebra concepts for computer science students. Covers vectors, matrices, and transformations.",
    categoryid: "2",
    categoryname: "Mathematics",
    startdate: Math.floor(Date.now() / 1000) - 20 * 24 * 60 * 60,
    enddate: Math.floor(Date.now() / 1000) + 70 * 24 * 60 * 60,
    progress: 35,
    enrolled: true,
    teachername: "Prof. David Miller",
  },
  {
    id: "5",
    shortname: "BUS101",
    fullname: "Business Communication",
    summary: "Develop professional communication skills for the business world. Focus on presentations, reports, and interpersonal communication.",
    categoryid: "3",
    categoryname: "Business",
    startdate: Math.floor(Date.now() / 1000) + 10 * 24 * 60 * 60,
    progress: 0,
    enrolled: false,
    teachername: "Dr. Amanda Foster",
  },
  {
    id: "6",
    shortname: "AI401",
    fullname: "Artificial Intelligence",
    summary: "Advanced course covering AI algorithms, neural networks, and deep learning applications.",
    categoryid: "1",
    categoryname: "Computer Science",
    startdate: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
    progress: 0,
    enrolled: false,
    teachername: "Prof. James Liu",
  },
];

const demoSections: Section[] = [
  { id: "s1", courseid: "1", name: "Getting Started", summary: "Welcome to the course and setup instructions", visible: true, position: 0 },
  { id: "s2", courseid: "1", name: "Week 1: Programming Basics", summary: "Variables, data types, and operators", visible: true, position: 1 },
  { id: "s3", courseid: "1", name: "Week 2: Control Flow", summary: "Conditionals and loops", visible: true, position: 2 },
  { id: "s4", courseid: "1", name: "Week 3: Functions", summary: "Defining and calling functions", visible: true, position: 3 },
  { id: "s5", courseid: "2", name: "Introduction to Web Dev", summary: "Overview of modern web development", visible: true, position: 0 },
  { id: "s6", courseid: "2", name: "HTML & CSS Fundamentals", summary: "Building blocks of the web", visible: true, position: 1 },
  { id: "s7", courseid: "2", name: "JavaScript Essentials", summary: "Core JavaScript concepts", visible: true, position: 2 },
  { id: "s8", courseid: "2", name: "React Framework", summary: "Building modern UIs with React", visible: true, position: 3 },
  { id: "s9", courseid: "3", name: "Data Science Overview", summary: "Introduction to the field", visible: true, position: 0 },
  { id: "s10", courseid: "3", name: "Python for Data Science", summary: "Python libraries and tools", visible: true, position: 1 },
  { id: "s11", courseid: "4", name: "Vectors and Matrices", summary: "Fundamentals of linear algebra", visible: true, position: 0 },
  { id: "s12", courseid: "4", name: "Matrix Operations", summary: "Operations and transformations", visible: true, position: 1 },
];

const demoActivities: Activity[] = [
  // CS101 Activities
  { id: "a1", sectionid: "s1", courseid: "1", name: "Course Introduction Video", modname: "resource", description: "Watch the welcome video from your instructor", visible: true, position: 0, completed: true },
  { id: "a2", sectionid: "s1", courseid: "1", name: "Setup Your Environment", modname: "page", description: "Instructions for setting up Python on your computer", visible: true, position: 1, completed: true },
  { id: "a3", sectionid: "s2", courseid: "1", name: "Variables Quiz", modname: "quiz", description: "Test your understanding of variables", visible: true, position: 0, completed: true, grade: 18, grademax: 20 },
  { id: "a4", sectionid: "s2", courseid: "1", name: "Assignment: Hello World", modname: "assign", description: "Write your first Python program", visible: true, position: 1, duedate: Math.floor(Date.now() / 1000) + 2 * 24 * 60 * 60, completed: false },
  { id: "a5", sectionid: "s3", courseid: "1", name: "Control Flow Lecture", modname: "resource", description: "Video lecture on conditionals", visible: true, position: 0, completed: true },
  { id: "a6", sectionid: "s3", courseid: "1", name: "Loops Assignment", modname: "assign", description: "Practice using for and while loops", visible: true, position: 1, duedate: Math.floor(Date.now() / 1000) + 5 * 24 * 60 * 60, completed: false },
  { id: "a7", sectionid: "s4", courseid: "1", name: "Functions Quiz", modname: "quiz", description: "Quiz on function definitions", visible: true, position: 0, duedate: Math.floor(Date.now() / 1000) + 8 * 24 * 60 * 60, completed: false },
  
  // WEB301 Activities
  { id: "a8", sectionid: "s5", courseid: "2", name: "Web Dev Overview", modname: "page", description: "Introduction to the modern web stack", visible: true, position: 0, completed: true },
  { id: "a9", sectionid: "s6", courseid: "2", name: "HTML Basics Quiz", modname: "quiz", description: "Test your HTML knowledge", visible: true, position: 0, completed: true, grade: 15, grademax: 15 },
  { id: "a10", sectionid: "s6", courseid: "2", name: "CSS Layout Project", modname: "assign", description: "Build a responsive layout using CSS Grid", visible: true, position: 1, duedate: Math.floor(Date.now() / 1000) + 3 * 24 * 60 * 60, completed: false },
  { id: "a11", sectionid: "s7", courseid: "2", name: "JavaScript Fundamentals", modname: "lesson", description: "Interactive lesson on JS basics", visible: true, position: 0, completed: false },
  { id: "a12", sectionid: "s8", courseid: "2", name: "React Project", modname: "assign", description: "Build a todo app with React", visible: true, position: 0, duedate: Math.floor(Date.now() / 1000) + 14 * 24 * 60 * 60, completed: false },
  
  // DATA200 Activities
  { id: "a13", sectionid: "s9", courseid: "3", name: "What is Data Science?", modname: "page", description: "Overview of the data science field", visible: true, position: 0, completed: true },
  { id: "a14", sectionid: "s10", courseid: "3", name: "Pandas Tutorial", modname: "resource", description: "Video tutorial on Pandas library", visible: true, position: 0, completed: true },
  { id: "a15", sectionid: "s10", courseid: "3", name: "Data Analysis Project", modname: "assign", description: "Analyze a real-world dataset", visible: true, position: 1, completed: true, grade: 92, grademax: 100 },
  
  // MATH201 Activities
  { id: "a16", sectionid: "s11", courseid: "4", name: "Introduction to Vectors", modname: "lesson", description: "Learn about vectors and their properties", visible: true, position: 0, completed: true },
  { id: "a17", sectionid: "s11", courseid: "4", name: "Vector Operations Quiz", modname: "quiz", description: "Practice vector operations", visible: true, position: 1, completed: false, duedate: Math.floor(Date.now() / 1000) + 1 * 24 * 60 * 60 },
  { id: "a18", sectionid: "s12", courseid: "4", name: "Matrix Multiplication", modname: "assign", description: "Assignment on matrix operations", visible: true, position: 0, duedate: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, completed: false },
];

const demoEvents: CalendarEvent[] = [
  {
    id: "e1",
    name: "Assignment: Hello World Due",
    description: "Submit your first Python program",
    courseid: "1",
    coursename: "Introduction to Computer Science",
    timestart: Math.floor(Date.now() / 1000) + 2 * 24 * 60 * 60,
    timeduration: 0,
    eventtype: "course",
    activityid: "a4",
    activityname: "Assignment: Hello World",
  },
  {
    id: "e2",
    name: "Vector Operations Quiz",
    description: "Quiz on vector operations",
    courseid: "4",
    coursename: "Linear Algebra for Computing",
    timestart: Math.floor(Date.now() / 1000) + 1 * 24 * 60 * 60,
    timeduration: 60 * 60,
    eventtype: "course",
    activityid: "a17",
  },
  {
    id: "e3",
    name: "CSS Layout Project Due",
    description: "Submit your responsive layout project",
    courseid: "2",
    coursename: "Modern Web Development",
    timestart: Math.floor(Date.now() / 1000) + 3 * 24 * 60 * 60,
    timeduration: 0,
    eventtype: "course",
    activityid: "a10",
  },
  {
    id: "e4",
    name: "Office Hours: Dr. Chen",
    description: "Open office hours for CS101 students",
    courseid: "1",
    coursename: "Introduction to Computer Science",
    timestart: Math.floor(Date.now() / 1000) + 4 * 24 * 60 * 60,
    timeduration: 2 * 60 * 60,
    eventtype: "course",
  },
  {
    id: "e5",
    name: "Loops Assignment Due",
    description: "Submit your loops practice assignment",
    courseid: "1",
    coursename: "Introduction to Computer Science",
    timestart: Math.floor(Date.now() / 1000) + 5 * 24 * 60 * 60,
    timeduration: 0,
    eventtype: "course",
    activityid: "a6",
  },
  {
    id: "e6",
    name: "Study Group Meeting",
    description: "Weekly study group for programming courses",
    timestart: Math.floor(Date.now() / 1000) + 6 * 24 * 60 * 60,
    timeduration: 90 * 60,
    eventtype: "user",
  },
  {
    id: "e7",
    name: "Matrix Assignment Due",
    description: "Submit matrix operations assignment",
    courseid: "4",
    coursename: "Linear Algebra for Computing",
    timestart: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
    timeduration: 0,
    eventtype: "course",
    activityid: "a18",
  },
  {
    id: "e8",
    name: "Functions Quiz",
    description: "Quiz on function definitions",
    courseid: "1",
    coursename: "Introduction to Computer Science",
    timestart: Math.floor(Date.now() / 1000) + 8 * 24 * 60 * 60,
    timeduration: 45 * 60,
    eventtype: "course",
    activityid: "a7",
  },
  {
    id: "e9",
    name: "React Project Due",
    description: "Submit your React todo app",
    courseid: "2",
    coursename: "Modern Web Development",
    timestart: Math.floor(Date.now() / 1000) + 14 * 24 * 60 * 60,
    timeduration: 0,
    eventtype: "course",
    activityid: "a12",
  },
  {
    id: "e10",
    name: "Site Maintenance",
    description: "Scheduled maintenance window",
    timestart: Math.floor(Date.now() / 1000) + 20 * 24 * 60 * 60,
    timeduration: 4 * 60 * 60,
    eventtype: "site",
  },
];

const demoGrades: GradeItem[] = [
  { id: "g1", courseid: "1", coursename: "Introduction to Computer Science", itemname: "Variables Quiz", itemtype: "Quiz", grade: 18, grademax: 20, percentage: 90, gradedategraded: Math.floor(Date.now() / 1000) - 5 * 24 * 60 * 60 },
  { id: "g2", courseid: "2", coursename: "Modern Web Development", itemname: "HTML Basics Quiz", itemtype: "Quiz", grade: 15, grademax: 15, percentage: 100, gradedategraded: Math.floor(Date.now() / 1000) - 3 * 24 * 60 * 60 },
  { id: "g3", courseid: "3", coursename: "Data Science Fundamentals", itemname: "Data Analysis Project", itemtype: "Assignment", grade: 92, grademax: 100, percentage: 92, feedback: "Excellent work on the data visualization!", gradedategraded: Math.floor(Date.now() / 1000) - 2 * 24 * 60 * 60 },
  { id: "g4", courseid: "1", coursename: "Introduction to Computer Science", itemname: "Mid-term Exam", itemtype: "Exam", grade: 85, grademax: 100, percentage: 85, gradedategraded: Math.floor(Date.now() / 1000) - 10 * 24 * 60 * 60 },
  { id: "g5", courseid: "2", coursename: "Modern Web Development", itemname: "Week 1 Participation", itemtype: "Participation", grade: 10, grademax: 10, percentage: 100, gradedategraded: Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60 },
  { id: "g6", courseid: "4", coursename: "Linear Algebra for Computing", itemname: "Introduction Quiz", itemtype: "Quiz", grade: 16, grademax: 20, percentage: 80, gradedategraded: Math.floor(Date.now() / 1000) - 4 * 24 * 60 * 60 },
];

export class MemStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    if (id === "1") return demoUser;
    return undefined;
  }

  async getCurrentUser(): Promise<User> {
    return demoUser;
  }

  async getCategories(): Promise<Category[]> {
    return demoCategories;
  }

  async getCourses(): Promise<Course[]> {
    return demoCourses;
  }

  async getCourse(id: string): Promise<Course | undefined> {
    return demoCourses.find((c) => c.id === id);
  }

  async getCourseSections(courseId: string): Promise<Section[]> {
    return demoSections.filter((s) => s.courseid === courseId);
  }

  async getCourseActivities(courseId: string): Promise<Activity[]> {
    return demoActivities.filter((a) => a.courseid === courseId);
  }

  async getUpcomingActivities(): Promise<Activity[]> {
    const now = Math.floor(Date.now() / 1000);
    return demoActivities
      .filter((a) => a.duedate && a.duedate > now && !a.completed)
      .sort((a, b) => (a.duedate || 0) - (b.duedate || 0));
  }

  async getEvents(): Promise<CalendarEvent[]> {
    return demoEvents.sort((a, b) => a.timestart - b.timestart);
  }

  async getUpcomingEvents(): Promise<CalendarEvent[]> {
    const now = Math.floor(Date.now() / 1000);
    return demoEvents
      .filter((e) => e.timestart > now)
      .sort((a, b) => a.timestart - b.timestart);
  }

  async getGrades(): Promise<GradeItem[]> {
    return demoGrades;
  }

  async getStats(): Promise<{
    totalCourses: number;
    completedActivities: number;
    averageGrade: number;
    upcomingDeadlines: number;
  }> {
    const enrolledCourses = demoCourses.filter((c) => c.enrolled);
    const completedActivities = demoActivities.filter((a) => a.completed);
    const gradeAverage =
      demoGrades.length > 0
        ? Math.round(
            demoGrades.reduce((acc, g) => acc + (g.percentage || 0), 0) /
              demoGrades.length
          )
        : 0;
    const now = Math.floor(Date.now() / 1000);
    const upcomingDeadlines = demoActivities.filter(
      (a) =>
        a.duedate &&
        a.duedate > now &&
        a.duedate < now + 7 * 24 * 60 * 60 &&
        !a.completed
    );

    return {
      totalCourses: enrolledCourses.length,
      completedActivities: completedActivities.length,
      averageGrade: gradeAverage,
      upcomingDeadlines: upcomingDeadlines.length,
    };
  }
}

export const storage = new MemStorage();
