// Temporary private-preview gate (edge-safe: imported by middleware.ts). When SITE_ACCESS is set, every request except
// the health check needs one of its logins via HTTP Basic Auth. Unset it to make the site public again.
import type { RateLimiter } from "./rate-limit";

export const SITE_ACCESS_REALM = 'Basic realm="ETC private preview", charset="UTF-8"';

/** "name:password,name2:password2" → logins. null = gate off. A set but unusable value gives an empty map (nobody in). */
export function parseSiteAccess(raw: string | undefined): Map<string, string> | null {
  if (!raw?.trim()) return null;
  const users = new Map<string, string>();
  for (const entry of raw.split(",")) {
    const at = entry.indexOf(":");
    const name = entry.slice(0, at).trim();
    const password = entry.slice(at + 1).trim();
    if (at > 0 && name && password) users.set(name, password);
  }
  return users;
}

/** Only the uptime probe stays open; it reveals nothing beyond "up/down". */
export function siteAccessExempt(path: string): boolean {
  return path === "/api/health";
}

/** Compares in time that depends only on the longer input's length, not on where the strings differ. */
function sameText(a: string, b: string): boolean {
  const x = new TextEncoder().encode(a);
  const y = new TextEncoder().encode(b);
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return diff === 0;
}

function decodeBasic(header: string | null): { name: string; password: string } | null {
  const m = header?.match(/^Basic\s+([A-Za-z0-9+/]+=*)\s*$/i);
  if (!m) return null;
  try {
    const text = new TextDecoder("utf-8", { fatal: true }).decode(Uint8Array.from(atob(m[1]), (c) => c.charCodeAt(0)));
    const at = text.indexOf(":");
    return at < 0 ? null : { name: text.slice(0, at), password: text.slice(at + 1) };
  } catch {
    return null;
  }
}

export function isAllowed(header: string | null, users: Map<string, string>): boolean {
  const creds = decodeBasic(header);
  if (!creds) return false;
  // Unknown names still run a comparison, so timing doesn't reveal which names exist.
  const expected = users.get(creds.name);
  const match = sameText(creds.password, expected ?? "\u0000not-a-login\u0000");
  return expected !== undefined && match;
}

/**
 * "ok" lets the request through; "challenge" asks for a login (401); "locked" refuses an IP that has sent too many wrong
 * logins. A request without credentials isn't a failure — browsers always try once without them.
 */
export function checkSiteAccess(
  header: string | null,
  ip: string,
  users: Map<string, string>,
  limiter: RateLimiter,
): "ok" | "challenge" | "locked" {
  const key = `site|${ip}`;
  if (limiter.blocked(key)) return "locked";
  if (isAllowed(header, users)) return "ok";
  if (header) limiter.hit(key);
  return "challenge";
}
