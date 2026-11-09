import { createHash } from "node:crypto";

export { getClientIp } from "./client-ip";

/** IPs are only ever stored as salted hashes (spec §6). */
export function hashIp(ip: string, salt: string): string {
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}
