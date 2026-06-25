import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { testRuns, testCases, webhooks, organizations, orgMembers, dataRetentionPolicies, consentLog, piiMaskingRules } from "../../drizzle/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { runAutonomousTests, maskPII, classifySeverity, generateComplianceReport, analyzePatterns } from "../autonomous-engine";

export const autonomousRouter = router({
  // ============ TEST RUNS ============
  runs: router({
    list: protectedProcedure.input(z.object({
      projectId: z.number(),
      limit: z.number().optional().default(20),
    })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(testRuns)
        .where(eq(testRuns.projectId, input.projectId))
        .orderBy(desc(testRuns.createdAt))
        .limit(input.limit);
    }),

    get: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const [run] = await db.select().from(testRuns).where(eq(testRuns.id, input.id)).limit(1);
      if (!run) return null;
      const cases = await db.select().from(testCases).where(eq(testCases.runId, run.id)).orderBy(desc(testCases.createdAt));
      return { ...run, cases };
    }),

    start: protectedProcedure.input(z.object({
      projectId: z.number(),
      type: z.enum(["red_team", "regression", "fuzzing", "generated", "compliance"]),
      targetPrompt: z.string().optional(),
      targetModel: z.string().optional(),
      customInstructions: z.string().optional(),
    })).mutation(async ({ input }) => {
      const runId = await runAutonomousTests({
        projectId: input.projectId,
        type: input.type,
        targetPrompt: input.targetPrompt,
        targetModel: input.targetModel,
        customInstructions: input.customInstructions,
      });
      return { runId };
    }),

    stats: protectedProcedure.input(z.object({ projectId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { totalRuns: 0, avgScore: 0, totalCases: 0, passRate: 0 };
      const runs = await db.select().from(testRuns).where(eq(testRuns.projectId, input.projectId));
      const totalRuns = runs.length;
      const completedRuns = runs.filter(r => r.status === "completed");
      const avgScore = completedRuns.length > 0
        ? completedRuns.reduce((sum, r) => sum + (r.score || 0), 0) / completedRuns.length
        : 0;
      const totalCases = completedRuns.reduce((sum, r) => sum + (r.totalCases || 0), 0);
      const passedCases = completedRuns.reduce((sum, r) => sum + (r.passedCases || 0), 0);
      const passRate = totalCases > 0 ? (passedCases / totalCases) * 100 : 0;
      return { totalRuns, avgScore, totalCases, passRate };
    }),
  }),

  // ============ AI ANALYSIS ============
  ai: router({
    complianceReport: protectedProcedure.input(z.object({ projectId: z.number() })).mutation(async ({ input }) => {
      const report = await generateComplianceReport(input.projectId);
      return { report };
    }),

    patternAnalysis: protectedProcedure.input(z.object({ projectId: z.number() })).mutation(async ({ input }) => {
      const analysis = await analyzePatterns(input.projectId);
      return { analysis };
    }),

    classifySeverity: protectedProcedure.input(z.object({
      description: z.string(),
      context: z.string(),
    })).mutation(async ({ input }) => {
      return classifySeverity(input);
    }),

    maskPii: protectedProcedure.input(z.object({ text: z.string() })).mutation(async ({ input }) => {
      return maskPII(input.text);
    }),
  }),

  // ============ WEBHOOKS ============
  webhooks: router({
    list: protectedProcedure.input(z.object({ projectId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(webhooks).where(eq(webhooks.projectId, input.projectId)).orderBy(desc(webhooks.createdAt));
    }),

    create: protectedProcedure.input(z.object({
      projectId: z.number(),
      name: z.string().min(1),
      url: z.string().url(),
      type: z.enum(["slack", "discord", "email", "custom"]),
      events: z.array(z.string()),
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      // Generate webhook secret
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let secret = 'whsec_';
      for (let i = 0; i < 32; i++) secret += chars.charAt(Math.floor(Math.random() * chars.length));

      const [result] = await db.insert(webhooks).values({
        projectId: input.projectId,
        name: input.name,
        url: input.url,
        type: input.type,
        events: input.events,
        secret,
      }).$returningId();
      return { id: result.id, secret };
    }),

    toggle: protectedProcedure.input(z.object({ id: z.number(), isActive: z.boolean() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      await db.update(webhooks).set({ isActive: input.isActive }).where(eq(webhooks.id, input.id));
      return { success: true };
    }),

    remove: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      await db.delete(webhooks).where(eq(webhooks.id, input.id));
      return { success: true };
    }),

    test: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false, error: "DB unavailable" };
      const [webhook] = await db.select().from(webhooks).where(eq(webhooks.id, input.id)).limit(1);
      if (!webhook) return { success: false, error: "Webhook not found" };

      try {
        const response = await fetch(webhook.url, {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Webhook-Secret": webhook.secret || "" },
          body: JSON.stringify({
            event: "test",
            timestamp: new Date().toISOString(),
            data: { message: "Argus Test AI webhook test" }
          }),
        });
        await db.update(webhooks).set({ lastTriggeredAt: new Date() }).where(eq(webhooks.id, input.id));
        return { success: response.ok, statusCode: response.status };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
      }
    }),
  }),

  // ============ ORGANIZATIONS ============
  orgs: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];
      const memberships = await db.select().from(orgMembers).where(eq(orgMembers.userId, ctx.user.id));
      if (memberships.length === 0) return [];
      const orgIds = memberships.map(m => m.orgId);
      return db.select().from(organizations).where(sql`${organizations.id} IN (${sql.join(orgIds.map(id => sql`${id}`), sql`, `)})`);
    }),

    create: protectedProcedure.input(z.object({
      name: z.string().min(2),
      slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
    })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return null;
      const [org] = await db.insert(organizations).values({
        name: input.name,
        slug: input.slug,
        ownerId: ctx.user.id,
      }).$returningId();
      // Add creator as owner
      await db.insert(orgMembers).values({
        orgId: org.id,
        userId: ctx.user.id,
        role: "owner",
      });
      return { id: org.id };
    }),

    members: protectedProcedure.input(z.object({ orgId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(orgMembers).where(eq(orgMembers.orgId, input.orgId));
    }),

    invite: protectedProcedure.input(z.object({
      orgId: z.number(),
      userId: z.number(),
      role: z.enum(["admin", "editor", "viewer"]),
    })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return { success: false };
      await db.insert(orgMembers).values({
        orgId: input.orgId,
        userId: input.userId,
        role: input.role,
        invitedBy: ctx.user.id,
      });
      return { success: true };
    }),
  }),

  // ============ LGPD / PRIVACY ============
  privacy: router({
    retentionPolicies: protectedProcedure.input(z.object({ projectId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(dataRetentionPolicies).where(eq(dataRetentionPolicies.projectId, input.projectId));
    }),

    createRetentionPolicy: protectedProcedure.input(z.object({
      projectId: z.number(),
      dataType: z.enum(["traces", "evaluations", "security_tests", "test_runs", "all"]),
      retentionDays: z.number().min(7).max(365),
      autoDelete: z.boolean(),
      anonymizeOnExpiry: z.boolean(),
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const [result] = await db.insert(dataRetentionPolicies).values(input).$returningId();
      return { id: result.id };
    }),

    maskingRules: protectedProcedure.input(z.object({ projectId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(piiMaskingRules).where(eq(piiMaskingRules.projectId, input.projectId));
    }),

    createMaskingRule: protectedProcedure.input(z.object({
      projectId: z.number(),
      fieldPattern: z.string().min(1),
      maskType: z.enum(["full", "partial", "hash", "tokenize"]),
      dataCategory: z.enum(["cpf", "email", "phone", "credit_card", "name", "address", "custom"]),
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const [result] = await db.insert(piiMaskingRules).values(input).$returningId();
      return { id: result.id };
    }),

    consentLog: protectedProcedure.input(z.object({ projectId: z.number().optional() })).query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(consentLog)
        .where(eq(consentLog.userId, ctx.user.id))
        .orderBy(desc(consentLog.createdAt))
        .limit(50);
    }),

    recordConsent: protectedProcedure.input(z.object({
      projectId: z.number().optional(),
      purpose: z.string(),
      legalBasis: z.enum(["consent", "legitimate_interest", "contract", "legal_obligation", "vital_interest", "public_interest"]),
      granted: z.boolean(),
    })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return null;
      const [result] = await db.insert(consentLog).values({
        userId: ctx.user.id,
        projectId: input.projectId,
        purpose: input.purpose,
        legalBasis: input.legalBasis,
        granted: input.granted,
      }).$returningId();
      return { id: result.id };
    }),

    dpiaReport: protectedProcedure.input(z.object({ projectId: z.number() })).mutation(async ({ input }) => {
      const report = await generateComplianceReport(input.projectId);
      return { report };
    }),
  }),
});
