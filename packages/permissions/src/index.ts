import { BrowserPermissionLevel, EntityId } from "@bizcontext/types";

export type Role = "owner" | "admin" | "member" | "guest";

export interface PermissionContext {
  userId: EntityId;
  organisationId: EntityId;
  role: Role;
  departmentIds?: EntityId[];
  projectIds?: EntityId[];
}

export function canAccessResource(
  context: PermissionContext,
  resourceOrgId: EntityId,
  requiredRole: Role = "member"
): boolean {
  if (context.organisationId !== resourceOrgId) {
    return false;
  }
  const roleHierarchy: Record<Role, number> = {
    guest: 1,
    member: 2,
    admin: 3,
    owner: 4,
  };
  return roleHierarchy[context.role] >= roleHierarchy[requiredRole];
}

export function isConsequentialAction(action: string): boolean {
  const highImpactActions = [
    "send_external_email",
    "submit_form_commitment",
    "financial_payment",
    "modify_access_policy",
    "delete_critical_record",
  ];
  return highImpactActions.includes(action);
}

export function canExecuteBrowserAction(
  level: BrowserPermissionLevel,
  action: "read" | "interact" | "submit" | "automate"
): boolean {
  const levels: Record<BrowserPermissionLevel, number> = {
    B0: 0,
    B1: 1, // Read-only browsing
    B2: 2, // Interactive browsing (non-submitted forms)
    B3: 3, // Approved execution (submit forms with approval)
    B4: 4, // Restricted automation
  };

  const actionRequirements = {
    read: 1,
    interact: 2,
    submit: 3,
    automate: 4,
  };

  return levels[level] >= actionRequirements[action];
}
