import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createMockContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user",
      email: "test@example.com",
      name: "Test User",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("appRouter", () => {
  it("has all expected router keys", () => {
    const routerKeys = Object.keys(appRouter._def.procedures);
    // Check that main routers exist
    expect(routerKeys).toContain("auth.me");
    expect(routerKeys).toContain("auth.logout");
    expect(routerKeys).toContain("dashboard.metrics");
    expect(routerKeys).toContain("traces.list");
    expect(routerKeys).toContain("traces.detail");
    expect(routerKeys).toContain("evaluations.list");
    expect(routerKeys).toContain("evaluations.byModel");
    expect(routerKeys).toContain("security.list");
    expect(routerKeys).toContain("security.summary");
    expect(routerKeys).toContain("alerts.list");
    expect(routerKeys).toContain("alerts.resolve");
    expect(routerKeys).toContain("prompts.list");
    expect(routerKeys).toContain("prompts.applyPrompt");
    expect(routerKeys).toContain("prompts.rejectPrompt");
    expect(routerKeys).toContain("projects.list");
    expect(routerKeys).toContain("projects.create");
    expect(routerKeys).toContain("integrations.list");
    expect(routerKeys).toContain("seed.run");
  });

  it("auth.me returns user from context", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toEqual(ctx.user);
  });

  it("auth.logout clears cookie and returns success", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result).toEqual({ success: true });
  });
});
