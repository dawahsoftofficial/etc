import { describe, expect, test } from "vitest";
import { checkSiteAccess, isAllowed, parseSiteAccess, siteAccessExempt } from "@/lib/site-access";
import { createRateLimiter } from "@/lib/rate-limit";

const basic = (user: string, pass: string) => "Basic " + Buffer.from(`${user}:${pass}`, "utf8").toString("base64");

describe("parseSiteAccess", () => {
  test("unset or blank means the site is public", () => {
    expect(parseSiteAccess(undefined)).toBeNull();
    expect(parseSiteAccess("  ")).toBeNull();
  });
  test("a comma-separated list of name:password pairs; passwords may contain colons", () => {
    expect(parseSiteAccess(" ayesha:Strong-pass-1 , bilal:a:b:c ")).toEqual(new Map([["ayesha", "Strong-pass-1"], ["bilal", "a:b:c"]]));
  });
  test("a set but unusable value locks everyone out rather than opening the site", () => {
    expect(parseSiteAccess("nonsense")).toEqual(new Map());
    expect(parseSiteAccess("name:")).toEqual(new Map());
  });
});

describe("isAllowed", () => {
  const users = parseSiteAccess("ayesha:Strong-pass-1,bilal:pässwörd")!;
  test("the right name and password", () => {
    expect(isAllowed(basic("ayesha", "Strong-pass-1"), users)).toBe(true);
    expect(isAllowed(basic("bilal", "pässwörd"), users)).toBe(true);
  });
  test("anything else is refused", () => {
    expect(isAllowed(null, users)).toBe(false);
    expect(isAllowed("Bearer abc", users)).toBe(false);
    expect(isAllowed("Basic !!!not-base64", users)).toBe(false);
    expect(isAllowed(basic("ayesha", "strong-pass-1"), users)).toBe(false);
    expect(isAllowed(basic("ayesha", "Strong-pass-1x"), users)).toBe(false);
    expect(isAllowed(basic("nobody", "Strong-pass-1"), users)).toBe(false);
    expect(isAllowed(basic("ayesha", ""), users)).toBe(false);
  });
  test("an empty list allows nobody", () => {
    expect(isAllowed(basic("ayesha", "Strong-pass-1"), new Map())).toBe(false);
  });
});

test("only the health check stays open", () => {
  expect(siteAccessExempt("/api/health")).toBe(true);
  expect(siteAccessExempt("/")).toBe(false);
  expect(siteAccessExempt("/admin/login")).toBe(false);
  expect(siteAccessExempt("/api/health/x")).toBe(false);
});

describe("checkSiteAccess", () => {
  const users = parseSiteAccess("ayesha:Strong-pass-1")!;
  const setup = () => createRateLimiter({ limit: 3, windowMs: 60_000 });

  test("no login yet gets the prompt and isn't counted as a failure", () => {
    const limiter = setup();
    for (let i = 0; i < 5; i++) expect(checkSiteAccess(null, "1.1.1.1", users, limiter)).toBe("challenge");
    expect(checkSiteAccess(basic("ayesha", "Strong-pass-1"), "1.1.1.1", users, limiter)).toBe("ok");
  });

  test("repeated wrong passwords lock that IP out, even with the right password afterwards", () => {
    const limiter = setup();
    for (let i = 0; i < 3; i++) expect(checkSiteAccess(basic("ayesha", `guess${i}`), "2.2.2.2", users, limiter)).toBe("challenge");
    expect(checkSiteAccess(basic("ayesha", "Strong-pass-1"), "2.2.2.2", users, limiter)).toBe("locked");
    // other people are unaffected
    expect(checkSiteAccess(basic("ayesha", "Strong-pass-1"), "3.3.3.3", users, limiter)).toBe("ok");
  });
});
