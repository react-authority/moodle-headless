import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Get connection status
  app.get("/api/status", async (_req, res) => {
    try {
      const status = storage.getConnectionStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: "Failed to get status" });
    }
  });

  // Get current user
  app.get("/api/user", async (_req, res) => {
    try {
      const user = await storage.getCurrentUser();
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  // Get all categories
  app.get("/api/categories", async (_req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to get categories" });
    }
  });

  // Get all courses
  app.get("/api/courses", async (_req, res) => {
    try {
      const courses = await storage.getCourses();
      res.json(courses);
    } catch (error) {
      res.status(500).json({ error: "Failed to get courses" });
    }
  });

  // Get single course
  app.get("/api/courses/:id", async (req, res) => {
    try {
      const course = await storage.getCourse(req.params.id);
      if (!course) {
        return res.status(404).json({ error: "Course not found" });
      }
      res.json(course);
    } catch (error) {
      res.status(500).json({ error: "Failed to get course" });
    }
  });

  // Get course sections
  app.get("/api/courses/:id/sections", async (req, res) => {
    try {
      const sections = await storage.getCourseSections(req.params.id);
      res.json(sections);
    } catch (error) {
      res.status(500).json({ error: "Failed to get sections" });
    }
  });

  // Get course activities
  app.get("/api/courses/:id/activities", async (req, res) => {
    try {
      const activities = await storage.getCourseActivities(req.params.id);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ error: "Failed to get activities" });
    }
  });

  // Get upcoming activities
  app.get("/api/activities/upcoming", async (_req, res) => {
    try {
      const activities = await storage.getUpcomingActivities();
      res.json(activities);
    } catch (error) {
      res.status(500).json({ error: "Failed to get upcoming activities" });
    }
  });

  // Get all calendar events
  app.get("/api/events", async (_req, res) => {
    try {
      const events = await storage.getEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to get events" });
    }
  });

  // Get upcoming events
  app.get("/api/events/upcoming", async (_req, res) => {
    try {
      const events = await storage.getUpcomingEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to get upcoming events" });
    }
  });

  // Get grades
  app.get("/api/grades", async (_req, res) => {
    try {
      const grades = await storage.getGrades();
      res.json(grades);
    } catch (error) {
      res.status(500).json({ error: "Failed to get grades" });
    }
  });

  // Get stats
  app.get("/api/stats", async (_req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to get stats" });
    }
  });

  // Get assignments
  app.get("/api/assignments", async (req, res) => {
    try {
      const courseId = req.query.courseId as string | undefined;
      const assignments = await storage.getAssignments(courseId);
      res.json(assignments);
    } catch (error) {
      res.status(500).json({ error: "Failed to get assignments" });
    }
  });

  // Get assignment submission status
  app.get("/api/assignments/:id/status", async (req, res) => {
    try {
      const status = await storage.getAssignmentSubmissionStatus(req.params.id);
      res.json(status || { submitted: false, graded: false });
    } catch (error) {
      res.status(500).json({ error: "Failed to get assignment status" });
    }
  });

  // Get quizzes
  app.get("/api/quizzes", async (req, res) => {
    try {
      const courseId = req.query.courseId as string | undefined;
      const quizzes = await storage.getQuizzes(courseId);
      res.json(quizzes);
    } catch (error) {
      res.status(500).json({ error: "Failed to get quizzes" });
    }
  });

  // Get quiz attempts
  app.get("/api/quizzes/:id/attempts", async (req, res) => {
    try {
      const attempts = await storage.getQuizAttempts(req.params.id);
      res.json(attempts);
    } catch (error) {
      res.status(500).json({ error: "Failed to get quiz attempts" });
    }
  });

  // Get forums
  app.get("/api/forums", async (req, res) => {
    try {
      const courseId = req.query.courseId as string | undefined;
      const forums = await storage.getForums(courseId);
      res.json(forums);
    } catch (error) {
      res.status(500).json({ error: "Failed to get forums" });
    }
  });

  // Get forum discussions
  app.get("/api/forums/:id/discussions", async (req, res) => {
    try {
      const discussions = await storage.getForumDiscussions(req.params.id);
      res.json(discussions);
    } catch (error) {
      res.status(500).json({ error: "Failed to get forum discussions" });
    }
  });

  // Get notifications
  app.get("/api/notifications", async (_req, res) => {
    try {
      const notifications = await storage.getNotifications();
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ error: "Failed to get notifications" });
    }
  });

  // Get unread notification count
  app.get("/api/notifications/count", async (_req, res) => {
    try {
      const count = await storage.getUnreadNotificationCount();
      res.json({ count });
    } catch (error) {
      res.status(500).json({ error: "Failed to get notification count" });
    }
  });

  // Get user badges
  app.get("/api/badges", async (_req, res) => {
    try {
      const badges = await storage.getUserBadges();
      res.json(badges);
    } catch (error) {
      res.status(500).json({ error: "Failed to get badges" });
    }
  });

  // Update activity completion
  app.post("/api/activities/:id/completion", async (req, res) => {
    try {
      const { completed } = req.body;
      const success = await storage.updateActivityCompletion(req.params.id, completed);
      res.json({ success });
    } catch (error) {
      res.status(500).json({ error: "Failed to update completion" });
    }
  });

  // Get module content for in-app viewing
  app.get("/api/modules/:cmid/content", async (req, res) => {
    try {
      const { modname } = req.query;
      if (!modname || typeof modname !== "string") {
        return res.status(400).json({ error: "modname query parameter required" });
      }
      const content = await storage.getModuleContent(req.params.cmid, modname);
      if (!content) {
        return res.status(404).json({ error: "Content not found" });
      }
      res.json(content);
    } catch (error) {
      res.status(500).json({ error: "Failed to get module content" });
    }
  });

  // ============ QUIZ API ROUTES ============

  // Get quiz info
  app.get("/api/quiz/:cmid", async (req, res) => {
    try {
      const { getQuizInfo } = await import("./moodle-api");
      const quiz = await getQuizInfo(req.params.cmid);
      if (!quiz) {
        return res.status(404).json({ error: "Quiz not found" });
      }
      res.json(quiz);
    } catch (error) {
      res.status(500).json({ error: "Failed to get quiz" });
    }
  });

  // Get quiz attempts
  app.get("/api/quiz/:quizId/attempts", async (req, res) => {
    try {
      const { getQuizAttempts } = await import("./moodle-api");
      const attempts = await getQuizAttempts(req.params.quizId);
      res.json(attempts || { attempts: [] });
    } catch (error) {
      res.status(500).json({ error: "Failed to get quiz attempts" });
    }
  });

  // Start quiz attempt
  app.post("/api/quiz/:quizId/start", async (req, res) => {
    try {
      const { startQuizAttempt } = await import("./moodle-api");
      const result = await startQuizAttempt(req.params.quizId);
      if (!result) {
        return res.status(400).json({ error: "Failed to start quiz attempt" });
      }
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to start quiz attempt" });
    }
  });

  // Get quiz attempt data
  app.get("/api/quiz/attempt/:attemptId", async (req, res) => {
    try {
      const { getQuizAttemptData } = await import("./moodle-api");
      const page = parseInt(req.query.page as string) || 0;
      const data = await getQuizAttemptData(req.params.attemptId, page);
      if (!data) {
        return res.status(404).json({ error: "Attempt not found" });
      }
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to get attempt data" });
    }
  });

  // Save quiz answers
  app.post("/api/quiz/attempt/:attemptId/save", async (req, res) => {
    try {
      const { saveQuizAttempt } = await import("./moodle-api");
      const success = await saveQuizAttempt(req.params.attemptId, req.body.data);
      res.json({ success });
    } catch (error) {
      res.status(500).json({ error: "Failed to save attempt" });
    }
  });

  // Finish quiz attempt
  app.post("/api/quiz/attempt/:attemptId/finish", async (req, res) => {
    try {
      const { finishQuizAttempt } = await import("./moodle-api");
      const success = await finishQuizAttempt(req.params.attemptId);
      res.json({ success });
    } catch (error) {
      res.status(500).json({ error: "Failed to finish attempt" });
    }
  });

  // Get quiz attempt review
  app.get("/api/quiz/attempt/:attemptId/review", async (req, res) => {
    try {
      const { getQuizAttemptReview } = await import("./moodle-api");
      const review = await getQuizAttemptReview(req.params.attemptId);
      if (!review) {
        return res.status(404).json({ error: "Review not found" });
      }
      res.json(review);
    } catch (error) {
      res.status(500).json({ error: "Failed to get review" });
    }
  });

  // ============ ASSIGNMENT API ROUTES ============

  // Get assignment info
  app.get("/api/assignment/:cmid", async (req, res) => {
    try {
      const { getAssignmentInfo } = await import("./moodle-api");
      const assignment = await getAssignmentInfo(req.params.cmid);
      if (!assignment) {
        return res.status(404).json({ error: "Assignment not found" });
      }
      res.json(assignment);
    } catch (error) {
      res.status(500).json({ error: "Failed to get assignment" });
    }
  });

  // Save assignment submission (text/online text)
  app.post("/api/assignment/:assignId/save", async (req, res) => {
    try {
      const { saveAssignmentSubmission } = await import("./moodle-api");
      const { text } = req.body;
      const result = await saveAssignmentSubmission(req.params.assignId, text);
      if (!result.success) {
        return res.status(400).json({ error: result.error || "Failed to save submission" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to save assignment submission" });
    }
  });

  // Submit assignment for grading
  app.post("/api/assignment/:assignId/submit", async (req, res) => {
    try {
      const { submitAssignmentForGrading } = await import("./moodle-api");
      const result = await submitAssignmentForGrading(req.params.assignId);
      if (!result.success) {
        return res.status(400).json({ error: result.error || "Failed to submit for grading" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to submit assignment for grading" });
    }
  });

  // ============ FORUM API ROUTES ============

  // Get forum info
  app.get("/api/forum/:cmid", async (req, res) => {
    try {
      const { getForumInfo } = await import("./moodle-api");
      const forum = await getForumInfo(req.params.cmid);
      if (!forum) {
        return res.status(404).json({ error: "Forum not found" });
      }
      res.json(forum);
    } catch (error) {
      res.status(500).json({ error: "Failed to get forum" });
    }
  });

  // Get forum discussions
  app.get("/api/forum/:forumId/discussions", async (req, res) => {
    try {
      const { getForumDiscussions } = await import("./moodle-api");
      const discussions = await getForumDiscussions(req.params.forumId);
      res.json(discussions);
    } catch (error) {
      res.status(500).json({ error: "Failed to get discussions" });
    }
  });

  // Get discussion posts
  app.get("/api/forum/discussion/:discussionId/posts", async (req, res) => {
    try {
      const { getForumDiscussionPosts } = await import("./moodle-api");
      const posts = await getForumDiscussionPosts(req.params.discussionId);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: "Failed to get posts" });
    }
  });

  // Add discussion
  app.post("/api/forum/:forumId/discussions", async (req, res) => {
    try {
      const { addForumDiscussion } = await import("./moodle-api");
      const { subject, message } = req.body;
      const result = await addForumDiscussion(req.params.forumId, subject, message);
      if (!result) {
        return res.status(400).json({ error: "Failed to add discussion" });
      }
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to add discussion" });
    }
  });

  // Add post to discussion
  app.post("/api/forum/discussion/:discussionId/posts", async (req, res) => {
    try {
      const { addForumPost } = await import("./moodle-api");
      const { parentId, subject, message } = req.body;
      const result = await addForumPost(req.params.discussionId, parentId, subject, message);
      if (!result) {
        return res.status(400).json({ error: "Failed to add post" });
      }
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to add post" });
    }
  });

  // ============ LESSON API ROUTES ============

  app.get("/api/lesson/:cmid", async (req, res) => {
    try {
      const { getLessonInfo } = await import("./moodle-api");
      const lesson = await getLessonInfo(req.params.cmid);
      if (!lesson) {
        return res.status(404).json({ error: "Lesson not found" });
      }
      res.json(lesson);
    } catch (error) {
      res.status(500).json({ error: "Failed to get lesson" });
    }
  });

  app.get("/api/lesson/:lessonId/pages", async (req, res) => {
    try {
      const { getLessonPages } = await import("./moodle-api");
      const pages = await getLessonPages(req.params.lessonId);
      res.json(pages);
    } catch (error) {
      res.status(500).json({ error: "Failed to get lesson pages" });
    }
  });

  app.get("/api/lessons", async (_req, res) => {
    try {
      const { getAllLessons } = await import("./moodle-api");
      const lessons = await getAllLessons();
      res.json(lessons);
    } catch (error) {
      res.status(500).json({ error: "Failed to get lessons" });
    }
  });

  // ============ SCORM API ROUTES ============

  app.get("/api/scorm/:cmid", async (req, res) => {
    try {
      const { getScormInfo } = await import("./moodle-api");
      const scorm = await getScormInfo(req.params.cmid);
      if (!scorm) {
        return res.status(404).json({ error: "SCORM not found" });
      }
      res.json(scorm);
    } catch (error) {
      res.status(500).json({ error: "Failed to get SCORM" });
    }
  });

  app.get("/api/scorm/:scormId/scoes", async (req, res) => {
    try {
      const { getScormScoes } = await import("./moodle-api");
      const scoes = await getScormScoes(req.params.scormId);
      res.json(scoes);
    } catch (error) {
      res.status(500).json({ error: "Failed to get SCORM SCOes" });
    }
  });

  app.get("/api/scorm/:scormId/attempts", async (req, res) => {
    try {
      const { getScormAttemptCount } = await import("./moodle-api");
      const count = await getScormAttemptCount(req.params.scormId);
      res.json({ count });
    } catch (error) {
      res.status(500).json({ error: "Failed to get SCORM attempts" });
    }
  });

  app.get("/api/scorms", async (_req, res) => {
    try {
      const { getAllScorms } = await import("./moodle-api");
      const scorms = await getAllScorms();
      res.json(scorms);
    } catch (error) {
      res.status(500).json({ error: "Failed to get SCORMs" });
    }
  });

  // ============ H5P ACTIVITY API ROUTES ============

  app.get("/api/h5p/:cmid", async (req, res) => {
    try {
      const { getH5pActivityInfo } = await import("./moodle-api");
      const h5p = await getH5pActivityInfo(req.params.cmid);
      if (!h5p) {
        return res.status(404).json({ error: "H5P activity not found" });
      }
      res.json(h5p);
    } catch (error) {
      res.status(500).json({ error: "Failed to get H5P activity" });
    }
  });

  app.get("/api/h5p/:h5pId/attempts", async (req, res) => {
    try {
      const { getH5pAttempts } = await import("./moodle-api");
      const attempts = await getH5pAttempts(req.params.h5pId);
      res.json(attempts);
    } catch (error) {
      res.status(500).json({ error: "Failed to get H5P attempts" });
    }
  });

  app.get("/api/h5pactivities", async (_req, res) => {
    try {
      const { getAllH5pActivities } = await import("./moodle-api");
      const h5pactivities = await getAllH5pActivities();
      res.json(h5pactivities);
    } catch (error) {
      res.status(500).json({ error: "Failed to get H5P activities" });
    }
  });

  // ============ WIKI API ROUTES ============

  app.get("/api/wiki/:cmid", async (req, res) => {
    try {
      const { getWikiInfo } = await import("./moodle-api");
      const wiki = await getWikiInfo(req.params.cmid);
      if (!wiki) {
        return res.status(404).json({ error: "Wiki not found" });
      }
      res.json(wiki);
    } catch (error) {
      res.status(500).json({ error: "Failed to get wiki" });
    }
  });

  app.get("/api/wiki/:wikiId/subwikis", async (req, res) => {
    try {
      const { getWikiSubwikis } = await import("./moodle-api");
      const subwikis = await getWikiSubwikis(req.params.wikiId);
      res.json(subwikis);
    } catch (error) {
      res.status(500).json({ error: "Failed to get wiki subwikis" });
    }
  });

  app.get("/api/wiki/subwiki/:subwikiId/pages", async (req, res) => {
    try {
      const { getWikiPages } = await import("./moodle-api");
      const pages = await getWikiPages(req.params.subwikiId);
      res.json(pages);
    } catch (error) {
      res.status(500).json({ error: "Failed to get wiki pages" });
    }
  });

  app.get("/api/wiki/page/:pageId", async (req, res) => {
    try {
      const { getWikiPageContents } = await import("./moodle-api");
      const page = await getWikiPageContents(req.params.pageId);
      if (!page) {
        return res.status(404).json({ error: "Wiki page not found" });
      }
      res.json(page);
    } catch (error) {
      res.status(500).json({ error: "Failed to get wiki page" });
    }
  });

  app.get("/api/wikis", async (_req, res) => {
    try {
      const { getAllWikis } = await import("./moodle-api");
      const wikis = await getAllWikis();
      res.json(wikis);
    } catch (error) {
      res.status(500).json({ error: "Failed to get wikis" });
    }
  });

  // ============ GLOSSARY API ROUTES ============

  app.get("/api/glossary/:cmid", async (req, res) => {
    try {
      const { getGlossaryInfo } = await import("./moodle-api");
      const glossary = await getGlossaryInfo(req.params.cmid);
      if (!glossary) {
        return res.status(404).json({ error: "Glossary not found" });
      }
      res.json(glossary);
    } catch (error) {
      res.status(500).json({ error: "Failed to get glossary" });
    }
  });

  app.get("/api/glossary/:glossaryId/entries", async (req, res) => {
    try {
      const { getGlossaryEntries } = await import("./moodle-api");
      const letter = (req.query.letter as string) || "ALL";
      const from = parseInt(req.query.from as string) || 0;
      const limit = parseInt(req.query.limit as string) || 20;
      const entries = await getGlossaryEntries(req.params.glossaryId, letter, from, limit);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ error: "Failed to get glossary entries" });
    }
  });

  app.get("/api/glossary/entry/:entryId", async (req, res) => {
    try {
      const { getGlossaryEntry } = await import("./moodle-api");
      const entry = await getGlossaryEntry(req.params.entryId);
      if (!entry) {
        return res.status(404).json({ error: "Glossary entry not found" });
      }
      res.json(entry);
    } catch (error) {
      res.status(500).json({ error: "Failed to get glossary entry" });
    }
  });

  app.get("/api/glossaries", async (_req, res) => {
    try {
      const { getAllGlossaries } = await import("./moodle-api");
      const glossaries = await getAllGlossaries();
      res.json(glossaries);
    } catch (error) {
      res.status(500).json({ error: "Failed to get glossaries" });
    }
  });

  // ============ FOLDER API ROUTES ============

  app.get("/api/folder/:cmid", async (req, res) => {
    try {
      const { getFolderInfo } = await import("./moodle-api");
      const folder = await getFolderInfo(req.params.cmid);
      if (!folder) {
        return res.status(404).json({ error: "Folder not found" });
      }
      res.json(folder);
    } catch (error) {
      res.status(500).json({ error: "Failed to get folder" });
    }
  });

  app.get("/api/folders", async (_req, res) => {
    try {
      const { getAllFolders } = await import("./moodle-api");
      const folders = await getAllFolders();
      res.json(folders);
    } catch (error) {
      res.status(500).json({ error: "Failed to get folders" });
    }
  });

  // ============ CHOICE API ROUTES ============

  app.get("/api/choice/:cmid", async (req, res) => {
    try {
      const { getChoiceInfo } = await import("./moodle-api");
      const choice = await getChoiceInfo(req.params.cmid);
      if (!choice) {
        return res.status(404).json({ error: "Choice not found" });
      }
      res.json(choice);
    } catch (error) {
      res.status(500).json({ error: "Failed to get choice" });
    }
  });

  app.get("/api/choice/:choiceId/options", async (req, res) => {
    try {
      const { getChoiceOptions } = await import("./moodle-api");
      const options = await getChoiceOptions(req.params.choiceId);
      res.json(options);
    } catch (error) {
      res.status(500).json({ error: "Failed to get choice options" });
    }
  });

  app.get("/api/choice/:choiceId/results", async (req, res) => {
    try {
      const { getChoiceResults } = await import("./moodle-api");
      const results = await getChoiceResults(req.params.choiceId);
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Failed to get choice results" });
    }
  });

  app.post("/api/choice/:choiceId/submit", async (req, res) => {
    try {
      const { submitChoice } = await import("./moodle-api");
      const { responses } = req.body;
      const success = await submitChoice(req.params.choiceId, responses);
      res.json({ success });
    } catch (error) {
      res.status(500).json({ error: "Failed to submit choice" });
    }
  });

  app.get("/api/choices", async (_req, res) => {
    try {
      const { getAllChoices } = await import("./moodle-api");
      const choices = await getAllChoices();
      res.json(choices);
    } catch (error) {
      res.status(500).json({ error: "Failed to get choices" });
    }
  });

  // ============ FEEDBACK API ROUTES ============

  app.get("/api/feedback/:cmid", async (req, res) => {
    try {
      const { getFeedbackInfo } = await import("./moodle-api");
      const feedback = await getFeedbackInfo(req.params.cmid);
      if (!feedback) {
        return res.status(404).json({ error: "Feedback not found" });
      }
      res.json(feedback);
    } catch (error) {
      res.status(500).json({ error: "Failed to get feedback" });
    }
  });

  app.get("/api/feedback/:feedbackId/items", async (req, res) => {
    try {
      const { getFeedbackItems } = await import("./moodle-api");
      const items = await getFeedbackItems(req.params.feedbackId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to get feedback items" });
    }
  });

  app.get("/api/feedbacks", async (_req, res) => {
    try {
      const { getAllFeedbacks } = await import("./moodle-api");
      const feedbacks = await getAllFeedbacks();
      res.json(feedbacks);
    } catch (error) {
      res.status(500).json({ error: "Failed to get feedbacks" });
    }
  });

  // ============ DATABASE API ROUTES ============

  app.get("/api/data/:cmid", async (req, res) => {
    try {
      const { getDataInfo } = await import("./moodle-api");
      const data = await getDataInfo(req.params.cmid);
      if (!data) {
        return res.status(404).json({ error: "Database not found" });
      }
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to get database" });
    }
  });

  app.get("/api/data/:dataId/fields", async (req, res) => {
    try {
      const { getDataFields } = await import("./moodle-api");
      const fields = await getDataFields(req.params.dataId);
      res.json(fields);
    } catch (error) {
      res.status(500).json({ error: "Failed to get database fields" });
    }
  });

  app.get("/api/data/:dataId/entries", async (req, res) => {
    try {
      const { getDataEntries } = await import("./moodle-api");
      const page = parseInt(req.query.page as string) || 0;
      const perpage = parseInt(req.query.perpage as string) || 10;
      const entries = await getDataEntries(req.params.dataId, page, perpage);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ error: "Failed to get database entries" });
    }
  });

  app.get("/api/databases", async (_req, res) => {
    try {
      const { getAllDatabases } = await import("./moodle-api");
      const databases = await getAllDatabases();
      res.json(databases);
    } catch (error) {
      res.status(500).json({ error: "Failed to get databases" });
    }
  });

  // ============ WORKSHOP API ROUTES ============

  app.get("/api/workshop/:cmid", async (req, res) => {
    try {
      const { getWorkshopInfo } = await import("./moodle-api");
      const workshop = await getWorkshopInfo(req.params.cmid);
      if (!workshop) {
        return res.status(404).json({ error: "Workshop not found" });
      }
      res.json(workshop);
    } catch (error) {
      res.status(500).json({ error: "Failed to get workshop" });
    }
  });

  app.get("/api/workshops", async (_req, res) => {
    try {
      const { getAllWorkshops } = await import("./moodle-api");
      const workshops = await getAllWorkshops();
      res.json(workshops);
    } catch (error) {
      res.status(500).json({ error: "Failed to get workshops" });
    }
  });

  // ============ LTI API ROUTES ============

  app.get("/api/lti/:cmid", async (req, res) => {
    try {
      const { getLtiInfo } = await import("./moodle-api");
      const lti = await getLtiInfo(req.params.cmid);
      if (!lti) {
        return res.status(404).json({ error: "LTI not found" });
      }
      res.json(lti);
    } catch (error) {
      res.status(500).json({ error: "Failed to get LTI" });
    }
  });

  app.get("/api/lti/:ltiId/launch", async (req, res) => {
    try {
      const { getLtiLaunchData } = await import("./moodle-api");
      const launchData = await getLtiLaunchData(req.params.ltiId);
      if (!launchData) {
        return res.status(404).json({ error: "LTI launch data not found" });
      }
      res.json(launchData);
    } catch (error) {
      res.status(500).json({ error: "Failed to get LTI launch data" });
    }
  });

  // ============ BOOK API ROUTES ============

  app.get("/api/book/:cmid", async (req, res) => {
    try {
      const { getBookContent } = await import("./moodle-api");
      const book = await getBookContent(req.params.cmid);
      if (!book) {
        return res.status(404).json({ error: "Book not found" });
      }
      res.json(book);
    } catch (error) {
      res.status(500).json({ error: "Failed to get book" });
    }
  });

  app.get("/api/books", async (_req, res) => {
    try {
      const { getAllBooks } = await import("./moodle-api");
      const books = await getAllBooks();
      res.json(books);
    } catch (error) {
      res.status(500).json({ error: "Failed to get books" });
    }
  });

  // ============ PAGE API ROUTES ============

  app.get("/api/page/:cmid", async (req, res) => {
    try {
      const { getPageContent } = await import("./moodle-api");
      const page = await getPageContent(req.params.cmid);
      if (!page) {
        return res.status(404).json({ error: "Page not found" });
      }
      res.json(page);
    } catch (error) {
      res.status(500).json({ error: "Failed to get page" });
    }
  });

  app.get("/api/pages", async (_req, res) => {
    try {
      const { getAllPages } = await import("./moodle-api");
      const pages = await getAllPages();
      res.json(pages);
    } catch (error) {
      res.status(500).json({ error: "Failed to get pages" });
    }
  });

  // ============ RESOURCE API ROUTES ============

  app.get("/api/resource/:cmid", async (req, res) => {
    try {
      const { getResourceContent } = await import("./moodle-api");
      const resource = await getResourceContent(req.params.cmid);
      if (!resource) {
        return res.status(404).json({ error: "Resource not found" });
      }
      res.json(resource);
    } catch (error) {
      res.status(500).json({ error: "Failed to get resource" });
    }
  });

  app.get("/api/resources", async (_req, res) => {
    try {
      const { getAllResources } = await import("./moodle-api");
      const resources = await getAllResources();
      res.json(resources);
    } catch (error) {
      res.status(500).json({ error: "Failed to get resources" });
    }
  });

  // ============ URL API ROUTES ============

  app.get("/api/url/:cmid", async (req, res) => {
    try {
      const { getUrlContent } = await import("./moodle-api");
      const urlContent = await getUrlContent(req.params.cmid);
      if (!urlContent) {
        return res.status(404).json({ error: "URL not found" });
      }
      res.json(urlContent);
    } catch (error) {
      res.status(500).json({ error: "Failed to get URL" });
    }
  });

  app.get("/api/urls", async (_req, res) => {
    try {
      const { getAllUrls } = await import("./moodle-api");
      const urls = await getAllUrls();
      res.json(urls);
    } catch (error) {
      res.status(500).json({ error: "Failed to get URLs" });
    }
  });

  // ============ ALL ACTIVITIES ROUTE ============

  app.get("/api/all-activities", async (_req, res) => {
    try {
      const moodleClient = await import("./moodle-api");
      
      const [
        quizzes,
        assignments,
        forums,
        lessons,
        scorms,
        h5pactivities,
        wikis,
        glossaries,
        folders,
        choices,
        feedbacks,
        databases,
        workshops,
        books,
        pages,
        resources,
        urls,
      ] = await Promise.all([
        moodleClient.getQuizzes(),
        moodleClient.getAssignments(),
        moodleClient.getForums(),
        moodleClient.getAllLessons(),
        moodleClient.getAllScorms(),
        moodleClient.getAllH5pActivities(),
        moodleClient.getAllWikis(),
        moodleClient.getAllGlossaries(),
        moodleClient.getAllFolders(),
        moodleClient.getAllChoices(),
        moodleClient.getAllFeedbacks(),
        moodleClient.getAllDatabases(),
        moodleClient.getAllWorkshops(),
        moodleClient.getAllBooks(),
        moodleClient.getAllPages(),
        moodleClient.getAllResources(),
        moodleClient.getAllUrls(),
      ]);
      
      res.json({
        quizzes: quizzes.map((q: any) => ({ ...q, modname: "quiz" })),
        assignments: assignments.map((a: any) => ({ ...a, modname: "assign" })),
        forums: forums.map((f: any) => ({ ...f, modname: "forum" })),
        lessons: lessons.map((l: any) => ({ ...l, modname: "lesson" })),
        scorms: scorms.map((s: any) => ({ ...s, modname: "scorm" })),
        h5pactivities: h5pactivities.map((h: any) => ({ ...h, modname: "h5pactivity" })),
        wikis: wikis.map((w: any) => ({ ...w, modname: "wiki" })),
        glossaries: glossaries.map((g: any) => ({ ...g, modname: "glossary" })),
        folders: folders.map((f: any) => ({ ...f, modname: "folder" })),
        choices: choices.map((c: any) => ({ ...c, modname: "choice" })),
        feedbacks: feedbacks.map((f: any) => ({ ...f, modname: "feedback" })),
        databases: databases.map((d: any) => ({ ...d, modname: "data" })),
        workshops: workshops.map((w: any) => ({ ...w, modname: "workshop" })),
        books: books.map((b: any) => ({ ...b, modname: "book" })),
        pages: pages.map((p: any) => ({ ...p, modname: "page" })),
        resources: resources.map((r: any) => ({ ...r, modname: "resource" })),
        urls: urls.map((u: any) => ({ ...u, modname: "url" })),
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to get all activities" });
    }
  });

  return httpServer;
}
