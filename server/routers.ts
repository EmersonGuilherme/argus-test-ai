import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { seedDemoData } from "./seed";
import { projects, traces, traceSteps, evaluations, securityTests, alerts, promptSuggestions, integrations, apiKeys } from "../drizzle/schema";
import { eq, desc, sql, and, count } from "drizzle-orm";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // Dashboard metrics
  dashboard: router({
    metrics: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return null;

      const [totalTraces] = await db.select({ count: count() }).from(traces);
      const [failedTraces] = await db.select({ count: count() }).from(traces).where(eq(traces.status, "failed"));
      const [aiCaused] = await db.select({ count: count() }).from(traces).where(eq(traces.rootCause, "ai"));
      const [codeCaused] = await db.select({ count: count() }).from(traces).where(eq(traces.rootCause, "code"));
      const [infraCaused] = await db.select({ count: count() }).from(traces).where(eq(traces.rootCause, "infrastructure"));

      const [tokenCost] = await db.select({
        total: sql<number>`COALESCE(SUM(totalCost), 0)`
      }).from(evaluations);

      const [financialImpact] = await db.select({
        total: sql<number>`COALESCE(SUM(financialImpact), 0)`
      }).from(traces).where(eq(traces.status, "failed"));

      const recentTraces = await db.select().from(traces).orderBy(desc(traces.createdAt)).limit(20);

      return {
        totalTests: totalTraces.count,
        failedTests: failedTraces.count,
        failureRate: totalTraces.count > 0 ? (failedTraces.count / totalTraces.count) * 100 : 0,
        rootCauses: {
          ai: aiCaused.count,
          code: codeCaused.count,
          infrastructure: infraCaused.count,
        },
        tokenCost: tokenCost.total,
        financialImpact: financialImpact.total,
        recentTraces,
      };
    }),
  }),

  // Traces
  traces: router({
    list: protectedProcedure.input(z.object({
      status: z.enum(["success", "failed", "running", "timeout"]).optional(),
      limit: z.number().min(1).max(100).default(50),
    }).optional()).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const filters = input?.status ? eq(traces.status, input.status) : undefined;
      return db.select().from(traces).where(filters).orderBy(desc(traces.createdAt)).limit(input?.limit ?? 50);
    }),

    detail: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const [trace] = await db.select().from(traces).where(eq(traces.id, input.id)).limit(1);
      if (!trace) return null;
      const steps = await db.select().from(traceSteps).where(eq(traceSteps.traceId, trace.id)).orderBy(traceSteps.stepOrder);
      return { ...trace, steps };
    }),
  }),

  // Evaluations
  evaluations: router({
    list: protectedProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(evaluations).orderBy(desc(evaluations.createdAt)).limit(50);
    }),

    byModel: protectedProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return db.select({
        model: evaluations.model,
        avgScore: sql<number>`AVG(overallScore)`,
        avgHallucination: sql<number>`AVG(hallucination)`,
        avgRelevance: sql<number>`AVG(relevance)`,
        avgFaithfulness: sql<number>`AVG(faithfulness)`,
        avgLatency: sql<number>`AVG(latency)`,
        avgCost: sql<number>`AVG(totalCost)`,
        totalEvals: count(),
      }).from(evaluations).groupBy(evaluations.model);
    }),
  }),

  // Security
  security: router({
    list: protectedProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(securityTests).orderBy(desc(securityTests.createdAt)).limit(50);
    }),

    summary: protectedProcedure.query(async () => {
      const db = await getDb();
      if (!db) return null;
      const [total] = await db.select({ count: count() }).from(securityTests);
      const [vulnerable] = await db.select({ count: count() }).from(securityTests).where(eq(securityTests.status, "vulnerable"));
      const [critical] = await db.select({ count: count() }).from(securityTests).where(eq(securityTests.severity, "critical"));
      const [high] = await db.select({ count: count() }).from(securityTests).where(eq(securityTests.severity, "high"));
      return {
        total: total.count,
        vulnerable: vulnerable.count,
        critical: critical.count,
        high: high.count,
        safeRate: total.count > 0 ? ((total.count - vulnerable.count) / total.count) * 100 : 100,
      };
    }),
  }),

  // Alerts
  alerts: router({
    list: protectedProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(alerts).orderBy(desc(alerts.createdAt)).limit(50);
    }),

    resolve: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      await db.update(alerts).set({ isResolved: true, resolvedAt: new Date() }).where(eq(alerts.id, input.id));
      return { success: true };
    }),
  }),

  // Prompt Suggestions
  prompts: router({
    list: protectedProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(promptSuggestions).orderBy(desc(promptSuggestions.createdAt)).limit(50);
    }),

    applyPrompt: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      await db.update(promptSuggestions).set({ status: "applied" }).where(eq(promptSuggestions.id, input.id));
      return { success: true };
    }),

    rejectPrompt: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      await db.update(promptSuggestions).set({ status: "rejected" }).where(eq(promptSuggestions.id, input.id));
      return { success: true };
    }),
  }),

  // Projects
  projects: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(projects).where(eq(projects.userId, ctx.user.id)).orderBy(desc(projects.createdAt));
    }),

    create: protectedProcedure.input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      environment: z.enum(["development", "staging", "production"]).default("development"),
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return null;
      const [result] = await db.insert(projects).values({
        userId: ctx.user.id,
        name: input.name,
        description: input.description,
        environment: input.environment,
      }).$returningId();
      return result;
    }),
  }),

  // Integrations
  integrations: router({
    list: protectedProcedure.input(z.object({ projectId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(integrations).where(eq(integrations.projectId, input.projectId));
    }),
  }),

  // Seed demo data
  seed: router({
    run: protectedProcedure.mutation(async ({ ctx }) => {
      await seedDemoData(ctx.user.id);
      return { success: true };
    }),
  }),
});

export type AppRouter = typeof appRouter;
