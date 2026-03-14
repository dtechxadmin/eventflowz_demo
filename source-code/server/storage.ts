import { 
  users, type User, type InsertUser,
  events, type Event, type InsertEvent,
  contacts, type Contact, type InsertContact,
  eventContacts, type EventContact, type InsertEventContact 
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import connectPg from "connect-pg-simple";
import { pool, db } from "./db";
import { eq, and } from "drizzle-orm";

const MemoryStore = createMemoryStore(session);
const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Event methods
  getEvents(): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, event: Partial<InsertEvent>): Promise<Event | undefined>;
  deleteEvent(id: number): Promise<boolean>;
  
  // Contact methods
  getContacts(): Promise<Contact[]>;
  getContact(id: number): Promise<Contact | undefined>;
  createContact(contact: InsertContact): Promise<Contact>;
  addContactToEvent(eventContact: InsertEventContact): Promise<EventContact>;
  getEventContacts(eventId: number): Promise<EventContact[]>;
  updateEventContact(id: number, contact: Partial<InsertEventContact>): Promise<EventContact | undefined>;
  
  // Session store
  sessionStore: any;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private events: Map<number, Event>;
  private contacts: Map<number, Contact>;
  private eventContacts: Map<number, EventContact>;
  
  public sessionStore: any;
  
  private userCurrentId: number;
  private eventCurrentId: number;
  private contactCurrentId: number;
  private eventContactCurrentId: number;

  constructor() {
    this.users = new Map();
    this.events = new Map();
    this.contacts = new Map();
    this.eventContacts = new Map();
    
    this.userCurrentId = 1;
    this.eventCurrentId = 1;
    this.contactCurrentId = 1;
    this.eventContactCurrentId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    // Add sample data
    this.setupSampleData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { 
      ...insertUser, 
      id,
      role: insertUser.role || "user",
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }
  
  // Event methods
  async getEvents(): Promise<Event[]> {
    return Array.from(this.events.values());
  }
  
  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }
  
  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = this.eventCurrentId++;
    const event: Event = {
      ...insertEvent,
      id,
      status: insertEvent.status || "inquiry",
      musicPreferences: insertEvent.musicPreferences || null,
      referralSource: insertEvent.referralSource || null,
      additionalDetails: insertEvent.additionalDetails || null,
      createdAt: new Date()
    };
    this.events.set(id, event);
    return event;
  }
  
  async updateEvent(id: number, eventData: Partial<InsertEvent>): Promise<Event | undefined> {
    const event = this.events.get(id);
    if (!event) return undefined;
    
    const updatedEvent = {
      ...event,
      ...eventData,
    };
    
    this.events.set(id, updatedEvent);
    return updatedEvent;
  }
  
  async deleteEvent(id: number): Promise<boolean> {
    return this.events.delete(id);
  }
  
  // Contact methods
  async getContacts(): Promise<Contact[]> {
    return Array.from(this.contacts.values());
  }
  
  async getContact(id: number): Promise<Contact | undefined> {
    return this.contacts.get(id);
  }
  
  async createContact(insertContact: InsertContact): Promise<Contact> {
    const id = this.contactCurrentId++;
    const contact: Contact = {
      ...insertContact,
      id,
      type: insertContact.type || "client",
      phone: insertContact.phone || null,
      createdAt: new Date()
    };
    this.contacts.set(id, contact);
    return contact;
  }
  

  
  async addContactToEvent(insertEventContact: InsertEventContact): Promise<EventContact> {
    const id = this.eventContactCurrentId++;
    const eventContact: EventContact = {
      id,
      eventId: insertEventContact.eventId,
      firstName: insertEventContact.firstName,
      lastName: insertEventContact.lastName,
      email: insertEventContact.email,
      phone: insertEventContact.phone || null,
      contactType: insertEventContact.contactType,
      role: insertEventContact.role,
      company: insertEventContact.company || null,
      website: insertEventContact.website || null
    };
    this.eventContacts.set(id, eventContact);
    return eventContact;
  }
  
  async getEventContacts(eventId: number): Promise<EventContact[]> {
    return Array.from(this.eventContacts.values())
      .filter(eventContact => eventContact.eventId === eventId)
      .map(contact => ({
        ...contact,
        company: contact.company || null,
        website: contact.website || null
      }));
  }
  
  async updateEventContact(id: number, contactData: Partial<InsertEventContact>): Promise<EventContact | undefined> {
    const existingContact = this.eventContacts.get(id);
    if (!existingContact) return undefined;
    
    const updatedContact: EventContact = {
      ...existingContact,
      ...contactData,
      id: existingContact.id,
      eventId: existingContact.eventId
    };
    
    this.eventContacts.set(id, updatedContact);
    return updatedContact;
  }
  
  // Sample data for testing
  private setupSampleData() {
    // Demo user
    const demoUser: InsertUser = {
      username: "demo",
      password: "$2b$10$mMxXxj7zWMxbJ6vO5M3K8OZWC5ydADYLYr1EiqiF9vVZkXj8ddFOe", // "password"
      fullName: "Demo User",
      email: "demo@eventflowz.com",
      role: "admin"
    };
    this.createUser(demoUser);
    
    // Sample events will be created via the API for demo purposes
  }
}

export class DatabaseStorage implements IStorage {
  public sessionStore: any;
  
  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
    
    // Initialize the database with a demo user if it doesn't exist
    this.ensureDemoUserExists();
  }
  
  private async ensureDemoUserExists() {
    try {
      // Check if demo user exists
      const existingUser = await this.getUserByUsername("demo");
      if (!existingUser) {
        // Create demo user if not exists
        await this.createUser({
          username: "demo",
          password: "$2b$10$zoO2mG/eQj1mJ6vk2AlEOOkafN0EK7wLF/PknZ6eW/WJtk3W43Ate", // "password"
          fullName: "Demo User",
          email: "demo@eventflowz.com",
          role: "admin"
        });
        console.log("Demo user created successfully");
      }
    } catch (error) {
      console.error("Error ensuring demo user exists:", error);
    }
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    console.log(`Looking up user by username: ${username}`);
    const result = await db.select().from(users).where(eq(users.username, username));
    console.log('Database query result:', result);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }
  
  // Event methods
  async getEvents(): Promise<Event[]> {
    const result = await db.select({
      id: events.id,
      name: events.name,
      date: events.date,
      venue: events.venue,
      eventType: events.eventType,
      services: events.services,
      startTime: events.startTime,
      endTime: events.endTime,
      guestCount: events.guestCount,
      minBudget: events.minBudget,
      maxBudget: events.maxBudget,
      status: events.status,
      referralSource: events.referralSource,
      additionalDetails: events.additionalDetails,
      musicPreferences: events.musicPreferences,
      createdAt: events.createdAt
    }).from(events);
    return result;
  }
  
  async getEvent(id: number): Promise<Event | undefined> {
    const result = await db.select({
      id: events.id,
      name: events.name,
      date: events.date,
      venue: events.venue,
      eventType: events.eventType,
      services: events.services,
      startTime: events.startTime,
      endTime: events.endTime,
      guestCount: events.guestCount,
      minBudget: events.minBudget,
      maxBudget: events.maxBudget,
      status: events.status,
      referralSource: events.referralSource,
      additionalDetails: events.additionalDetails,
      musicPreferences: events.musicPreferences,
      createdAt: events.createdAt
    }).from(events).where(eq(events.id, id));
    return result[0];
  }
  
  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const result = await db.insert(events).values({
      ...insertEvent,
      status: insertEvent.status || "inquiry",
      musicPreferences: insertEvent.musicPreferences || null,
      referralSource: insertEvent.referralSource || null,
      additionalDetails: insertEvent.additionalDetails || null,
    }).returning();
    return result[0];
  }
  
  async updateEvent(id: number, eventData: Partial<InsertEvent>): Promise<Event | undefined> {
    const result = await db.update(events)
      .set(eventData)
      .where(eq(events.id, id))
      .returning();
    return result[0];
  }
  
  async deleteEvent(id: number): Promise<boolean> {
    await db.delete(events).where(eq(events.id, id));
    return true;
  }
  
  // Contact methods
  async getContacts(): Promise<Contact[]> {
    return await db.select().from(contacts);
  }
  
  async getContact(id: number): Promise<Contact | undefined> {
    const result = await db.select().from(contacts).where(eq(contacts.id, id));
    return result[0];
  }
  
  async createContact(insertContact: InsertContact): Promise<Contact> {
    const result = await db.insert(contacts).values({
      ...insertContact,
      type: insertContact.type || "client",
      phone: insertContact.phone || null,
    }).returning();
    return result[0];
  }
  

  
  async addContactToEvent(insertEventContact: InsertEventContact): Promise<EventContact> {
    const result = await db.insert(eventContacts)
      .values(insertEventContact)
      .returning();
    return result[0];
  }
  
  async getEventContacts(eventId: number): Promise<EventContact[]> {
    const result = await db.select({
      id: eventContacts.id,
      eventId: eventContacts.eventId,
      firstName: eventContacts.firstName,
      lastName: eventContacts.lastName,
      email: eventContacts.email,
      phone: eventContacts.phone,
      contactType: eventContacts.contactType,
      role: eventContacts.role,
      company: eventContacts.company,
      website: eventContacts.website
    })
      .from(eventContacts)
      .where(eq(eventContacts.eventId, eventId));
    return result;
  }
  
  async updateEventContact(id: number, contactData: Partial<InsertEventContact>): Promise<EventContact | undefined> {
    const result = await db.update(eventContacts)
      .set(contactData)
      .where(eq(eventContacts.id, id))
      .returning();
    return result[0];
  }
}

// Replace MemStorage with DatabaseStorage for production use
export const storage = new DatabaseStorage();
