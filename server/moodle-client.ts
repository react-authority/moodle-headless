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
