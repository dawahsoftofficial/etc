import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import {
  Announcements,
  ClientsMarquee,
  FindYourTest,
  Numbers,
} from "@/components/site/home/HomeSections";
import { LatestAnnouncement } from "@/components/site/home/LatestAnnouncement";
import { getClients, getSchedule, getStats } from "@/lib/content/home";
import { getLatestNotices } from "@/lib/content/notices";
import { getPublishedTests } from "@/lib/content/tests";

export const metadata: Metadata = pageMetadata({
  title: { absolute: "Education Testing Council | Higher Education Commission, Pakistan" },
  description:
    "Standardized, secure and merit-based assessment for admissions, scholarships, licensing and careers across Pakistan.",
  path: "/",
});

export default async function HomePage() {
  const [notices, schedule, tests, stats, clients] = await Promise.all([
    getLatestNotices(5),
    getSchedule(),
    getPublishedTests(),
    getStats(),
    getClients(),
  ]);

  return (
    <>
      {notices[0] && <LatestAnnouncement key={notices[0].slug} notice={notices[0]} />}
      <Announcements notices={notices} schedule={schedule} />
      <FindYourTest tests={tests} />
      <Numbers stats={stats} />
      <ClientsMarquee clients={clients} />
    </>
  );
}
