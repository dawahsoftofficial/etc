import { test, expect } from "@playwright/test";

test.describe("desktop chrome", () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test("mega-menu opens by keyboard and Escape returns focus", async ({ page }) => {
    await page.goto("/");
    const trigger = page.getByRole("button", { name: "Tests & Assessments" });
    await trigger.focus();
    await page.keyboard.press("Enter");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByRole("link", { name: "USAT", exact: true }).first()).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(trigger).toBeFocused();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  test("mega-menu opens on hover, stays open while the pointer moves into the panel, and closes when it leaves", async ({ page }) => {
    await page.goto("/");
    const about = page.getByRole("button", { name: "About ETC" });
    const tests = page.getByRole("button", { name: "Tests & Assessments" });
    await about.hover();
    await expect(about).toHaveAttribute("aria-expanded", "true");
    const panel = page.locator("#mega-about");
    await expect(panel).toBeVisible();
    // travel down into the panel and use a link there
    const box = (await panel.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + 40, { steps: 8 });
    await expect(about).toHaveAttribute("aria-expanded", "true");
    // moving across to the next item swaps panels
    await tests.hover();
    await expect(tests).toHaveAttribute("aria-expanded", "true");
    await expect(about).toHaveAttribute("aria-expanded", "false");
    // leaving the menu closes it
    await page.mouse.move(640, 800, { steps: 8 });
    await expect(tests).toHaveAttribute("aria-expanded", "false");
    // a click after hovering keeps the panel open rather than toggling it shut
    await about.hover();
    await expect(about).toHaveAttribute("aria-expanded", "true");
    await about.click();
    await expect(about).toHaveAttribute("aria-expanded", "true");
  });

  test("only one mega panel is open at a time and an outside click closes it", async ({ page }) => {
    await page.goto("/");
    const about = page.getByRole("button", { name: "About ETC" });
    const tests = page.getByRole("button", { name: "Tests & Assessments" });
    await about.click();
    await tests.click();
    await expect(about).toHaveAttribute("aria-expanded", "false");
    await expect(tests).toHaveAttribute("aria-expanded", "true");
    await page.mouse.click(10, 700);
    await expect(tests).toHaveAttribute("aria-expanded", "false");
  });

  test("current section is marked on detail pages", async ({ page }) => {
    await page.goto("/tests/usat");
    await expect(page.getByRole("button", { name: "Tests & Assessments" })).toHaveAttribute("aria-current", "page");
  });

  test("footer and quick links render settings-driven content", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("contentinfo")).toContainText("Merit · Transparency · Fairness · Quality");
    await expect(page.getByRole("link", { name: /Results.*official ETC portal/ }).first()).toHaveAttribute("target", "_blank");
  });
});

test.describe("mobile drawer", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("drawer opens full screen, above the sticky header, with a usable menu", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();
    const dialog = page.getByRole("dialog", { name: "Site menu" });
    // the header's backdrop-filter once trapped this fixed drawer inside the 72px header
    const box = (await dialog.boundingBox())!;
    expect(box.y).toBe(0);
    expect(box.height).toBe(812);
    const item = dialog.getByText("Tests & Assessments", { exact: true });
    await item.click();
    await dialog.getByRole("link", { name: "USAT", exact: true }).click();
    await expect(page).toHaveURL(/\/tests\/usat$/);
    await expect(dialog).toBeHidden();
  });

  test("drawer traps focus and returns it on close", async ({ page }) => {
    await page.goto("/");
    const toggle = page.getByRole("button", { name: "Open menu" });
    await toggle.click();
    const dialog = page.getByRole("dialog", { name: "Site menu" });
    await expect(dialog).toBeVisible();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    // Shift+Tab from the first focusable wraps to the last one inside the drawer
    await page.keyboard.press("Shift+Tab");
    await expect(dialog.getByRole("link", { name: "Find a Test" })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(dialog.getByRole("button", { name: "Close menu" })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(toggle).toBeFocused();
  });
});

test("unknown route shows the branded 404 with status 404", async ({ page }) => {
  const res = await page.goto("/nope");
  expect(res!.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("We couldn’t find that page.");
  await expect(page.getByRole("banner")).toBeVisible();
});
