import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { ADMIN, EDITOR, login } from "./fixtures";

const prisma = new PrismaClient();
let helpline = "";
let quote = "";

test.beforeAll(async () => {
  helpline = (await prisma.setting.findUniqueOrThrow({ where: { key: "helpline" } })).value;
  quote = (await prisma.leader.findUniqueOrThrow({ where: { role: "CHAIRMAN" } })).quote;
});

// Each test restores what it changed through the admin form, so the site's cache is refreshed too (a direct database
// write would leave the edited value showing on public pages for the rest of the run). afterAll is only a safety net.
test.afterAll(async () => {
  await prisma.setting.update({ where: { key: "helpline" }, data: { value: helpline } });
  await prisma.leader.update({ where: { role: "CHAIRMAN" }, data: { quote } });
  await prisma.$disconnect();
});

test("an admin changes the helpline and the footer and contact page show it", async ({ page }) => {
  await login(page, ADMIN);
  await page.goto("/admin/settings");
  await page.getByLabel(/^Helpline/).fill("E2E 051-0000000");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("status").filter({ hasText: /^Saved$/ })).toBeVisible();
  await page.goto("/contact");
  await expect(page.locator("#support")).toContainText("E2E 051-0000000");
  await expect(page.getByRole("contentinfo")).toContainText("E2E 051-0000000");

  await page.goto("/admin/settings");
  await page.getByLabel(/^Helpline/).fill(helpline);
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("status").filter({ hasText: /^Saved$/ })).toBeVisible();
  await page.goto("/contact");
  await expect(page.locator("#support")).toContainText(helpline);
});

test("an invalid notification email is refused", async ({ page }) => {
  await login(page, ADMIN);
  await page.goto("/admin/settings");
  await page.getByLabel(/^Enquiry notifications/).fill("not-an-email");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.locator("main").getByRole("alert")).toContainText("Enter an email address like name@example.com.");
});

test("editors get the 403 page on settings", async ({ page }) => {
  await login(page, EDITOR);
  await page.goto("/admin/settings");
  await expect(page.getByRole("heading", { name: "You don’t have access to this page." })).toBeVisible();
});

test("editing the Chairman's quote shows on the homepage", async ({ page }) => {
  await login(page, EDITOR);
  await page.goto("/admin/leaders");
  await page.getByRole("link", { name: /Chairman/ }).first().click();
  await page.getByLabel(/^Quote/).fill("E2E Merit opens every door.");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("status").filter({ hasText: /^Saved$/ })).toBeVisible();
  await page.goto("/");
  await expect(page.getByText("“E2E Merit opens every door.”")).toBeVisible();

  await page.goto("/admin/leaders");
  await page.getByRole("link", { name: /Chairman/ }).first().click();
  await page.getByLabel(/^Quote/).fill(quote);
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("status").filter({ hasText: /^Saved$/ })).toBeVisible();
  await page.goto("/");
  await expect(page.getByText(`“${quote}”`)).toBeVisible();
});
