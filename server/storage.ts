import { users, sessions, neuralSignals, cursorPositions, targetEvents, type User, type InsertUser, type Session, type InsertSession, type NeuralSignal, type InsertNeuralSignal, type CursorPosition, type InsertCursorPosition, type TargetEvent, type InsertTargetEvent } from "@shared/schema";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Session management
  createSession(session: InsertSession): Promise<Session>;
  getSession(id: number): Promise<Session | undefined>;
  getSessionsByUserId(userId: number): Promise<Session[]>;
  updateSession(id: number, updates: Partial<Session>): Promise<Session | undefined>;
  
  // Neural signal data
  createNeuralSignal(signal: InsertNeuralSignal): Promise<NeuralSignal>;
  getNeuralSignalsBySession(sessionId: number): Promise<NeuralSignal[]>;
  
  // Cursor position data
  createCursorPosition(position: InsertCursorPosition): Promise<CursorPosition>;
  getCursorPositionsBySession(sessionId: number): Promise<CursorPosition[]>;
  
  // Target event data
  createTargetEvent(event: InsertTargetEvent): Promise<TargetEvent>;
  getTargetEventsBySession(sessionId: number): Promise<TargetEvent[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private sessions: Map<number, Session> = new Map();
  private neuralSignals: Map<number, NeuralSignal> = new Map();
  private cursorPositions: Map<number, CursorPosition> = new Map();
  private targetEvents: Map<number, TargetEvent> = new Map();
  
  private currentUserId = 1;
  private currentSessionId = 1;
  private currentNeuralSignalId = 1;
  private currentCursorPositionId = 1;
  private currentTargetEventId = 1;

  constructor() {
    // Create default user
    this.createUser({ username: "demo", password: "demo" });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = { ...insertUser, id: this.currentUserId++ };
    this.users.set(user.id, user);
    return user;
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    const session: Session = { 
      ...insertSession, 
      id: this.currentSessionId++,
      startTime: new Date(),
      endTime: null,
      duration: null,
      successRate: null,
      targetHits: 0,
      totalAttempts: 0,
    };
    this.sessions.set(session.id, session);
    return session;
  }

  async getSession(id: number): Promise<Session | undefined> {
    return this.sessions.get(id);
  }

  async getSessionsByUserId(userId: number): Promise<Session[]> {
    return Array.from(this.sessions.values()).filter(session => session.userId === userId);
  }

  async updateSession(id: number, updates: Partial<Session>): Promise<Session | undefined> {
    const session = this.sessions.get(id);
    if (!session) return undefined;
    
    const updatedSession = { ...session, ...updates };
    this.sessions.set(id, updatedSession);
    return updatedSession;
  }

  async createNeuralSignal(insertSignal: InsertNeuralSignal): Promise<NeuralSignal> {
    const signal: NeuralSignal = {
      ...insertSignal,
      id: this.currentNeuralSignalId++,
      timestamp: new Date(),
    };
    this.neuralSignals.set(signal.id, signal);
    return signal;
  }

  async getNeuralSignalsBySession(sessionId: number): Promise<NeuralSignal[]> {
    return Array.from(this.neuralSignals.values()).filter(signal => signal.sessionId === sessionId);
  }

  async createCursorPosition(insertPosition: InsertCursorPosition): Promise<CursorPosition> {
    const position: CursorPosition = {
      ...insertPosition,
      id: this.currentCursorPositionId++,
      timestamp: new Date(),
    };
    this.cursorPositions.set(position.id, position);
    return position;
  }

  async getCursorPositionsBySession(sessionId: number): Promise<CursorPosition[]> {
    return Array.from(this.cursorPositions.values()).filter(position => position.sessionId === sessionId);
  }

  async createTargetEvent(insertEvent: InsertTargetEvent): Promise<TargetEvent> {
    const event: TargetEvent = {
      ...insertEvent,
      id: this.currentTargetEventId++,
      timestamp: new Date(),
    };
    this.targetEvents.set(event.id, event);
    return event;
  }

  async getTargetEventsBySession(sessionId: number): Promise<TargetEvent[]> {
    return Array.from(this.targetEvents.values()).filter(event => event.sessionId === sessionId);
  }
}

export const storage = new MemStorage();
