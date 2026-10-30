import { AgentRecord, EntityId } from "@bizcontext/types";

export interface ToolDefinition {
  name: string;
  description: string;
  parametersSchema: Record<string, unknown>;
  requiresApproval?: boolean;
}

export interface AgentExecutionContext {
  agent: AgentRecord;
  organisationId: EntityId;
  userId: EntityId;
  conversationId: EntityId;
  tools: ToolDefinition[];
}

export abstract class BaseAgent {
  constructor(public readonly config: AgentRecord) {}

  abstract execute(
    prompt: string,
    context: AgentExecutionContext
  ): Promise<{
    response: string;
    citations: Array<{ sourceId: string; title: string; url?: string }>;
    toolCalls?: Array<{ toolName: string; input: unknown; output: unknown }>;
  }>;
}
