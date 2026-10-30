/**
 * Domain Service & Constants for Employee Documents
 * (CVs, Certificates, Portfolios, and verification workflows)
 *
 * Mapped to IMPLEMENTATION.md Sections 2.2, 8.1, 8.5 & 11.
 */

export type { EmployeeDocument } from "@bizcontext/types";

export const EMPLOYEE_DOCUMENTS_BUCKET = "employee-documents";

export const ALLOWED_DOCUMENT_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/csv",
  "text/markdown",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

/**
 * Sanitise a filename so it is safe to embed in an object storage key.
 * Removes directory traversal characters and unsafe symbols.
 */
export function sanitiseDocumentFilename(raw: string): string {
  const basename = raw.replace(/.*[/\\]/, "");
  return basename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 200);
}

/**
 * Build the Supabase Storage object key for an employee document.
 * Storage path format: org-{orgId}/employee-docs/{employeeProfileId}/{uuid}/{sanitisedFilename}
 */
export function buildDocumentStoragePath(
  orgId: string,
  employeeProfileId: string,
  filename: string
): string {
  const uuid = crypto.randomUUID();
  const safeName = sanitiseDocumentFilename(filename);
  return `org-${orgId}/employee-docs/${employeeProfileId}/${uuid}/${safeName}`;
}

/** Check if role has elevated admin-level permissions on employee documents */
export function canAdministerDocuments(role: string): boolean {
  return role === "admin" || role === "owner";
}

/** Check if role can verify / reject employee documents (admin, owner, hr) */
export function canVerifyDocuments(role: string): boolean {
  return role === "admin" || role === "owner" || role === "hr";
}

/**
 * Enforce resource-level access control on an employee document:
 * Admins/owners can access all documents in the org.
 * Regular users can only access documents they uploaded or documents attached to their employee profile.
 */
export function canAccessDocument(params: {
  role: string;
  userId: string;
  myProfileId: string | null;
  documentCreatedBy: string;
  documentProfileId: string;
}): boolean {
  if (canAdministerDocuments(params.role)) {
    return true;
  }
  const isUploader = params.documentCreatedBy === params.userId;
  const isSubject = params.myProfileId !== null && params.myProfileId === params.documentProfileId;
  return isUploader || isSubject;
}
