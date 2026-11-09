import { test, expect } from "@playwright/test";
import { PREVIEW } from "./preview-access";

// Plain fetch: Playwright's request contexts answer a 401 with the suite's viewer login, so they can't play a stranger.
const basic = (user: string, pass: string) => ({ Authorization: "Basic " + Buffer.from(`${user}:${pass}`).toString("base64") });
const stranger = (baseURL: string | undefined, path: string, headers: Record<string, string> = {}) =>
  fetch(new URL(path, baseURL), { headers, redirect: "manual" });

test("without a login every page asks for one, including the admin", async ({ baseURL }) => {
  for (const path of ["/", "/tests/usat", "/news", "/admin/login", "/admin", "/sitemap.xml", "/robots.txt", "/api/auth/session"]) {
    const res = await stranger(baseURL, path);
    expect(res.status, path).toBe(401);
    expect(res.headers.get("www-authenticate"), path).toBe('Basic realm="ETC private preview", charset="UTF-8"');
    expect(res.headers.get("cache-control"), path).toContain("no-store");
    expect(res.headers.get("x-frame-options"), path).toBe("DENY");
    expect(await res.text(), path).not.toContain("Education Testing Council");
  }
});

test("a wrong password or unknown name is refused; the right login gets in", async ({ baseURL }) => {
  expect((await stranger(baseURL, "/", basic(PREVIEW.username, "wrong"))).status).toBe(401);
  expect((await stranger(baseURL, "/", basic("someone-else", PREVIEW.password))).status).toBe(401);
  expect((await stranger(baseURL, "/", basic(PREVIEW.username, PREVIEW.password))).status).toBe(200);
});

test("the health check stays open for Ploi's uptime monitor", async ({ baseURL }) => {
  const res = await stranger(baseURL, "/api/health");
  expect(res.status).toBe(200);
  expect(await res.json()).toMatchObject({ ok: true });
});

test("a signed-in viewer browses the site normally, crests and photos included", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
  // local images must not go through the optimizer: its internal fetch carries no login and would get the 401
  const crests = page.locator('header img[src*="crest"]');
  await expect(crests.first()).toBeVisible();
  for (const img of await crests.all()) {
    await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth)).toBeGreaterThan(0);
  }
});

test("images, scripts and the image optimizer need the login too", async ({ baseURL, request }) => {
  const html = await (await request.get("/")).text();
  const chunk = html.match(/\/_next\/static\/[^"']+\.js/)![0];
  expect((await request.get(chunk)).status()).toBe(200);
  for (const path of [chunk, "/brand/etc-crest.png", "/_next/image?url=%2Fbrand%2Fetc-crest.png&w=64&q=75", "/favicon.ico"]) {
    expect((await stranger(baseURL, path)).status, path).toBe(401);
  }
});

test("ten wrong passwords lock that IP out, even with the right password", async ({ baseURL }) => {
  // A fresh address so the lockout doesn't affect the rest of the suite (Nginx overwrites this header in production).
  const ip = { "X-Forwarded-For": "203.0.113.200" };
  for (let i = 0; i < 10; i++) {
    expect((await stranger(baseURL, "/", { ...ip, ...basic(PREVIEW.username, `guess-${i}`) })).status).toBe(401);
  }
  const res = await stranger(baseURL, "/", { ...ip, ...basic(PREVIEW.username, PREVIEW.password) });
  expect(res.status).toBe(429);
  expect(res.headers.get("retry-after")).toBe("900");
  // someone else on another address still gets in
  expect((await stranger(baseURL, "/", { "X-Forwarded-For": "203.0.113.201", ...basic(PREVIEW.username, PREVIEW.password) })).status).toBe(200);
});
