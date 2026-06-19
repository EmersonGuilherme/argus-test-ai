import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, float, bigint, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

/**
 * Projects — each client/environment has a project
 */
export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  environment: mysqlEnum("environment", ["development", "staging", "production"]).default("development").notNull(),
  status: mysqlEnum("status", ["active", "paused", "archived"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * API Keys — for SDK authentication
 */
export const apiKeys = mysqlTable("api_keys", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  keyHash: varchar("keyHash", { length: 128 }).notNull(),
  keyPrefix: varchar("keyPrefix", { length: 12 }).notNull(),
  lastUsedAt: timestamp("lastUsedAt"),
  expiresAt: timestamp("expiresAt"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * Traces — distributed trace records
 */
export const traces = mysqlTable("traces", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  traceId: varchar("traceId", { length: 64 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["success", "failed", "running", "timeout"]).default("running").notNull(),
  totalDuration: int("totalDuration"), // ms
  totalSteps: int("totalSteps").default(0),
  failedStep: varchar("failedStep", { length: 255 }),
  failedField: varchar("failedField", { length: 255 }),
  rootCause: mysqlEnum("rootCause", ["ai", "code", "infrastructure", "unknown"]).default("unknown"),
  rootCauseDetail: text("rootCauseDetail"),
  financialImpact: float("financialImpact"),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * Trace Steps — individual steps within a trace
 */
export const traceSteps = mysqlTable("trace_steps", {
  id: int("id").autoincrement().primaryKey(),
  traceId: int("traceId").notNull(),
  stepOrder: int("stepOrder").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  serviceType: mysqlEnum("serviceType", ["api_gateway", "lambda", "agent_ai", "kafka", "database", "external_api", "queue", "cache", "mainframe"]).notNull(),
  status: mysqlEnum("status", ["success", "failed", "warning"]).default("success").notNull(),
  duration: int("duration"), // ms
  inputData: json("inputData"),
  outputData: json("outputData"),
  errorMessage: text("errorMessage"),
  errorField: varchar("errorField", { length: 255 }),
  prompt: text("prompt"),
  llmResponse: text("llmResponse"),
  model: varchar("model", { length: 128 }),
  tokensUsed: int("tokensUsed"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * Evaluations — LLM-as-Judge quality assessments
 */
export const evaluations = mysqlTable("evaluations", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  traceId: int("traceId"),
  model: varchar("model", { length: 128 }).notNull(),
  prompt: text("prompt").notNull(),
  response: text("response").notNull(),
  hallucination: float("hallucination"), // 0-1
  relevance: float("relevance"), // 0-1
  faithfulness: float("faithfulness"), // 0-1
  toxicity: float("toxicity"), // 0-1
  overallScore: float("overallScore"), // 0-100
  latency: int("latency"), // ms
  costPerToken: float("costPerToken"),
  totalTokens: int("totalTokens"),
  totalCost: float("totalCost"),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * Security Tests — red-teaming results
 */
export const securityTests = mysqlTable("security_tests", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  testType: mysqlEnum("testType", ["prompt_injection", "data_leakage", "jailbreak", "validation_bypass", "pii_exposure", "model_extraction"]).notNull(),
  severity: mysqlEnum("severity", ["critical", "high", "medium", "low", "info"]).default("medium").notNull(),
  status: mysqlEnum("status", ["vulnerable", "safe", "partial"]).default("safe").notNull(),
  attackPayload: text("attackPayload"),
  response: text("response"),
  description: text("description"),
  suggestion: text("suggestion"),
  suggestedPrompt: text("suggestedPrompt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * Alerts — predictive alerts and notifications
 */
export const alerts = mysqlTable("alerts", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  type: mysqlEnum("type", ["threshold_breach", "model_drift", "cost_spike", "security_threat", "performance_degradation"]).notNull(),
  severity: mysqlEnum("severity", ["critical", "high", "medium", "low"]).default("medium").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  metric: varchar("metric", { length: 128 }),
  currentValue: float("currentValue"),
  thresholdValue: float("thresholdValue"),
  isResolved: boolean("isResolved").default(false).notNull(),
  resolvedAt: timestamp("resolvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * Prompt Suggestions — auto-generated prompt improvements
 */
export const promptSuggestions = mysqlTable("prompt_suggestions", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  evaluationId: int("evaluationId"),
  currentPrompt: text("currentPrompt").notNull(),
  suggestedPrompt: text("suggestedPrompt").notNull(),
  improvementReason: text("improvementReason"),
  estimatedImpact: float("estimatedImpact"), // percentage improvement
  status: mysqlEnum("status", ["pending", "applied", "rejected"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * Integrations — external service connections
 */
export const integrations = mysqlTable("integrations", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  type: mysqlEnum("type", ["github", "datadog", "kafka", "aws", "slack", "langfuse", "langsmith"]).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  config: json("config"),
  isActive: boolean("isActive").default(true).notNull(),
  lastSyncAt: timestamp("lastSyncAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;
export type Trace = typeof traces.$inferSelect;
export type TraceStep = typeof traceSteps.$inferSelect;
export type Evaluation = typeof evaluations.$inferSelect;
export type SecurityTest = typeof securityTests.$inferSelect;
export type Alert = typeof alerts.$inferSelect;
export type PromptSuggestion = typeof promptSuggestions.$inferSelect;
export type Integration = typeof integrations.$inferSelect;
export type ApiKey = typeof apiKeys.$inferSelect;
