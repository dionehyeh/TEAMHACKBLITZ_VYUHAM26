import { Hono } from "hono";
import type { Context } from "hono";
import { SignUpSchema, LoginSchema, RefreshTokenSchema } from "@bizcontext/validation";
import { getSupabaseAnonClient, getSupabaseServiceClient } from "../lib/supabase";
import type { Session, User } from "@supabase/supabase-js";

const authRoutes = new Hono();

export interface AuthUserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface AuthSessionResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface AuthMeResponse {
  user: AuthUserResponse;
  organisationId: string | null;
  role: string | null;
}

function toUserResponse(user: User): AuthUserResponse {
  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
  const firstName =
    typeof metadata.firstName === "string"
      ? metadata.firstName
      : typeof metadata.first_name === "string"
        ? (metadata.first_name as string)
        : "";
  const lastName =
    typeof metadata.lastName === "string"
      ? metadata.lastName
      : typeof metadata.last_name === "string"
        ? (metadata.last_name as string)
        : "";

  return {
    id: user.id,
    email: user.email ?? "",
    firstName,
    lastName,
  };
}

function toSessionResponse(session: Session): AuthSessionResponse {
  return {
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    expiresIn: session.expires_in,
    tokenType: session.token_type,
  };
}

function errorMessage(c: Context, status: 400 | 401 | 403 | 500, message: string) {
  return c.json({ error: { message } }, status);
}

// POST /api/v1/auth/signup
authRoutes.post("/signup", async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = SignUpSchema.safeParse(body);
  if (!parsed.success) {
    return errorMessage(c, 400, "Validation failed");
  }

  const { email, password, firstName, lastName } = parsed.data;
  const supabase = getSupabaseAnonClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        firstName,
        lastName,
      },
    },
  });

  if (error) {
    if (error.status === 422) {
      return errorMessage(c, 400, "An account with this email already exists");
    }
    return errorMessage(c, 400, error.message);
  }

  const session = data.session;
  if (!session || !data.user) {
    // Auto-confirm must be enabled on the Supabase project for instant signup.
    // (Email verification has been disabled for now.)
    return errorMessage(
      c,
      403,
      "Signup could not be completed. Please ensure email auto-confirmation is enabled in the Supabase project."
    );
  }

  return c.json({ user: toUserResponse(data.user), session: toSessionResponse(session) }, 201);
});

// POST /api/v1/auth/login
authRoutes.post("/login", async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = LoginSchema.safeParse(body);
  if (!parsed.success) {
    return errorMessage(c, 400, "Validation failed");
  }

  const { email, password } = parsed.data;
  const supabase = getSupabaseAnonClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return errorMessage(c, 401, error.message || "Invalid email or password");
  }

  if (!data.session || !data.user) {
    return errorMessage(c, 401, "Invalid email or password");
  }

  return c.json({ user: toUserResponse(data.user), session: toSessionResponse(data.session) }, 200);
});

// POST /api/v1/auth/logout
authRoutes.post("/logout", async (c) => {
  const authHeader = c.req.header("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;

  if (!token) {
    return errorMessage(c, 401, "Missing bearer token");
  }

  const supabase = getSupabaseServiceClient();
  const { error } = await supabase.auth.admin.signOut(token, "local");

  if (error) {
    return errorMessage(c, 500, "Failed to revoke session");
  }

  return c.json({ success: true }, 200);
});

// POST /api/v1/auth/refresh
authRoutes.post("/refresh", async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = RefreshTokenSchema.safeParse(body);
  if (!parsed.success) {
    return errorMessage(c, 400, "Validation failed");
  }

  const supabase = getSupabaseAnonClient();
  const { data, error } = await supabase.auth.refreshSession({
    refresh_token: parsed.data.refreshToken,
  });

  if (error) {
    return errorMessage(c, 401, "Failed to refresh session");
  }

  if (!data.session || !data.user) {
    return errorMessage(c, 401, "Failed to refresh session");
  }

  return c.json({ user: toUserResponse(data.user), session: toSessionResponse(data.session) }, 200);
});

// GET /api/v1/auth/me
authRoutes.get("/me", async (c) => {
  const authHeader = c.req.header("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;

  if (!token) {
    return errorMessage(c, 401, "Missing bearer token");
  }

  const supabase = getSupabaseAnonClient();
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return errorMessage(c, 401, "Invalid or expired token");
  }

  const user = data.user;
  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
  const organisationId =
    (user.app_metadata?.organisationId as string | undefined) ??
    (metadata.organisationId as string | undefined) ??
    null;
  const role =
    (user.app_metadata?.role as string | undefined) ??
    (metadata.role as string | undefined) ??
    null;

  const meResponse: AuthMeResponse = {
    user: toUserResponse(user),
    organisationId: organisationId ?? null,
    role: role ?? null,
  };

  return c.json(meResponse, 200);
});

export default authRoutes;
