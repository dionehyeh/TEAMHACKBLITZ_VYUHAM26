import { Hono } from "hono";
import { z } from "zod";
import { aiEngineClient } from "../services/ai-engine.client";

export const aiRouter = new Hono();

const querySchema = z.object({
  prompt: z.string().min(1),
  conversationId: z.string().optional(),
  agentRole: z.string().optional().default("general_assistant"),
  allowedTools: z.array(z.string()).optional(),
  chatHistory: z
    .array(
      z.object({
        role: z.enum(["user", "assistant", "system"]),
        content: z.string(),
      })
    )
    .optional(),
  metadata: z.record(z.unknown()).optional(),
  systemPrompt: z.string().optional(),
});

// ─── POST /api/v1/ai/query ───────────────────────────────────────────────────
// Synchronous agent execution. Returns the full AI response with citations
// and tool-call receipts once the agent turn completes.
aiRouter.post("/query", async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = querySchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: "Invalid payload", details: parsed.error.issues }, 400);
  }

  // Extract auth & multi-tenancy context from request headers
  const authHeader = c.req.header("Authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "");
  const organisationId = c.req.header("X-Organisation-Id") || "default-org";
  const userId = c.req.header("X-User-Id") || "anonymous-user";

  try {
    const result = await aiEngineClient.runAgent({
      prompt: parsed.data.prompt,
      userId,
      organisationId,
      conversationId: parsed.data.conversationId,
      agentRole: parsed.data.agentRole,
      allowedTools: parsed.data.allowedTools,
      chatHistory: parsed.data.chatHistory,
      systemPrompt: parsed.data.systemPrompt,
      metadata: parsed.data.metadata,
      authToken: token,
    });

    return c.json(result);
  } catch (error: any) {
    console.error("[AI /query]", error?.message);
    return c.json({ error: error.message || "Failed to execute AI query" }, 500);
  }
});

// ─── POST /api/v1/ai/stream ──────────────────────────────────────────────────
// Real-time streaming via Server-Sent Events (SSE).
// Event types: `token` | `tools` | `citations` | `done`
aiRouter.post("/stream", async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = querySchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: "Invalid payload", details: parsed.error.issues }, 400);
  }

  const authHeader = c.req.header("Authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "");
  const organisationId = c.req.header("X-Organisation-Id") || "default-org";
  const userId = c.req.header("X-User-Id") || "anonymous-user";

  try {
    const stream = await aiEngineClient.streamAgent({
      prompt: parsed.data.prompt,
      userId,
      organisationId,
      conversationId: parsed.data.conversationId,
      agentRole: parsed.data.agentRole,
      allowedTools: parsed.data.allowedTools,
      chatHistory: parsed.data.chatHistory,
      systemPrompt: parsed.data.systemPrompt,
      metadata: parsed.data.metadata,
      authToken: token,
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("[AI /stream]", error?.message);
    return c.json({ error: error.message || "Failed to initiate AI stream" }, 500);
  }
});
