import { test, expect } from "@playwright/test";

// Content from the 2026 A4 Institutional Profile (a4/index.html), the client's current source of truth.

test("leadership: the HEC Chairman, the HEC Executive Director and the ETC CEO, each with their own portrait", async ({ page }) => {
  await page.goto("/about#leadership");
  const section = page.locator("#leadership");
  await expect(section.getByText("Prof. Dr Niaz Ahmed Akhtar")).toBeVisible();
  await expect(section.getByText("Chairman, Higher Education Commission", { exact: true })).toBeVisible();
  await expect(section.getByText("Dr. Zia Ul Haq")).toBeVisible();
  await expect(section.getByText("Executive Director, Higher Education Commission", { exact: true })).toBeVisible();
  await expect(section.getByText("Dr Muhammad Imtiaz Haider")).toHaveCount(1);
  await expect(section.getByText("Chief Executive Officer, Education Testing Council", { exact: true })).toBeVisible();
  await expect(section).toContainText("For a candidate, a single test result can influence the course of a life.");
  const photos = await section.locator("img").evaluateAll((imgs) => imgs.map((i) => (i as HTMLImageElement).currentSrc));
  expect(new Set(photos).size).toBe(3);
});

test("home: the Chairman's message and the record in numbers", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("A fair test opens a door. Our responsibility is to ensure that it opens on the strength of merit.")).toBeVisible();
  await expect(page.getByText("Prof. Dr Niaz Ahmed Akhtar").first()).toBeVisible();
  await expect(page.getByText(/2 M\s+candidates tested since 2017/)).toBeAttached();
  const numbers = page.locator(`section[aria-labelledby="numbers-title"]`);
  await expect(numbers).toContainText("251,685");
  await expect(numbers).toContainText("203");
  await expect(numbers).not.toContainText("230,685");
});

test("about: current figures, international administration, vision and the five priorities", async ({ page }) => {
  await page.goto("/about");
  await expect(page.locator("#history")).toContainText("203 test centres in 40 cities");
  await expect(page.locator("#overview")).toContainText("United Arab Emirates, Saudi Arabia, Afghanistan, Bangladesh and Sri Lanka");
  await expect(page.locator("#vision")).toContainText("with an unwavering commitment to quality, fairness and excellence");
  const roadmap = page.locator("#roadmap");
  for (const p of ["Digital transformation", "Research and innovation", "Quality and certification", "Institutional capacity", "Stakeholder confidence"]) {
    await expect(roadmap.getByText(p, { exact: true })).toBeVisible();
  }
});

test("quality: item bank size, expert reviews, item analysis rules, reliability and validity, and the glossary", async ({ page }) => {
  await page.goto("/quality");
  await expect(page.locator("#item-bank")).toContainText("251,685");
  const qa = page.locator("#qa");
  for (const r of ["Content and subject review", "Technical review", "Language review", "Fairness review", "Final review"]) {
    await expect(qa.getByText(r, { exact: true })).toBeVisible();
  }
  const ps = page.locator("#psychometrics");
  await expect(ps).toContainText("fewer than 5%");
  await expect(ps).toContainText("0.7–1.3");
  await expect(ps).toContainText("Mantel–Haenszel");
  await expect(ps).toContainText("Test–retest");
  await expect(ps).toContainText("Criterion relationships");
  const glossary = page.locator("#glossary");
  await expect(glossary.getByRole("heading", { name: "Assessment glossary" })).toBeVisible();
  await expect(glossary.locator("dt")).toHaveCount(25);
  await expect(page.getByRole("navigation", { name: "On this page" }).getByRole("link", { name: "Glossary" })).toHaveAttribute("href", "#glossary");
});

test("institutions and candidate services carry the booklet's additions", async ({ page }) => {
  await page.goto("/institutions");
  await expect(page.locator("main")).toContainText("251,685 calibrated items");
  await expect(page.locator("main")).toContainText("Pakistan’s embassies");
  await page.goto("/candidate-services");
  const accountable = page.locator("#policies");
  await expect(accountable.getByRole("heading", { name: "How we remain accountable" })).toBeVisible();
  for (const a of ["Published rules", "Communication channels", "Unfair-means hearings", "Post-test review", "Oversight"]) {
    await expect(accountable.getByText(a, { exact: true })).toBeVisible();
  }
});

test("contact details from the booklet", async ({ page }) => {
  await page.goto("/contact");
  await expect(page.locator("#support")).toContainText("051-90408184");
  await expect(page.locator("#support")).toContainText("etc@hec.gov.pk");
  await expect(page.locator("#office")).toContainText("Higher Education Commission, Islamabad");
  await expect(page.locator("main")).not.toContainText("[to be provided]");
});
