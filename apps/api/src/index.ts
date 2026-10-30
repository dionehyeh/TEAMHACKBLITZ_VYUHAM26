import { Hono } from "hono";
import { cors } from "hono/cors";
import authRoutes from "./routes/auth";
import organisationsRoutes from "./routes/organisations";
import employeesRoutes from "./routes/employees";

const app = new Hono();
const v1 = new Hono();

app.use("*", cors());

// Health Check
app.get("/health", (c) => {
  return c.json({
    status: "ok",
    service: "bizcontext-api",
    timestamp: new Date().toISOString(),
  });
});

// V1 API Router Entry Points (Section 9 of IMPLEMENTATION.md)
v1.get("/", (c) => {
  return c.json({
    message: "BizContext AI API v1 Operational",
    endpoints: [
      "/api/v1/auth",
      "/api/v1/organisations",
      "/api/v1/departments",
      "/api/v1/employees",
      "/api/v1/employee-documents",
      "/api/v1/knowledge/pages",
      "/api/v1/files",
      "/api/v1/projects",
      "/api/v1/tasks",
      "/api/v1/tickets",
      "/api/v1/meetings",
      "/api/v1/notifications",
      "/api/v1/agents",
      "/api/v1/agent-executions",
      "/api/v1/browser-jobs",
      "/api/v1/integrations",
      "/api/v1/search",
      "/api/v1/analytics",
    ],
  });
});

v1.route("/auth", authRoutes);
v1.route("/organisations", organisationsRoutes);
v1.route("/employees", employeesRoutes);

app.route("/api/v1", v1);

const port = process.env.API_PORT ? parseInt(process.env.API_PORT, 10) : 3001;

console.log(`BizContext AI API running on port ${port}`);

export default {
  port,
  fetch: app.fetch,
};
