/**
 * Module: Asset Storage
 * Central document and media storage, OCR metadata, and expiring signed URLs.
 */

export const MODULE_NAME = "storage";

export interface StorageModuleConfig {
  enabled: boolean;
}

export * from "./files";
