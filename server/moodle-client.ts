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

export function getMoodleUrl(): string {
  return MOODLE_URL;
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
    url?: string;
    instance?: number;
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

interface MoodleAssignment {
  id: number;
  cmid: number;
  course: number;
  name: string;
  intro: string;
  duedate: number;
  allowsubmissionsfromdate: number;
  cutoffdate: number;
  grade: number;
  introattachments?: { filename: string; fileurl: string }[];
}

interface MoodleSubmissionStatus {
  lastattempt?: {
    submission?: {
      id: number;
      userid?: number;
      status: string;
      timemodified: number;
      timecreated?: number;
      plugins?: {
        type: string;
        name: string;
        fileareas?: { area: string; files: { filename: string; fileurl: string; filesize: number }[] }[];
        editorfields?: { name: string; text: string; format: number }[];
      }[];
    };
    graded?: boolean;
    gradingstatus?: string;
    grading?: {
      grade?: string;
      gradefordisplay?: string;
      gradeddate?: number;
    };
  };
  gradingsummary?: {
    participantcount: number;
    submissioncount: number;
    submissionssubmittedcount: number;
    submissionsneedgradingcount: number;
  };
  feedback?: {
    grade?: { grade: string; gradefordisplay?: string };
    gradefordisplay?: string;
    gradeddate?: number;
    plugins?: { type: string; name: string; fileareas?: any[]; editorfields?: any[] }[];
  };
}

interface MoodleQuiz {
  id: number;
  coursemodule: number;
  course: number;
  name: string;
  intro: string;
  timeopen: number;
  timeclose: number;
  timelimit: number;
  grade: number;
  attempts: number;
  sumgrades: number;
  grademethod?: number;
  questions?: number;
}

interface MoodleQuizAttempt {
  id: number;
  quiz: number;
  userid: number;
  attempt: number;
  uniqueid?: number;
  layout?: string;
  currentpage?: number;
  preview?: number;
  state: string;
  timestart: number;
  timefinish: number;
  timemodified?: number;
  timemodifiedoffline?: number;
  sumgrades?: number;
}

interface MoodleForum {
  id: number;
  course: number;
  name: string;
  intro: string;
  type: string;
  numdiscussions: number;
}

interface MoodleDiscussion {
  id: number;
  name: string;
  subject: string;
  message: string;
  userid: number;
  userfullname: string;
  created: number;
  modified: number;
  numreplies: number;
  pinned: boolean;
}

interface MoodleMessage {
  id: number;
  useridfrom: number;
  useridto: number;
  subject?: string;
  text: string;
  fullmessage?: string;
  fullmessageformat?: number;
  fullmessagehtml?: string;
  smallmessage?: string;
  notification?: number;
  timecreated: number;
  timeread?: number;
}

interface MoodleBadge {
  id: number;
  name: string;
  description: string;
  badgeurl: string;
  issuername: string;
  dateissued: number;
  dateexpire?: number;
}

interface MoodleNotification {
  id: number;
  useridfrom: number;
  useridto: number;
  subject: string;
  shortenedsubject: string;
  text: string;
  fullmessage: string;
  fullmessagehtml: string;
  timecreated: number;
  timeread: number | null;
  read: boolean;
  component: string;
  contexturl: string;
  contexturlname: string;
  userfromfullname: string;
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
        url: mod.url,
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

// Assignment functions
export async function getAssignments(courseId?: string): Promise<{
  id: string;
  courseId: string;
  name: string;
  intro: string;
  duedate: number;
  allowsubmissionsfromdate: number;
  grade: number;
}[]> {
  try {
    const params: Record<string, unknown> = {};
    if (courseId) {
      params.courseids = [Number(courseId)];
    }

    const result = await callMoodleAPI<{ courses: { id: number; assignments: MoodleAssignment[] }[] }>(
      "mod_assign_get_assignments",
      params
    );

    const assignments: ReturnType<typeof getAssignments> extends Promise<infer T> ? T : never = [];

    for (const course of result.courses || []) {
      for (const assign of course.assignments || []) {
        assignments.push({
          id: String(assign.id),
          courseId: String(course.id),
          name: assign.name,
          intro: assign.intro,
          duedate: assign.duedate,
          allowsubmissionsfromdate: assign.allowsubmissionsfromdate,
          grade: assign.grade,
        });
      }
    }

    return assignments;
  } catch {
    return [];
  }
}

export async function getAssignmentSubmissionStatus(assignId: string): Promise<{
  submitted: boolean;
  graded: boolean;
  gradingStatus?: string;
  grade?: string;
  submissionTime?: number;
} | null> {
  try {
    const siteInfo = await getSiteInfo();
    const result = await callMoodleAPI<MoodleSubmissionStatus>("mod_assign_get_submission_status", {
      assignid: Number(assignId),
      userid: Number(siteInfo.userid),
    });

    return {
      submitted: result.lastattempt?.submission?.status === "submitted",
      graded: result.lastattempt?.graded || false,
      gradingStatus: result.lastattempt?.gradingstatus,
      grade: result.feedback?.gradefordisplay,
      submissionTime: result.lastattempt?.submission?.timemodified,
    };
  } catch {
    return null;
  }
}

// Quiz functions
export async function getQuizzes(courseId?: string): Promise<{
  id: string;
  courseId: string;
  name: string;
  intro: string;
  timeopen: number;
  timeclose: number;
  timelimit: number;
  grade: number;
  attempts: number;
}[]> {
  try {
    const params: Record<string, unknown> = {};
    if (courseId) {
      params.courseids = [Number(courseId)];
    }

    const result = await callMoodleAPI<{ quizzes: MoodleQuiz[] }>("mod_quiz_get_quizzes_by_courses", params);

    return (result.quizzes || []).map((quiz) => ({
      id: String(quiz.id),
      courseId: String(quiz.course),
      name: quiz.name,
      intro: quiz.intro,
      timeopen: quiz.timeopen,
      timeclose: quiz.timeclose,
      timelimit: quiz.timelimit,
      grade: quiz.grade,
      attempts: quiz.attempts,
    }));
  } catch {
    return [];
  }
}

// Forum functions
export async function getForums(courseId?: string): Promise<{
  id: string;
  courseId: string;
  name: string;
  intro: string;
  type: string;
  numdiscussions: number;
}[]> {
  try {
    const params: Record<string, unknown> = {};
    if (courseId) {
      params.courseids = [Number(courseId)];
    }

    const result = await callMoodleAPI<MoodleForum[]>("mod_forum_get_forums_by_courses", params);

    return (result || []).map((forum) => ({
      id: String(forum.id),
      courseId: String(forum.course),
      name: forum.name,
      intro: forum.intro,
      type: forum.type,
      numdiscussions: forum.numdiscussions,
    }));
  } catch {
    return [];
  }
}

// Messages and Notifications
export async function getNotifications(): Promise<{
  id: string;
  subject: string;
  text: string;
  timecreated: number;
  read: boolean;
  component: string;
  contexturl: string;
  userfromfullname: string;
}[]> {
  try {
    const siteInfo = await getSiteInfo();
    const result = await callMoodleAPI<{ notifications: MoodleNotification[] }>("message_popup_get_popup_notifications", {
      useridto: Number(siteInfo.userid),
    });

    return (result.notifications || []).map((notif) => ({
      id: String(notif.id),
      subject: notif.subject || notif.shortenedsubject,
      text: notif.text || notif.fullmessage,
      timecreated: notif.timecreated,
      read: notif.read || notif.timeread !== null,
      component: notif.component,
      contexturl: notif.contexturl,
      userfromfullname: notif.userfromfullname,
    }));
  } catch {
    return [];
  }
}

export async function getUnreadNotificationCount(): Promise<number> {
  try {
    const siteInfo = await getSiteInfo();
    const result = await callMoodleAPI<number>("message_popup_get_unread_popup_notification_count", {
      useridto: Number(siteInfo.userid),
    });
    return result || 0;
  } catch {
    return 0;
  }
}

// Badges
export async function getUserBadges(): Promise<{
  id: string;
  name: string;
  description: string;
  badgeurl: string;
  issuername: string;
  dateissued: number;
}[]> {
  try {
    const siteInfo = await getSiteInfo();
    const result = await callMoodleAPI<{ badges: MoodleBadge[] }>("core_badges_get_user_badges", {
      userid: Number(siteInfo.userid),
    });

    return (result.badges || []).map((badge) => ({
      id: String(badge.id),
      name: badge.name,
      description: badge.description,
      badgeurl: badge.badgeurl,
      issuername: badge.issuername,
      dateissued: badge.dateissued,
    }));
  } catch {
    return [];
  }
}

// Module Content Fetching
interface MoodleBook {
  id: number;
  coursemodule: number;
  course: number;
  name: string;
  intro: string;
  introformat: number;
}

interface MoodleBookChapter {
  id: number;
  bookid: number;
  pagenum: number;
  subchapter: number;
  title: string;
  content: string;
  contentformat: number;
  hidden: number;
}

interface MoodlePage {
  id: number;
  coursemodule: number;
  course: number;
  name: string;
  intro: string;
  content: string;
  contentformat: number;
}

interface MoodleResource {
  id: number;
  coursemodule: number;
  course: number;
  name: string;
  intro: string;
  contentfiles?: { filename: string; fileurl: string; filesize: number; mimetype: string }[];
}

export async function getBookContent(cmid: string): Promise<{
  id: string;
  name: string;
  intro: string;
  chapters: { id: string; title: string; content: string; pagenum: number }[];
} | null> {
  try {
    const courses = await getCourses();
    const courseIds = courses.map(c => Number(c.id));
    
    const booksResult = await callMoodleAPI<{ books: MoodleBook[] }>("mod_book_get_books_by_courses", {
      courseids: courseIds,
    });
    const book = booksResult.books?.find(b => String(b.coursemodule) === cmid);
    
    if (!book) return null;

    // Try to view the book to trigger logging/completion
    try {
      await callMoodleAPI("mod_book_view_book", { bookid: book.id });
    } catch {
      // View might fail, continue anyway
    }

    return {
      id: String(book.id),
      name: book.name,
      intro: book.intro,
      chapters: [],  // Moodle doesn't expose chapter content through standard API
    };
  } catch {
    return null;
  }
}

export async function getPageContent(cmid: string): Promise<{
  id: string;
  name: string;
  intro: string;
  content: string;
} | null> {
  try {
    const courses = await getCourses();
    const courseIds = courses.map(c => Number(c.id));
    
    const result = await callMoodleAPI<{ pages: MoodlePage[] }>("mod_page_get_pages_by_courses", {
      courseids: courseIds,
    });
    const page = result.pages?.find(p => String(p.coursemodule) === cmid);
    
    if (!page) return null;

    return {
      id: String(page.id),
      name: page.name,
      intro: page.intro,
      content: page.content,
    };
  } catch {
    return null;
  }
}

export async function getResourceContent(cmid: string): Promise<{
  id: string;
  name: string;
  intro: string;
  files: { filename: string; fileurl: string; filesize: number; mimetype: string }[];
} | null> {
  try {
    const courses = await getCourses();
    const courseIds = courses.map(c => Number(c.id));
    
    const result = await callMoodleAPI<{ resources: MoodleResource[] }>("mod_resource_get_resources_by_courses", {
      courseids: courseIds,
    });
    const resource = result.resources?.find(r => String(r.coursemodule) === cmid);
    
    if (!resource) return null;

    return {
      id: String(resource.id),
      name: resource.name,
      intro: resource.intro,
      files: (resource.contentfiles || []).map(f => ({
        filename: f.filename,
        fileurl: f.fileurl + `?token=${MOODLE_TOKEN}`,
        filesize: f.filesize,
        mimetype: f.mimetype,
      })),
    };
  } catch {
    return null;
  }
}

export async function getUrlContent(cmid: string): Promise<{
  id: string;
  name: string;
  intro: string;
  externalurl: string;
} | null> {
  try {
    const courses = await getCourses();
    const courseIds = courses.map(c => Number(c.id));
    
    const result = await callMoodleAPI<{ urls: { id: number; coursemodule: number; name: string; intro: string; externalurl: string }[] }>("mod_url_get_urls_by_courses", {
      courseids: courseIds,
    });
    const urlMod = result.urls?.find(u => String(u.coursemodule) === cmid);
    
    if (!urlMod) return null;

    return {
      id: String(urlMod.id),
      name: urlMod.name,
      intro: urlMod.intro,
      externalurl: urlMod.externalurl,
    };
  } catch {
    return null;
  }
}

export async function getLabelContent(cmid: string): Promise<{
  id: string;
  name: string;
  intro: string;
} | null> {
  try {
    const courses = await getCourses();
    const courseIds = courses.map(c => Number(c.id));
    
    const result = await callMoodleAPI<{ labels: { id: number; coursemodule: number; name: string; intro: string }[] }>("mod_label_get_labels_by_courses", {
      courseids: courseIds,
    });
    const label = result.labels?.find(l => String(l.coursemodule) === cmid);
    
    if (!label) return null;

    return {
      id: String(label.id),
      name: label.name,
      intro: label.intro,
    };
  } catch {
    return null;
  }
}

// Activity Completion
export async function updateActivityCompletion(cmid: string, completed: boolean): Promise<boolean> {
  try {
    await callMoodleAPI("core_completion_update_activity_completion_status_manually", {
      cmid: Number(cmid),
      completed: completed ? 1 : 0,
    });
    return true;
  } catch {
    return false;
  }
}

export async function getActivityCompletionStatus(courseId: string): Promise<{
  activityId: string;
  state: number;
  timecompleted: number | null;
}[]> {
  try {
    const siteInfo = await getSiteInfo();
    const result = await callMoodleAPI<{
      statuses: { cmid: number; state: number; timecompleted: number | null }[];
    }>("core_completion_get_activities_completion_status", {
      courseid: Number(courseId),
      userid: Number(siteInfo.userid),
    });

    return (result.statuses || []).map((status) => ({
      activityId: String(status.cmid),
      state: status.state,
      timecompleted: status.timecompleted,
    }));
  } catch {
    return [];
  }
}

// View course (marks course as viewed)
export async function viewCourse(courseId: string): Promise<boolean> {
  try {
    await callMoodleAPI("core_course_view_course", {
      courseid: Number(courseId),
    });
    return true;
  } catch {
    return false;
  }
}

// ============ QUIZ API ============

interface MoodleQuizQuestion {
  slot: number;
  type: string;
  page: number;
  html: string;
  sequencecheck: number;
  lastactiontime: number;
  hasautosavedstep: boolean;
  flagged: boolean;
  number: number;
  state: string;
  status: string;
  blockedbyprevious: boolean;
  mark?: string;
  maxmark?: number;
}

export interface QuizInfo {
  id: string;
  name: string;
  intro: string;
  timeOpen: number | null;
  timeClose: number | null;
  timeLimit: number;
  maxGrade: number;
  attemptsAllowed: number;
  questionsCount: number;
}

export interface QuizAttemptData {
  attemptId: string;
  state: string;
  currentPage: number;
  questions: {
    slot: number;
    type: string;
    html: string;
    number: number;
    state: string;
    flagged: boolean;
  }[];
}

export async function getQuizInfo(cmid: string): Promise<QuizInfo | null> {
  try {
    const courses = await getCourses();
    const courseIds = courses.map(c => Number(c.id));
    
    const result = await callMoodleAPI<{ quizzes: MoodleQuiz[] }>("mod_quiz_get_quizzes_by_courses", {
      courseids: courseIds,
    });
    
    const quiz = result.quizzes?.find(q => String(q.coursemodule) === cmid);
    if (!quiz) return null;
    
    return {
      id: String(quiz.id),
      name: quiz.name,
      intro: quiz.intro,
      timeOpen: quiz.timeopen || null,
      timeClose: quiz.timeclose || null,
      timeLimit: quiz.timelimit,
      maxGrade: quiz.grade,
      attemptsAllowed: quiz.attempts,
      questionsCount: quiz.questions || 0,
    };
  } catch (e) {
    console.error("Failed to get quiz info:", e);
    return null;
  }
}

export async function getQuizAttempts(quizId: string): Promise<{
  attempts: { id: string; attempt: number; state: string; grade?: number; timestart: number; timefinish: number }[];
} | null> {
  try {
    const result = await callMoodleAPI<{ attempts: MoodleQuizAttempt[] }>("mod_quiz_get_user_attempts", {
      quizid: Number(quizId),
      status: "all",
    });
    
    return {
      attempts: (result.attempts || []).map(a => ({
        id: String(a.id),
        attempt: a.attempt,
        state: a.state,
        grade: a.sumgrades,
        timestart: a.timestart,
        timefinish: a.timefinish,
      })),
    };
  } catch (e) {
    console.error("Failed to get quiz attempts:", e);
    return null;
  }
}

export async function startQuizAttempt(quizId: string): Promise<{ attemptId: string } | null> {
  try {
    const result = await callMoodleAPI<{ attempt: MoodleQuizAttempt }>("mod_quiz_start_attempt", {
      quizid: Number(quizId),
    });
    
    return { attemptId: String(result.attempt.id) };
  } catch (e) {
    console.error("Failed to start quiz attempt:", e);
    return null;
  }
}

export async function getQuizAttemptData(attemptId: string, page: number = 0): Promise<QuizAttemptData | null> {
  try {
    const result = await callMoodleAPI<{ attempt: MoodleQuizAttempt; questions: MoodleQuizQuestion[] }>("mod_quiz_get_attempt_data", {
      attemptid: Number(attemptId),
      page,
    });
    
    return {
      attemptId: String(result.attempt.id),
      state: result.attempt.state,
      currentPage: result.attempt.currentpage || 0,
      questions: (result.questions || []).map(q => ({
        slot: q.slot,
        type: q.type,
        html: q.html,
        number: q.number,
        state: q.state,
        flagged: q.flagged,
      })),
    };
  } catch (e) {
    console.error("Failed to get quiz attempt data:", e);
    return null;
  }
}

export async function saveQuizAttempt(attemptId: string, data: { slot: number; name: string; value: string }[]): Promise<boolean> {
  try {
    await callMoodleAPI("mod_quiz_save_attempt", {
      attemptid: Number(attemptId),
      data,
    });
    return true;
  } catch (e) {
    console.error("Failed to save quiz attempt:", e);
    return false;
  }
}

export async function finishQuizAttempt(attemptId: string): Promise<boolean> {
  try {
    await callMoodleAPI("mod_quiz_process_attempt", {
      attemptid: Number(attemptId),
      finishattempt: 1,
    });
    return true;
  } catch (e) {
    console.error("Failed to finish quiz attempt:", e);
    return false;
  }
}

export async function getQuizAttemptReview(attemptId: string): Promise<{
  grade?: number;
  questions: { slot: number; html: string; mark: string; maxmark: number; state: string }[];
} | null> {
  try {
    const result = await callMoodleAPI<{ 
      attempt: MoodleQuizAttempt;
      questions: MoodleQuizQuestion[];
      grade: string;
    }>("mod_quiz_get_attempt_review", {
      attemptid: Number(attemptId),
    });
    
    return {
      grade: result.attempt.sumgrades,
      questions: (result.questions || []).map(q => ({
        slot: q.slot,
        html: q.html,
        mark: q.mark || "0",
        maxmark: q.maxmark || 0,
        state: q.state,
      })),
    };
  } catch (e) {
    console.error("Failed to get quiz review:", e);
    return null;
  }
}

// ============ ASSIGNMENT API ============

interface MoodleAssignment {
  id: number;
  cmid: number;
  course: number;
  name: string;
  intro: string;
  introformat: number;
  duedate: number;
  allowsubmissionsfromdate: number;
  grade: number;
  timemodified: number;
  cutoffdate: number;
  gradingduedate: number;
  submissiondrafts: number;
  requiresubmissionstatement: number;
  configs?: { plugin: string; subtype: string; name: string; value: string }[];
}

export interface AssignmentInfo {
  id: string;
  cmid: string;
  name: string;
  intro: string;
  dueDate: number | null;
  cutoffDate: number | null;
  maxGrade: number;
  submissionStatus: string;
  gradeStatus: string | null;
  grade: string | null;
  feedback: string | null;
  submittedFiles: { filename: string; fileurl: string; filesize: number }[];
  submittedText: string | null;
}

export async function getAssignmentInfo(cmid: string): Promise<AssignmentInfo | null> {
  try {
    const courses = await getCourses();
    const courseIds = courses.map(c => Number(c.id));
    
    // Get assignment details
    const assignResult = await callMoodleAPI<{ courses: { assignments: MoodleAssignment[] }[] }>("mod_assign_get_assignments", {
      courseids: courseIds,
    });
    
    let assignment: MoodleAssignment | undefined;
    for (const course of assignResult.courses || []) {
      assignment = course.assignments?.find(a => String(a.cmid) === cmid);
      if (assignment) break;
    }
    
    if (!assignment) return null;
    
    // Get submission status
    let submissionStatus: MoodleSubmissionStatus | null = null;
    try {
      submissionStatus = await callMoodleAPI<MoodleSubmissionStatus>("mod_assign_get_submission_status", {
        assignid: assignment.id,
      });
    } catch {
      // Submission status might fail if user hasn't submitted
    }
    
    const submission = submissionStatus?.lastattempt?.submission;
    const grading = submissionStatus?.lastattempt?.grading;
    const feedback = submissionStatus?.feedback;
    
    // Extract submitted files
    let submittedFiles: { filename: string; fileurl: string; filesize: number }[] = [];
    let submittedText: string | null = null;
    
    if (submission?.plugins) {
      for (const plugin of submission.plugins) {
        if (plugin.fileareas) {
          for (const area of plugin.fileareas) {
            submittedFiles.push(...(area.files || []));
          }
        }
        if (plugin.editorfields) {
          for (const field of plugin.editorfields) {
            if (field.text) {
              submittedText = field.text;
            }
          }
        }
      }
    }
    
    return {
      id: String(assignment.id),
      cmid: String(assignment.cmid),
      name: assignment.name,
      intro: assignment.intro,
      dueDate: assignment.duedate || null,
      cutoffDate: assignment.cutoffdate || null,
      maxGrade: assignment.grade,
      submissionStatus: submission?.status || "nosubmission",
      gradeStatus: grading?.gradefordisplay || null,
      grade: feedback?.grade?.gradefordisplay || null,
      feedback: null,
      submittedFiles: submittedFiles.map(f => ({
        filename: f.filename,
        fileurl: f.fileurl + `?token=${MOODLE_TOKEN}`,
        filesize: f.filesize,
      })),
      submittedText,
    };
  } catch (e) {
    console.error("Failed to get assignment info:", e);
    return null;
  }
}

export async function saveAssignmentSubmission(
  assignId: string, 
  text?: string,
  fileItemId?: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const pluginData: { type: string; text?: string; onlinetext?: number; files_filemanager?: number }[] = [];
    
    if (text !== undefined) {
      pluginData.push({
        type: "onlinetext",
        onlinetext: 1,
        text,
      });
    }
    
    if (fileItemId !== undefined) {
      pluginData.push({
        type: "file",
        files_filemanager: fileItemId,
      });
    }
    
    await callMoodleAPI("mod_assign_save_submission", {
      assignmentid: Number(assignId),
      plugindata: {
        onlinetext_editor: text ? { text, format: 1, itemid: 0 } : undefined,
        files_filemanager: fileItemId,
      },
    });
    
    return { success: true };
  } catch (e: any) {
    console.error("Failed to save assignment submission:", e);
    return { success: false, error: e.message || "Failed to save submission" };
  }
}

export async function submitAssignmentForGrading(assignId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await callMoodleAPI("mod_assign_submit_for_grading", {
      assignmentid: Number(assignId),
      acceptsubmissionstatement: 1,
    });
    return { success: true };
  } catch (e: any) {
    console.error("Failed to submit assignment for grading:", e);
    return { success: false, error: e.message || "Failed to submit for grading" };
  }
}

export async function uploadFile(
  filename: string,
  fileContent: string,
  component: string = "user",
  fileArea: string = "draft"
): Promise<{ itemid: number; fileurl: string } | null> {
  try {
    const formData = new URLSearchParams();
    formData.append("token", MOODLE_TOKEN);
    formData.append("component", component);
    formData.append("filearea", fileArea);
    formData.append("itemid", "0");
    formData.append("filepath", "/");
    formData.append("filename", filename);
    formData.append("filecontent", fileContent);
    
    const response = await fetch(`${MOODLE_URL}/webservice/upload.php`, {
      method: "POST",
      body: formData,
    });
    
    const result = await response.json();
    if (result.error) {
      throw new Error(result.error);
    }
    
    return {
      itemid: result.itemid,
      fileurl: result.url,
    };
  } catch (e) {
    console.error("Failed to upload file:", e);
    return null;
  }
}

// ============ FORUM API ============

interface MoodleForum {
  id: number;
  course: number;
  type: string;
  name: string;
  intro: string;
  cmid: number;
}

interface MoodleDiscussion {
  id: number;
  name: string;
  firstpostid: number;
  userid: number;
  userfullname: string;
  userpictureurl: string;
  usermodified: number;
  usermodifiedfullname: string;
  usermodifiedpictureurl: string;
  message: string;
  timemodified: number;
  numreplies: number;
  numunread: number;
  pinned: boolean;
  locked: boolean;
  starred: boolean;
}

interface MoodlePost {
  id: number;
  discussionid: number;
  parentid: number | null;
  userid: number;
  userfullname: string;
  userpictureurl: string;
  subject: string;
  message: string;
  messageplain: string;
  created: number;
  modified: number;
  hasparent: boolean;
  isdeleted: boolean;
  isprivatereply: boolean;
  haswordcount: boolean;
  wordcount: number;
  capabilities: { reply: boolean; delete: boolean; edit: boolean };
}

export interface ForumInfo {
  id: string;
  cmid: string;
  name: string;
  intro: string;
  type: string;
}

export interface ForumDiscussion {
  id: string;
  name: string;
  authorName: string;
  authorAvatar: string;
  message: string;
  timeModified: number;
  numReplies: number;
  numUnread: number;
  pinned: boolean;
  locked: boolean;
}

export interface ForumPost {
  id: string;
  discussionId: string;
  parentId: string | null;
  authorName: string;
  authorAvatar: string;
  subject: string;
  message: string;
  created: number;
  modified: number;
  canReply: boolean;
}

export async function getForumInfo(cmid: string): Promise<ForumInfo | null> {
  try {
    const courses = await getCourses();
    const courseIds = courses.map(c => Number(c.id));
    
    const result = await callMoodleAPI<{ forums: MoodleForum[] }>("mod_forum_get_forums_by_courses", {
      courseids: courseIds,
    });
    
    const forum = result.forums?.find(f => String(f.cmid) === cmid);
    if (!forum) return null;
    
    return {
      id: String(forum.id),
      cmid: String(forum.cmid),
      name: forum.name,
      intro: forum.intro,
      type: forum.type,
    };
  } catch (e) {
    console.error("Failed to get forum info:", e);
    return null;
  }
}

export async function getForumDiscussions(forumId: string): Promise<ForumDiscussion[]> {
  try {
    const result = await callMoodleAPI<{ discussions: MoodleDiscussion[] }>("mod_forum_get_forum_discussions", {
      forumid: Number(forumId),
      sortby: "timemodified",
      sortdirection: "DESC",
    });
    
    return (result.discussions || []).map(d => ({
      id: String(d.id),
      name: d.name,
      authorName: d.userfullname,
      authorAvatar: d.userpictureurl,
      message: d.message,
      timeModified: d.timemodified,
      numReplies: d.numreplies,
      numUnread: d.numunread,
      pinned: d.pinned,
      locked: d.locked,
    }));
  } catch (e) {
    console.error("Failed to get forum discussions:", e);
    return [];
  }
}

export async function getForumDiscussionPosts(discussionId: string): Promise<ForumPost[]> {
  try {
    const result = await callMoodleAPI<{ posts: MoodlePost[] }>("mod_forum_get_discussion_posts", {
      discussionid: Number(discussionId),
      sortby: "created",
      sortdirection: "ASC",
    });
    
    return (result.posts || []).map(p => ({
      id: String(p.id),
      discussionId: String(p.discussionid),
      parentId: p.parentid ? String(p.parentid) : null,
      authorName: p.userfullname,
      authorAvatar: p.userpictureurl,
      subject: p.subject,
      message: p.message,
      created: p.created,
      modified: p.modified,
      canReply: p.capabilities?.reply || false,
    }));
  } catch (e) {
    console.error("Failed to get discussion posts:", e);
    return [];
  }
}

export async function addForumDiscussion(forumId: string, subject: string, message: string): Promise<{ discussionId: string } | null> {
  try {
    const result = await callMoodleAPI<{ discussionid: number; postid: number }>("mod_forum_add_discussion", {
      forumid: Number(forumId),
      subject,
      message,
    });
    
    return { discussionId: String(result.discussionid) };
  } catch (e) {
    console.error("Failed to add discussion:", e);
    return null;
  }
}

export async function addForumPost(discussionId: string, parentId: string, subject: string, message: string): Promise<{ postId: string } | null> {
  try {
    const result = await callMoodleAPI<{ postid: number }>("mod_forum_add_discussion_post", {
      postid: Number(parentId),
      subject,
      message,
    });
    
    return { postId: String(result.postid) };
  } catch (e) {
    console.error("Failed to add post:", e);
    return null;
  }
}

// ============ LESSON API ============

interface MoodleLesson {
  id: number;
  course: number;
  coursemodule: number;
  name: string;
  intro: string;
  introformat: number;
  practice: number;
  modattempts: number;
  grade: number;
  custom: number;
  ongoing: number;
  maxanswers: number;
  maxattempts: number;
  review: number;
  nextpagedefault: number;
  feedback: number;
  minquestions: number;
  maxpages: number;
  timelimit: number;
  retake: number;
  activitylink: number;
  mediafile: string;
  mediaheight: number;
  mediawidth: number;
  mediaclose: number;
  slideshow: number;
  width: number;
  height: number;
  bgcolor: string;
  displayleft: number;
  displayleftif: number;
  progressbar: number;
  available: number;
  deadline: number;
  timemodified: number;
  completionendreached: number;
  completiontimespent: number;
  allowofflineattempts: number;
}

interface MoodleLessonPage {
  id: number;
  lessonid: number;
  prevpageid: number;
  nextpageid: number;
  qtype: number;
  qoption: number;
  layout: number;
  display: number;
  timecreated: number;
  timemodified: number;
  title: string;
  contents: string;
  contentsformat: number;
}

export interface LessonInfo {
  id: string;
  cmid: string;
  name: string;
  intro: string;
  grade: number;
  timelimit: number;
  retake: number;
  maxattempts: number;
  available: number | null;
  deadline: number | null;
  progressbar: boolean;
  ongoing: boolean;
}

export async function getLessonInfo(cmid: string): Promise<LessonInfo | null> {
  try {
    const courses = await getCourses();
    const courseIds = courses.map(c => Number(c.id));
    
    const result = await callMoodleAPI<{ lessons: MoodleLesson[] }>("mod_lesson_get_lessons_by_courses", {
      courseids: courseIds,
    });
    
    const lesson = result.lessons?.find(l => String(l.coursemodule) === cmid);
    if (!lesson) return null;
    
    return {
      id: String(lesson.id),
      cmid: String(lesson.coursemodule),
      name: lesson.name,
      intro: lesson.intro,
      grade: lesson.grade,
      timelimit: lesson.timelimit,
      retake: lesson.retake,
      maxattempts: lesson.maxattempts,
      available: lesson.available || null,
      deadline: lesson.deadline || null,
      progressbar: lesson.progressbar === 1,
      ongoing: lesson.ongoing === 1,
    };
  } catch (e) {
    console.error("Failed to get lesson info:", e);
    return null;
  }
}

export async function getLessonPages(lessonId: string): Promise<{ id: string; title: string; contents: string; qtype: number }[]> {
  try {
    const result = await callMoodleAPI<{ pages: MoodleLessonPage[] }>("mod_lesson_get_pages", {
      lessonid: Number(lessonId),
    });
    
    return (result.pages || []).map(p => ({
      id: String(p.id),
      title: p.title,
      contents: p.contents,
      qtype: p.qtype,
    }));
  } catch (e) {
    console.error("Failed to get lesson pages:", e);
    return [];
  }
}

export async function viewLesson(lessonId: string): Promise<boolean> {
  try {
    await callMoodleAPI("mod_lesson_view_lesson", { lessonid: Number(lessonId) });
    return true;
  } catch {
    return false;
  }
}

// ============ SCORM API ============

interface MoodleScorm {
  id: number;
  coursemodule: number;
  course: number;
  name: string;
  intro: string;
  introformat: number;
  version: string;
  maxgrade: number;
  grademethod: number;
  whatgrade: number;
  maxattempt: number;
  forcecompleted: number;
  forcenewattempt: number;
  lastattemptlock: number;
  displayattemptstatus: number;
  displaycoursestructure: number;
  updatefreq: number;
  sha1hash: string;
  revision: number;
  launch: number;
  timeopen: number;
  timeclose: number;
  width: number;
  height: number;
  popup: number;
}

interface MoodleScormSco {
  id: number;
  scorm: number;
  manifest: string;
  organization: string;
  parent: string;
  identifier: string;
  launch: string;
  scormtype: string;
  title: string;
  sortorder: number;
}

export interface ScormInfo {
  id: string;
  cmid: string;
  name: string;
  intro: string;
  maxgrade: number;
  maxattempt: number;
  timeopen: number | null;
  timeclose: number | null;
  width: number;
  height: number;
  popup: boolean;
}

export interface ScormSco {
  id: string;
  title: string;
  scormtype: string;
  launch: string;
  sortorder: number;
}

export async function getScormInfo(cmid: string): Promise<ScormInfo | null> {
  try {
    const courses = await getCourses();
    const courseIds = courses.map(c => Number(c.id));
    
    const result = await callMoodleAPI<{ scorms: MoodleScorm[] }>("mod_scorm_get_scorms_by_courses", {
      courseids: courseIds,
    });
    
    const scorm = result.scorms?.find(s => String(s.coursemodule) === cmid);
    if (!scorm) return null;
    
    return {
      id: String(scorm.id),
      cmid: String(scorm.coursemodule),
      name: scorm.name,
      intro: scorm.intro,
      maxgrade: scorm.maxgrade,
      maxattempt: scorm.maxattempt,
      timeopen: scorm.timeopen || null,
      timeclose: scorm.timeclose || null,
      width: scorm.width,
      height: scorm.height,
      popup: scorm.popup === 1,
    };
  } catch (e) {
    console.error("Failed to get scorm info:", e);
    return null;
  }
}

export async function getScormScoes(scormId: string): Promise<ScormSco[]> {
  try {
    const result = await callMoodleAPI<{ scoes: MoodleScormSco[] }>("mod_scorm_get_scorm_scoes", {
      scormid: Number(scormId),
    });
    
    return (result.scoes || []).map(s => ({
      id: String(s.id),
      title: s.title,
      scormtype: s.scormtype,
      launch: s.launch,
      sortorder: s.sortorder,
    }));
  } catch (e) {
    console.error("Failed to get scorm scoes:", e);
    return [];
  }
}

export async function getScormAttemptCount(scormId: string): Promise<number> {
  try {
    const siteInfo = await getSiteInfo();
    const result = await callMoodleAPI<{ attemptscount: number }>("mod_scorm_get_scorm_attempt_count", {
      scormid: Number(scormId),
      userid: Number(siteInfo.userid),
    });
    return result.attemptscount || 0;
  } catch {
    return 0;
  }
}

export async function viewScorm(scormId: string): Promise<boolean> {
  try {
    await callMoodleAPI("mod_scorm_view_scorm", { scormid: Number(scormId) });
    return true;
  } catch {
    return false;
  }
}

// ============ H5P ACTIVITY API ============

interface MoodleH5pActivity {
  id: number;
  course: number;
  name: string;
  timecreated: number;
  timemodified: number;
  intro: string;
  introformat: number;
  grade: number;
  displayoptions: number;
  enabletracking: number;
  grademethod: number;
  contenthash: string;
  coursemodule: number;
  context: number;
  package?: { filename: string; fileurl: string; filesize: number }[];
  deployedfile?: { filename: string; fileurl: string };
}

interface MoodleH5pAttempt {
  id: number;
  h5pactivityid: number;
  userid: number;
  timecreated: number;
  timemodified: number;
  attempt: number;
  rawscore: number;
  maxscore: number;
  duration: number;
  completion: number;
  success: number;
  scaled: number;
}

export interface H5pActivityInfo {
  id: string;
  cmid: string;
  name: string;
  intro: string;
  grade: number;
  enabletracking: boolean;
  grademethod: number;
  packageUrl?: string;
}

export interface H5pAttempt {
  id: string;
  attempt: number;
  rawscore: number;
  maxscore: number;
  duration: number;
  completion: boolean;
  success: boolean;
  timecreated: number;
}

export async function getH5pActivityInfo(cmid: string): Promise<H5pActivityInfo | null> {
  try {
    const courses = await getCourses();
    const courseIds = courses.map(c => Number(c.id));
    
    const result = await callMoodleAPI<{ h5pactivities: MoodleH5pActivity[] }>("mod_h5pactivity_get_h5pactivities_by_courses", {
      courseids: courseIds,
    });
    
    const h5p = result.h5pactivities?.find(h => String(h.coursemodule) === cmid);
    if (!h5p) return null;
    
    return {
      id: String(h5p.id),
      cmid: String(h5p.coursemodule),
      name: h5p.name,
      intro: h5p.intro,
      grade: h5p.grade,
      enabletracking: h5p.enabletracking === 1,
      grademethod: h5p.grademethod,
      packageUrl: h5p.deployedfile?.fileurl ? h5p.deployedfile.fileurl + `?token=${MOODLE_TOKEN}` : undefined,
    };
  } catch (e) {
    console.error("Failed to get h5p activity info:", e);
    return null;
  }
}

export async function getH5pAttempts(h5pId: string): Promise<H5pAttempt[]> {
  try {
    const siteInfo = await getSiteInfo();
    const result = await callMoodleAPI<{ attempts: MoodleH5pAttempt[] }>("mod_h5pactivity_get_user_attempts", {
      h5pactivityid: Number(h5pId),
      userid: Number(siteInfo.userid),
    });
    
    return (result.attempts || []).map(a => ({
      id: String(a.id),
      attempt: a.attempt,
      rawscore: a.rawscore,
      maxscore: a.maxscore,
      duration: a.duration,
      completion: a.completion === 1,
      success: a.success === 1,
      timecreated: a.timecreated,
    }));
  } catch (e) {
    console.error("Failed to get h5p attempts:", e);
    return [];
  }
}

export async function viewH5pActivity(h5pId: string): Promise<boolean> {
  try {
    await callMoodleAPI("mod_h5pactivity_view_h5pactivity", { h5pactivityid: Number(h5pId) });
    return true;
  } catch {
    return false;
  }
}

// ============ WIKI API ============

interface MoodleWiki {
  id: number;
  coursemodule: number;
  course: number;
  name: string;
  intro: string;
  introformat: number;
  timecreated: number;
  timemodified: number;
  firstpagetitle: string;
  wikimode: string;
  defaultformat: string;
  forceformat: number;
  editbegin: number;
  editend: number;
  cancreatepages: number;
}

interface MoodleWikiSubwiki {
  id: number;
  wikiid: number;
  groupid: number;
  userid: number;
}

interface MoodleWikiPage {
  id: number;
  subwikiid: number;
  title: string;
  timecreated: number;
  timemodified: number;
  timerendered: number;
  userid: number;
  pageviews: number;
  readonly: number;
  caneditpage: number;
  firstpage: number;
  cachedcontent: string;
  contentformat: number;
  tags?: { id: number; name: string; rawname: string }[];
}

export interface WikiInfo {
  id: string;
  cmid: string;
  name: string;
  intro: string;
  firstpagetitle: string;
  wikimode: string;
  defaultformat: string;
  cancreatepages: boolean;
}

export interface WikiPage {
  id: string;
  title: string;
  content: string;
  timecreated: number;
  timemodified: number;
  canedit: boolean;
  firstpage: boolean;
}

export async function getWikiInfo(cmid: string): Promise<WikiInfo | null> {
  try {
    const courses = await getCourses();
    const courseIds = courses.map(c => Number(c.id));
    
    const result = await callMoodleAPI<{ wikis: MoodleWiki[] }>("mod_wiki_get_wikis_by_courses", {
      courseids: courseIds,
    });
    
    const wiki = result.wikis?.find(w => String(w.coursemodule) === cmid);
    if (!wiki) return null;
    
    return {
      id: String(wiki.id),
      cmid: String(wiki.coursemodule),
      name: wiki.name,
      intro: wiki.intro,
      firstpagetitle: wiki.firstpagetitle,
      wikimode: wiki.wikimode,
      defaultformat: wiki.defaultformat,
      cancreatepages: wiki.cancreatepages === 1,
    };
  } catch (e) {
    console.error("Failed to get wiki info:", e);
    return null;
  }
}

export async function getWikiSubwikis(wikiId: string): Promise<{ id: string; wikiid: string; groupid: number }[]> {
  try {
    const result = await callMoodleAPI<{ subwikis: MoodleWikiSubwiki[] }>("mod_wiki_get_subwikis", {
      wikiid: Number(wikiId),
    });
    
    return (result.subwikis || []).map(s => ({
      id: String(s.id),
      wikiid: String(s.wikiid),
      groupid: s.groupid,
    }));
  } catch (e) {
    console.error("Failed to get wiki subwikis:", e);
    return [];
  }
}

export async function getWikiPages(subwikiId: string): Promise<WikiPage[]> {
  try {
    const result = await callMoodleAPI<{ pages: MoodleWikiPage[] }>("mod_wiki_get_subwiki_pages", {
      wikiid: Number(subwikiId),
    });
    
    return (result.pages || []).map(p => ({
      id: String(p.id),
      title: p.title,
      content: p.cachedcontent,
      timecreated: p.timecreated,
      timemodified: p.timemodified,
      canedit: p.caneditpage === 1,
      firstpage: p.firstpage === 1,
    }));
  } catch (e) {
    console.error("Failed to get wiki pages:", e);
    return [];
  }
}

export async function getWikiPageContents(pageId: string): Promise<{ title: string; content: string; canedit: boolean } | null> {
  try {
    const result = await callMoodleAPI<{ page: MoodleWikiPage }>("mod_wiki_get_page_contents", {
      pageid: Number(pageId),
    });
    
    return {
      title: result.page.title,
      content: result.page.cachedcontent,
      canedit: result.page.caneditpage === 1,
    };
  } catch (e) {
    console.error("Failed to get wiki page contents:", e);
    return null;
  }
}

export async function viewWiki(wikiId: string): Promise<boolean> {
  try {
    await callMoodleAPI("mod_wiki_view_wiki", { wikiid: Number(wikiId) });
    return true;
  } catch {
    return false;
  }
}

// ============ GLOSSARY API ============

interface MoodleGlossary {
  id: number;
  coursemodule: number;
  course: number;
  name: string;
  intro: string;
  introformat: number;
  allowduplicatedentries: number;
  displayformat: string;
  mainglossary: number;
  showspecial: number;
  showalphabet: number;
  showall: number;
  allowcomments: number;
  allowprintview: number;
  usedynalink: number;
  defaultapproval: number;
  approvaldisplayformat: string;
  globalglossary: number;
  entbypage: number;
  editalways: number;
  rsstype: number;
  rssarticles: number;
  assessed: number;
  assesstimestart: number;
  assesstimefinish: number;
  scale: number;
  timecreated: number;
  timemodified: number;
  completionentries: number;
  browsemodes: string[];
  canaddentry: number;
}

interface MoodleGlossaryEntry {
  id: number;
  glossaryid: number;
  userid: number;
  userfullname: string;
  userpictureurl: string;
  concept: string;
  definition: string;
  definitionformat: number;
  definitiontrust: number;
  attachment: number;
  attachments?: { filename: string; fileurl: string; filesize: number }[];
  timecreated: number;
  timemodified: number;
  teacherentry: number;
  sourceglossaryid: number;
  usedynalink: number;
  casesensitive: number;
  fullmatch: number;
  approved: number;
}

export interface GlossaryInfo {
  id: string;
  cmid: string;
  name: string;
  intro: string;
  displayformat: string;
  canaddentry: boolean;
  allowcomments: boolean;
  showalphabet: boolean;
  showall: boolean;
  showspecial: boolean;
  entbypage: number;
}

export interface GlossaryEntry {
  id: string;
  concept: string;
  definition: string;
  userfullname: string;
  userpictureurl: string;
  timecreated: number;
  timemodified: number;
  approved: boolean;
  attachments?: { filename: string; fileurl: string; filesize: number }[];
}

export async function getGlossaryInfo(cmid: string): Promise<GlossaryInfo | null> {
  try {
    const courses = await getCourses();
    const courseIds = courses.map(c => Number(c.id));
    
    const result = await callMoodleAPI<{ glossaries: MoodleGlossary[] }>("mod_glossary_get_glossaries_by_courses", {
      courseids: courseIds,
    });
    
    const glossary = result.glossaries?.find(g => String(g.coursemodule) === cmid);
    if (!glossary) return null;
    
    return {
      id: String(glossary.id),
      cmid: String(glossary.coursemodule),
      name: glossary.name,
      intro: glossary.intro,
      displayformat: glossary.displayformat,
      canaddentry: glossary.canaddentry === 1,
      allowcomments: glossary.allowcomments === 1,
      showalphabet: glossary.showalphabet === 1,
      showall: glossary.showall === 1,
      showspecial: glossary.showspecial === 1,
      entbypage: glossary.entbypage,
    };
  } catch (e) {
    console.error("Failed to get glossary info:", e);
    return null;
  }
}

export async function getGlossaryEntries(glossaryId: string, letter: string = "ALL", from: number = 0, limit: number = 20): Promise<{ entries: GlossaryEntry[]; count: number }> {
  try {
    const result = await callMoodleAPI<{ entries: MoodleGlossaryEntry[]; count: number }>("mod_glossary_get_entries_by_letter", {
      id: Number(glossaryId),
      letter,
      from,
      limit,
    });
    
    return {
      entries: (result.entries || []).map(e => ({
        id: String(e.id),
        concept: e.concept,
        definition: e.definition,
        userfullname: e.userfullname,
        userpictureurl: e.userpictureurl,
        timecreated: e.timecreated,
        timemodified: e.timemodified,
        approved: e.approved === 1,
        attachments: e.attachments?.map(a => ({
          filename: a.filename,
          fileurl: a.fileurl + `?token=${MOODLE_TOKEN}`,
          filesize: a.filesize,
        })),
      })),
      count: result.count || 0,
    };
  } catch (e) {
    console.error("Failed to get glossary entries:", e);
    return { entries: [], count: 0 };
  }
}

export async function getGlossaryEntry(entryId: string): Promise<GlossaryEntry | null> {
  try {
    const result = await callMoodleAPI<{ entry: MoodleGlossaryEntry }>("mod_glossary_get_entry_by_id", {
      id: Number(entryId),
    });
    
    const e = result.entry;
    return {
      id: String(e.id),
      concept: e.concept,
      definition: e.definition,
      userfullname: e.userfullname,
      userpictureurl: e.userpictureurl,
      timecreated: e.timecreated,
      timemodified: e.timemodified,
      approved: e.approved === 1,
      attachments: e.attachments?.map(a => ({
        filename: a.filename,
        fileurl: a.fileurl + `?token=${MOODLE_TOKEN}`,
        filesize: a.filesize,
      })),
    };
  } catch (e) {
    console.error("Failed to get glossary entry:", e);
    return null;
  }
}

export async function viewGlossary(glossaryId: string): Promise<boolean> {
  try {
    await callMoodleAPI("mod_glossary_view_glossary", { id: Number(glossaryId) });
    return true;
  } catch {
    return false;
  }
}

// ============ FOLDER API ============

interface MoodleFolder {
  id: number;
  coursemodule: number;
  course: number;
  name: string;
  intro: string;
  introformat: number;
  introfiles?: { filename: string; filepath: string; filesize: number; fileurl: string; mimetype: string }[];
  revision: number;
  timemodified: number;
  display: number;
  showexpanded: number;
  showdownloadfolder: number;
  forcedownload: number;
}

export interface FolderInfo {
  id: string;
  cmid: string;
  name: string;
  intro: string;
  display: number;
  showexpanded: boolean;
  showdownloadfolder: boolean;
  files: { filename: string; filepath: string; filesize: number; fileurl: string; mimetype: string }[];
}

export async function getFolderInfo(cmid: string): Promise<FolderInfo | null> {
  try {
    const courses = await getCourses();
    const courseIds = courses.map(c => Number(c.id));
    
    const result = await callMoodleAPI<{ folders: MoodleFolder[] }>("mod_folder_get_folders_by_courses", {
      courseids: courseIds,
    });
    
    const folder = result.folders?.find(f => String(f.coursemodule) === cmid);
    if (!folder) return null;
    
    // Get folder files using core_course_get_contents
    let files: { filename: string; filepath: string; filesize: number; fileurl: string; mimetype: string }[] = [];
    try {
      const courseContent = await callMoodleAPI<{ id: number; modules: { id: number; modname: string; contents?: { filename: string; filepath: string; filesize: number; fileurl: string; mimetype: string }[] }[] }[]>("core_course_get_contents", {
        courseid: folder.course,
        options: [{ name: "modid", value: folder.coursemodule }],
      });
      
      for (const section of courseContent) {
        for (const mod of section.modules || []) {
          if (mod.id === folder.coursemodule && mod.contents) {
            files = mod.contents.map(c => ({
              filename: c.filename,
              filepath: c.filepath,
              filesize: c.filesize,
              fileurl: c.fileurl + `?token=${MOODLE_TOKEN}`,
              mimetype: c.mimetype,
            }));
          }
        }
      }
    } catch {
      // Files might not be accessible
    }
    
    return {
      id: String(folder.id),
      cmid: String(folder.coursemodule),
      name: folder.name,
      intro: folder.intro,
      display: folder.display,
      showexpanded: folder.showexpanded === 1,
      showdownloadfolder: folder.showdownloadfolder === 1,
      files,
    };
  } catch (e) {
    console.error("Failed to get folder info:", e);
    return null;
  }
}

export async function viewFolder(folderId: string): Promise<boolean> {
  try {
    await callMoodleAPI("mod_folder_view_folder", { folderid: Number(folderId) });
    return true;
  } catch {
    return false;
  }
}

// ============ CHOICE API ============

interface MoodleChoice {
  id: number;
  coursemodule: number;
  course: number;
  name: string;
  intro: string;
  introformat: number;
  publish: number;
  showresults: number;
  display: number;
  allowupdate: number;
  allowmultiple: number;
  showunanswered: number;
  includeinactive: number;
  limitanswers: number;
  timeopen: number;
  timeclose: number;
  showpreview: number;
  timemodified: number;
  completionsubmit: number;
  showavailable: number;
}

interface MoodleChoiceOption {
  id: number;
  text: string;
  maxanswers: number;
  displaylayout: number;
  countanswers: number;
  checked: boolean;
  disabled: boolean;
}

interface MoodleChoiceResult {
  id: number;
  text: string;
  maxanswer: number;
  userresponses: { userid: number; fullname: string; profileimageurl: string; answerid: number; timemodified: number }[];
  numberofuser: number;
  percentageamount: number;
}

export interface ChoiceInfo {
  id: string;
  cmid: string;
  name: string;
  intro: string;
  allowupdate: boolean;
  allowmultiple: boolean;
  limitanswers: boolean;
  showresults: number;
  timeopen: number | null;
  timeclose: number | null;
  publish: boolean;
}

export interface ChoiceOption {
  id: string;
  text: string;
  maxanswers: number;
  countanswers: number;
  checked: boolean;
  disabled: boolean;
}

export interface ChoiceResult {
  id: string;
  text: string;
  numberofuser: number;
  percentageamount: number;
}

export async function getChoiceInfo(cmid: string): Promise<ChoiceInfo | null> {
  try {
    const courses = await getCourses();
    const courseIds = courses.map(c => Number(c.id));
    
    const result = await callMoodleAPI<{ choices: MoodleChoice[] }>("mod_choice_get_choices_by_courses", {
      courseids: courseIds,
    });
    
    const choice = result.choices?.find(c => String(c.coursemodule) === cmid);
    if (!choice) return null;
    
    return {
      id: String(choice.id),
      cmid: String(choice.coursemodule),
      name: choice.name,
      intro: choice.intro,
      allowupdate: choice.allowupdate === 1,
      allowmultiple: choice.allowmultiple === 1,
      limitanswers: choice.limitanswers === 1,
      showresults: choice.showresults,
      timeopen: choice.timeopen || null,
      timeclose: choice.timeclose || null,
      publish: choice.publish === 1,
    };
  } catch (e) {
    console.error("Failed to get choice info:", e);
    return null;
  }
}

export async function getChoiceOptions(choiceId: string): Promise<ChoiceOption[]> {
  try {
    const result = await callMoodleAPI<{ options: MoodleChoiceOption[] }>("mod_choice_get_choice_options", {
      choiceid: Number(choiceId),
    });
    
    return (result.options || []).map(o => ({
      id: String(o.id),
      text: o.text,
      maxanswers: o.maxanswers,
      countanswers: o.countanswers,
      checked: o.checked,
      disabled: o.disabled,
    }));
  } catch (e) {
    console.error("Failed to get choice options:", e);
    return [];
  }
}

export async function getChoiceResults(choiceId: string): Promise<ChoiceResult[]> {
  try {
    const result = await callMoodleAPI<{ options: MoodleChoiceResult[] }>("mod_choice_get_choice_results", {
      choiceid: Number(choiceId),
    });
    
    return (result.options || []).map(o => ({
      id: String(o.id),
      text: o.text,
      numberofuser: o.numberofuser,
      percentageamount: o.percentageamount,
    }));
  } catch (e) {
    console.error("Failed to get choice results:", e);
    return [];
  }
}

export async function submitChoice(choiceId: string, responses: number[]): Promise<boolean> {
  try {
    await callMoodleAPI("mod_choice_submit_choice_response", {
      choiceid: Number(choiceId),
      responses,
    });
    return true;
  } catch (e) {
    console.error("Failed to submit choice:", e);
    return false;
  }
}

export async function viewChoice(choiceId: string): Promise<boolean> {
  try {
    await callMoodleAPI("mod_choice_view_choice", { choiceid: Number(choiceId) });
    return true;
  } catch {
    return false;
  }
}

// ============ FEEDBACK API ============

interface MoodleFeedback {
  id: number;
  coursemodule: number;
  course: number;
  name: string;
  intro: string;
  introformat: number;
  anonymous: number;
  email_notification: number;
  multiple_submit: number;
  autonumbering: number;
  site_after_submit: string;
  page_after_submit: string;
  page_after_submitformat: number;
  publish_stats: number;
  timeopen: number;
  timeclose: number;
  timemodified: number;
  completionsubmit: number;
}

interface MoodleFeedbackItem {
  id: number;
  feedback: number;
  template: number;
  name: string;
  label: string;
  presentation: string;
  typ: string;
  hasvalue: number;
  position: number;
  required: number;
  dependitem: number;
  dependvalue: string;
  options: string;
}

export interface FeedbackInfo {
  id: string;
  cmid: string;
  name: string;
  intro: string;
  anonymous: boolean;
  multipleSubmit: boolean;
  timeopen: number | null;
  timeclose: number | null;
  pageAfterSubmit: string;
}

export interface FeedbackItem {
  id: string;
  name: string;
  label: string;
  typ: string;
  presentation: string;
  required: boolean;
  position: number;
}

export async function getFeedbackInfo(cmid: string): Promise<FeedbackInfo | null> {
  try {
    const courses = await getCourses();
    const courseIds = courses.map(c => Number(c.id));
    
    const result = await callMoodleAPI<{ feedbacks: MoodleFeedback[] }>("mod_feedback_get_feedbacks_by_courses", {
      courseids: courseIds,
    });
    
    const feedback = result.feedbacks?.find(f => String(f.coursemodule) === cmid);
    if (!feedback) return null;
    
    return {
      id: String(feedback.id),
      cmid: String(feedback.coursemodule),
      name: feedback.name,
      intro: feedback.intro,
      anonymous: feedback.anonymous === 1,
      multipleSubmit: feedback.multiple_submit === 1,
      timeopen: feedback.timeopen || null,
      timeclose: feedback.timeclose || null,
      pageAfterSubmit: feedback.page_after_submit,
    };
  } catch (e) {
    console.error("Failed to get feedback info:", e);
    return null;
  }
}

export async function getFeedbackItems(feedbackId: string): Promise<FeedbackItem[]> {
  try {
    const result = await callMoodleAPI<{ items: MoodleFeedbackItem[] }>("mod_feedback_get_items", {
      feedbackid: Number(feedbackId),
    });
    
    return (result.items || []).map(i => ({
      id: String(i.id),
      name: i.name,
      label: i.label,
      typ: i.typ,
      presentation: i.presentation,
      required: i.required === 1,
      position: i.position,
    }));
  } catch (e) {
    console.error("Failed to get feedback items:", e);
    return [];
  }
}

export async function viewFeedback(feedbackId: string): Promise<boolean> {
  try {
    await callMoodleAPI("mod_feedback_view_feedback", { feedbackid: Number(feedbackId) });
    return true;
  } catch {
    return false;
  }
}

// ============ DATABASE (DATA) API ============

interface MoodleData {
  id: number;
  coursemodule: number;
  course: number;
  name: string;
  intro: string;
  introformat: number;
  comments: number;
  timeavailablefrom: number;
  timeavailableto: number;
  timeviewfrom: number;
  timeviewto: number;
  requiredentries: number;
  requiredentriestoview: number;
  maxentries: number;
  rssarticles: number;
  singletemplate: string;
  listtemplate: string;
  listtemplateheader: string;
  listtemplatefooter: string;
  addtemplate: string;
  rsstemplate: string;
  rsstitletemplate: string;
  csstemplate: string;
  jstemplate: string;
  asearchtemplate: string;
  approval: number;
  manageapproved: number;
  scale: number;
  assessed: number;
  assesstimestart: number;
  assesstimefinish: number;
  defaultsort: number;
  defaultsortdir: number;
  editany: number;
  notification: number;
  timemodified: number;
}

interface MoodleDataField {
  id: number;
  dataid: number;
  type: string;
  name: string;
  description: string;
  required: number;
  param1: string;
  param2: string;
  param3: string;
  param4: string;
  param5: string;
  param6: string;
  param7: string;
  param8: string;
  param9: string;
  param10: string;
}

interface MoodleDataEntry {
  id: number;
  userid: number;
  groupid: number;
  dataid: number;
  timecreated: number;
  timemodified: number;
  approved: number;
  canmanageentry: boolean;
  fullname: string;
  contents: { id: number; fieldid: number; recordid: number; content: string; content1: string; content2: string; content3: string; content4: string }[];
}

export interface DataInfo {
  id: string;
  cmid: string;
  name: string;
  intro: string;
  approval: boolean;
  requiredentries: number;
  maxentries: number;
  timeavailablefrom: number | null;
  timeavailableto: number | null;
}

export interface DataField {
  id: string;
  type: string;
  name: string;
  description: string;
  required: boolean;
}

export interface DataEntry {
  id: string;
  userid: number;
  fullname: string;
  timecreated: number;
  timemodified: number;
  approved: boolean;
  contents: { fieldid: string; content: string }[];
}

export async function getDataInfo(cmid: string): Promise<DataInfo | null> {
  try {
    const courses = await getCourses();
    const courseIds = courses.map(c => Number(c.id));
    
    const result = await callMoodleAPI<{ databases: MoodleData[] }>("mod_data_get_databases_by_courses", {
      courseids: courseIds,
    });
    
    const data = result.databases?.find(d => String(d.coursemodule) === cmid);
    if (!data) return null;
    
    return {
      id: String(data.id),
      cmid: String(data.coursemodule),
      name: data.name,
      intro: data.intro,
      approval: data.approval === 1,
      requiredentries: data.requiredentries,
      maxentries: data.maxentries,
      timeavailablefrom: data.timeavailablefrom || null,
      timeavailableto: data.timeavailableto || null,
    };
  } catch (e) {
    console.error("Failed to get data info:", e);
    return null;
  }
}

export async function getDataFields(dataId: string): Promise<DataField[]> {
  try {
    const result = await callMoodleAPI<{ fields: MoodleDataField[] }>("mod_data_get_fields", {
      databaseid: Number(dataId),
    });
    
    return (result.fields || []).map(f => ({
      id: String(f.id),
      type: f.type,
      name: f.name,
      description: f.description,
      required: f.required === 1,
    }));
  } catch (e) {
    console.error("Failed to get data fields:", e);
    return [];
  }
}

export async function getDataEntries(dataId: string, page: number = 0, perpage: number = 10): Promise<{ entries: DataEntry[]; totalcount: number }> {
  try {
    const result = await callMoodleAPI<{ entries: MoodleDataEntry[]; totalcount: number }>("mod_data_get_entries", {
      databaseid: Number(dataId),
      page,
      perpage,
      returncontents: 1,
    });
    
    return {
      entries: (result.entries || []).map(e => ({
        id: String(e.id),
        userid: e.userid,
        fullname: e.fullname,
        timecreated: e.timecreated,
        timemodified: e.timemodified,
        approved: e.approved === 1,
        contents: (e.contents || []).map(c => ({
          fieldid: String(c.fieldid),
          content: c.content,
        })),
      })),
      totalcount: result.totalcount || 0,
    };
  } catch (e) {
    console.error("Failed to get data entries:", e);
    return { entries: [], totalcount: 0 };
  }
}

export async function viewDatabase(dataId: string): Promise<boolean> {
  try {
    await callMoodleAPI("mod_data_view_database", { databaseid: Number(dataId) });
    return true;
  } catch {
    return false;
  }
}

// ============ CHAT API ============

interface MoodleChat {
  id: number;
  coursemodule: number;
  course: number;
  name: string;
  intro: string;
  introformat: number;
  keepdays: number;
  studentlogs: number;
  chattime: number;
  schedule: number;
  timemodified: number;
}

export interface ChatInfo {
  id: string;
  cmid: string;
  name: string;
  intro: string;
  chattime: number;
  schedule: number;
}

export async function getChatInfo(cmid: string): Promise<ChatInfo | null> {
  try {
    const courses = await getCourses();
    const courseIds = courses.map(c => Number(c.id));
    
    const result = await callMoodleAPI<{ chats: MoodleChat[] }>("mod_chat_get_chats_by_courses", {
      courseids: courseIds,
    });
    
    const chat = result.chats?.find(c => String(c.coursemodule) === cmid);
    if (!chat) return null;
    
    return {
      id: String(chat.id),
      cmid: String(chat.coursemodule),
      name: chat.name,
      intro: chat.intro,
      chattime: chat.chattime,
      schedule: chat.schedule,
    };
  } catch (e) {
    console.error("Failed to get chat info:", e);
    return null;
  }
}

// ============ SURVEY API ============

interface MoodleSurvey {
  id: number;
  coursemodule: number;
  course: number;
  name: string;
  intro: string;
  introformat: number;
  template: number;
  days: number;
  timecreated: number;
  timemodified: number;
}

export interface SurveyInfo {
  id: string;
  cmid: string;
  name: string;
  intro: string;
  template: number;
}

export async function getSurveyInfo(cmid: string): Promise<SurveyInfo | null> {
  try {
    const courses = await getCourses();
    const courseIds = courses.map(c => Number(c.id));
    
    const result = await callMoodleAPI<{ surveys: MoodleSurvey[] }>("mod_survey_get_surveys_by_courses", {
      courseids: courseIds,
    });
    
    const survey = result.surveys?.find(s => String(s.coursemodule) === cmid);
    if (!survey) return null;
    
    return {
      id: String(survey.id),
      cmid: String(survey.coursemodule),
      name: survey.name,
      intro: survey.intro,
      template: survey.template,
    };
  } catch (e) {
    console.error("Failed to get survey info:", e);
    return null;
  }
}

// ============ LTI API ============

interface MoodleLti {
  id: number;
  coursemodule: number;
  course: number;
  name: string;
  intro: string;
  introformat: number;
  timecreated: number;
  timemodified: number;
  typeid: number;
  toolurl: string;
  securetoolurl: string;
  instructorchoicesendname: number;
  instructorchoicesendemailaddr: number;
  instructorchoiceallowroster: number;
  instructorchoiceallowsetting: number;
  instructorcustomparameters: string;
  instructorchoiceacceptgrades: number;
  grade: number;
  launchcontainer: number;
  resourcekey: string;
  password: string;
  debuglaunch: number;
  showtitlelaunch: number;
  showdescriptionlaunch: number;
  servicesalt: string;
  icon: string;
  secureicon: string;
}

export interface LtiInfo {
  id: string;
  cmid: string;
  name: string;
  intro: string;
  toolurl: string;
  launchcontainer: number;
  grade: number;
}

export async function getLtiInfo(cmid: string): Promise<LtiInfo | null> {
  try {
    const courses = await getCourses();
    const courseIds = courses.map(c => Number(c.id));
    
    const result = await callMoodleAPI<{ ltis: MoodleLti[] }>("mod_lti_get_ltis_by_courses", {
      courseids: courseIds,
    });
    
    const lti = result.ltis?.find(l => String(l.coursemodule) === cmid);
    if (!lti) return null;
    
    return {
      id: String(lti.id),
      cmid: String(lti.coursemodule),
      name: lti.name,
      intro: lti.intro,
      toolurl: lti.toolurl || lti.securetoolurl,
      launchcontainer: lti.launchcontainer,
      grade: lti.grade,
    };
  } catch (e) {
    console.error("Failed to get lti info:", e);
    return null;
  }
}

export async function getLtiLaunchData(ltiId: string): Promise<{ endpoint: string; parameters: { name: string; value: string }[] } | null> {
  try {
    const result = await callMoodleAPI<{ endpoint: string; parameters: { name: string; value: string }[] }>("mod_lti_get_tool_launch_data", {
      toolid: Number(ltiId),
    });
    
    return {
      endpoint: result.endpoint,
      parameters: result.parameters || [],
    };
  } catch (e) {
    console.error("Failed to get lti launch data:", e);
    return null;
  }
}

export async function viewLti(ltiId: string): Promise<boolean> {
  try {
    await callMoodleAPI("mod_lti_view_lti", { ltiid: Number(ltiId) });
    return true;
  } catch {
    return false;
  }
}

// ============ WORKSHOP API ============

interface MoodleWorkshop {
  id: number;
  coursemodule: number;
  course: number;
  name: string;
  intro: string;
  introformat: number;
  instructauthors: string;
  instructauthorsformat: number;
  instructreviewers: string;
  instructreviewersformat: number;
  timemodified: number;
  phase: number;
  useexamples: number;
  usepeerassessment: number;
  useselfassessment: number;
  grade: number;
  gradinggrade: number;
  strategy: string;
  evaluation: string;
  gradedecimals: number;
  submissiontypetext: number;
  submissiontypefile: number;
  nattachments: number;
  submissionfiletypes: string;
  latesubmissions: number;
  maxbytes: number;
  examplesmode: number;
  submissionstart: number;
  submissionend: number;
  assessmentstart: number;
  assessmentend: number;
  phaseswitchassessment: number;
  conclusion: string;
  conclusionformat: number;
  overallfeedbackmode: number;
  overallfeedbackfiles: number;
  overallfeedbackfiletypes: string;
  overallfeedbackmaxbytes: number;
}

export interface WorkshopInfo {
  id: string;
  cmid: string;
  name: string;
  intro: string;
  phase: number;
  grade: number;
  gradinggrade: number;
  strategy: string;
  submissionstart: number | null;
  submissionend: number | null;
  assessmentstart: number | null;
  assessmentend: number | null;
  usepeerassessment: boolean;
  useselfassessment: boolean;
}

export async function getWorkshopInfo(cmid: string): Promise<WorkshopInfo | null> {
  try {
    const courses = await getCourses();
    const courseIds = courses.map(c => Number(c.id));
    
    const result = await callMoodleAPI<{ workshops: MoodleWorkshop[] }>("mod_workshop_get_workshops_by_courses", {
      courseids: courseIds,
    });
    
    const workshop = result.workshops?.find(w => String(w.coursemodule) === cmid);
    if (!workshop) return null;
    
    return {
      id: String(workshop.id),
      cmid: String(workshop.coursemodule),
      name: workshop.name,
      intro: workshop.intro,
      phase: workshop.phase,
      grade: workshop.grade,
      gradinggrade: workshop.gradinggrade,
      strategy: workshop.strategy,
      submissionstart: workshop.submissionstart || null,
      submissionend: workshop.submissionend || null,
      assessmentstart: workshop.assessmentstart || null,
      assessmentend: workshop.assessmentend || null,
      usepeerassessment: workshop.usepeerassessment === 1,
      useselfassessment: workshop.useselfassessment === 1,
    };
  } catch (e) {
    console.error("Failed to get workshop info:", e);
    return null;
  }
}

export async function viewWorkshop(workshopId: string): Promise<boolean> {
  try {
    await callMoodleAPI("mod_workshop_view_workshop", { workshopid: Number(workshopId) });
    return true;
  } catch {
    return false;
  }
}

// ============ IMSCP API ============

interface MoodleImscp {
  id: number;
  coursemodule: number;
  course: number;
  name: string;
  intro: string;
  introformat: number;
  revision: number;
  keepold: number;
  structure: string;
  timemodified: number;
}

export interface ImscpInfo {
  id: string;
  cmid: string;
  name: string;
  intro: string;
  structure: string;
}

export async function getImscpInfo(cmid: string): Promise<ImscpInfo | null> {
  try {
    const courses = await getCourses();
    const courseIds = courses.map(c => Number(c.id));
    
    const result = await callMoodleAPI<{ imscps: MoodleImscp[] }>("mod_imscp_get_imscps_by_courses", {
      courseids: courseIds,
    });
    
    const imscp = result.imscps?.find(i => String(i.coursemodule) === cmid);
    if (!imscp) return null;
    
    return {
      id: String(imscp.id),
      cmid: String(imscp.coursemodule),
      name: imscp.name,
      intro: imscp.intro,
      structure: imscp.structure,
    };
  } catch (e) {
    console.error("Failed to get imscp info:", e);
    return null;
  }
}

export async function viewImscp(imscpId: string): Promise<boolean> {
  try {
    await callMoodleAPI("mod_imscp_view_imscp", { imscpid: Number(imscpId) });
    return true;
  } catch {
    return false;
  }
}

// ============ ALL ACTIVITIES BY TYPE ============

export async function getAllLessons(): Promise<{ id: string; cmid: string; courseId: string; name: string; intro: string }[]> {
  try {
    const courses = await getCourses();
    const courseIds = courses.map(c => Number(c.id));
    
    const result = await callMoodleAPI<{ lessons: MoodleLesson[] }>("mod_lesson_get_lessons_by_courses", {
      courseids: courseIds,
    });
    
    return (result.lessons || []).map(l => ({
      id: String(l.id),
      cmid: String(l.coursemodule),
      courseId: String(l.course),
      name: l.name,
      intro: l.intro,
    }));
  } catch {
    return [];
  }
}

export async function getAllScorms(): Promise<{ id: string; cmid: string; courseId: string; name: string; intro: string }[]> {
  try {
    const courses = await getCourses();
    const courseIds = courses.map(c => Number(c.id));
    
    const result = await callMoodleAPI<{ scorms: MoodleScorm[] }>("mod_scorm_get_scorms_by_courses", {
      courseids: courseIds,
    });
    
    return (result.scorms || []).map(s => ({
      id: String(s.id),
      cmid: String(s.coursemodule),
      courseId: String(s.course),
      name: s.name,
      intro: s.intro,
    }));
  } catch {
    return [];
  }
}

export async function getAllH5pActivities(): Promise<{ id: string; cmid: string; courseId: string; name: string; intro: string }[]> {
  try {
    const courses = await getCourses();
    const courseIds = courses.map(c => Number(c.id));
    
    const result = await callMoodleAPI<{ h5pactivities: MoodleH5pActivity[] }>("mod_h5pactivity_get_h5pactivities_by_courses", {
      courseids: courseIds,
    });
    
    return (result.h5pactivities || []).map(h => ({
      id: String(h.id),
      cmid: String(h.coursemodule),
      courseId: String(h.course),
      name: h.name,
      intro: h.intro,
    }));
  } catch {
    return [];
  }
}

export async function getAllWikis(): Promise<{ id: string; cmid: string; courseId: string; name: string; intro: string }[]> {
  try {
    const courses = await getCourses();
    const courseIds = courses.map(c => Number(c.id));
    
    const result = await callMoodleAPI<{ wikis: MoodleWiki[] }>("mod_wiki_get_wikis_by_courses", {
      courseids: courseIds,
    });
    
    return (result.wikis || []).map(w => ({
      id: String(w.id),
      cmid: String(w.coursemodule),
      courseId: String(w.course),
      name: w.name,
      intro: w.intro,
    }));
  } catch {
    return [];
  }
}

export async function getAllGlossaries(): Promise<{ id: string; cmid: string; courseId: string; name: string; intro: string }[]> {
  try {
    const courses = await getCourses();
    const courseIds = courses.map(c => Number(c.id));
    
    const result = await callMoodleAPI<{ glossaries: MoodleGlossary[] }>("mod_glossary_get_glossaries_by_courses", {
      courseids: courseIds,
    });
    
    return (result.glossaries || []).map(g => ({
      id: String(g.id),
      cmid: String(g.coursemodule),
      courseId: String(g.course),
      name: g.name,
      intro: g.intro,
    }));
  } catch {
    return [];
  }
}

export async function getAllFolders(): Promise<{ id: string; cmid: string; courseId: string; name: string; intro: string }[]> {
  try {
    const courses = await getCourses();
    const courseIds = courses.map(c => Number(c.id));
    
    const result = await callMoodleAPI<{ folders: MoodleFolder[] }>("mod_folder_get_folders_by_courses", {
      courseids: courseIds,
    });
    
    return (result.folders || []).map(f => ({
      id: String(f.id),
      cmid: String(f.coursemodule),
      courseId: String(f.course),
      name: f.name,
      intro: f.intro,
    }));
  } catch {
    return [];
  }
}

export async function getAllChoices(): Promise<{ id: string; cmid: string; courseId: string; name: string; intro: string }[]> {
  try {
    const courses = await getCourses();
    const courseIds = courses.map(c => Number(c.id));
    
    const result = await callMoodleAPI<{ choices: MoodleChoice[] }>("mod_choice_get_choices_by_courses", {
      courseids: courseIds,
    });
    
    return (result.choices || []).map(c => ({
      id: String(c.id),
      cmid: String(c.coursemodule),
      courseId: String(c.course),
      name: c.name,
      intro: c.intro,
    }));
  } catch {
    return [];
  }
}

export async function getAllFeedbacks(): Promise<{ id: string; cmid: string; courseId: string; name: string; intro: string }[]> {
  try {
    const courses = await getCourses();
    const courseIds = courses.map(c => Number(c.id));
    
    const result = await callMoodleAPI<{ feedbacks: MoodleFeedback[] }>("mod_feedback_get_feedbacks_by_courses", {
      courseids: courseIds,
    });
    
    return (result.feedbacks || []).map(f => ({
      id: String(f.id),
      cmid: String(f.coursemodule),
      courseId: String(f.course),
      name: f.name,
      intro: f.intro,
    }));
  } catch {
    return [];
  }
}

export async function getAllDatabases(): Promise<{ id: string; cmid: string; courseId: string; name: string; intro: string }[]> {
  try {
    const courses = await getCourses();
    const courseIds = courses.map(c => Number(c.id));
    
    const result = await callMoodleAPI<{ databases: MoodleData[] }>("mod_data_get_databases_by_courses", {
      courseids: courseIds,
    });
    
    return (result.databases || []).map(d => ({
      id: String(d.id),
      cmid: String(d.coursemodule),
      courseId: String(d.course),
      name: d.name,
      intro: d.intro,
    }));
  } catch {
    return [];
  }
}

export async function getAllWorkshops(): Promise<{ id: string; cmid: string; courseId: string; name: string; intro: string }[]> {
  try {
    const courses = await getCourses();
    const courseIds = courses.map(c => Number(c.id));
    
    const result = await callMoodleAPI<{ workshops: MoodleWorkshop[] }>("mod_workshop_get_workshops_by_courses", {
      courseids: courseIds,
    });
    
    return (result.workshops || []).map(w => ({
      id: String(w.id),
      cmid: String(w.coursemodule),
      courseId: String(w.course),
      name: w.name,
      intro: w.intro,
    }));
  } catch {
    return [];
  }
}

export async function getAllBooks(): Promise<{ id: string; cmid: string; courseId: string; name: string; intro: string }[]> {
  try {
    const courses = await getCourses();
    const courseIds = courses.map(c => Number(c.id));
    
    const result = await callMoodleAPI<{ books: MoodleBook[] }>("mod_book_get_books_by_courses", {
      courseids: courseIds,
    });
    
    return (result.books || []).map(b => ({
      id: String(b.id),
      cmid: String(b.coursemodule),
      courseId: String(b.course),
      name: b.name,
      intro: b.intro,
    }));
  } catch {
    return [];
  }
}

export async function getAllPages(): Promise<{ id: string; cmid: string; courseId: string; name: string; intro: string; content: string }[]> {
  try {
    const courses = await getCourses();
    const courseIds = courses.map(c => Number(c.id));
    
    const result = await callMoodleAPI<{ pages: MoodlePage[] }>("mod_page_get_pages_by_courses", {
      courseids: courseIds,
    });
    
    return (result.pages || []).map(p => ({
      id: String(p.id),
      cmid: String(p.coursemodule),
      courseId: String(p.course),
      name: p.name,
      intro: p.intro,
      content: p.content,
    }));
  } catch {
    return [];
  }
}

export async function getAllResources(): Promise<{ id: string; cmid: string; courseId: string; name: string; intro: string; files: { filename: string; fileurl: string; filesize: number }[] }[]> {
  try {
    const courses = await getCourses();
    const courseIds = courses.map(c => Number(c.id));
    
    const result = await callMoodleAPI<{ resources: MoodleResource[] }>("mod_resource_get_resources_by_courses", {
      courseids: courseIds,
    });
    
    return (result.resources || []).map(r => ({
      id: String(r.id),
      cmid: String(r.coursemodule),
      courseId: String(r.course),
      name: r.name,
      intro: r.intro,
      files: (r.contentfiles || []).map(f => ({
        filename: f.filename,
        fileurl: f.fileurl + `?token=${MOODLE_TOKEN}`,
        filesize: f.filesize,
      })),
    }));
  } catch {
    return [];
  }
}

export async function getAllUrls(): Promise<{ id: string; cmid: string; courseId: string; name: string; intro: string; externalurl: string }[]> {
  try {
    const courses = await getCourses();
    const courseIds = courses.map(c => Number(c.id));
    
    const result = await callMoodleAPI<{ urls: { id: number; coursemodule: number; course: number; name: string; intro: string; externalurl: string }[] }>("mod_url_get_urls_by_courses", {
      courseids: courseIds,
    });
    
    return (result.urls || []).map(u => ({
      id: String(u.id),
      cmid: String(u.coursemodule),
      courseId: String(u.course),
      name: u.name,
      intro: u.intro,
      externalurl: u.externalurl,
    }));
  } catch {
    return [];
  }
}
