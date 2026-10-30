/**
 * Download/upload file screening.
 *
 * IMPLEMENTATION.md Section 5.5: "Scan downloads and restrict executable
 * file handling." In v1 the screening is extension-based (portable across
 * environments); a malware-scanner hook (ClamAV or vendor service) is a
 * documented extension point in the artifacts store.
 */

const BLOCKED_EXTENSIONS = new Set([
  ".exe", ".msi", ".msp", ".bat", ".cmd", ".com", ".scr", ".vbs", ".vbe", ".js", ".jse",
  ".wsf", ".wsh", ".ps1", ".psm1", ".sh", ".bash", ".zsh", ".fish", ".dll", ".so",
  ".dylib", ".bin", ".jar", ".class", ".apk", ".deb", ".rpm", ".app", ".dmg", ".pkg",
  ".hta", ".cpl", ".pif", ".sys", ".drv",
]);

export function inspectFilenameForExecutables(filename: string): { allowed: boolean; reason: string } {
  const lower = filename.toLowerCase();
  for (const extension of BLOCKED_EXTENSIONS) {
    if (lower.endsWith(extension)) {
      return {
        allowed: false,
        reason: `Executable/script type "${extension}" is not permitted (${filename}).`,
      };
    }
  }
  return { allowed: true, reason: "" };
}

export function isAllowedUpload(filename: string): boolean {
  return inspectFilenameForExecutables(filename).allowed;
}
