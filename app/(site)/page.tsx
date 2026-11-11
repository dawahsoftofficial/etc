import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { Carousel } from "@/components/site/Carousel";
import {
  Announcements,
  ChairmanQuote,
  ClientsMarquee,
  FindYourTest,
  Journeys,
  Numbers,
  Protect,
  QuickActions,
  Services,
} from "@/components/site/home/HomeSections";
import { getClients, getHeroSlides, getSchedule, getStats } from "@/lib/content/home";
import { getLeader } from "@/lib/content/leaders";
import { getMediaByKeys, SECTION_IMAGES } from "@/lib/content/media";
import { getLatestNotices } from "@/lib/content/notices";
import { getPublishedTests } from "@/lib/content/tests";

export const metadata: Metadata = pageMetadata({
  title: { absolute: "Education Testing Council | Higher Education Commission, Pakistan" },
  description:
    "Standardized, secure and merit-based assessment for admissions, scholarships, licensing and careers across Pakistan.",
  path: "/",
});

export default async function HomePage() {
  const [slides, notices, schedule, tests, stats, chairman, clients, media] = await Promise.all([
    getHeroSlides(),
    getLatestNotices(5),
    getSchedule(),
    getPublishedTests(),
    getStats(),
    getLeader("CHAIRMAN"),
    getClients(),
    getMediaByKeys([SECTION_IMAGES.institutions, SECTION_IMAGES.qualityOmr, SECTION_IMAGES.qualitySealed]),
  ]);
  const img = (key: string) => media[key] ?? { url: "/brand/etc-crest.png", alt: "" };
  // The A4 cover's three headline figures, read from the homepage numbers so admins keep them current.
  const stat = (label: string) => stats.find((st) => st.label === label);
  const candidates = stat("Candidates tested");
  const centres = stat("Test centres");
  const cities = stat("Cities");
  const items = stat("Calibrated test items");
  const coverStats = [
    candidates && {
      value: candidates.value >= 1_000_000 ? `${Number((candidates.value / 1_000_000).toFixed(2))} million` : candidates.value.toLocaleString("en-US"),
      label: `Candidates tested ${candidates.note.toLowerCase()}`,
    },
    centres && { value: centres.value.toLocaleString("en-US"), label: cities ? `Test centres in ${cities.value} cities` : "Test centres" },
    items && { value: items.value.toLocaleString("en-US"), label: items.label },
  ].filter((x): x is { value: string; label: string } => Boolean(x));

  return (
    <>
      <Carousel
        slides={slides}
        firstSlideExtra={
          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-1 border-y border-gold-500/50 py-3 font-serif text-base text-gold-300 sm:mt-7 sm:gap-x-6 sm:py-4 sm:text-xl">
            {["Merit", "Transparency", "Fairness", "Quality"].map((v) => (
              <li key={v}>{v}</li>
            ))}
          </ul>
        }
        aside={
          coverStats.length > 0 && (
            <dl className="ml-auto hidden grid-cols-3 gap-6 lg:grid">
              {coverStats.map((c) => (
                <div key={c.label} className="flex w-44 flex-col border-t-2 border-gold-500 pt-3">
                  <dt className="order-2 mt-1 text-xs leading-snug text-white/75">{c.label}</dt>
                  <dd className="order-1 font-serif text-2xl text-white">{c.value}</dd>
                </div>
              ))}
            </dl>
          )
        }
      />
      <QuickActions />
      <Announcements notices={notices} schedule={schedule} />
      <FindYourTest tests={tests} />
      <Journeys institutionsImage={img(SECTION_IMAGES.institutions).url} />
      <Numbers stats={stats} />
      <Protect omr={img(SECTION_IMAGES.qualityOmr)} sealed={img(SECTION_IMAGES.qualitySealed)} />
      <Services />
      <ChairmanQuote leader={chairman} />
      <ClientsMarquee clients={clients} />
    </>
  );
}
