import { z } from "zod";

export const CreateOrganisationSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/),
  parentId: z.string().uuid().optional(),
});

export const CreateTaskSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  projectId: z.string().uuid().optional(),
  primaryAssigneeId: z.string().uuid().optional(),
  collaboratorIds: z.array(z.string().uuid()).default([]),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  dueDate: z.string().datetime().optional(),
});

export const CreateTicketSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().min(5),
  category: z.enum(["it", "access", "infrastructure", "hr", "design", "dev", "finance", "general"]),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
});

export const BrowserJobRequestSchema = z.object({
  agentId: z.string().uuid(),
  goal: z.string().min(5).max(1000),
  targetUrl: z.string().url(),
  permissionLevel: z.enum(["B0", "B1", "B2", "B3", "B4"]).default("B1"),
});
