/**
 * Local artifact store — evidence capture (screenshots, downloads, traces).
 *
 * Layout: {artifactDir}/{organisationId}/{jobId}/{stepIndex}-{kind}-{name}
 * Every artifact is hashed (sha256) and registered in the job result, so the
 * producer can move files into object storage (S3/MinIO) without re-uploading.
 *
 * IMPLEMENTATION.md Section 5.6: "Do not persist full page contents or
 * screenshots indefinitely by default." Retention is enforced by a sweeper
 * (BROWSER_EVIDENCE_RETENTION_HOURS) that also cleans the upload staging dir.
 */

import { mkdir, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { inspectFilenameForExecutables } from "../security/file-screen";
import { PolicyViolationError } from "../errors";
import { sha256Hex } from "../utils";
import type { Artifact } from "../contracts";

export interface SaveOptions {
  organisationId: string;
  jobId: string;
  stepIndex: number;
  kind: Artifact["kind"];
  filename: string;
  data: Buffer;
}

export interface FinalizeOptions {
  kind: Artifact["kind"];
  /** Already-saved file (e.g. placed on disk via Download.saveAs under the root). */
  absolutePath: string;
  /** Original filename the browser suggested (kept post-sanitise). */
  renderName?: string;
}

export class LocalArtifactStore {
  constructor(
    private readonly rootDir: string,
    private readonly stagingDir: string,
    private readonly retentionHours: number,
  ) {}

  get baseDir(): string {
    return this.rootDir;
  }

  get uploadStagingDir(): string {
    return this.stagingDir;
  }

  /**
   * Contained absolute path helper: resolves under a base directory and
   * rejects traversal that escapes it.
   */
  resolveContained(base: string, ...segments: string[]): string | null {
    const target = path.resolve(base, ...segments);
    const relative = path.relative(path.resolve(base), target);
    if (relative.startsWith("..") || path.isAbsolute(relative)) return null;
    return target;
  }

  async saveBuffer(input: SaveOptions): Promise<Artifact> {
    const relative = path.join(
      input.organisationId,
      input.jobId,
      `${String(input.stepIndex).padStart(3, "0")}-${input.kind}-${input.filename}`,
    );
    const absolute = this.resolveContained(this.rootDir, relative);
    if (!absolute) throw new PolicyViolationError("staging_file_invalid", "Artifact path escapes the artifact root.");

    await mkdir(path.dirname(absolute), { recursive: true });
    await writeFile(absolute, input.data);
    return {
      kind: input.kind,
      filename: input.filename,
      path: relative.split(path.sep).join("/"),
      sha256: sha256Hex(input.data),
      bytes: input.data.byteLength,
      createdAt: new Date().toISOString(),
    };
  }

  /** Hash + register a file already written to disk (download/trace flows). */
  async finalize(input: FinalizeOptions): Promise<Artifact> {
    const absolute = path.resolve(input.absolutePath);
    const relative = path.relative(path.resolve(this.rootDir), absolute);
    if (relative.startsWith("..") || path.isAbsolute(relative)) {
      throw new PolicyViolationError("staging_file_invalid", "Artifact path escapes the artifact root.");
    }
    const info = await stat(absolute);
    return {
      kind: input.kind,
      filename: input.renderName ?? path.basename(absolute),
      path: relative.split(path.sep).join("/"),
      sha256: await hashFile(absolute),
      bytes: info.size,
      createdAt: new Date().toISOString(),
    };
  }

  async remove(absolutePath: string): Promise<void> {
    await rm(absolutePath, { force: true }).catch(() => undefined);
  }

  /**
   * Validate + resolve an upload staging reference BEFORE it is handed to
   * Playwright: containment, existence, size cap, executable screening.
   */
  async validateStagingFile(
    stagingPath: string,
    maxBytes: number,
  ): Promise<{ absolutePath: string; bytes: number; filename: string }> {
    if (stagingPath.includes("..") || stagingPath.startsWith("/") || stagingPath.includes("\\")) {
      throw new PolicyViolationError("staging_file_invalid", "Forbidden staging path segments.");
    }
    const absolute = this.resolveContained(this.stagingDir, stagingPath);
    if (!absolute) throw new PolicyViolationError("staging_file_invalid", "Staging path escapes the staging root.");
    if (!inspectFilenameForExecutables(path.basename(absolute)).allowed) {
      throw new PolicyViolationError("executable_file_blocked", "Executable uploads are blocked.", { blocked: true });
    }
    const info = await stat(absolute).catch(() => null);
    if (!info) throw new PolicyViolationError("staging_file_invalid", `Staging file "${stagingPath}" does not exist.`);
    if (!info.isFile()) throw new PolicyViolationError("staging_file_invalid", "Staging path is not a regular file.");
    if (info.size > maxBytes) {
      throw new PolicyViolationError("download_size_exceeded", `Upload exceeds the ${maxBytes} byte cap.`);
    }
    return { absolutePath: absolute, bytes: info.size, filename: path.basename(absolute) };
  }

  /**
   * Delete artifacts (and staging files) older than the retention window.
   * Returns the number of removed files for logging.
   */
  async sweepRetention(nowEpoch: number): Promise<{ artifacts: number; staging: number }> {
    const cutoff = nowEpoch - this.retentionHours * 3_600_000;
    return {
      artifacts: await this.sweepDirectory(this.rootDir, cutoff, 6),
      staging: await this.sweepDirectory(this.stagingDir, cutoff, 4),
    };
  }

  async ensureDirectories(): Promise<void> {
    await mkdir(this.rootDir, { recursive: true });
    await mkdir(this.stagingDir, { recursive: true });
  }

  private async sweepDirectory(dir: string, cutoff: number, maxDepth: number): Promise<number> {
    if (maxDepth < 0) return 0;
    let removed = 0;
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return 0;
    }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        removed += await this.sweepDirectory(full, cutoff, maxDepth - 1);
        await this.removeIfEmpty(full).catch(() => undefined);
        continue;
      }
      const info = await stat(full).catch(() => null);
      if (!info) continue;
      if (info.mtimeMs < cutoff || info.atimeMs < cutoff) {
        await rm(full, { force: true });
        removed += 1;
      }
    }
    return removed;
  }

  private async removeIfEmpty(dir: string): Promise<void> {
    const entries = await readdir(dir);
    if (entries.length === 0) await rm(dir, { force: true });
  }
}

/** Streaming-safe hash of a file already on disk. */
export async function hashFile(filePath: string): Promise<string> {
  const fs = await import("node:fs/promises");
  const { createHash } = await import("node:crypto");
  return createHash("sha256").update(await fs.readFile(filePath)).digest("hex");
}
