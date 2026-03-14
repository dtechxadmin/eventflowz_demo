import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertEventSchema, insertContactSchema, insertEventContactSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Events API
  app.get("/api/events", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const events = await storage.getEvents();
      res.json(events);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/events/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const eventId = parseInt(req.params.id);
      const event = await storage.getEvent(eventId);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      res.json(event);
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/events", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      try {
        const validatedData = insertEventSchema.parse(req.body);
        const event = await storage.createEvent(validatedData);
        res.status(201).json(event);
      } catch (error) {
        if (error instanceof ZodError) {
          const validationError = fromZodError(error);
          return res.status(400).json({ message: validationError.message });
        }
        throw error;
      }
    } catch (err) {
      next(err);
    }
  });

  app.patch("/api/events/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const eventId = parseInt(req.params.id);
      console.log(`Updating event ID: ${eventId} with data:`, req.body);
      
      const event = await storage.getEvent(eventId);
      
      if (!event) {
        console.log(`Event ID ${eventId} not found`);
        return res.status(404).json({ message: "Event not found" });
      }
      
      console.log("Existing event:", event);
      
      const updatedEvent = await storage.updateEvent(eventId, req.body);
      console.log("Updated event:", updatedEvent);
      
      res.json(updatedEvent);
    } catch (err) {
      console.error("Error updating event:", err);
      next(err);
    }
  });

  app.delete("/api/events/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const eventId = parseInt(req.params.id);
      const success = await storage.deleteEvent(eventId);
      
      if (!success) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  });

  // Contacts API
  app.get("/api/contacts", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const contacts = await storage.getContacts();
      res.json(contacts);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/contacts/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const contactId = parseInt(req.params.id);
      const contact = await storage.getContact(contactId);
      
      if (!contact) {
        return res.status(404).json({ message: "Contact not found" });
      }
      
      res.json(contact);
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/contacts", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      try {
        const validatedData = insertContactSchema.parse(req.body);
        const contact = await storage.createContact(validatedData);
        res.status(201).json(contact);
      } catch (error) {
        if (error instanceof ZodError) {
          const validationError = fromZodError(error);
          return res.status(400).json({ message: validationError.message });
        }
        throw error;
      }
    } catch (err) {
      next(err);
    }
  });

  // Event-Contacts relationship API - now returns event contacts directly
  app.get("/api/events/:id/contacts", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const eventId = parseInt(req.params.id);
      const event = await storage.getEvent(eventId);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      const eventContacts = await storage.getEventContacts(eventId);
      res.json(eventContacts);
    } catch (err) {
      next(err);
    }
  });

  // Get event-contacts relationship data for an event
  app.get("/api/events/:id/event-contacts", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const eventId = parseInt(req.params.id);
      const event = await storage.getEvent(eventId);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      const eventContacts = await storage.getEventContacts(eventId);
      res.json(eventContacts);
    } catch (err) {
      next(err);
    }
  });
  
  app.post("/api/events/:id/contacts", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const eventId = parseInt(req.params.id);
      const event = await storage.getEvent(eventId);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      try {
        const validatedData = insertEventContactSchema.parse({
          ...req.body,
          eventId,
        });
        
        const eventContact = await storage.addContactToEvent(validatedData);
        res.status(201).json(eventContact);
      } catch (error) {
        if (error instanceof ZodError) {
          const validationError = fromZodError(error);
          return res.status(400).json({ message: validationError.message });
        }
        throw error;
      }
    } catch (err) {
      next(err);
    }
  });

  // Update event contact
  app.patch("/api/events/:eventId/contacts/:contactId", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const eventId = parseInt(req.params.eventId);
      const contactId = parseInt(req.params.contactId);
      
      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      const updatedContact = await storage.updateEventContact(contactId, req.body);
      
      if (!updatedContact) {
        return res.status(404).json({ message: "Contact not found" });
      }
      
      res.json(updatedContact);
    } catch (err) {
      next(err);
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
