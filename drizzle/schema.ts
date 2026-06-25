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

/**
 * Autonomous Test Runs — scheduled/on-demand AI-driven test sessions
 */
export const testRuns = mysqlTable("test_runs", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  type: mysqlEnum("type", ["red_team", "regression", "fuzzing", "generated", "compliance"]).notNull(),
  status: mysqlEnum("status", ["pending", "running", "completed", "failed"]).default("pending").notNull(),
  totalCases: int("totalCases").default(0),
  passedCases: int("passedCases").default(0),
  failedCases: int("failedCases").default(0),
  score: float("score"),
  summary: text("summary"),
  aiAnalysis: text("aiAnalysis"),
  config: json("config"),
  triggeredBy: mysqlEnum("triggeredBy", ["manual", "scheduled", "ci_cd"]).default("manual").notNull(),
  scheduleCronTaskUid: varchar("scheduleCronTaskUid", { length: 65 }),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * Test Cases — individual test cases within a run
 */
export const testCases = mysqlTable("test_cases", {
  id: int("id").autoincrement().primaryKey(),
  runId: int("runId").notNull(),
  category: varchar("category", { length: 128 }).notNull(),
  input: text("input").notNull(),
  expectedBehavior: text("expectedBehavior"),
  actualOutput: text("actualOutput"),
  status: mysqlEnum("status", ["passed", "failed", "error", "skipped"]).default("skipped").notNull(),
  severity: mysqlEnum("severity", ["critical", "high", "medium", "low"]).default("medium").notNull(),
  score: float("score"),
  reasoning: text("reasoning"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * Organizations — multi-tenancy
 */
export const organizations = mysqlTable("organizations", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  ownerId: int("ownerId").notNull(),
  plan: mysqlEnum("plan", ["free", "pro", "enterprise"]).default("free").notNull(),
  maxMembers: int("maxMembers").default(5),
  settings: json("settings"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * Organization Members
 */
export const orgMembers = mysqlTable("org_members", {
  id: int("id").autoincrement().primaryKey(),
  orgId: int("orgId").notNull(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", ["owner", "admin", "editor", "viewer"]).default("viewer").notNull(),
  invitedBy: int("invitedBy"),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
});

/**
 * Webhooks — notification endpoints
 */
export const webhooks = mysqlTable("webhooks", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  url: text("url").notNull(),
  type: mysqlEnum("type", ["slack", "discord", "email", "custom"]).notNull(),
  events: json("events"), // array of event types to listen for
  isActive: boolean("isActive").default(true).notNull(),
  secret: varchar("secret", { length: 255 }),
  lastTriggeredAt: timestamp("lastTriggeredAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * LGPD/Privacy — data retention policies
 */
export const dataRetentionPolicies = mysqlTable("data_retention_policies", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  dataType: mysqlEnum("dataType", ["traces", "evaluations", "security_tests", "test_runs", "all"]).notNull(),
  retentionDays: int("retentionDays").notNull().default(90),
  autoDelete: boolean("autoDelete").default(false).notNull(),
  anonymizeOnExpiry: boolean("anonymizeOnExpiry").default(true).notNull(),
  lastCleanupAt: timestamp("lastCleanupAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * LGPD/Privacy — consent log
 */
export const consentLog = mysqlTable("consent_log", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  projectId: int("projectId"),
  purpose: varchar("purpose", { length: 255 }).notNull(),
  legalBasis: mysqlEnum("legalBasis", ["consent", "legitimate_interest", "contract", "legal_obligation", "vital_interest", "public_interest"]).notNull(),
  granted: boolean("granted").default(true).notNull(),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  revokedAt: timestamp("revokedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * PII Masking Rules — configurable per project
 */
export const piiMaskingRules = mysqlTable("pii_masking_rules", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  fieldPattern: varchar("fieldPattern", { length: 255 }).notNull(),
  maskType: mysqlEnum("maskType", ["full", "partial", "hash", "tokenize"]).default("full").notNull(),
  dataCategory: mysqlEnum("dataCategory", ["cpf", "email", "phone", "credit_card", "name", "address", "custom"]).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * Validation Rules — deterministic value checking
 */
export const validationRules = mysqlTable("validation_rules", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  type: mysqlEnum("type", ["range", "regex", "exact_match", "cross_reference", "format"]).notNull(),
  config: json("config"), // { min, max, pattern, reference, format }
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * Validation Results — outcomes of deterministic checks
 */
export const validationResults = mysqlTable("validation_results", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  ruleId: int("ruleId").notNull(),
  traceId: int("traceId"),
  passed: boolean("passed").default(false).notNull(),
  actualValue: text("actualValue"),
  expectedValue: text("expectedValue"),
  confidence: float("confidence"),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * MCP Servers — registered Model Context Protocol servers
 */
export const mcpServers = mysqlTable("mcp_servers", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  url: text("url").notNull(),
  protocol: varchar("protocol", { length: 64 }).default("stdio").notNull(),
  status: mysqlEnum("status", ["active", "inactive", "error"]).default("active").notNull(),
  lastScanAt: timestamp("lastScanAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * MCP Scan Results — security scan findings for MCP servers
 */
export const mcpScanResults = mysqlTable("mcp_scan_results", {
  id: int("id").autoincrement().primaryKey(),
  serverId: int("serverId").notNull(),
  scanType: mysqlEnum("scanType", ["tool_poisoning", "excessive_permissions", "data_exfiltration", "hidden_instructions", "privilege_escalation", "rug_pull"]).notNull(),
  severity: mysqlEnum("severity", ["critical", "high", "medium", "low", "info"]).default("medium").notNull(),
  finding: text("finding"),
  recommendation: text("recommendation"),
  status: mysqlEnum("status", ["open", "resolved", "accepted"]).default("open").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * Audit Trail — immutable hash-chain log
 */
export const auditTrail = mysqlTable("audit_trail", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId"),
  userId: int("userId"),
  action: varchar("action", { length: 255 }).notNull(),
  resource: varchar("resource", { length: 255 }),
  details: json("details"),
  previousHash: varchar("previousHash", { length: 64 }),
  hash: varchar("hash", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * Shadow AI Findings — unauthorized AI usage detection
 */
export const shadowAiFindings = mysqlTable("shadow_ai_findings", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  toolName: varchar("toolName", { length: 255 }).notNull(),
  category: mysqlEnum("category", ["chatbot", "code_assistant", "image_gen", "api_call", "browser_extension", "other"]).notNull(),
  riskLevel: mysqlEnum("riskLevel", ["critical", "high", "medium", "low"]).default("medium").notNull(),
  department: varchar("department", { length: 128 }),
  usersAffected: int("usersAffected").default(1),
  dataExposure: text("dataExposure"),
  detectedAt: timestamp("detectedAt").defaultNow().notNull(),
  status: mysqlEnum("status", ["active", "mitigated", "accepted"]).default("active").notNull(),
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
export type TestRun = typeof testRuns.$inferSelect;
export type TestCase = typeof testCases.$inferSelect;
export type Organization = typeof organizations.$inferSelect;
export type OrgMember = typeof orgMembers.$inferSelect;
export type Webhook = typeof webhooks.$inferSelect;
export type DataRetentionPolicy = typeof dataRetentionPolicies.$inferSelect;
export type ConsentLogEntry = typeof consentLog.$inferSelect;
export type PiiMaskingRule = typeof piiMaskingRules.$inferSelect;
export type ValidationRule = typeof validationRules.$inferSelect;
export type ValidationResult = typeof validationResults.$inferSelect;
export type McpServer = typeof mcpServers.$inferSelect;
export type McpScanResult = typeof mcpScanResults.$inferSelect;
export type AuditTrailEntry = typeof auditTrail.$inferSelect;
export type ShadowAiFinding = typeof shadowAiFindings.$inferSelect;
