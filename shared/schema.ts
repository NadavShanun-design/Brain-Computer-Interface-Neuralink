import { pgTable, text, serial, integer, real, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  startTime: timestamp("start_time").defaultNow(),
  endTime: timestamp("end_time"),
  mode: text("mode").notNull(), // 'training', 'calibration', 'free-control'
  duration: integer("duration"), // in seconds
  successRate: real("success_rate"),
  targetHits: integer("target_hits").default(0),
  totalAttempts: integer("total_attempts").default(0),
});

export const neuralSignals = pgTable("neural_signals", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => sessions.id),
  timestamp: timestamp("timestamp").defaultNow(),
  c3Power: real("c3_power"), // Left motor cortex
  c4Power: real("c4_power"), // Right motor cortex
  alphaPower: real("alpha_power"), // 8-12 Hz
  betaPower: real("beta_power"), // 13-30 Hz
  gammaPower: real("gamma_power"), // 30-100 Hz
  thetaPower: real("theta_power"), // 4-8 Hz
  classification: text("classification"), // 'left', 'right', 'rest'
  confidence: real("confidence"),
});

export const cursorPositions = pgTable("cursor_positions", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => sessions.id),
  timestamp: timestamp("timestamp").defaultNow(),
  x: real("x").notNull(),
  y: real("y").notNull(),
  targetDistance: real("target_distance"),
  activeTarget: text("active_target"),
});

export const targetEvents = pgTable("target_events", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => sessions.id),
  timestamp: timestamp("timestamp").defaultNow(),
  targetId: text("target_id").notNull(),
  eventType: text("event_type").notNull(), // 'hit', 'miss', 'timeout'
  responseTime: real("response_time"), // in milliseconds
  accuracy: real("accuracy"),
});

// Insert schemas
export const insertSessionSchema = createInsertSchema(sessions).omit({ id: true });
export const insertNeuralSignalSchema = createInsertSchema(neuralSignals).omit({ id: true });
export const insertCursorPositionSchema = createInsertSchema(cursorPositions).omit({ id: true });
export const insertTargetEventSchema = createInsertSchema(targetEvents).omit({ id: true });

// Types
export type Session = typeof sessions.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type NeuralSignal = typeof neuralSignals.$inferSelect;
export type InsertNeuralSignal = z.infer<typeof insertNeuralSignalSchema>;
export type CursorPosition = typeof cursorPositions.$inferSelect;
export type InsertCursorPosition = z.infer<typeof insertCursorPositionSchema>;
export type TargetEvent = typeof targetEvents.$inferSelect;
export type InsertTargetEvent = z.infer<typeof insertTargetEventSchema>;

// Real-time data types
export const realtimeNeuralDataSchema = z.object({
  c3Power: z.number(),
  c4Power: z.number(),
  alphaPower: z.number(),
  betaPower: z.number(),
  gammaPower: z.number(),
  thetaPower: z.number(),
  classification: z.enum(['left', 'right', 'rest']),
  confidence: z.number(),
  timestamp: z.number(),
});

export const cursorUpdateSchema = z.object({
  x: z.number(),
  y: z.number(),
  targetDistance: z.number().optional(),
  activeTarget: z.string().optional(),
  timestamp: z.number(),
});

export const targetInteractionSchema = z.object({
  targetId: z.string(),
  eventType: z.enum(['hit', 'miss', 'timeout']),
  responseTime: z.number(),
  accuracy: z.number(),
  timestamp: z.number(),
});

export type RealtimeNeuralData = z.infer<typeof realtimeNeuralDataSchema>;
export type CursorUpdate = z.infer<typeof cursorUpdateSchema>;
export type TargetInteraction = z.infer<typeof targetInteractionSchema>;
