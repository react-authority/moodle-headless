import type {
  User,
  Course,
  Category,
  Section,
  Activity,
  CalendarEvent,
  GradeItem,
} from "@shared/schema";
import * as moodleClient from "./moodle-client";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getCurrentUser(): Promise<User>;
  getCategories(): Promise<Category[]>;
  getCourses(): Promise<Course[]>;
  getCourse(id: string): Promise<Course | undefined>;
  getCourseSections(courseId: string): Promise<Section[]>;
  getCourseActivities(courseId: string): Promise<Activity[]>;
  getUpcomingActivities(): Promise<Activity[]>;
  getEvents(): Promise<CalendarEvent[]>;
  getUpcomingEvents(): Promise<CalendarEvent[]>;
  getGrades(): Promise<GradeItem[]>;
  getStats(): Promise<{
    totalCourses: number;
    completedActivities: number;
    averageGrade: number;
    upcomingDeadlines: number;
  }>;
  getAssignments(courseId?: string): Promise<{
    id: string;
    courseId: string;
    name: string;
    intro: string;
    duedate: number;
    allowsubmissionsfromdate: number;
    grade: number;
  }[]>;
  getAssignmentSubmissionStatus(assignId: string): Promise<{
    submitted: boolean;
    graded: boolean;
    gradingStatus?: string;
    grade?: string;
    submissionTime?: number;
  } | null>;
  getQuizzes(courseId?: string): Promise<{
    id: string;
    courseId: string;
    name: string;
    intro: string;
    timeopen: number;
    timeclose: number;
    timelimit: number;
    grade: number;
    attempts: number;
  }[]>;
  getQuizAttempts(quizId: string): Promise<{
    id: string;
    attempt: number;
    state: string;
    timestart: number;
    timefinish: number;
    grade?: number;
  }[]>;
  getForums(courseId?: string): Promise<{
    id: string;
    courseId: string;
    name: string;
    intro: string;
    type: string;
    numdiscussions: number;
  }[]>;
  getForumDiscussions(forumId: string): Promise<{
    id: string;
    name: string;
    subject: string;
    message: string;
    userfullname: string;
    created: number;
    modified: number;
    numreplies: number;
    pinned: boolean;
  }[]>;
  getNotifications(): Promise<{
    id: string;
    subject: string;
    text: string;
    timecreated: number;
    read: boolean;
    component: string;
    contexturl: string;
    userfromfullname: string;
  }[]>;
  getUnreadNotificationCount(): Promise<number>;
  getUserBadges(): Promise<{
    id: string;
    name: string;
    description: string;
    badgeurl: string;
    issuername: string;
    dateissued: number;
  }[]>;
  updateActivityCompletion(cmid: string, completed: boolean): Promise<boolean>;
  getConnectionStatus(): { connected: boolean; siteUrl: string };
  getModuleContent(cmid: string, modname: string): Promise<{
    type: string;
    id: string;
    name: string;
    intro: string;
    content?: string;
    files?: { filename: string; fileurl: string; filesize: number; mimetype: string }[];
    externalurl?: string;
  } | null>;
}

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
];

const demoCourses: Course[] = [
  {
    id: "1",
    shortname: "CS101",
    fullname: "Introduction to Computer Science",
    summary: "Learn the fundamentals of programming and computational thinking.",
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
    summary: "Master modern web technologies including React and Node.js.",
    categoryid: "1",
    categoryname: "Computer Science",
    startdate: Math.floor(Date.now() / 1000) - 15 * 24 * 60 * 60,
    enddate: Math.floor(Date.now() / 1000) + 75 * 24 * 60 * 60,
    progress: 42,
    enrolled: true,
    teachername: "Prof. Michael Torres",
  },
];

const demoSections: Section[] = [
  { id: "s1", courseid: "1", name: "Getting Started", summary: "Welcome to the course", visible: true, position: 0 },
  { id: "s2", courseid: "1", name: "Week 1: Programming Basics", summary: "Variables and data types", visible: true, position: 1 },
  { id: "s3", courseid: "2", name: "Introduction to Web Dev", summary: "Overview", visible: true, position: 0 },
];

const demoActivities: Activity[] = [
  { id: "a1", sectionid: "s1", courseid: "1", name: "Course Introduction", modname: "resource", description: "Welcome video", visible: true, position: 0, completed: true },
  { id: "a2", sectionid: "s2", courseid: "1", name: "Variables Quiz", modname: "quiz", description: "Test your understanding", visible: true, position: 0, completed: true, grade: 18, grademax: 20 },
  { id: "a3", sectionid: "s2", courseid: "1", name: "Assignment: Hello World", modname: "assign", description: "Write your first program", visible: true, position: 1, duedate: Math.floor(Date.now() / 1000) + 2 * 24 * 60 * 60, completed: false },
  { id: "a4", sectionid: "s3", courseid: "2", name: "HTML Basics", modname: "page", description: "Learn HTML", visible: true, position: 0, completed: true },
];

const demoEvents: CalendarEvent[] = [
  {
    id: "e1",
    name: "Assignment Due",
    description: "Submit your first program",
    courseid: "1",
    coursename: "Introduction to Computer Science",
    timestart: Math.floor(Date.now() / 1000) + 2 * 24 * 60 * 60,
    timeduration: 0,
    eventtype: "course",
  },
];

const demoGrades: GradeItem[] = [
  {
    id: "g1",
    courseid: "1",
    coursename: "Introduction to Computer Science",
    itemname: "Variables Quiz",
    itemtype: "quiz",
    grade: 18,
    grademax: 20,
    percentage: 90,
  },
];

class MoodleStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    if (moodleClient.isConfigured()) {
      const user = await moodleClient.getCurrentUser();
      return user.id === id ? user : undefined;
    }
    return id === demoUser.id ? demoUser : undefined;
  }

  async getCurrentUser(): Promise<User> {
    if (moodleClient.isConfigured()) {
      return moodleClient.getCurrentUser();
    }
    return demoUser;
  }

  async getCategories(): Promise<Category[]> {
    if (moodleClient.isConfigured()) {
      return moodleClient.getCategories();
    }
    return demoCategories;
  }

  async getCourses(): Promise<Course[]> {
    if (moodleClient.isConfigured()) {
      return moodleClient.getCourses();
    }
    return demoCourses;
  }

  async getCourse(id: string): Promise<Course | undefined> {
    if (moodleClient.isConfigured()) {
      return moodleClient.getCourse(id);
    }
    return demoCourses.find((c) => c.id === id);
  }

  async getCourseSections(courseId: string): Promise<Section[]> {
    if (moodleClient.isConfigured()) {
      return moodleClient.getCourseSections(courseId);
    }
    return demoSections.filter((s) => s.courseid === courseId);
  }

  async getCourseActivities(courseId: string): Promise<Activity[]> {
    if (moodleClient.isConfigured()) {
      return moodleClient.getCourseActivities(courseId);
    }
    return demoActivities.filter((a) => a.courseid === courseId);
  }

  async getUpcomingActivities(): Promise<Activity[]> {
    if (moodleClient.isConfigured()) {
      return moodleClient.getUpcomingActivities();
    }
    const now = Math.floor(Date.now() / 1000);
    return demoActivities
      .filter((a) => a.duedate && a.duedate > now && !a.completed)
      .sort((a, b) => (a.duedate || 0) - (b.duedate || 0));
  }

  async getEvents(): Promise<CalendarEvent[]> {
    if (moodleClient.isConfigured()) {
      return moodleClient.getEvents();
    }
    return demoEvents;
  }

  async getUpcomingEvents(): Promise<CalendarEvent[]> {
    if (moodleClient.isConfigured()) {
      return moodleClient.getUpcomingEvents();
    }
    const now = Math.floor(Date.now() / 1000);
    return demoEvents
      .filter((e) => e.timestart >= now)
      .sort((a, b) => a.timestart - b.timestart);
  }

  async getGrades(): Promise<GradeItem[]> {
    if (moodleClient.isConfigured()) {
      return moodleClient.getGrades();
    }
    return demoGrades;
  }

  async getStats(): Promise<{
    totalCourses: number;
    completedActivities: number;
    averageGrade: number;
    upcomingDeadlines: number;
  }> {
    if (moodleClient.isConfigured()) {
      return moodleClient.getStats();
    }
    const courses = demoCourses.filter((c) => c.enrolled);
    const completed = demoActivities.filter((a) => a.completed);
    const grades = demoGrades.filter((g) => g.percentage !== undefined);
    const avgGrade = grades.length > 0
      ? Math.round(grades.reduce((sum, g) => sum + (g.percentage || 0), 0) / grades.length)
      : 0;
    const now = Math.floor(Date.now() / 1000);
    const upcoming = demoActivities.filter((a) => a.duedate && a.duedate > now && !a.completed);

    return {
      totalCourses: courses.length,
      completedActivities: completed.length,
      averageGrade: avgGrade,
      upcomingDeadlines: upcoming.length,
    };
  }

  async getAssignments(courseId?: string) {
    if (moodleClient.isConfigured()) {
      return moodleClient.getAssignments(courseId);
    }
    return [];
  }

  async getAssignmentSubmissionStatus(assignId: string) {
    if (moodleClient.isConfigured()) {
      return moodleClient.getAssignmentSubmissionStatus(assignId);
    }
    return null;
  }

  async getQuizzes(courseId?: string) {
    if (moodleClient.isConfigured()) {
      return moodleClient.getQuizzes(courseId);
    }
    return [];
  }

  async getQuizAttempts(quizId: string) {
    if (moodleClient.isConfigured()) {
      return moodleClient.getQuizAttempts(quizId);
    }
    return [];
  }

  async getForums(courseId?: string) {
    if (moodleClient.isConfigured()) {
      return moodleClient.getForums(courseId);
    }
    return [];
  }

  async getForumDiscussions(forumId: string) {
    if (moodleClient.isConfigured()) {
      return moodleClient.getForumDiscussions(forumId);
    }
    return [];
  }

  async getNotifications() {
    if (moodleClient.isConfigured()) {
      return moodleClient.getNotifications();
    }
    return [];
  }

  async getUnreadNotificationCount() {
    if (moodleClient.isConfigured()) {
      return moodleClient.getUnreadNotificationCount();
    }
    return 0;
  }

  async getUserBadges() {
    if (moodleClient.isConfigured()) {
      return moodleClient.getUserBadges();
    }
    return [];
  }

  async updateActivityCompletion(cmid: string, completed: boolean) {
    if (moodleClient.isConfigured()) {
      return moodleClient.updateActivityCompletion(cmid, completed);
    }
    return false;
  }

  getConnectionStatus() {
    return {
      connected: moodleClient.isConfigured(),
      siteUrl: moodleClient.getMoodleUrl(),
    };
  }

  async getModuleContent(cmid: string, modname: string) {
    if (!moodleClient.isConfigured()) {
      return null;
    }

    switch (modname) {
      case "page": {
        const page = await moodleClient.getPageContent(cmid);
        if (page) {
          return {
            type: "page",
            id: page.id,
            name: page.name,
            intro: page.intro,
            content: page.content,
          };
        }
        break;
      }
      case "book": {
        const book = await moodleClient.getBookContent(cmid);
        if (book) {
          return {
            type: "book",
            id: book.id,
            name: book.name,
            intro: book.intro,
            content: book.intro, // Book content requires special handling
          };
        }
        break;
      }
      case "resource": {
        const resource = await moodleClient.getResourceContent(cmid);
        if (resource) {
          return {
            type: "resource",
            id: resource.id,
            name: resource.name,
            intro: resource.intro,
            files: resource.files,
          };
        }
        break;
      }
      case "url": {
        const urlContent = await moodleClient.getUrlContent(cmid);
        if (urlContent) {
          return {
            type: "url",
            id: urlContent.id,
            name: urlContent.name,
            intro: urlContent.intro,
            externalurl: urlContent.externalurl,
          };
        }
        break;
      }
      case "label": {
        const label = await moodleClient.getLabelContent(cmid);
        if (label) {
          return {
            type: "label",
            id: label.id,
            name: label.name,
            intro: label.intro,
            content: label.intro,
          };
        }
        break;
      }
      default:
        return null;
    }
    return null;
  }
}

export const storage = new MoodleStorage();
