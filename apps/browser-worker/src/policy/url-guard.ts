import dnsPromises from "node:dns/promises";
import net from "node:net";

/**
 * URL security guard (IMPLEMENTATION.md Section 5.5):
 *  - http/https only (blocks javascript:, data:, file:, etc.)
 *  - per-job domain allowlist with subdomain semantics ("*.example.com" entry
 *    is stored as "example.com" and matches example.com and any subdomain)
 *  - ports restricted to 80/443 (blocks internal services on odd ports)
 *  - IP literals and DNS-resolved addresses checked against private/reserved
 *    ranges to prevent SSRF into the internal network
 *  - DNS results cached briefly (60s) to keep the hot path cheap
 *
 * Known hardening boundary (documented, deferred to infrastructure):
 * a determined SSRF via exotic DNS (rebinding) is also mitigated in production
 * by running the worker egress through a network proxy/firewall; the in-process
 * guard is the first line, not the last one.
 */

export type UrlGuardCode =
  | "invalid_url"
  | "disallowed_scheme"
  | "unknown_host"
  | "nonstandard_port_blocked"
  | "ip_literal_blocked"
  | "host_not_allowlisted"
  | "private_address_blocked"
  | "dns_resolution_failed";

export type UrlGuardResult = { ok: true } | { ok: false; code: UrlGuardCode; reason: string };

export type HostResolver = (host: string) => Promise<Array<{ address: string }>>;

const DEFAULT_RESOLVE_TTL_MS = 60_000;

export interface UrlGuardOptions {
  allowedDomains: string[];
  resolveHost?: HostResolver;
  dnsCacheTtlMs?: number;
}

const DEFAULT_RESOLVER: HostResolver = (host) => dnsPromises.lookup(host, { all: true, verbatim: true });

export class UrlGuard {
  private readonly domains: string[];
  private readonly dnsCache = new Map<string, { expiresAt: number; addresses: string[] }>();
  private readonly resolveHost: HostResolver;
  private readonly ttlMs: number;

  constructor(options: UrlGuardOptions) {
    this.domains = options.allowedDomains
      .map((entry) => entry.trim().toLowerCase().replace(/^\*\./, "").split("/")[0] ?? "")
      .filter((entry) => entry.length > 0);
    this.resolveHost = options.resolveHost ?? DEFAULT_RESOLVER;
    this.ttlMs = options.dnsCacheTtlMs ?? DEFAULT_RESOLVE_TTL_MS;
  }

  /** Cheap allowlist check usable inside request interception. */
  isHostAllowed(host: string): boolean {
    const candidate = host.toLowerCase();
    return this.domains.some((domain) => candidate === domain || candidate.endsWith(`.${domain}`));
  }

  /** Synchronous rules (scheme, port, literal-IP privacy, allowlist). */
  checkSync(rawUrl: string): UrlGuardResult {
    let url: URL;
    try {
      url = new URL(rawUrl);
    } catch {
      return { ok: false, code: "invalid_url", reason: "Target is not a parseable URL." };
    }

    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return {
        ok: false,
        code: "disallowed_scheme",
        reason: `Only http/https navigations are permitted (got ${url.protocol}).`,
      };
    }

    const host = url.hostname.toLowerCase();
    if (!host) return { ok: false, code: "unknown_host", reason: "URL has no resolvable host." };

    if (url.port && url.port !== "80" && url.port !== "443") {
      return {
        ok: false,
        code: "nonstandard_port_blocked",
        reason: `Non-standard port ${url.port} is not permitted.`,
      };
    }

    if (net.isIP(host) !== 0) {
      if (isPrivateOrReservedAddress(host)) {
        return { ok: false, code: "ip_literal_blocked", reason: "Direct IP navigation blocked (SSRF protection)." };
      }
      if (!this.isHostAllowed(host)) {
        return {
          ok: false,
          code: "host_not_allowlisted",
          reason: "Host literals must appear in the allowlist verbatim.",
        };
      }
      return { ok: true };
    }

    if (!this.isHostAllowed(host)) {
      return {
        ok: false,
        code: "host_not_allowlisted",
        reason: `Host "${host}" is not in the job domain allowlist.`,
      };
    }
    return { ok: true };
  }

  /** Full check including DNS resolution of the host. */
  async guard(rawUrl: string): Promise<UrlGuardResult> {
    const syncResult = this.checkSync(rawUrl);
    if (!syncResult.ok) return syncResult;

    const host = new URL(rawUrl).hostname.toLowerCase();
    const addresses = await this.resolveAddresses(host);
    if (!addresses) return { ok: false, code: "dns_resolution_failed", reason: `DNS lookup failed for "${host}".` };
    if (addresses.some((address) => isPrivateOrReservedAddress(address))) {
      return {
        ok: false,
        code: "private_address_blocked",
        reason: `"${host}" resolves into a private/reserved network range (SSRF protection).`,
      };
    }
    return { ok: true };
  }

  clearDnsCache(): void {
    this.dnsCache.clear();
  }

  private async resolveAddresses(host: string): Promise<string[] | null> {
    const cached = this.dnsCache.get(host);
    const now = Date.now();
    if (cached && cached.expiresAt > now) return cached.addresses;
    try {
      const records = await this.resolveHost(host);
      const addresses = records.map((record) => record.address);
      this.dnsCache.set(host, { expiresAt: now + this.ttlMs, addresses });
      return addresses;
    } catch {
      return null;
    }
  }
}

export function isPrivateOrReservedAddress(ip: string): boolean {
  const mapped = unwrapIPv4Mapped(ip);
  const target = mapped ?? ip;
  if (net.isIP(target) === 4) return isPrivateIPv4(target);
  if (net.isIP(target) === 6) return isPrivateIPv6(target);
  return true; // unknown formats are refused
}

function unwrapIPv4Mapped(ip: string): string | null {
  const match = ip.toLowerCase().match(/^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/);
  return match?.[1] ?? null;
}

function octets(ip: string): [number, number, number, number] | null {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return null;
  return [parts[0]!, parts[1]!, parts[2]!, parts[3]!];
}

function isPrivateIPv4(ip: string): boolean {
  const parts = octets(ip);
  if (!parts) return true;
  const [a, b, c] = parts;

  if (a === 0) return true; // 0.0.0.0/8 "this network"
  if (a === 10) return true; // RFC1918
  if (a === 127) return true; // loopback
  if (a === 169 && b === 254) return true; // link-local
  if (a === 172 && b >= 16 && b <= 31) return true; // RFC1918
  if (a === 192 && b === 168) return true; // RFC1918
  if (a === 192 && b === 0 && (c === 0 || c === 2)) return true; // protocol tests
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
  if (a === 198 && (b === 18 || b === 19)) return true; // benchmarking
  if (a === 198 && b === 51 && c === 100) return true; // doc
  if (a === 203 && b === 0 && c === 113) return true; // doc
  if (a >= 224) return true; // multicast + reserved
  return false;
}

function isPrivateIPv6(ip: string): boolean {
  const lower = ip.toLowerCase();
  if (lower === "::" || lower === "::1") return true; // unspecified + loopback
  if (lower.startsWith("::ffff:")) return true; // mapped (defensive; usually unwrapped)
  if (lower.startsWith("fc") || lower.startsWith("fd")) return true; // unique local fc00::/7
  if (lower.startsWith("fe8") || lower.startsWith("fe9") || lower.startsWith("fea") || lower.startsWith("feb")) {
    return true; // link-local fe80::/10
  }
  if (lower.startsWith("ff")) return true; // multicast
  if (lower.startsWith("64:ff9b:") || lower.startsWith("::ffff:0:")) return true; // NAT64 + mapped v4
  if (lower.startsWith("2002:")) {
    // 6to4 embeds an IPv4 in the next two hextets — check it.
    const hex = lower.slice("2002:".length).replace(/:/g, "").slice(0, 8);
    if (hex.length === 8) {
      const parts = [0, 2, 4, 6].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16));
      const dotted = parts.map((part) => String(part)).join(".");
      if (!dotted.includes("NaN")) return isPrivateIPv4(dotted);
    }
    return true;
  }
  return false;
}
