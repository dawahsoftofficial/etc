// Next's data cache (unstable_cache) lives in <distDir>/cache/fetch-cache and survives rebuilds. Content changed outside
// the admin panel (seed or update scripts) never revalidates it, so a deploy could keep serving stale rows. Every build
// starts with an empty data cache instead; pages simply re-read the database on first request.
import { rmSync } from "node:fs";
import path from "node:path";

const dir = path.join(process.env.NEXT_DIST_DIR || ".next", "cache", "fetch-cache");
rmSync(dir, { recursive: true, force: true });
console.log(`Cleared ${dir}`);
