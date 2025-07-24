import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAlarmSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all alarms
  app.get("/api/alarms", async (req, res) => {
    try {
      const alarms = await storage.getAlarms();
      res.json(alarms);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch alarms" });
    }
  });

  // Create new alarm
  app.post("/api/alarms", async (req, res) => {
    try {
      // Convert triggerTime string to Date object before validation
      const requestData = {
        ...req.body,
        triggerTime: req.body.triggerTime ? new Date(req.body.triggerTime) : undefined
      };
      
      const validatedData = insertAlarmSchema.parse(requestData);
      const alarm = await storage.createAlarm(validatedData);
      res.status(201).json(alarm);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid alarm data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create alarm" });
      }
    }
  });

  // Update alarm
  app.patch("/api/alarms/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Convert triggerTime string to Date object before validation
      const requestData = {
        ...req.body,
        triggerTime: req.body.triggerTime ? new Date(req.body.triggerTime) : undefined
      };
      
      const validatedData = insertAlarmSchema.partial().parse(requestData);
      const alarm = await storage.updateAlarm(id, validatedData);
      
      if (!alarm) {
        return res.status(404).json({ message: "Alarm not found" });
      }
      
      res.json(alarm);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid alarm data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update alarm" });
      }
    }
  });

  // Delete alarm
  app.delete("/api/alarms/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteAlarm(id);
      
      if (!success) {
        return res.status(404).json({ message: "Alarm not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete alarm" });
    }
  });

  // Get specific alarm
  app.get("/api/alarms/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const alarm = await storage.getAlarmById(id);
      
      if (!alarm) {
        return res.status(404).json({ message: "Alarm not found" });
      }
      
      res.json(alarm);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch alarm" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
