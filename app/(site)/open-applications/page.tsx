import type { Metadata } from "next";
import Link from "next/link";
import { DirectoryHeader } from "@/components/site/DirectoryHeader";
import { PortalLink } from "@/components/site/PortalLink";
import { SampleChip, StatusChip } from "@/components/site/StatusChip";
import { Icon } from "@/components/ui/icon";
import { getApplicationNotices } from "@/lib/content/notices";
import { getSettings } from "@/lib/content/settings";
import { first, type SP } from "@/lib/filters";
import { formatDate, todayInKarachi, toIsoDate } from "@/lib/format";
import { NOTICE_TYPE } from "@/lib/labels";
import { pageMetadata } from "@/lib/seo";

const title = "Open Applications";
const description = "Find ETC admission and recruitment notices, application deadlines, and instructions for applying.";
export const metadata: Metadata = pageMetadata({ title, description, path: "/open-applications" });

const statusLinks = [
  { label: "Open applications", href: "/open-applications", closed: false },
  { label: "Closed applications", href: "/open-applications?status=closed", closed: true },
];

export default async function ApplicationsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const [params, notices, settings] = await Promise.all([searchParams, getApplicationNotices(), getSettings()]);
  const closed = first(params.status) === "closed";
  const today = toIsoDate(todayInKarachi());
  const applications = notices.flatMap((notice) => {
    const { deadline, publishedAt, status } = notice;
    if (!deadline || publishedAt > today) return [];
    const isClosed = deadline < today || (status !== "OPEN" && status !== "CLOSING");
    return isClosed === closed ? [{ ...notice, deadline }] : [];
  });
  applications.sort((a, b) => closed ? b.deadline.localeCompare(a.deadline) : a.deadline.localeCompare(b.deadline));

  return (
    <>
      <DirectoryHeader title={title} description={description} />
      <section aria-label="Application notices" className="mx-auto max-w-site px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <nav aria-label="Application status" className="flex flex-wrap gap-2 border-b border-line pb-4">
          {statusLinks.map((link) => (
            <Link key={link.href} href={link.href} aria-current={link.closed === closed ? "page" : undefined} className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-green-800 hover:bg-mint-50 aria-[current=page]:border-green-700 aria-[current=page]:bg-green-700 aria-[current=page]:text-white">
              {link.label}
            </Link>
          ))}
        </nav>
        {applications.length ? (
          <ul aria-label={closed ? "Closed applications" : "Open applications"} className="mt-5 divide-y divide-line overflow-hidden rounded-xl border border-line bg-white">
            {applications.map((notice) => (
              <li key={notice.slug} className="grid gap-4 p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-6">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-semibold text-green-800">{NOTICE_TYPE[notice.type].label}</span>
                    <StatusChip status={closed ? "CLOSED" : notice.status} />
                    {notice.isSample && <SampleChip />}
                  </div>
                  <h2 className="mt-2 font-serif text-xl font-semibold text-ink sm:text-2xl">{notice.title}</h2>
                  <p className="mt-2 font-semibold text-green-800">Application deadline <time dateTime={notice.deadline}>{formatDate(notice.deadline)}</time></p>
                  <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted">{notice.summary}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                  <Link href={`/news/${notice.slug}`} className="inline-flex items-center gap-2 rounded-md border border-line px-4 py-2.5 text-sm font-semibold text-green-800 hover:bg-mint-50">
                    View notice <Icon name="arrow" className="size-4" />
                    <span className="sr-only"> for {notice.title}</span>
                  </Link>
                  {!closed && !notice.isSample && settings.portalRegistrationUrl.startsWith("https://") && (
                    <PortalLink which="registration" settings={settings} className="inline-flex items-center gap-2 rounded-md bg-green-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-800">
                      Apply on ETC portal <span className="sr-only"> for {notice.title}</span>
                    </PortalLink>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-5 rounded-xl border border-line bg-mint-50 p-5 text-muted">
            {closed ? "There are no closed application notices yet." : "There are no open applications right now. Check this page again for new notices."}
          </p>
        )}
      </section>
    </>
  );
}
