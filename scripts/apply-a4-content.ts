// One-off content update for databases seeded before the 2026 A4 Institutional Profile (e.g. ETCStaging).
// The seed only fills empty tables, so existing rows keep the old placeholder content. This script replaces a value
// only while it still equals the old seeded value — anything an editor changed in the admin panel is left alone.
//
// Usage: npx tsx scripts/apply-a4-content.ts            (dry run: prints what would change)
//        npx tsx scripts/apply-a4-content.ts --apply    (writes, and records each change in the audit log)
// Afterwards restart the app (or clear .next/cache) so cached pages pick up the new content.
import { statSync } from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import data from "../prisma/seed-data/mockup.json";
import { heroCoverPhoto, heroSlides } from "../prisma/seed-data/hero";
import { leaderPhotos, leaders } from "../prisma/seed-data/leaders";
import { settingsDefaults } from "../prisma/seed-data/settings";

const apply = process.argv.includes("--apply");
const prisma = new PrismaClient();
const changes: string[] = [];

const OLD_LEADER_NAME = "Dr Muhammad Imtiaz Haider";
const OLD_CEO_TITLE = "Chief Executive Officer, ETC";
const OLD_HERO_TITLE = "A fair test opens a door.";
const OLD_SETTINGS = {
  helpline: "[to be provided]",
  supportEmail: "[to be provided]",
  address: "Higher Education Commission, Sector H-9, Islamabad, Pakistan [to be confirmed]",
  officeHours: "[To be provided]",
} as const;
// [old label, old value, old note] → the row with the same order in the new seed data
const OLD_STATS: [label: string, value: number, note: string][] = [
  ["Candidates tested", 1852391, "Since 1 July 2021"],
  ["Test projects", 261, "Delivered for clients"],
  ["Question bank items", 230685, "Developed so far"],
  ["Test centres", 103, "Capacity of about 100,000"],
];

async function audit(entity: string, entityId: string, summary: string) {
  changes.push(`${entity} ${entityId}: ${summary}`);
  if (apply) await prisma.auditLog.create({ data: { action: "UPDATE", entity, entityId, summary: `${summary} (A4 profile 2026 content update)` } });
}

async function main() {
  const db = new URL(process.env.DATABASE_URL ?? "").pathname.slice(1);
  console.log(`${apply ? "Applying" : "Dry run"} against database ${db}`);

  // Portraits for the Chairman and Executive Director (the CEO's already exists).
  const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
  for (const photo of [...Object.values(leaderPhotos), heroCoverPhoto]) {
    if (await prisma.media.findUnique({ where: { key: photo.key } })) continue;
    if (apply) await prisma.media.create({ data: { ...photo, size: statSync(path.join(here, "../public", photo.url)).size } });
    await audit("Media", photo.key, `Added image: ${photo.alt}`);
  }

  for (const next of leaders) {
    const row = await prisma.leader.findUnique({ where: { role: next.role } });
    if (!row || (row.name === next.name && row.title === next.title)) continue; // missing, or already up to date
    const untouched = next.role === "CEO" ? row.title === OLD_CEO_TITLE : row.name === OLD_LEADER_NAME;
    if (!untouched) {
      console.log(`  skip leader ${next.role}: edited in the admin panel`);
      continue;
    }
    const { photoKey, ...fields } = next;
    if (apply) {
      const photo = await prisma.media.findUniqueOrThrow({ where: { key: photoKey } });
      await prisma.leader.update({ where: { role: next.role }, data: { ...fields, photoId: photo.id } });
    }
    await audit("Leader", next.role, `Updated ${next.title}: ${next.name}`);
  }

  // First hero slide → the A4 cover (only while it still shows the original mockup slide).
  const cover = heroSlides[0];
  const firstSlide = await prisma.heroSlide.findFirst({ where: { title: OLD_HERO_TITLE } });
  if (firstSlide) {
    if (apply) {
      const photo = await prisma.media.findUniqueOrThrow({ where: { key: heroCoverPhoto.key } });
      await prisma.heroSlide.update({ where: { id: firstSlide.id }, data: { title: cover.title, body: cover.body, eyebrow: cover.eyebrow, imageId: photo.id } });
    }
    await audit("HeroSlide", String(firstSlide.id), `First slide now the A4 cover: “${cover.title}”`);
  }

  for (const [key, old] of Object.entries(OLD_SETTINGS) as [keyof typeof OLD_SETTINGS, string][]) {
    const row = await prisma.setting.findUnique({ where: { key } });
    if (!row || row.value === settingsDefaults[key]) continue; // missing, or already up to date
    if (row.value !== old) {
      console.log(`  skip setting ${key}: edited in the admin panel`);
      continue;
    }
    if (apply) await prisma.setting.update({ where: { key }, data: { value: settingsDefaults[key] } });
    await audit("Setting", key, `Set ${key} to ${settingsDefaults[key]}`);
  }

  for (const [label, value, note] of OLD_STATS) {
    const row = await prisma.stat.findFirst({ where: { label } });
    if (!row) continue;
    const next = data.stats.find((s) => s.order === row.order)!;
    if (row.value === next.value && row.note === next.note) continue; // already up to date
    if (row.value !== value || row.note !== note) {
      console.log(`  skip stat ${label}: edited in the admin panel`);
      continue;
    }
    if (apply) await prisma.stat.update({ where: { id: row.id }, data: { value: next.value, label: next.label, note: next.note } });
    await audit("Stat", String(row.id), `${label} ${value} → ${next.label} ${next.value} (${next.note})`);
  }

  console.log(changes.length ? changes.map((c) => `  ${apply ? "changed" : "would change"} ${c}`).join("\n") : "  nothing to change");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
