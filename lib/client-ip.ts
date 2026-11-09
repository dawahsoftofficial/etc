// Edge-safe (no Node imports): used by middleware.ts as well as server code.
/** Client IP behind Nginx: first X-Forwarded-For entry, then X-Real-IP. Nginx must overwrite X-Forwarded-For. */
export function getClientIp(h: Headers): string {
  const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || h.get("x-real-ip")?.trim() || "0.0.0.0";
}
