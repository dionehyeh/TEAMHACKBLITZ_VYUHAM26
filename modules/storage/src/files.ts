/**
 * Domain Service & Utilities for Central Asset Storage
 * (Files, Presigned URLs, Versions, and Sharing Permissions)
 *
 * Mapped to IMPLEMENTATION.md Sections 2.4, 8.2, and 11.
 */

export const ASSET_STORAGE_BUCKET = process.env.STORAGE_ASSETS_BUCKET || "assets";

/** Standard file MIME types allowed for organisational asset uploads */
export const ALLOWED_ASSET_MIME_TYPES = new Set([
  // Documents
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
  "application/json",
  // Images
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
  "image/gif",
  // Archives
  "application/zip",
  "application/gzip",
  "application/x-tar",
]);

/**
 * Sanitise a filename for safe object-storage keys.
 */
export function sanitiseAssetFilename(raw: string): string {
  const basename = raw.replace(/.*[/\\]/, "");
  return basename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 200);
}

/**
 * Build a structured object storage path for an asset.
 * Pattern: org-{orgId}/assets/{uuid}/{sanitisedFilename}
 */
export function buildAssetStoragePath(
  orgId: string,
  filename: string,
  folderPath = "/"
): string {
  const uuid = crypto.randomUUID();
  const safeName = sanitiseAssetFilename(filename);
  const cleanFolder = folderPath.replace(/^\/+|\/+$/g, "").replace(/[^a-zA-Z0-9._/-]/g, "_");
  const prefix = cleanFolder.length > 0 ? `${cleanFolder}/` : "";
  return `org-${orgId}/assets/${prefix}${uuid}/${safeName}`;
}

/** Check if role has elevated admin-level file management permissions */
export function canAdministerFiles(role: string): boolean {
  return role === "admin" || role === "owner";
}

/**
 * Check if a user has read/download access to a file based on visibility and ownership.
 */
export function canReadFile(opts: {
  role: string;
  userId: string;
  fileCreatedBy: string;
  fileVisibility: "public" | "internal" | "restricted";
  hasExplicitPermission?: boolean;
}): boolean {
  if (canAdministerFiles(opts.role)) return true;
  if (opts.fileCreatedBy === opts.userId) return true;
  if (opts.fileVisibility === "public" || opts.fileVisibility === "internal") return true;
  return Boolean(opts.hasExplicitPermission);
}

/**
 * Check if a user can edit or delete a file.
 */
export function canModifyFile(opts: {
  role: string;
  userId: string;
  fileCreatedBy: string;
  hasAdminPermission?: boolean;
}): boolean {
  if (canAdministerFiles(opts.role)) return true;
  if (opts.fileCreatedBy === opts.userId) return true;
  return Boolean(opts.hasAdminPermission);
}
