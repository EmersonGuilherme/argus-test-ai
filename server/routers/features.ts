import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import {
  validationRules, validationResults,
  mcpServers, mcpScanResults,
  auditTrail,
  shadowAiFindings,
} from "../../drizzle/schema";
import { eq, desc, sql, count, and } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";
import { createHash } from "crypto";

// ============================================================
// VALIDATION ROUTER
// ============================================================
const validationRouter = router({
  rules: protectedProcedure.input(z.object({ projectId: z.number() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(validationRules)
      .where(eq(validationRules.projectId, input.projectId))
      .orderBy(desc(validationRules.createdAt));
  }),

  createRule: protectedProcedure.input(z.object({
    projectId: z.number(),
    name: z.string().min(1),
    description: z.string().optional(),
    type: z.enum(["range", "regex", "exact_match", "cross_reference", "format"]),
    config: z.any(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) return null;
    const [result] = await db.insert(validationRules).values({
      projectId: input.projectId,
      name: input.name,
      description: input.description || null,
      type: input.type,
      config: input.config,
    }).$returningId();
    return { id: result.id };
  }),

  toggleRule: protectedProcedure.input(z.object({
    id: z.number(),
    isActive: z.boolean(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) return { success: false };
    await db.update(validationRules).set({ isActive: input.isActive }).where(eq(validationRules.id, input.id));
    return { success: true };
  }),

  deleteRule: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) return { success: false };
    await db.delete(validationRules).where(eq(validationRules.id, input.id));
    return { success: true };
  }),

  results: protectedProcedure.input(z.object({
    projectId: z.number(),
    limit: z.number().optional().default(50),
  })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(validationResults)
      .where(eq(validationResults.projectId, input.projectId))
      .orderBy(desc(validationResults.createdAt))
      .limit(input.limit);
  }),

  stats: protectedProcedure.input(z.object({ projectId: z.number() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return { totalRules: 0, totalResults: 0, passRate: 0, blockRate: 0 };
    const rules = await db.select({ count: count() }).from(validationRules)
      .where(and(eq(validationRules.projectId, input.projectId), eq(validationRules.isActive, true)));
    const results = await db.select({ count: count() }).from(validationResults)
      .where(eq(validationResults.projectId, input.projectId));
    const passed = await db.select({ count: count() }).from(validationResults)
      .where(and(eq(validationResults.projectId, input.projectId), eq(validationResults.passed, true)));
    const totalResults = results[0]?.count || 0;
    const passedCount = passed[0]?.count || 0;
    const passRate = totalResults > 0 ? Math.round((passedCount / totalResults) * 100) : 0;
    return {
      totalRules: rules[0]?.count || 0,
      totalResults,
      passRate,
      blockRate: 100 - passRate,
    };
  }),

  execute: protectedProcedure.input(z.object({
    projectId: z.number(),
    ruleId: z.number(),
    value: z.string(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) return { passed: false, reason: "DB unavailable" };
    const [rule] = await db.select().from(validationRules).where(eq(validationRules.id, input.ruleId)).limit(1);
    if (!rule) return { passed: false, reason: "Rule not found" };

    const config = rule.config as any || {};
    let passed = false;
    let expectedValue = "";

    switch (rule.type) {
      case "range": {
        const num = parseFloat(input.value.replace(/[^\d.-]/g, ""));
        const min = config.min ?? -Infinity;
        const max = config.max ?? Infinity;
        passed = num >= min && num <= max;
        expectedValue = `${min} <= x <= ${max}`;
        break;
      }
      case "regex": {
        const regex = new RegExp(config.pattern || "");
        passed = regex.test(input.value);
        expectedValue = config.pattern || "";
        break;
      }
      case "exact_match": {
        passed = input.value === config.expected;
        expectedValue = config.expected || "";
        break;
      }
      case "format": {
        if (config.format === "DD/MM/YYYY") {
          passed = /^\d{2}\/\d{2}\/\d{4}$/.test(input.value);
        } else if (config.format === "JSON") {
          try { JSON.parse(input.value); passed = true; } catch { passed = false; }
        } else if (config.format === "no_pii") {
          const piiPatterns = [/\d{3}\.\d{3}\.\d{3}-\d{2}/, /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/, /\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}/];
          passed = !piiPatterns.some(p => p.test(input.value));
        }
        expectedValue = config.format || "";
        break;
      }
      case "cross_reference": {
        passed = input.value === config.reference;
        expectedValue = config.reference || "";
        break;
      }
    }

    await db.insert(validationResults).values({
      projectId: input.projectId,
      ruleId: input.ruleId,
      passed,
      actualValue: input.value,
      expectedValue,
      confidence: passed ? 1.0 : 0.0,
    });

    return { passed, expectedValue, actualValue: input.value };
  }),
});

// ============================================================
// MCP SECURITY ROUTER
// ============================================================
const mcpRouter = router({
  servers: protectedProcedure.input(z.object({ projectId: z.number() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(mcpServers)
      .where(eq(mcpServers.projectId, input.projectId))
      .orderBy(desc(mcpServers.createdAt));
  }),

  addServer: protectedProcedure.input(z.object({
    projectId: z.number(),
    name: z.string().min(1),
    url: z.string().min(1),
    protocol: z.string().optional(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) return null;
    const [result] = await db.insert(mcpServers).values({
      projectId: input.projectId,
      name: input.name,
      url: input.url,
      protocol: input.protocol || "stdio",
    }).$returningId();
    return { id: result.id };
  }),

  removeServer: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) return { success: false };
    await db.delete(mcpScanResults).where(eq(mcpScanResults.serverId, input.id));
    await db.delete(mcpServers).where(eq(mcpServers.id, input.id));
    return { success: true };
  }),

  scanResults: protectedProcedure.input(z.object({ serverId: z.number().optional(), projectId: z.number().optional() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];
    if (input.serverId) {
      return db.select().from(mcpScanResults).where(eq(mcpScanResults.serverId, input.serverId)).orderBy(desc(mcpScanResults.createdAt));
    }
    // Get all results for all servers in a project
    if (input.projectId) {
      const servers = await db.select().from(mcpServers).where(eq(mcpServers.projectId, input.projectId));
      if (servers.length === 0) return [];
      const serverIds = servers.map(s => s.id);
      return db.select().from(mcpScanResults)
        .where(sql`${mcpScanResults.serverId} IN (${sql.join(serverIds.map(id => sql`${id}`), sql`, `)})`)
        .orderBy(desc(mcpScanResults.createdAt));
    }
    return [];
  }),

  scan: protectedProcedure.input(z.object({
    serverId: z.number(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) return { findings: 0 };

    const [server] = await db.select().from(mcpServers).where(eq(mcpServers.id, input.serverId)).limit(1);
    if (!server) return { findings: 0 };

    // Use AI to simulate security scan
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are an MCP (Model Context Protocol) security scanner. Analyze the given MCP server and generate realistic security findings.
For each finding, provide:
- scanType: one of "tool_poisoning", "excessive_permissions", "data_exfiltration", "hidden_instructions", "privilege_escalation", "rug_pull"
- severity: one of "critical", "high", "medium", "low", "info"
- finding: description of the vulnerability
- recommendation: how to fix it

Generate 3-5 realistic findings based on common MCP security issues.`
        },
        {
          role: "user",
          content: `Scan MCP server: ${server.name} at ${server.url} (protocol: ${server.protocol})`
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "mcp_scan",
          strict: true,
          schema: {
            type: "object",
            properties: {
              findings: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    scanType: { type: "string", enum: ["tool_poisoning", "excessive_permissions", "data_exfiltration", "hidden_instructions", "privilege_escalation", "rug_pull"] },
                    severity: { type: "string", enum: ["critical", "high", "medium", "low", "info"] },
                    finding: { type: "string" },
                    recommendation: { type: "string" }
                  },
                  required: ["scanType", "severity", "finding", "recommendation"],
                  additionalProperties: false
                }
              }
            },
            required: ["findings"],
            additionalProperties: false
          }
        }
      }
    });

    const content = response.choices[0]?.message?.content;
    if (!content || typeof content !== "string") return { findings: 0 };
    const parsed = JSON.parse(content);

    // Save findings to database
    for (const f of parsed.findings || []) {
      await db.insert(mcpScanResults).values({
        serverId: input.serverId,
        scanType: f.scanType,
        severity: f.severity,
        finding: f.finding,
        recommendation: f.recommendation,
      });
    }

    // Update server last scan time
    await db.update(mcpServers).set({ lastScanAt: new Date() }).where(eq(mcpServers.id, input.serverId));

    return { findings: (parsed.findings || []).length };
  }),

  stats: protectedProcedure.input(z.object({ projectId: z.number() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return { totalServers: 0, totalFindings: 0, criticalFindings: 0, openFindings: 0 };
    const servers = await db.select({ count: count() }).from(mcpServers).where(eq(mcpServers.projectId, input.projectId));
    const serverList = await db.select().from(mcpServers).where(eq(mcpServers.projectId, input.projectId));
    if (serverList.length === 0) return { totalServers: servers[0]?.count || 0, totalFindings: 0, criticalFindings: 0, openFindings: 0 };
    const serverIds = serverList.map(s => s.id);
    const allFindings = await db.select().from(mcpScanResults)
      .where(sql`${mcpScanResults.serverId} IN (${sql.join(serverIds.map(id => sql`${id}`), sql`, `)})`);
    return {
      totalServers: servers[0]?.count || 0,
      totalFindings: allFindings.length,
      criticalFindings: allFindings.filter(f => f.severity === "critical" || f.severity === "high").length,
      openFindings: allFindings.filter(f => f.status === "open").length,
    };
  }),
});

// ============================================================
// AUDIT TRAIL ROUTER
// ============================================================
const auditRouter = router({
  list: protectedProcedure.input(z.object({
    projectId: z.number().optional(),
    limit: z.number().optional().default(50),
  })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];
    const query = input.projectId
      ? db.select().from(auditTrail).where(eq(auditTrail.projectId, input.projectId))
      : db.select().from(auditTrail);
    return query.orderBy(desc(auditTrail.createdAt)).limit(input.limit);
  }),

  record: protectedProcedure.input(z.object({
    projectId: z.number().optional(),
    action: z.string(),
    resource: z.string().optional(),
    details: z.any().optional(),
  })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) return null;

    // Get the last entry's hash for chaining
    const [lastEntry] = await db.select().from(auditTrail).orderBy(desc(auditTrail.id)).limit(1);
    const previousHash = lastEntry?.hash || "genesis";

    // Create hash for this entry
    const payload = JSON.stringify({
      previousHash,
      action: input.action,
      resource: input.resource,
      details: input.details,
      userId: ctx.user.id,
      timestamp: new Date().toISOString(),
    });
    const hash = createHash("sha256").update(payload).digest("hex");

    const [result] = await db.insert(auditTrail).values({
      projectId: input.projectId,
      userId: ctx.user.id,
      action: input.action,
      resource: input.resource || null,
      details: input.details,
      previousHash,
      hash,
    }).$returningId();

    return { id: result.id, hash };
  }),

  verifyIntegrity: protectedProcedure.input(z.object({
    projectId: z.number().optional(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) return { valid: false, error: "DB unavailable" };

    const entries = input.projectId
      ? await db.select().from(auditTrail).where(eq(auditTrail.projectId, input.projectId)).orderBy(auditTrail.id)
      : await db.select().from(auditTrail).orderBy(auditTrail.id);

    if (entries.length === 0) return { valid: true, totalEntries: 0, verifiedEntries: 0 };

    let valid = true;
    let brokenAt = -1;

    for (let i = 1; i < entries.length; i++) {
      if (entries[i].previousHash !== entries[i - 1].hash) {
        valid = false;
        brokenAt = i;
        break;
      }
    }

    return {
      valid,
      totalEntries: entries.length,
      verifiedEntries: valid ? entries.length : brokenAt,
      brokenAt: valid ? undefined : brokenAt,
    };
  }),

  stats: protectedProcedure.input(z.object({ projectId: z.number().optional() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return { totalEntries: 0, todayEntries: 0, uniqueActions: 0 };
    const all = input.projectId
      ? await db.select().from(auditTrail).where(eq(auditTrail.projectId, input.projectId))
      : await db.select().from(auditTrail);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEntries = all.filter(e => e.createdAt && new Date(e.createdAt) >= today).length;
    const uniqueActions = new Set(all.map(e => e.action)).size;
    return { totalEntries: all.length, todayEntries, uniqueActions };
  }),
});

// ============================================================
// SHADOW AI ROUTER
// ============================================================
const shadowRouter = router({
  findings: protectedProcedure.input(z.object({ projectId: z.number() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(shadowAiFindings)
      .where(eq(shadowAiFindings.projectId, input.projectId))
      .orderBy(desc(shadowAiFindings.createdAt));
  }),

  scan: protectedProcedure.input(z.object({
    projectId: z.number(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) return { findings: 0 };

    // Use AI to generate realistic shadow AI findings
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are a Shadow AI detection system. Simulate a network traffic analysis and generate findings of unauthorized AI tool usage in an enterprise environment.
For each finding, provide:
- toolName: name of the unauthorized AI tool detected
- category: one of "chatbot", "code_assistant", "image_gen", "api_call", "browser_extension", "other"
- riskLevel: one of "critical", "high", "medium", "low"
- department: which department is using it
- usersAffected: number of users (1-50)
- dataExposure: what type of data might be exposed

Generate 5-8 realistic findings based on common shadow AI patterns in Brazilian enterprises.`
        },
        {
          role: "user",
          content: "Run shadow AI detection scan on enterprise network traffic."
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "shadow_ai_scan",
          strict: true,
          schema: {
            type: "object",
            properties: {
              findings: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    toolName: { type: "string" },
                    category: { type: "string", enum: ["chatbot", "code_assistant", "image_gen", "api_call", "browser_extension", "other"] },
                    riskLevel: { type: "string", enum: ["critical", "high", "medium", "low"] },
                    department: { type: "string" },
                    usersAffected: { type: "number" },
                    dataExposure: { type: "string" }
                  },
                  required: ["toolName", "category", "riskLevel", "department", "usersAffected", "dataExposure"],
                  additionalProperties: false
                }
              }
            },
            required: ["findings"],
            additionalProperties: false
          }
        }
      }
    });

    const content = response.choices[0]?.message?.content;
    if (!content || typeof content !== "string") return { findings: 0 };
    const parsed = JSON.parse(content);

    // Save findings to database
    for (const f of parsed.findings || []) {
      await db.insert(shadowAiFindings).values({
        projectId: input.projectId,
        toolName: f.toolName,
        category: f.category,
        riskLevel: f.riskLevel,
        department: f.department,
        usersAffected: f.usersAffected,
        dataExposure: f.dataExposure,
      });
    }

    return { findings: (parsed.findings || []).length };
  }),

  updateStatus: protectedProcedure.input(z.object({
    id: z.number(),
    status: z.enum(["active", "mitigated", "accepted"]),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) return { success: false };
    await db.update(shadowAiFindings).set({ status: input.status }).where(eq(shadowAiFindings.id, input.id));
    return { success: true };
  }),

  stats: protectedProcedure.input(z.object({ projectId: z.number() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return { totalFindings: 0, criticalFindings: 0, activeFindings: 0, departments: 0, usersAtRisk: 0 };
    const all = await db.select().from(shadowAiFindings).where(eq(shadowAiFindings.projectId, input.projectId));
    return {
      totalFindings: all.length,
      criticalFindings: all.filter(f => f.riskLevel === "critical" || f.riskLevel === "high").length,
      activeFindings: all.filter(f => f.status === "active").length,
      departments: new Set(all.map(f => f.department)).size,
      usersAtRisk: all.reduce((sum, f) => sum + (f.usersAffected || 0), 0),
    };
  }),
});

// ============================================================
// EXPORT COMBINED ROUTER
// ============================================================
export const featuresRouter = router({
  validation: validationRouter,
  mcp: mcpRouter,
  audit: auditRouter,
  shadow: shadowRouter,
});
