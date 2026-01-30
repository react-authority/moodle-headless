/**
 * Moodle API functions using moodle-ts typed wrappers
 * 
 * This module provides typed API calls using the moodle-ts package.
 * Import versioned typed functions for full type safety.
 */

import { getClient, getMoodleToken, isConfigured } from "./moodle-client";
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

// ============ HELPER ============

const client = () => getClient();

// ============ CORE API ============

export async function getSiteInfo(): Promise<SiteInfo> {
  const { data } = await client().getSiteInfo();
  return {
    sitename: data.sitename,
    siteurl: data.siteurl,
    username: data.username,
    firstname: data.firstname,
    lastname: data.lastname,
    fullname: data.fullname,
    userid: String(data.userid),
    userpictureurl: data.userpictureurl,
    lang: data.lang,
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
    const { data } = await client().call<{}, any[]>("core_course_get_categories", {});
    return data.map((cat: any) => ({
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
  const info = await getSiteInfo();
  const { data } = await client().call<any, any[]>("core_enrol_get_users_courses", {
    userid: Number(info.userid),
  });

  const categories = await getCategories();
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  return data.map((course: any) => ({
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
  const { data } = await client().call<any, any[]>("core_course_get_contents", {
    courseid: Number(courseId),
  });

  return data.map((section: any, index: number) => ({
    id: String(section.id),
    courseid: courseId,
    name: section.name,
    summary: section.summary,
    visible: section.visible === 1,
    position: index,
  }));
}

export async function getCourseActivities(courseId: string): Promise<Activity[]> {
  const { data } = await client().call<any, any[]>("core_course_get_contents", {
    courseid: Number(courseId),
  });

  const activities: Activity[] = [];
  const validModnames = [
    "assign", "quiz", "forum", "resource", "url", "page", "folder",
    "label", "book", "lesson", "workshop", "scorm", "h5pactivity",
    "choice", "feedback", "glossary", "wiki", "chat", "survey", "data", "lti",
  ];

  for (const section of data) {
    for (const mod of section.modules || []) {
      const modname = validModnames.includes(mod.modname) ? mod.modname : "resource";
      const dueDate = mod.dates?.find((d: any) => d.label.toLowerCase().includes("due"))?.timestamp;
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
    const { data } = await client().call<any, any>("core_calendar_get_calendar_events", {
      options: { timestart: now, timeend: now + 30 * 24 * 60 * 60 },
    });

    return (data.events || []).map((event: any) => ({
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
  const info = await getSiteInfo();
  const userId = Number(info.userid);
  const courses = await getCourses();
  const grades: GradeItem[] = [];

  for (const course of courses) {
    try {
      const { data } = await client().call<any, any>("gradereport_user_get_grade_items", {
        courseid: Number(course.id),
        userid: userId,
      });

      const items = data.usergrades?.[0]?.gradeitems || [];
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

export async function getStats() {
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

// ============ ASSIGNMENTS ============

export async function getAssignments(courseId?: string) {
  try {
    const params: any = {};
    if (courseId) params.courseids = [Number(courseId)];

    const { data } = await client().call<any, any>("mod_assign_get_assignments", params);
    const assignments: any[] = [];

    for (const course of data.courses || []) {
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

export async function getAssignmentSubmissionStatus(assignId: string) {
  try {
    const info = await getSiteInfo();
    const { data } = await client().call<any, any>("mod_assign_get_submission_status", {
      assignid: Number(assignId),
      userid: Number(info.userid),
    });

    return {
      submitted: data.lastattempt?.submission?.status === "submitted",
      graded: data.lastattempt?.graded || false,
      gradingStatus: data.lastattempt?.gradingstatus,
      grade: data.feedback?.gradefordisplay,
      submissionTime: data.lastattempt?.submission?.timemodified,
    };
  } catch {
    return null;
  }
}

export async function getAssignmentInfo(cmid: string) {
  try {
    const courses = await getCourses();
    const courseIds = courses.map(c => Number(c.id));
    
    const { data } = await client().call<any, any>("mod_assign_get_assignments", { courseids: courseIds });
    
    let assignment: any;
    for (const course of data.courses || []) {
      assignment = course.assignments?.find((a: any) => String(a.cmid) === cmid);
      if (assignment) break;
    }
    
    if (!assignment) return null;

    let submissionStatus: any = null;
    try {
      const { data: subData } = await client().call<any, any>("mod_assign_get_submission_status", {
        assignid: assignment.id,
      });
      submissionStatus = subData;
    } catch {}

    const submission = submissionStatus?.lastattempt?.submission;
    const token = getMoodleToken();

    return {
      id: String(assignment.id),
      cmid: String(assignment.cmid),
      name: assignment.name,
      intro: assignment.intro,
      dueDate: assignment.duedate || null,
      cutoffDate: assignment.cutoffdate || null,
      maxGrade: assignment.grade,
      submissionStatus: submission?.status || "nosubmission",
      gradeStatus: submissionStatus?.lastattempt?.grading?.gradefordisplay || null,
      grade: submissionStatus?.feedback?.grade?.gradefordisplay || null,
      feedback: null,
      submittedFiles: [],
      submittedText: null,
    };
  } catch {
    return null;
  }
}

export async function getAllAssignments() {
  try {
    const courses = await getCourses();
    const courseIds = courses.map(c => Number(c.id));
    const { data } = await client().call<any, any>("mod_assign_get_assignments", { courseids: courseIds });

    const assignments: any[] = [];
    for (const course of data.courses || []) {
      for (const a of course.assignments || []) {
        assignments.push({
          id: String(a.id),
          cmid: String(a.cmid),
          courseId: String(course.id),
          name: a.name,
          intro: a.intro,
          duedate: a.duedate,
        });
      }
    }
    return assignments;
  } catch {
    return [];
  }
}

// ============ QUIZZES ============

export async function getQuizzes(courseId?: string) {
  try {
    const params: any = {};
    if (courseId) params.courseids = [Number(courseId)];

    const { data } = await client().call<any, any>("mod_quiz_get_quizzes_by_courses", params);
    return (data.quizzes || []).map((q: any) => ({
      id: String(q.id),
      courseId: String(q.course),
      name: q.name,
      intro: q.intro,
      timeopen: q.timeopen,
      timeclose: q.timeclose,
      timelimit: q.timelimit,
      grade: q.grade,
      attempts: q.attempts,
    }));
  } catch {
    return [];
  }
}

export async function getQuizAttempts(quizId: string) {
  try {
    const { data } = await client().call<any, any>("mod_quiz_get_user_attempts", {
      quizid: Number(quizId),
      status: "all",
    });
    return (data.attempts || []).map((a: any) => ({
      id: String(a.id),
      attempt: a.attempt,
      state: a.state,
      grade: a.sumgrades,
      timestart: a.timestart,
      timefinish: a.timefinish,
    }));
  } catch {
    return [];
  }
}

export async function getQuizInfo(cmid: string) {
  try {
    const courses = await getCourses();
    const courseIds = courses.map(c => Number(c.id));
    const { data } = await client().call<any, any>("mod_quiz_get_quizzes_by_courses", { courseids: courseIds });

    const quiz = data.quizzes?.find((q: any) => String(q.coursemodule) === cmid);
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
  } catch {
    return null;
  }
}

export async function getAllQuizzes() {
  try {
    const courses = await getCourses();
    const courseIds = courses.map(c => Number(c.id));
    const { data } = await client().call<any, any>("mod_quiz_get_quizzes_by_courses", { courseids: courseIds });

    return (data.quizzes || []).map((q: any) => ({
      id: String(q.id),
      cmid: String(q.coursemodule),
      courseId: String(q.course),
      name: q.name,
      intro: q.intro,
    }));
  } catch {
    return [];
  }
}

export async function startQuizAttempt(quizId: string) {
  try {
    const { data } = await client().call<any, any>("mod_quiz_start_attempt", {
      quizid: Number(quizId),
      forcenew: true,
    });
    return {
      attemptid: String(data.attempt.id),
      uniqueid: data.attempt.uniqueid,
      attempt: data.attempt.attempt,
    };
  } catch {
    return null;
  }
}

export async function getQuizAttemptData(attemptId: string, page = 0) {
  try {
    const { data } = await client().call<any, any>("mod_quiz_get_attempt_data", {
      attemptid: Number(attemptId),
      page,
    });
    return {
      attempt: data.attempt,
      questions: (data.questions || []).map((q: any) => ({
        slot: q.slot,
        type: q.type,
        html: q.html,
        sequencecheck: q.sequencecheck,
        responsefileareas: q.responsefileareas,
      })),
      nextpage: data.nextpage,
    };
  } catch {
    return null;
  }
}

export async function saveQuizAttempt(attemptId: string, answers: { name: string; value: string }[]) {
  try {
    await client().call("mod_quiz_save_attempt", {
      attemptid: Number(attemptId),
      data: answers,
    });
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function finishQuizAttempt(attemptId: string) {
  try {
    await client().call("mod_quiz_process_attempt", {
      attemptid: Number(attemptId),
      finishattempt: 1,
    });
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function getQuizAttemptReview(attemptId: string) {
  try {
    const { data } = await client().call<any, any>("mod_quiz_get_attempt_review", {
      attemptid: Number(attemptId),
    });
    return {
      attempt: data.attempt,
      questions: (data.questions || []).map((q: any) => ({
        slot: q.slot,
        type: q.type,
        html: q.html,
        status: q.status,
        mark: q.mark,
        maxmark: q.maxmark,
      })),
      grade: data.grade,
    };
  } catch {
    return null;
  }
}

// ============ FORUMS ============

export async function getForums(courseId?: string) {
  try {
    const params: any = {};
    if (courseId) params.courseids = [Number(courseId)];

    const { data } = await client().call<any, any[]>("mod_forum_get_forums_by_courses", params);
    return (data || []).map((f: any) => ({
      id: String(f.id),
      courseId: String(f.course),
      name: f.name,
      intro: f.intro,
      type: f.type,
      numdiscussions: f.numdiscussions,
    }));
  } catch {
    return [];
  }
}

export async function getForumDiscussions(forumId: string) {
  try {
    const { data } = await client().call<any, any>("mod_forum_get_forum_discussions", {
      forumid: Number(forumId),
      sortby: "timemodified",
      sortdirection: "DESC",
    });

    return (data.discussions || []).map((d: any) => ({
      id: String(d.id),
      name: d.name,
      subject: d.name,
      message: d.message,
      userfullname: d.userfullname,
      created: d.timemodified,
      modified: d.timemodified,
      numreplies: d.numreplies,
      pinned: d.pinned,
    }));
  } catch {
    return [];
  }
}

export async function getForumInfo(cmid: string) {
  try {
    const courses = await getCourses();
    const courseIds = courses.map(c => Number(c.id));
    const { data } = await client().call<any, any[]>("mod_forum_get_forums_by_courses", { courseids: courseIds });

    const forum = data?.find((f: any) => String(f.cmid) === cmid);
    if (!forum) return null;

    return {
      id: String(forum.id),
      cmid: String(forum.cmid),
      name: forum.name,
      intro: forum.intro,
      type: forum.type,
    };
  } catch {
    return null;
  }
}

export async function getForumDiscussionPosts(discussionId: string) {
  try {
    const { data } = await client().call<any, any>("mod_forum_get_discussion_posts", {
      discussionid: Number(discussionId),
      sortby: "created",
      sortdirection: "ASC",
    });

    return (data.posts || []).map((p: any) => ({
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
  } catch {
    return [];
  }
}

export async function addForumPost(discussionId: string, parentId: number, subject: string, message: string) {
  try {
    const { data } = await client().call<any, any>("mod_forum_add_discussion_post", {
      postid: parentId,
      subject,
      message,
    });
    return { postId: String(data.postid) };
  } catch {
    return null;
  }
}

export async function addForumDiscussion(forumId: string, name: string, message: string) {
  try {
    const { data } = await client().call<any, any>("mod_forum_add_discussion", {
      forumid: Number(forumId),
      subject: name,
      message,
    });
    return { discussionId: String(data.discussionid) };
  } catch {
    return null;
  }
}

export async function getAllForums() {
  try {
    const courses = await getCourses();
    const courseIds = courses.map(c => Number(c.id));
    const { data } = await client().call<any, any[]>("mod_forum_get_forums_by_courses", { courseids: courseIds });

    return (data || []).map((f: any) => ({
      id: String(f.id),
      cmid: String(f.cmid),
      courseId: String(f.course),
      name: f.name,
      intro: f.intro,
    }));
  } catch {
    return [];
  }
}

// ============ NOTIFICATIONS ============

export async function getNotifications() {
  try {
    const info = await getSiteInfo();
    const { data } = await client().call<any, any>("message_popup_get_popup_notifications", {
      useridto: Number(info.userid),
    });

    return (data.notifications || []).map((n: any) => ({
      id: String(n.id),
      subject: n.subject || n.shortenedsubject,
      text: n.text || n.fullmessage,
      timecreated: n.timecreated,
      read: n.read || n.timeread !== null,
      component: n.component,
      contexturl: n.contexturl,
      userfromfullname: n.userfromfullname,
    }));
  } catch {
    return [];
  }
}

export async function getUnreadNotificationCount() {
  try {
    const info = await getSiteInfo();
    const { data } = await client().call<any, number>("message_popup_get_unread_popup_notification_count", {
      useridto: Number(info.userid),
    });
    return data || 0;
  } catch {
    return 0;
  }
}

// ============ BADGES ============

export async function getUserBadges() {
  try {
    const info = await getSiteInfo();
    const { data } = await client().call<any, any>("core_badges_get_user_badges", {
      userid: Number(info.userid),
    });

    return (data.badges || []).map((b: any) => ({
      id: String(b.id),
      name: b.name,
      description: b.description,
      badgeurl: b.badgeurl,
      issuername: b.issuername,
      dateissued: b.dateissued,
    }));
  } catch {
    return [];
  }
}

// ============ COMPLETION ============

export async function updateActivityCompletion(cmid: string, completed: boolean) {
  try {
    await client().call("core_completion_update_activity_completion_status_manually", {
      cmid: Number(cmid),
      completed: completed ? 1 : 0,
    });
    return true;
  } catch {
    return false;
  }
}

export async function getActivityCompletionStatus(courseId: string) {
  try {
    const info = await getSiteInfo();
    const { data } = await client().call<any, any>("core_completion_get_activities_completion_status", {
      courseid: Number(courseId),
      userid: Number(info.userid),
    });

    return (data.statuses || []).map((s: any) => ({
      activityId: String(s.cmid),
      state: s.state,
      timecompleted: s.timecompleted,
    }));
  } catch {
    return [];
  }
}

export async function viewCourse(courseId: string) {
  try {
    await client().call("core_course_view_course", { courseid: Number(courseId) });
    return true;
  } catch {
    return false;
  }
}

// ============ MODULE CONTENT ============

export async function getBookContent(cmid: string) {
  try {
    const courses = await getCourses();
    const courseIds = courses.map(c => Number(c.id));
    const { data } = await client().call<any, any>("mod_book_get_books_by_courses", { courseids: courseIds });

    const book = data.books?.find((b: any) => String(b.coursemodule) === cmid);
    if (!book) return null;

    return { id: String(book.id), name: book.name, intro: book.intro, chapters: [] };
  } catch {
    return null;
  }
}

export async function getPageContent(cmid: string) {
  try {
    const courses = await getCourses();
    const courseIds = courses.map(c => Number(c.id));
    const { data } = await client().call<any, any>("mod_page_get_pages_by_courses", { courseids: courseIds });

    const page = data.pages?.find((p: any) => String(p.coursemodule) === cmid);
    if (!page) return null;

    return { id: String(page.id), name: page.name, intro: page.intro, content: page.content };
  } catch {
    return null;
  }
}

export async function getResourceContent(cmid: string) {
  try {
    const courses = await getCourses();
    const courseIds = courses.map(c => Number(c.id));
    const token = getMoodleToken();
    const { data } = await client().call<any, any>("mod_resource_get_resources_by_courses", { courseids: courseIds });

    const resource = data.resources?.find((r: any) => String(r.coursemodule) === cmid);
    if (!resource) return null;

    return {
      id: String(resource.id),
      name: resource.name,
      intro: resource.intro,
      files: (resource.contentfiles || []).map((f: any) => ({
        filename: f.filename,
        fileurl: f.fileurl + `?token=${token}`,
        filesize: f.filesize,
        mimetype: f.mimetype,
      })),
    };
  } catch {
    return null;
  }
}

export async function getUrlContent(cmid: string) {
  try {
    const courses = await getCourses();
    const courseIds = courses.map(c => Number(c.id));
    const { data } = await client().call<any, any>("mod_url_get_urls_by_courses", { courseids: courseIds });

    const url = data.urls?.find((u: any) => String(u.coursemodule) === cmid);
    if (!url) return null;

    return { id: String(url.id), name: url.name, intro: url.intro, externalurl: url.externalurl };
  } catch {
    return null;
  }
}

export async function getLabelContent(cmid: string) {
  try {
    const courses = await getCourses();
    const courseIds = courses.map(c => Number(c.id));
    const { data } = await client().call<any, any>("mod_label_get_labels_by_courses", { courseids: courseIds });

    const label = data.labels?.find((l: any) => String(l.coursemodule) === cmid);
    if (!label) return null;

    return { id: String(label.id), name: label.name, intro: label.intro };
  } catch {
    return null;
  }
}

// ============ LESSONS ============

export async function getLessonInfo(cmid: string) {
  try {
    const courses = await getCourses();
    const courseIds = courses.map(c => Number(c.id));
    const { data } = await client().call<any, any>("mod_lesson_get_lessons_by_courses", { courseids: courseIds });

    const lesson = data.lessons?.find((l: any) => String(l.coursemodule) === cmid);
    if (!lesson) return null;

    return { id: String(lesson.id), name: lesson.name, intro: lesson.intro };
  } catch {
    return null;
  }
}

export async function getLessonPages(lessonId: string) {
  try {
    const { data } = await client().call<any, any>("mod_lesson_get_pages", { lessonid: Number(lessonId) });
    return (data.pages || []).map((p: any) => ({
      id: String(p.id),
      title: p.title,
      contents: p.contents,
      type: p.qtype,
    }));
  } catch {
    return [];
  }
}

export async function getAllLessons() {
  try {
    const courses = await getCourses();
    const courseIds = courses.map(c => Number(c.id));
    const { data } = await client().call<any, any>("mod_lesson_get_lessons_by_courses", { courseids: courseIds });

    return (data.lessons || []).map((l: any) => ({
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

// ============ SCORM ============

export async function getScormInfo(cmid: string) {
  try {
    const courses = await getCourses();
    const courseIds = courses.map(c => Number(c.id));
    const { data } = await client().call<any, any>("mod_scorm_get_scorms_by_courses", { courseids: courseIds });

    const scorm = data.scorms?.find((s: any) => String(s.coursemodule) === cmid);
    if (!scorm) return null;

    return { id: String(scorm.id), name: scorm.name, intro: scorm.intro };
  } catch {
    return null;
  }
}

export async function getScormScoes(scormId: string) {
  try {
    const { data } = await client().call<any, any>("mod_scorm_get_scorm_scoes", { scormid: Number(scormId) });
    return (data.scoes || []).map((s: any) => ({
      id: String(s.id),
      title: s.title,
      identifier: s.identifier,
      launch: s.launch,
    }));
  } catch {
    return [];
  }
}

export async function getScormAttemptCount(scormId: string) {
  try {
    const { data } = await client().call<any, any>("mod_scorm_get_scorm_attempt_count", { scormid: Number(scormId) });
    return data.attemptscount || 0;
  } catch {
    return 0;
  }
}

export async function getAllScorms() {
  try {
    const courses = await getCourses();
    const courseIds = courses.map(c => Number(c.id));
    const { data } = await client().call<any, any>("mod_scorm_get_scorms_by_courses", { courseids: courseIds });

    return (data.scorms || []).map((s: any) => ({
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

// ============ H5P ============

export async function getH5PInfo(cmid: string) {
  try {
    const courses = await getCourses();
    const courseIds = courses.map(c => Number(c.id));
    const { data } = await client().call<any, any>("mod_h5pactivity_get_h5pactivities_by_courses", { courseids: courseIds });

    const h5p = data.h5pactivities?.find((h: any) => String(h.coursemodule) === cmid);
    if (!h5p) return null;

    return { id: String(h5p.id), name: h5p.name, intro: h5p.intro };
  } catch {
    return null;
  }
}

export async function getH5pActivityInfo(cmid: string) {
  return getH5PInfo(cmid);
}

export async function getH5pAttempts(h5pId: string) {
  try {
    const { data } = await client().call<any, any>("mod_h5pactivity_get_attempts", { h5pactivityid: Number(h5pId) });
    return (data.attempts || []).map((a: any) => ({
      id: String(a.id),
      attempt: a.attempt,
      rawscore: a.rawscore,
      maxscore: a.maxscore,
      timecreated: a.timecreated,
    }));
  } catch {
    return [];
  }
}

export async function getAllH5pActivities() {
  try {
    const courses = await getCourses();
    const courseIds = courses.map(c => Number(c.id));
    const { data } = await client().call<any, any>("mod_h5pactivity_get_h5pactivities_by_courses", { courseids: courseIds });

    return (data.h5pactivities || []).map((h: any) => ({
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

// ============ WIKI ============

export async function getWikiInfo(cmid: string) {
  try {
    const courses = await getCourses();
    const courseIds = courses.map(c => Number(c.id));
    const { data } = await client().call<any, any>("mod_wiki_get_wikis_by_courses", { courseids: courseIds });

    const wiki = data.wikis?.find((w: any) => String(w.coursemodule) === cmid);
    if (!wiki) return null;

    return { id: String(wiki.id), name: wiki.name, intro: wiki.intro };
  } catch {
    return null;
  }
}

export async function getWikiSubwikis(wikiId: string) {
  try {
    const { data } = await client().call<any, any>("mod_wiki_get_subwikis", { wikiid: Number(wikiId) });
    return (data.subwikis || []).map((s: any) => ({
      id: String(s.id),
      groupid: s.groupid,
      userid: s.userid,
    }));
  } catch {
    return [];
  }
}

export async function getWikiPages(wikiId: string) {
  try {
    const { data } = await client().call<any, any>("mod_wiki_get_subwiki_pages", { wikiid: Number(wikiId) });
    return (data.pages || []).map((p: any) => ({
      id: String(p.id),
      title: p.title,
      timecreated: p.timecreated,
      timemodified: p.timemodified,
    }));
  } catch {
    return [];
  }
}

export async function getWikiPageContents(pageId: string) {
  try {
    const { data } = await client().call<any, any>("mod_wiki_get_page_contents", { pageid: Number(pageId) });
    return { id: String(data.page.id), title: data.page.title, content: data.page.content };
  } catch {
    return null;
  }
}

export async function getAllWikis() {
  try {
    const courses = await getCourses();
    const courseIds = courses.map(c => Number(c.id));
    const { data } = await client().call<any, any>("mod_wiki_get_wikis_by_courses", { courseids: courseIds });

    return (data.wikis || []).map((w: any) => ({
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

// ============ GLOSSARY ============

export async function getGlossaryInfo(cmid: string) {
  try {
    const courses = await getCourses();
    const courseIds = courses.map(c => Number(c.id));
    const { data } = await client().call<any, any>("mod_glossary_get_glossaries_by_courses", { courseids: courseIds });

    const glossary = data.glossaries?.find((g: any) => String(g.coursemodule) === cmid);
    if (!glossary) return null;

    return { id: String(glossary.id), name: glossary.name, intro: glossary.intro };
  } catch {
    return null;
  }
}

export async function getGlossaryEntries(glossaryId: string, letter = "ALL", from = 0, limit = 20) {
  try {
    const { data } = await client().call<any, any>("mod_glossary_get_entries_by_letter", {
      id: Number(glossaryId),
      letter,
      from,
      limit,
    });
    return (data.entries || []).map((e: any) => ({
      id: String(e.id),
      concept: e.concept,
      definition: e.definition,
      author: e.userfullname,
    }));
  } catch {
    return [];
  }
}

export async function getGlossaryEntry(entryId: string) {
  try {
    const { data } = await client().call<any, any>("mod_glossary_get_entry_by_id", { id: Number(entryId) });
    return {
      id: String(data.entry.id),
      concept: data.entry.concept,
      definition: data.entry.definition,
      author: data.entry.userfullname,
    };
  } catch {
    return null;
  }
}

export async function getAllGlossaries() {
  try {
    const courses = await getCourses();
    const courseIds = courses.map(c => Number(c.id));
    const { data } = await client().call<any, any>("mod_glossary_get_glossaries_by_courses", { courseids: courseIds });

    return (data.glossaries || []).map((g: any) => ({
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

// ============ FOLDER ============

export async function getFolderInfo(cmid: string) {
  try {
    const courses = await getCourses();
    const courseIds = courses.map(c => Number(c.id));
    const { data } = await client().call<any, any>("mod_folder_get_folders_by_courses", { courseids: courseIds });

    const folder = data.folders?.find((f: any) => String(f.coursemodule) === cmid);
    if (!folder) return null;

    return { id: String(folder.id), name: folder.name, intro: folder.intro, files: [] };
  } catch {
    return null;
  }
}

export async function getAllFolders() {
  try {
    const courses = await getCourses();
    const courseIds = courses.map(c => Number(c.id));
    const { data } = await client().call<any, any>("mod_folder_get_folders_by_courses", { courseids: courseIds });

    return (data.folders || []).map((f: any) => ({
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

// ============ CHOICE ============

export async function getChoiceInfo(cmid: string) {
  try {
    const courses = await getCourses();
    const courseIds = courses.map(c => Number(c.id));
    const { data } = await client().call<any, any>("mod_choice_get_choices_by_courses", { courseids: courseIds });

    const choice = data.choices?.find((c: any) => String(c.coursemodule) === cmid);
    if (!choice) return null;

    return {
      id: String(choice.id),
      name: choice.name,
      intro: choice.intro,
      options: (choice.options || []).map((o: any) => ({ id: String(o.id), text: o.text })),
    };
  } catch {
    return null;
  }
}

export async function getChoiceOptions(choiceId: string) {
  try {
    const { data } = await client().call<any, any>("mod_choice_get_choice_options", { choiceid: Number(choiceId) });
    return (data.options || []).map((o: any) => ({
      id: String(o.id),
      text: o.text,
      maxanswers: o.maxanswers,
      countanswers: o.countanswers,
    }));
  } catch {
    return [];
  }
}

export async function getChoiceResults(choiceId: string) {
  try {
    const { data } = await client().call<any, any>("mod_choice_get_choice_results", { choiceid: Number(choiceId) });
    return {
      options: (data.options || []).map((o: any) => ({
        id: String(o.id),
        text: o.text,
        count: o.numberofuser,
        percent: o.percentageamount,
      })),
    };
  } catch {
    return { options: [] };
  }
}

export async function submitChoice(choiceId: string, responses: number[]) {
  try {
    await client().call("mod_choice_submit_choice_response", { choiceid: Number(choiceId), responses });
    return true;
  } catch {
    return false;
  }
}

export async function getAllChoices() {
  try {
    const courses = await getCourses();
    const courseIds = courses.map(c => Number(c.id));
    const { data } = await client().call<any, any>("mod_choice_get_choices_by_courses", { courseids: courseIds });

    return (data.choices || []).map((c: any) => ({
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

// ============ FEEDBACK ============

export async function getFeedbackInfo(cmid: string) {
  try {
    const courses = await getCourses();
    const courseIds = courses.map(c => Number(c.id));
    const { data } = await client().call<any, any>("mod_feedback_get_feedbacks_by_courses", { courseids: courseIds });

    const feedback = data.feedbacks?.find((f: any) => String(f.coursemodule) === cmid);
    if (!feedback) return null;

    return { id: String(feedback.id), name: feedback.name, intro: feedback.intro };
  } catch {
    return null;
  }
}

export async function getFeedbackItems(feedbackId: string) {
  try {
    const { data } = await client().call<any, any>("mod_feedback_get_items", { feedbackid: Number(feedbackId) });
    return (data.items || []).map((i: any) => ({
      id: String(i.id),
      name: i.name,
      label: i.label,
      type: i.typ,
      required: i.required === 1,
    }));
  } catch {
    return [];
  }
}

export async function getAllFeedbacks() {
  try {
    const courses = await getCourses();
    const courseIds = courses.map(c => Number(c.id));
    const { data } = await client().call<any, any>("mod_feedback_get_feedbacks_by_courses", { courseids: courseIds });

    return (data.feedbacks || []).map((f: any) => ({
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

// ============ DATABASE ============

export async function getDataInfo(cmid: string) {
  try {
    const courses = await getCourses();
    const courseIds = courses.map(c => Number(c.id));
    const { data } = await client().call<any, any>("mod_data_get_databases_by_courses", { courseids: courseIds });

    const database = data.databases?.find((d: any) => String(d.coursemodule) === cmid);
    if (!database) return null;

    return { id: String(database.id), name: database.name, intro: database.intro };
  } catch {
    return null;
  }
}

export async function getDataFields(databaseId: string) {
  try {
    const { data } = await client().call<any, any>("mod_data_get_fields", { databaseid: Number(databaseId) });
    return (data.fields || []).map((f: any) => ({
      id: String(f.id),
      name: f.name,
      type: f.type,
      description: f.description,
      required: f.required === 1,
    }));
  } catch {
    return [];
  }
}

export async function getDataEntries(databaseId: string, page = 0, perpage = 10) {
  try {
    const { data } = await client().call<any, any>("mod_data_get_entries", {
      databaseid: Number(databaseId),
      page,
      perpage,
    });
    return (data.entries || []).map((e: any) => ({
      id: String(e.id),
      userid: e.userid,
      fullname: e.fullname,
      timecreated: e.timecreated,
      contents: (e.contents || []).map((c: any) => ({ fieldid: String(c.fieldid), content: c.content })),
    }));
  } catch {
    return [];
  }
}

export async function getAllDatabases() {
  try {
    const courses = await getCourses();
    const courseIds = courses.map(c => Number(c.id));
    const { data } = await client().call<any, any>("mod_data_get_databases_by_courses", { courseids: courseIds });

    return (data.databases || []).map((d: any) => ({
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

// ============ WORKSHOP ============

export async function getWorkshopInfo(cmid: string) {
  try {
    const courses = await getCourses();
    const courseIds = courses.map(c => Number(c.id));
    const { data } = await client().call<any, any>("mod_workshop_get_workshops_by_courses", { courseids: courseIds });

    const workshop = data.workshops?.find((w: any) => String(w.coursemodule) === cmid);
    if (!workshop) return null;

    return { id: String(workshop.id), name: workshop.name, intro: workshop.intro };
  } catch {
    return null;
  }
}

export async function getAllWorkshops() {
  try {
    const courses = await getCourses();
    const courseIds = courses.map(c => Number(c.id));
    const { data } = await client().call<any, any>("mod_workshop_get_workshops_by_courses", { courseids: courseIds });

    return (data.workshops || []).map((w: any) => ({
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

// ============ LTI ============

export async function getLtiInfo(cmid: string) {
  try {
    const courses = await getCourses();
    const courseIds = courses.map(c => Number(c.id));
    const { data } = await client().call<any, any>("mod_lti_get_ltis_by_courses", { courseids: courseIds });

    const lti = data.ltis?.find((l: any) => String(l.coursemodule) === cmid);
    if (!lti) return null;

    return { id: String(lti.id), name: lti.name, intro: lti.intro };
  } catch {
    return null;
  }
}

export async function getLtiLaunchData(ltiId: string) {
  try {
    const { data } = await client().call<any, any>("mod_lti_get_tool_launch_data", { toolid: Number(ltiId) });
    const parameters: Record<string, string> = {};
    for (const p of data.parameters || []) {
      parameters[p.name] = p.value;
    }
    return { endpoint: data.endpoint, parameters };
  } catch {
    return null;
  }
}

// ============ BULK FETCHES ============

export async function getAllBooks() {
  try {
    const courses = await getCourses();
    const courseIds = courses.map(c => Number(c.id));
    const { data } = await client().call<any, any>("mod_book_get_books_by_courses", { courseids: courseIds });

    return (data.books || []).map((b: any) => ({
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

export async function getAllPages() {
  try {
    const courses = await getCourses();
    const courseIds = courses.map(c => Number(c.id));
    const { data } = await client().call<any, any>("mod_page_get_pages_by_courses", { courseids: courseIds });

    return (data.pages || []).map((p: any) => ({
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

export async function getAllResources() {
  try {
    const courses = await getCourses();
    const courseIds = courses.map(c => Number(c.id));
    const token = getMoodleToken();
    const { data } = await client().call<any, any>("mod_resource_get_resources_by_courses", { courseids: courseIds });

    return (data.resources || []).map((r: any) => ({
      id: String(r.id),
      cmid: String(r.coursemodule),
      courseId: String(r.course),
      name: r.name,
      intro: r.intro,
      files: (r.contentfiles || []).map((f: any) => ({
        filename: f.filename,
        fileurl: f.fileurl + `?token=${token}`,
        filesize: f.filesize,
      })),
    }));
  } catch {
    return [];
  }
}

export async function getAllUrls() {
  try {
    const courses = await getCourses();
    const courseIds = courses.map(c => Number(c.id));
    const { data } = await client().call<any, any>("mod_url_get_urls_by_courses", { courseids: courseIds });

    return (data.urls || []).map((u: any) => ({
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

// ============ FILE UPLOAD ============

export async function uploadFile(filename: string, fileContent: string, component = "user", fileArea = "draft") {
  try {
    const token = getMoodleToken();
    const url = getClient().baseUrl;
    
    const formData = new URLSearchParams();
    formData.append("token", token);
    formData.append("component", component);
    formData.append("filearea", fileArea);
    formData.append("itemid", "0");
    formData.append("filepath", "/");
    formData.append("filename", filename);
    formData.append("filecontent", fileContent);

    const response = await fetch(`${url}/webservice/upload.php`, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    if (result.error) throw new Error(result.error);

    return { itemid: result.itemid, fileurl: result.url };
  } catch {
    return null;
  }
}

export async function saveAssignmentSubmission(assignId: string, text?: string, fileItemId?: number) {
  try {
    await client().call("mod_assign_save_submission", {
      assignmentid: Number(assignId),
      plugindata: {
        onlinetext_editor: text ? { text, format: 1, itemid: 0 } : undefined,
        files_filemanager: fileItemId,
      },
    });
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message || "Failed to save submission" };
  }
}

export async function submitAssignmentForGrading(assignId: string) {
  try {
    await client().call("mod_assign_submit_for_grading", {
      assignmentid: Number(assignId),
      acceptsubmissionstatement: 1,
    });
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message || "Failed to submit for grading" };
  }
}

// Re-export helper functions
export { isConfigured, getMoodleUrl } from "./moodle-client";
