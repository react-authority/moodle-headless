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

  return httpServer;
}
