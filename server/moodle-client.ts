import type {
  User,
  Course,
  Category,
  Section,
  Activity,
  CalendarEvent,
  GradeItem,
  SiteInfo,
} from "@shared/schema";

const MOODLE_URL = process.env.MOODLE_URL || "";
const MOODLE_TOKEN = process.env.MOODLE_TOKEN || "";

interface MoodleResponse<T> {
  data?: T;
  exception?: string;
  errorcode?: string;
  message?: string;
}

async function callMoodleAPI<T>(wsfunction: string, params: Record<string, unknown> = {}): Promise<T> {
  const url = new URL(`${MOODLE_URL}/webservice/rest/server.php`);
  url.searchParams.set("wstoken", MOODLE_TOKEN);
  url.searchParams.set("wsfunction", wsfunction);
  url.searchParams.set("moodlewsrestformat", "json");

  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      value.forEach((v, i) => {
        if (typeof v === "object") {
          for (const [k, val] of Object.entries(v)) {
            url.searchParams.set(`${key}[${i}][${k}]`, String(val));
          }
        } else {
          url.searchParams.set(`${key}[${i}]`, String(v));
        }
      });
    } else {
      url.searchParams.set(key, String(value));
    }
  }

  const response = await fetch(url.toString());
  const data = await response.json();

  if (data.exception || data.errorcode) {
    console.error("Moodle API error:", data);
    throw new Error(data.message || data.exception || "Unknown Moodle error");
  }

  return data as T;
}

export function isConfigured(): boolean {
  return Boolean(MOODLE_URL && MOODLE_TOKEN);
}

interface MoodleSiteInfo {
  sitename: string;
  siteurl: string;
  username: string;
  firstname: string;
  lastname: string;
  fullname: string;
  userid: number;
  userpictureurl?: string;
  lang: string;
}

interface MoodleCourse {
  id: number;
  shortname: string;
  fullname: string;
  summary?: string;
  categoryid?: number;
  startdate: number;
  enddate?: number;
  progress?: number;
  overviewfiles?: { fileurl: string }[];
  contacts?: { fullname: string }[];
}

interface MoodleCourseContent {
  id: number;
  name: string;
  summary?: string;
  visible: number;
  modules: {
    id: number;
    name: string;
    modname: string;
    description?: string;
    visible: number;
    completion?: number;
    completiondata?: { state: number };
    dates?: { label: string; timestamp: number }[];
    grade?: number;
    grademax?: number;
  }[];
}

interface MoodleEvent {
  id: number;
  name: string;
  description?: string;
  courseid?: number;
  timestart: number;
  timeduration: number;
  eventtype: string;
  course?: { fullname: string };
  moduleid?: number;
  modulename?: string;
}

interface MoodleGradeItem {
  id: number;
  courseid: number;
  itemname: string;
  itemtype: string;
  graderaw?: number;
  grademax: number;
  percentageformatted?: string;
  feedback?: string;
  gradedategraded?: number;
}

interface MoodleCategory {
  id: number;
  name: string;
  description?: string;
  coursecount: number;
}

export async function getSiteInfo(): Promise<SiteInfo> {
  const info = await callMoodleAPI<MoodleSiteInfo>("core_webservice_get_site_info");
  return {
    sitename: info.sitename,
    siteurl: info.siteurl,
    username: info.username,
    firstname: info.firstname,
    lastname: info.lastname,
    fullname: info.fullname,
    userid: String(info.userid),
    userpictureurl: info.userpictureurl,
    lang: info.lang,
  };
}

export async function getCurrentUser(): Promise<User> {
  const info = await getSiteInfo();
  return {
    id: info.userid,
    username: info.username,
    firstname: info.firstname,
    lastname: info.lastname,
    fullname: info.fullname,
    email: `${info.username}@moodle.local`,
    profileimageurl: info.userpictureurl,
  };
}

export async function getCategories(): Promise<Category[]> {
  try {
    const categories = await callMoodleAPI<MoodleCategory[]>("core_course_get_categories");
    return categories.map((cat) => ({
      id: String(cat.id),
      name: cat.name,
      description: cat.description,
      coursecount: cat.coursecount,
    }));
  } catch {
    return [];
  }
}

export async function getCourses(): Promise<Course[]> {
  const siteInfo = await getSiteInfo();
  const userId = Number(siteInfo.userid);

  const enrolledCourses = await callMoodleAPI<MoodleCourse[]>("core_enrol_get_users_courses", {
    userid: userId,
  });

  const categories = await getCategories();
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  return enrolledCourses.map((course) => ({
    id: String(course.id),
    shortname: course.shortname,
    fullname: course.fullname,
    summary: course.summary || "",
    categoryid: String(course.categoryid || 0),
    categoryname: categoryMap.get(String(course.categoryid)) || "Course",
    startdate: course.startdate,
    enddate: course.enddate,
    progress: course.progress,
    enrolled: true,
    imageurl: course.overviewfiles?.[0]?.fileurl,
    teachername: course.contacts?.[0]?.fullname,
  }));
}

export async function getCourse(courseId: string): Promise<Course | undefined> {
  const courses = await getCourses();
  return courses.find((c) => c.id === courseId);
}

export async function getCourseSections(courseId: string): Promise<Section[]> {
  const content = await callMoodleAPI<MoodleCourseContent[]>("core_course_get_contents", {
    courseid: Number(courseId),
  });

  return content.map((section, index) => ({
    id: String(section.id),
    courseid: courseId,
    name: section.name,
    summary: section.summary,
    visible: section.visible === 1,
    position: index,
  }));
}

export async function getCourseActivities(courseId: string): Promise<Activity[]> {
  const content = await callMoodleAPI<MoodleCourseContent[]>("core_course_get_contents", {
    courseid: Number(courseId),
  });

  const activities: Activity[] = [];
  const validModnames = [
    "assign", "quiz", "forum", "resource", "url", "page", "folder",
    "label", "book", "lesson", "workshop", "scorm", "h5pactivity",
    "choice", "feedback", "glossary", "wiki", "chat", "survey", "data", "lti",
  ];

  for (const section of content) {
    for (const mod of section.modules) {
      const modname = validModnames.includes(mod.modname) ? mod.modname : "resource";
      const dueDate = mod.dates?.find((d) => d.label.toLowerCase().includes("due"))?.timestamp;
      const isCompleted = mod.completiondata?.state === 1;

      activities.push({
        id: String(mod.id),
        sectionid: String(section.id),
        courseid: courseId,
        name: mod.name,
        modname: modname as Activity["modname"],
        description: mod.description || "",
        visible: mod.visible === 1,
        position: activities.filter((a) => a.sectionid === String(section.id)).length,
        duedate: dueDate,
        completed: isCompleted,
        grade: mod.grade,
        grademax: mod.grademax,
      });
    }
  }

  return activities;
}

export async function getAllActivities(): Promise<Activity[]> {
  const courses = await getCourses();
  const allActivities: Activity[] = [];

  for (const course of courses) {
    const activities = await getCourseActivities(course.id);
    allActivities.push(...activities);
  }

  return allActivities;
}

export async function getUpcomingActivities(): Promise<Activity[]> {
  const activities = await getAllActivities();
  const now = Math.floor(Date.now() / 1000);

  return activities
    .filter((a) => a.duedate && a.duedate > now && !a.completed)
    .sort((a, b) => (a.duedate || 0) - (b.duedate || 0))
    .slice(0, 10);
}

export async function getEvents(): Promise<CalendarEvent[]> {
  try {
    const now = Math.floor(Date.now() / 1000);
    const events = await callMoodleAPI<{ events: MoodleEvent[] }>("core_calendar_get_calendar_events", {
      options: { timestart: now, timeend: now + 30 * 24 * 60 * 60 },
    });

    return (events.events || []).map((event) => ({
      id: String(event.id),
      name: event.name,
      description: event.description,
      courseid: event.courseid ? String(event.courseid) : undefined,
      coursename: event.course?.fullname,
      timestart: event.timestart,
      timeduration: event.timeduration,
      eventtype: (["course", "user", "site", "group", "category"].includes(event.eventtype)
        ? event.eventtype
        : "course") as CalendarEvent["eventtype"],
      activityid: event.moduleid ? String(event.moduleid) : undefined,
      activityname: event.modulename,
    }));
  } catch {
    return [];
  }
}

export async function getUpcomingEvents(): Promise<CalendarEvent[]> {
  const events = await getEvents();
  const now = Math.floor(Date.now() / 1000);

  return events
    .filter((e) => e.timestart >= now)
    .sort((a, b) => a.timestart - b.timestart)
    .slice(0, 10);
}

export async function getGrades(): Promise<GradeItem[]> {
  const siteInfo = await getSiteInfo();
  const userId = Number(siteInfo.userid);
  const courses = await getCourses();
  const grades: GradeItem[] = [];

  for (const course of courses) {
    try {
      const gradeData = await callMoodleAPI<{
        usergrades?: {
          gradeitems?: MoodleGradeItem[];
        }[];
      }>("gradereport_user_get_grade_items", {
        courseid: Number(course.id),
        userid: userId,
      });

      const items = gradeData.usergrades?.[0]?.gradeitems || [];
      for (const item of items) {
        if (item.itemname && item.grademax > 0) {
          const percentage = item.graderaw !== undefined
            ? Math.round((item.graderaw / item.grademax) * 100)
            : undefined;

          grades.push({
            id: String(item.id || `${course.id}-${item.itemname}`),
            courseid: course.id,
            coursename: course.fullname,
            itemname: item.itemname,
            itemtype: item.itemtype,
            grade: item.graderaw,
            grademax: item.grademax,
            percentage,
            feedback: item.feedback,
            gradedategraded: item.gradedategraded,
          });
        }
      }
    } catch {
      continue;
    }
  }

  return grades;
}

export async function getStats(): Promise<{
  totalCourses: number;
  completedActivities: number;
  averageGrade: number;
  upcomingDeadlines: number;
}> {
  const courses = await getCourses();
  const activities = await getAllActivities();
  const grades = await getGrades();
  const upcomingActivities = await getUpcomingActivities();

  const completedCount = activities.filter((a) => a.completed).length;
  const gradesWithValues = grades.filter((g) => g.percentage !== undefined);
  const averageGrade = gradesWithValues.length > 0
    ? Math.round(gradesWithValues.reduce((sum, g) => sum + (g.percentage || 0), 0) / gradesWithValues.length)
    : 0;

  return {
    totalCourses: courses.length,
    completedActivities: completedCount,
    averageGrade,
    upcomingDeadlines: upcomingActivities.length,
  };
}
