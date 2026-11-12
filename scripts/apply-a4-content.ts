// One-off content update for databases seeded before the 2026 A4 Institutional Profile (e.g. ETCStaging).
// The seed only fills empty tables, so existing rows keep the old placeholder content. This script replaces a value
// only while it still equals the old seeded value — anything an editor changed in the admin panel is left alone.
//
// Usage: npx tsx scripts/apply-a4-content.ts            (dry run: prints what would change)
//        npx tsx scripts/apply-a4-content.ts --apply    (writes, and records each change in the audit log)
// Afterwards restart the app (or clear .next/cache) so cached pages pick up the new content.
import { Prisma, PrismaClient } from "@prisma/client";
import data from "../prisma/seed-data/mockup.json";
import { CLIENTS_2026, nsctPhoto, nsctTest, RESULT_VALIDITY_FAQ, TEST_VALIDITY } from "../prisma/seed-data/a4-2026";
import { heroCoverPhoto, heroSlides } from "../prisma/seed-data/hero";
import { leaderPhotos, leaders } from "../prisma/seed-data/leaders";
import { settingsDefaults } from "../prisma/seed-data/settings";

const apply = process.argv.includes("--apply");
const prisma = new PrismaClient();
const changes: string[] = [];

// Every name/title the seed has used before, per role: a leader still holding one of these was never edited by hand.
const PREVIOUS_LEADERS: Record<string, { names: string[]; titles: string[] }> = {
  CHAIRMAN: {
    names: ["Dr Muhammad Imtiaz Haider", "Prof. Dr Niaz Ahmed Akhtar"],
    titles: ["Chairman, Board of Governors", "Chairman, Higher Education Commission"],
  },
  EXECUTIVE_DIRECTOR: {
    names: ["Dr Muhammad Imtiaz Haider", "Dr. Zia Ul Haq"],
    titles: ["Executive Director, Higher Education Commission"],
  },
  CEO: { names: ["Dr Muhammad Imtiaz Haider"], titles: ["Chief Executive Officer, ETC", "Chief Executive Officer, Education Testing Council"] },
};
// Portraits added on 2026-11-09 under each other's names (the Chairman's and Executive Director's photos were swapped).
const MISLABELLED_PHOTOS = ["local/img/leaders/niaz-ahmed-akhtar.jpg", "local/img/leaders/zia-ul-haq.jpg"];
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

  // Leader portraits from the booklet, and the hero cover photo.
  for (const photo of [...Object.values(leaderPhotos), heroCoverPhoto, nsctPhoto]) {
    if (await prisma.media.findUnique({ where: { key: photo.key } })) continue;
    if (apply) await prisma.media.create({ data: { ...photo } });
    await audit("Media", photo.key, `Added image: ${photo.alt}`);
  }

  for (const next of leaders) {
    const row = await prisma.leader.findUnique({ where: { role: next.role }, include: { photo: { select: { key: true } } } });
    if (!row) continue;
    const { photoKey, ...fields } = next;
    if (row.name === next.name && row.title === next.title && row.photo?.key === photoKey) continue; // already up to date
    const prev = PREVIOUS_LEADERS[next.role];
    const untouched = (row.name === next.name || prev.names.includes(row.name)) && (row.title === next.title || prev.titles.includes(row.title));
    if (!untouched) {
      console.log(`  skip leader ${next.role}: edited in the admin panel`);
      continue;
    }
    if (apply) {
      const photo = await prisma.media.findUniqueOrThrow({ where: { key: photoKey } });
      await prisma.leader.update({ where: { role: next.role }, data: { ...fields, photoId: photo.id } });
    }
    await audit("Leader", next.role, `${next.title}: ${next.name}, with the booklet portrait`);
  }

  // Remove the swapped portraits once nothing uses them (a wrong face under a leader's name must not stay in the library).
  for (const key of MISLABELLED_PHOTOS) {
    const m = await prisma.media.findUnique({ where: { key } });
    if (!m) continue;
    const used = apply
      ? (await prisma.leader.count({ where: { photoId: m.id } })) +
        (await prisma.test.count({ where: { imageId: m.id } })) +
        (await prisma.heroSlide.count({ where: { imageId: m.id } })) +
        (await prisma.resource.count({ where: { mediaId: m.id } })) +
        (await prisma.noticeAttachment.count({ where: { mediaId: m.id } }))
      : 0;
    if (used) {
      console.log(`  keep ${key}: still used somewhere`);
      continue;
    }
    if (apply) await prisma.media.delete({ where: { id: m.id } });
    await audit("Media", key, "Removed a mislabelled portrait (Chairman and Executive Director photos were swapped)");
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

  // ---- Updated A4 profile (Shoaib 3c92ccd) ----

  // Result validity on LAT, HAT, USAT and LAW-GAT (only where not set yet).
  for (const [slug, validity] of Object.entries(TEST_VALIDITY)) {
    const t = await prisma.test.findUnique({ where: { slug } });
    if (!t || t.validity) continue;
    if (apply) await prisma.test.update({ where: { slug }, data: { validity } });
    await audit("Test", slug, `Result validity: ${validity}`);
  }

  // The NSCT (new in the booklet), after USAT and before customized tests.
  if (!(await prisma.test.findUnique({ where: { slug: nsctTest.slug } }))) {
    if (apply) {
      const photo = await prisma.media.findUniqueOrThrow({ where: { key: nsctPhoto.key } });
      const { sections, categories: _c, ...t } = nsctTest;
      await prisma.test.create({
        data: { ...t, categories: Prisma.DbNull, tos: Prisma.DbNull, imageId: photo.id, sections: { create: sections.map((x, order) => ({ ...x, order })) } },
      });
      await prisma.test.updateMany({ where: { slug: "customized", sortOrder: 5 }, data: { sortOrder: 6 } });
    }
    await audit("Test", nsctTest.slug, `Added ${nsctTest.code}: ${nsctTest.name}`);
  }

  // FAQ: how long a result is valid (only while it still has the original vague answer).
  const faq = await prisma.faq.findFirst({ where: { question: RESULT_VALIDITY_FAQ.question, answer: { startsWith: "Validity depends on the test" } } });
  if (faq) {
    if (apply) await prisma.faq.update({ where: { id: faq.id }, data: { answer: RESULT_VALIDITY_FAQ.answer } });
    await audit("Faq", String(faq.id), `Answered “${RESULT_VALIDITY_FAQ.question}” with the booklet's validity periods`);
  }

  // First hero slide: the updated cover wording (only while it shows the first cover version).
  const coverNow = await prisma.heroSlide.findFirst({ where: { title: heroSlides[0].title, body: { startsWith: "A national assessment platform opening pathways" } } });
  if (coverNow) {
    if (apply) await prisma.heroSlide.update({ where: { id: coverNow.id }, data: { eyebrow: heroSlides[0].eyebrow, body: heroSlides[0].body } });
    await audit("HeroSlide", String(coverNow.id), `Cover wording: “${heroSlides[0].eyebrow}”`);
  }

  // Clients: the booklet's 48 "Our Clients", only if the list is still exactly the original mockup list.
  const current = (await prisma.client.findMany({ select: { name: true } })).map((c) => c.name).sort();
  const original = data.clients.map((c) => c.name).sort();
  if (current.length === original.length && current.every((n, i) => n === original[i])) {
    if (apply) {
      await prisma.$transaction([
        prisma.client.deleteMany({}),
        prisma.client.createMany({ data: CLIENTS_2026.map(([name, sector], order) => ({ name, sector, order })) }),
      ]);
    }
    await audit("Client", "all", `Replaced the ${original.length} mockup clients with the booklet's ${CLIENTS_2026.length}`);
  } else if (current.length !== CLIENTS_2026.length) {
    console.log("  skip clients: the list was edited in the admin panel");
  }

  // ---- Site photos now served from Spaces (ETC/mockup/site/) instead of the app's public/ folder ----
  const LOCAL_TO_SPACES: [local: string, spaces: string][] = [
    ["local/img/leaders/niaz-ahmed-akhtar.webp", leaderPhotos.chairman.key],
    ["local/img/leaders/zia-ul-haq.webp", leaderPhotos.executiveDirector.key],
    ["local/img/leaders/imtiaz-haider.webp", leaderPhotos.ceo.key],
    ["local/img/leaders/imtiaz-haider.jpg", leaderPhotos.ceo.key],
    ["local/img/hero/cover-assessment.jpg", heroCoverPhoto.key],
    ["local/img/tests/nsct-cbt.jpg", nsctPhoto.key],
  ];
  for (const [localKey, spacesKey] of LOCAL_TO_SPACES) {
    const local = await prisma.media.findUnique({ where: { key: localKey } });
    if (!local) continue;
    if (apply) {
      const target = await prisma.media.findUniqueOrThrow({ where: { key: spacesKey } });
      await prisma.$transaction([
        prisma.leader.updateMany({ where: { photoId: local.id }, data: { photoId: target.id } }),
        prisma.heroSlide.updateMany({ where: { imageId: local.id }, data: { imageId: target.id } }),
        prisma.test.updateMany({ where: { imageId: local.id }, data: { imageId: target.id } }),
        prisma.resource.updateMany({ where: { mediaId: local.id }, data: { mediaId: target.id } }),
        prisma.noticeAttachment.updateMany({ where: { mediaId: local.id }, data: { mediaId: target.id } }),
        prisma.media.delete({ where: { id: local.id } }),
      ]);
    }
    await audit("Media", localKey, `Now served from Spaces: ${spacesKey}`);
  }

  console.log(changes.length ? changes.map((c) => `  ${apply ? "changed" : "would change"} ${c}`).join("\n") : "  nothing to change");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
