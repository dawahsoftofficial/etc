import { test, expect } from "@playwright/test";
import { dismissLatestAnnouncement } from "./fixtures";

test.describe("home", () => {
  test("opens the latest announcement once per tab session and lets visitors dismiss it with Escape", async ({ page }) => {
    await page.goto("/");
    const dialog = page.getByRole("dialog", { name: /^Latest announcement/ });
    const latest = page.locator("#home-notices h3 a").first();
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("heading")).toHaveText(await latest.innerText());
    await expect(dialog.getByRole("button", { name: "Dismiss announcement" })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();

    await page.reload();
    await page.getByRole("button", { name: "Pause news ticker" }).click();
    await expect(dialog).toBeHidden();
  });

  test("opens the full latest notice from the announcement popup", async ({ page }) => {
    await page.goto("/");
    const latest = await page.locator("#home-notices h3 a").first().getAttribute("href");
    const dialog = page.getByRole("dialog", { name: /^Latest announcement/ });
    const link = dialog.getByRole("link", { name: "Read full announcement" });
    await expect(link).toHaveAttribute("href", latest!);
    await link.click();
    await expect(page).toHaveURL(latest!);
    await expect(dialog).toBeHidden();
  });

  test("renders DB content", async ({ page }) => {
    await page.goto("/");
    await dismissLatestAnnouncement(page);
    await expect(page.getByRole("heading", { level: 1, name: "Results" })).toBeVisible();
    await expect(page.getByRole("region", { name: "Our record in numbers" }).getByText("Candidates tested", { exact: true })).toBeVisible();
    await expect(page.locator("main :is(#quote-title, #services-title, #protect-title, #journeys-title)")).toHaveCount(0);
    await expect(page.locator("#home-notices li")).toHaveCount(5);
    await expect(page.locator("#home-tests article")).toHaveCount(7);
    await expect(page.locator("#home-schedule li")).toHaveCount(4);
    await expect(page.getByRole("link", { name: "Law Admission Test" }).first()).toHaveAttribute("href", "/tests/lat");
    const shortcuts = page.getByRole("navigation", { name: "Candidate shortcuts" });
    await expect(shortcuts.getByRole("link", { name: "Open Applications" })).toHaveAttribute("href", "/open-applications");
    await expect(shortcuts.getByRole("link", { name: "List of Candidates" })).toHaveAttribute("href", "/candidates");
    await expect(shortcuts.getByRole("link", { name: "All Results" })).toHaveAttribute("href", "/results");
  });

  test("homepage shows results before announcements and links to the archive", async ({ page }) => {
    await page.goto("/");
    const sections = page.locator("main > section");
    await expect(sections.nth(0)).toHaveAttribute("aria-labelledby", "home-results-title");
    await expect(sections.nth(1)).toHaveAttribute("aria-labelledby", "news-title");
    await expect(page.locator("main :is([data-carousel], #qa-title)")).toHaveCount(0);
    await dismissLatestAnnouncement(page);
    const recent = sections.nth(0).getByRole("list", { name: "Result notices" }).getByRole("link");
    await expect(recent).toHaveCount(3);
    const recentLinks = await recent.evaluateAll((links) => links.map((link) => link.getAttribute("href")));

    await page.getByRole("link", { name: "View all results" }).click();
    await expect(page).toHaveURL(/\/results$/);
    const archive = page.getByRole("list", { name: "Result notices" }).getByRole("link");
    const archiveLinks = await archive.evaluateAll((links) => links.map((link) => link.getAttribute("href")));
    expect(archiveLinks.slice(0, 3)).toEqual(recentLinks);
  });
});

test("application directory separates closed notices from open applications", async ({ page }) => {
  await page.goto("/open-applications");
  await expect(page.getByRole("heading", { level: 1, name: "Open Applications" })).toBeVisible();
  const status = page.getByRole("navigation", { name: "Application status" });
  await expect(status.getByRole("link", { name: "Open applications" })).toHaveAttribute("aria-current", "page");
  await status.getByRole("link", { name: "Closed applications" }).click();
  await expect(page).toHaveURL(/status=closed/);
  const closed = page.getByRole("list", { name: "Closed applications" });
  await expect(closed.getByRole("link", { name: /View notice for USAT December 2026/ })).toHaveAttribute("href", "/news/usat-reg-dec-2026");
});

test("candidate directory switches to past test sessions", async ({ page }) => {
  await page.goto("/candidates");
  await expect(page.getByRole("heading", { level: 1, name: "List of Candidates" })).toBeVisible();
  const period = page.getByRole("navigation", { name: "Session period" });
  await expect(period.getByRole("link", { name: "Upcoming sessions" })).toHaveAttribute("aria-current", "page");
  await period.getByRole("link", { name: "Past sessions" }).click();
  await expect(page).toHaveURL(/session=past/);
  const past = page.getByRole("list", { name: "Past test sessions" });
  await expect(past.getByRole("link", { name: /Test details for LAW-GAT Q4 2026/ })).toHaveAttribute("href", "/tests/law-gat#schedule");
});

test("results archive filters by test and search term", async ({ page }) => {
  await page.goto("/results");
  await expect(page.getByRole("heading", { level: 1, name: "Test Results" })).toBeVisible();
  await page.getByLabel("Related test").selectOption("usat");
  await expect(page).toHaveURL(/test=usat/);
  const notices = page.getByRole("list", { name: "Result notices" });
  await expect(notices.getByRole("link", { name: "USAT September 2026 results announced" })).toHaveAttribute("href", "/news/usat-result-sep-2026");
  await expect(notices.getByRole("link", { name: /LAW-GAT/ })).toHaveCount(0);
  await page.getByLabel("Search result notices").fill("no-matching-result-for-e2e");
  await expect(page.getByText("No results match your filters.")).toBeVisible();
  await page.getByRole("link", { name: "Reset filters" }).click();
  await expect(page).toHaveURL(/\/results$/);
  await expect(notices.getByRole("link", { name: /LAW-GAT/ })).toBeVisible();
});

const STATIC_PAGES: [string, string[]][] = [
  ["/about", ["overview", "history", "mandate", "vision", "governance", "leadership"]],
  ["/quality", ["workflow", "item-bank", "psychometrics", "qa", "security"]],
  ["/institutions", ["services", "process", "clients", "enquiry"]],
  ["/candidate-services", ["schedule", "register", "admit-card", "results", "test-day", "accessibility", "policies", "unfair-means"]],
];

for (const [path, anchors] of STATIC_PAGES) {
  test(`${path} renders with one h1 and its nav anchors`, async ({ page }) => {
    const res = await page.goto(path);
    expect(res!.status()).toBe(200);
    await expect(page.locator("main h1")).toHaveCount(1);
    for (const id of anchors) await expect(page.locator(`#${id}`), `#${id} on ${path}`).toHaveCount(1);
  });
}

test("about shows the three leadership messages from the database", async ({ page }) => {
  await page.goto("/about#leadership");
  const section = page.locator("#leadership");
  await expect(section.locator("section")).toHaveCount(3);
  await expect(section.getByText("Executive Director, Higher Education Commission")).toBeVisible();
});

test("institutions lists clients by sector and shows the enquiry form", async ({ page }) => {
  await page.goto("/institutions");
  await expect(page.locator("#clients").getByText("Quaid-i-Azam University")).toBeVisible();
  await expect(page.getByLabel(/Organization/)).toBeVisible();
});

test("candidate services schedule table comes from the database", async ({ page }) => {
  await page.goto("/candidate-services");
  await expect(page.locator("#schedule tbody tr")).toHaveCount(5);
  await expect(page.locator("#schedule").getByText("LAW-GAT Q4 2026", { exact: true })).toBeVisible();
});

test("quality workflow tabs switch by keyboard", async ({ page }) => {
  await page.goto("/quality");
  const first = page.getByRole("tab", { name: /Test blueprint/ });
  await first.click();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("tab", { name: /Item development/ })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("heading", { level: 3, name: "Item development" })).toBeVisible();
});

test("quality workflow advances automatically with a fade", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/quality#workflow");
  const workflow = page.locator("#workflow");
  await workflow.getByRole("tabpanel").scrollIntoViewIfNeeded();
  await expect(workflow.getByRole("tab", { name: /Item development/ })).toHaveAttribute("aria-selected", "true", { timeout: 14_000 });
  await expect(workflow.getByRole("tabpanel")).toHaveCSS("transition-duration", "0.3s");
  await expect(workflow.getByRole("button", { name: /autoplay|play workflow/i })).toHaveCount(0);
});

test.describe("tests", () => {
  test("directory filters by purpose and level with URL state", async ({ page }) => {
    await page.goto("/tests");
    await expect(page.locator("#test-grid article")).toHaveCount(7);
    await page.getByRole("link", { name: "Postgraduate & scholarships" }).click();
    await expect(page).toHaveURL(/category=postgraduate/);
    await expect(page.locator("#test-grid article")).toHaveCount(2);
    await page.getByRole("link", { name: "PhD", exact: true }).click();
    await expect(page.locator("#test-grid article")).toHaveCount(1);
    await expect(page.getByText("Showing 1 of 7 tests")).toBeVisible();
    await page.goto("/tests?category=licensing&level=PhD");
    await expect(page.getByText("No tests match these filters.").first()).toBeVisible();
    await expect(page.locator("#compare-body tr")).toHaveCount(7);
  });

  test("/tests/usat shows the TOS table with Common Core total 45", async ({ page }) => {
    await page.goto("/tests/usat");
    await expect(page.getByRole("heading", { level: 1, name: "Undergraduate Studies Admission Test" })).toBeVisible();
    const row = page.getByRole("row", { name: /Common Core total/ });
    await expect(row).toContainText("45");
    await page.getByRole("tab", { name: "USAT-M" }).click();
    await expect(page.getByText("Physics 8 • Chemistry 8 • Biology 14")).toBeVisible();
  });

  test("/tests/customized shows By agreement and the enquiry route", async ({ page }) => {
    await page.goto("/tests/customized");
    await expect(page.locator("#fees").getByText("By agreement")).toBeVisible();
    await expect(page.getByRole("link", { name: "Submit an enquiry" })).toHaveAttribute("href", "/institutions#enquiry");
  });

  test("/tests/unknown is 404 with the test-not-found page", async ({ page }) => {
    const res = await page.goto("/tests/unknown");
    expect(res!.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1, name: "Test not found" })).toBeVisible();
  });
});

test.describe("news", () => {
  test("filter by type=result shows only results and keeps URL state", async ({ page }) => {
    await page.goto("/news?type=result");
    const chips = page.locator("#notice-list").getByTestId("status-chip");
    await expect(chips.first()).toBeVisible();
    for (const chip of await chips.all()) await expect(chip).toHaveText("Result announced");
    await expect(page.getByLabel("Notice type")).toHaveValue("result");
  });

  test("changing a filter updates the list and the URL", async ({ page }) => {
    await page.goto("/news");
    await page.getByLabel("Related test").selectOption("usat");
    await expect(page).toHaveURL(/test=usat/);
    await expect(page.locator("#notice-list li").first()).toContainText("USAT");
  });

  test("no matches shows the empty state with a reset link", async ({ page }) => {
    await page.goto("/news?q=zzzzzz");
    await expect(page.getByText("No notices match your filters.")).toBeVisible();
    await page.getByRole("link", { name: "Reset filters" }).click();
    await expect(page).toHaveURL(/\/news$/);
  });

  // Review Focus 4
  test("garbage params render normally", async ({ page }) => {
    for (const q of ["?page=999", "?page=abc", "?type=foo", "?test=nope&period=7"]) {
      const res = await page.goto("/news" + q);
      expect(res!.status(), q).toBe(200);
      await expect(page.locator("#notice-list li").first()).toBeVisible();
    }
  });

  test("pagination moves to page 2 and focuses the result count", async ({ page }) => {
    await page.goto("/news");
    await page.getByRole("link", { name: "Page 2" }).click();
    await expect(page).toHaveURL(/page=2/);
    await expect(page.getByRole("status").filter({ hasText: /Showing 9–/ })).toBeFocused();
  });

  test("/news/usat-reg-dec-2026 renders body, attachments and related notices", async ({ page }) => {
    await page.goto("/news/usat-reg-dec-2026");
    await expect(page.getByRole("heading", { level: 1, name: "USAT December 2026 session: registration open" })).toBeVisible();
    await expect(page.getByText(/Registration for the Undergraduate Studies Admission Test/)).toBeVisible();
    await expect(page.getByRole("link", { name: /USAT December 2026 — official notice/ })).toHaveAttribute("href", /sample\.pdf$/);
    await expect(page.getByRole("heading", { name: "Related notices" })).toBeVisible();
  });

  test("/news/unknown is 404 with the notice-not-found page", async ({ page }) => {
    const res = await page.goto("/news/unknown");
    expect(res!.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1, name: "Notice not found" })).toBeVisible();
  });
});

test.describe("resources, faqs, contact", () => {
  test("/resources?type=policy shows 3 cards with PDF links", async ({ page }) => {
    await page.goto("/resources?type=policy");
    await expect(page.locator("#resource-list > li")).toHaveCount(3);
    await expect(page.locator("#resource-list a").first()).toHaveAttribute("href", /\.pdf$/);
    await expect(page.getByLabel("Resource type")).toHaveValue("policy");
  });

  test("resources search with no match shows the empty state", async ({ page }) => {
    await page.goto("/resources?q=zzzz");
    await expect(page.getByText("No resources match your filters.")).toBeVisible();
  });

  test("FAQ search filters live and counts results", async ({ page }) => {
    await page.goto("/faqs");
    await expect(page.getByRole("status")).toHaveText("19 questions");
    await page.getByLabel("Search questions").fill("admit card");
    await expect(page.getByRole("status")).toHaveText("4 questions matching “admit card”");
    await page.getByLabel("Search questions").fill("zzzz");
    await expect(page.getByText("No questions match your search.")).toBeVisible();
  });

  test("FAQ topics filter and the accordion opens an answer", async ({ page }) => {
    await page.goto("/faqs");
    await page.getByRole("group", { name: "Topics" }).getByRole("button", { name: /Fees/ }).click();
    await expect(page.getByRole("status")).toHaveText("2 questions");
    const q = page.getByRole("button", { name: /How much does each test cost\?/ });
    await q.click();
    await expect(q).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByText(/LAT Rs\. 2,000/)).toBeVisible();
  });

  test("/contact shows settings-driven support details and the form", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.locator("#support")).toContainText("051-90408184");
    await expect(page.locator("#office")).toContainText("Higher Education Commission, Islamabad");
    await expect(page.getByLabel(/Full name/)).toBeVisible();
    await expect(page.getByLabel(/Subject/)).toBeVisible();
  });
});
