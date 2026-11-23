import type { Metadata } from "next";
import Link from "next/link";
import { DirectoryHeader } from "@/components/site/DirectoryHeader";
import { PortalLink } from "@/components/site/PortalLink";
import { Icon } from "@/components/ui/icon";
import { getSchedule } from "@/lib/content/home";
import { getSettings } from "@/lib/content/settings";
import { first, type SP } from "@/lib/filters";
import { formatDate, todayInKarachi, toIsoDate } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";

const title = "List of Candidates";
const description = "Find your test session. Check your candidate status or download your roll number slip through the official ETC portal when available.";
export const metadata: Metadata = pageMetadata({ title, description, path: "/candidates" });

export default async function CandidatesPage({ searchParams }: { searchParams: Promise<SP> }) {
  const [params, schedule, settings] = await Promise.all([searchParams, getSchedule(), getSettings()]);
  const past = first(params.session) === "past";
  const today = toIsoDate(todayInKarachi());
  const sessions = schedule.filter(({ testDate }) => past ? testDate < today : testDate >= today);
  sessions.sort((a, b) => past ? b.testDate.localeCompare(a.testDate) : a.testDate.localeCompare(b.testDate));

  return (
    <>
      <DirectoryHeader title={title} description={description} />
      <section aria-labelledby="candidate-sessions-title" className="mx-auto max-w-site px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="candidate-sessions-title" className="font-serif text-2xl font-semibold text-green-700 sm:text-3xl">Test sessions</h2>
          {settings.portalAdmitCardUrl.startsWith("https://") && (
            <PortalLink which="admitCard" settings={settings} className="inline-flex items-center gap-2 rounded-md bg-green-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-800">
              Check status or get roll number slip
            </PortalLink>
          )}
        </div>
        <nav aria-label="Session period" className="mt-4 flex flex-wrap gap-2 border-b border-line pb-4">
          <Link href="/candidates" aria-current={!past ? "page" : undefined} className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-green-800 hover:bg-mint-50 aria-[current=page]:border-green-700 aria-[current=page]:bg-green-700 aria-[current=page]:text-white">
            Upcoming sessions
          </Link>
          <Link href="/candidates?session=past" aria-current={past ? "page" : undefined} className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-green-800 hover:bg-mint-50 aria-[current=page]:border-green-700 aria-[current=page]:bg-green-700 aria-[current=page]:text-white">
            Past sessions
          </Link>
        </nav>
        {sessions.length ? (
          <ul aria-label={past ? "Past test sessions" : "Upcoming test sessions"} className="mt-5 divide-y divide-line overflow-hidden rounded-xl border border-line bg-white">
            {sessions.map(({ session, testSlug, testCode, testDate }) => (
              <li key={`${testSlug}-${session}-${testDate}`} className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
                <div>
                  <p className="text-sm font-semibold text-green-800">{testCode}</p>
                  <h3 className="mt-1 font-serif text-xl font-semibold text-ink">{session}</h3>
                  <p className="mt-1 text-sm text-muted">Test date <time dateTime={testDate}>{formatDate(testDate)}</time></p>
                </div>
                <Link href={`/tests/${testSlug}#schedule`} className="inline-flex items-center gap-2 rounded-md border border-line px-4 py-2.5 text-sm font-semibold text-green-800 hover:bg-mint-50">
                  Test details <Icon name="arrow" className="size-4" />
                  <span className="sr-only"> for {session}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-5 rounded-xl border border-line bg-mint-50 p-5 text-muted">No {past ? "past" : "upcoming"} test sessions are listed.</p>
        )}
        <Link href="/candidate-services#admit-card" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-green-700 hover:underline">
          Roll number slip guidance <Icon name="arrow" className="size-4" />
        </Link>
      </section>
    </>
  );
}
