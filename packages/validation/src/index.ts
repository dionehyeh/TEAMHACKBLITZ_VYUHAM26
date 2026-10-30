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

// Auth (Section 9: /api/v1/auth)
export const SignUpSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(8).max(128),
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().max(100).optional(),
});

export const LoginSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(128),
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1).max(2048),
});

// Employees (Section 8.1, 2.2, MVP)
export const CreateEmployeeSchema = z.object({
  organisationId: z.string().uuid(),
  userId: z.string().uuid(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().max(100),
  workEmail: z.string().email().max(254),
  departmentId: z.string().uuid().optional(),
  designation: z.string().max(150).optional(),
  employmentStatus: z.enum(["active", "invited", "suspended", "offboarded"]).default("active"),
});

// Knowledge pages (Section 2.3, 8.2, MVP)
export const CreateKnowledgePageSchema = z.object({
  organisationId: z.string().uuid(),
  title: z.string().min(1).max(255),
  content: z.string().max(100000).optional(),
  parentId: z.string().uuid().optional(),
  visibility: z.enum(["public", "internal", "restricted"]).default("internal"),
});
