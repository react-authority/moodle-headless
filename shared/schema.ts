import { z } from "zod";

// Moodle User
export const userSchema = z.object({
  id: z.string(),
  username: z.string(),
  firstname: z.string(),
  lastname: z.string(),
  fullname: z.string(),
  email: z.string().email(),
  profileimageurl: z.string().optional(),
  description: z.string().optional(),
});

export type User = z.infer<typeof userSchema>;

// Moodle Course Category
export const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  coursecount: z.number(),
});

export type Category = z.infer<typeof categorySchema>;

// Moodle Course
export const courseSchema = z.object({
  id: z.string(),
  shortname: z.string(),
  fullname: z.string(),
  summary: z.string().optional(),
  categoryid: z.string(),
  categoryname: z.string().optional(),
  startdate: z.number(),
  enddate: z.number().optional(),
  progress: z.number().optional(),
  enrolled: z.boolean().default(false),
  imageurl: z.string().optional(),
  teachername: z.string().optional(),
});

export type Course = z.infer<typeof courseSchema>;

// Course Section (Topic)
export const sectionSchema = z.object({
  id: z.string(),
  courseid: z.string(),
  name: z.string(),
  summary: z.string().optional(),
  visible: z.boolean().default(true),
  position: z.number(),
});

export type Section = z.infer<typeof sectionSchema>;

// Course Module/Activity
export const activityTypeSchema = z.enum([
  "assign",
  "quiz",
  "forum",
  "resource",
  "url",
  "page",
  "folder",
  "label",
  "book",
  "lesson",
  "workshop",
  "scorm",
  "h5pactivity",
  "choice",
  "feedback",
  "glossary",
  "wiki",
  "chat",
  "survey",
  "data",
  "lti",
]);

export type ActivityType = z.infer<typeof activityTypeSchema>;

export const activitySchema = z.object({
  id: z.string(),
  sectionid: z.string(),
  courseid: z.string(),
  name: z.string(),
  modname: activityTypeSchema,
  description: z.string().optional(),
  visible: z.boolean().default(true),
  position: z.number(),
  url: z.string().optional(),
  duedate: z.number().optional(),
  completed: z.boolean().default(false),
  grade: z.number().optional(),
  grademax: z.number().optional(),
});

export type Activity = z.infer<typeof activitySchema>;

// Calendar Event
export const eventSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  courseid: z.string().optional(),
  coursename: z.string().optional(),
  timestart: z.number(),
  timeduration: z.number(),
  eventtype: z.enum(["course", "user", "site", "group", "category"]),
  activityid: z.string().optional(),
  activityname: z.string().optional(),
});

export type CalendarEvent = z.infer<typeof eventSchema>;

// Grade Item
export const gradeItemSchema = z.object({
  id: z.string(),
  courseid: z.string(),
  coursename: z.string(),
  itemname: z.string(),
  itemtype: z.string(),
  grade: z.number().optional(),
  grademax: z.number(),
  percentage: z.number().optional(),
  feedback: z.string().optional(),
  gradedategraded: z.number().optional(),
});

export type GradeItem = z.infer<typeof gradeItemSchema>;

// Moodle Site Info
export const siteInfoSchema = z.object({
  sitename: z.string(),
  siteurl: z.string(),
  username: z.string(),
  firstname: z.string(),
  lastname: z.string(),
  fullname: z.string(),
  userid: z.string(),
  userpictureurl: z.string().optional(),
  lang: z.string(),
});

export type SiteInfo = z.infer<typeof siteInfoSchema>;

// API Configuration
export const moodleConfigSchema = z.object({
  siteUrl: z.string().url(),
  token: z.string(),
});

export type MoodleConfig = z.infer<typeof moodleConfigSchema>;

// Insert schemas for creating new items
export const insertUserSchema = userSchema.omit({ id: true });
export type InsertUser = z.infer<typeof insertUserSchema>;

export const insertCourseSchema = courseSchema.omit({ id: true });
export type InsertCourse = z.infer<typeof insertCourseSchema>;

export const insertActivitySchema = activitySchema.omit({ id: true });
export type InsertActivity = z.infer<typeof insertActivitySchema>;

export const insertEventSchema = eventSchema.omit({ id: true });
export type InsertEvent = z.infer<typeof insertEventSchema>;
