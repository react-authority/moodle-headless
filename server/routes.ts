import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
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

  return httpServer;
}
