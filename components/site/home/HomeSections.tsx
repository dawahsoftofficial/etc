// Homepage sections ported from mockup/index.html. Static copy is verbatim; lists come from the database.
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import type { ClientSector } from "@prisma/client";
import type { NoticeRow as NoticeRowData, ScheduleItem as ScheduleItemData, StatItem, TestCard as TestCardData } from "@/lib/content/types";
import { NoticeRow } from "../NoticeRow";
import { ScheduleItem } from "../ScheduleItem";
import { TestCard } from "../TestCard";
import { Counter } from "../Counter";

export function Announcements({ notices, schedule }: { notices: NoticeRowData[]; schedule: ScheduleItemData[] }) {
  return (
    <section aria-labelledby="news-title" className="mx-auto max-w-site px-4 pb-20 pt-10 sm:px-6 sm:pb-24 sm:pt-14 lg:px-8">
      <div className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-8" data-reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">News &amp; Notices</p>
              <h1 id="news-title" className="mt-3 font-serif text-3xl font-semibold text-green-700 sm:text-4xl">
                Latest announcements
              </h1>
            </div>
            <Link href="/news" className="inline-flex items-center gap-2 text-sm font-semibold text-green-700 hover:text-green-900">
              View all notices <Icon name="arrow" className="h-4 w-4" />
            </Link>
          </div>
          <ul id="home-notices" className="mt-6 border-t border-line">
            {notices.map((n) => (
              <NoticeRow key={n.slug} notice={n} />
            ))}
          </ul>
        </div>
        <aside className="lg:col-span-4" data-reveal aria-labelledby="dates-title">
          <div className="on-dark relative overflow-hidden rounded-2xl bg-green-900 p-7 text-white lg:sticky lg:top-40">
            <div className="pattern-dots absolute inset-0 opacity-70" aria-hidden="true" />
            <div className="relative">
              <p className="eyebrow">Plan ahead</p>
              <h2 id="dates-title" className="mt-3 font-serif text-2xl font-semibold">
                Upcoming test dates
              </h2>
              <ul id="home-schedule" className="mt-4">
                {schedule.slice(0, 4).map((s) => (
                  <ScheduleItem key={s.session} item={s} />
                ))}
              </ul>
              <p className="mt-4 text-xs text-white/60">Official dates are confirmed in each test notice.</p>
              <Link
                href="/candidate-services#schedule"
                className="mt-6 inline-flex items-center gap-2 rounded-md bg-white px-4 py-2.5 text-sm font-semibold text-green-800 hover:bg-cream-50"
              >
                Full schedule
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

export function FindYourTest({ tests }: { tests: TestCardData[] }) {
  return (
    <section aria-labelledby="tests-title" className="border-y border-line bg-mint-50">
      <div className="mx-auto max-w-site px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="max-w-3xl" data-reveal>
          <p className="eyebrow">Tests &amp; Assessments</p>
          <h2 id="tests-title" className="mt-3 font-serif text-3xl font-semibold text-green-700 sm:text-4xl">
            Find your test
          </h2>
          <p className="mt-4 text-lg text-muted">
            Six national standardized tests and customized assessments — each built to a blueprint, piloted before use and
            analysed after every session.
          </p>
        </div>
        <div
          id="home-tests"
          className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:flex xl:flex-wrap xl:justify-center xl:gap-x-5 xl:*:basis-[calc((100%_-_3.75rem)/4)]"
        >
          {tests.map((t) => (
            <TestCard
              key={t.slug}
              test={t}
              compact
              imageSizes="(min-width: 1280px) 289px, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            />
          ))}
        </div>
        <p className="mt-6 text-xs text-muted">
          *Fee per candidate as per ETC Institutional Profile 2026; always confirm in the official announcement.
        </p>
      </div>
    </section>
  );
}

export function Numbers({ stats }: { stats: StatItem[] }) {
  return (
    <section aria-labelledby="numbers-title" className="border-y border-gold-300/50 bg-cream-50">
      <div className="mx-auto max-w-site px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4" data-reveal>
          <div>
            <p className="eyebrow">ETC at a glance</p>
            <h2 id="numbers-title" className="mt-3 font-serif text-3xl font-semibold text-green-700 sm:text-4xl">
              Our record in numbers
            </h2>
          </div>
          <p className="text-sm text-muted">Candidates tested since 2017; project and development figures since 1 July 2021, as recorded in ETC’s institutional data.</p>
        </div>
        <dl className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-4">
          {stats.map((s, k) => (
            <div key={s.label} className={`flex flex-col px-2 lg:px-6 ${k % 4 ? "lg:border-l lg:border-gold-300/50" : "lg:pl-0"}`}>
              <dt className="order-2 text-sm font-medium text-muted">{s.label}</dt>
              <dd className="order-1 font-serif text-3xl font-semibold text-green-700 sm:text-[2.6rem]">
                <Counter value={s.value} />
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

const SECTOR_ORDER: ClientSector[] = ["FEDERAL", "UNIVERSITY", "PROVINCIAL", "OTHER"];

export function ClientsMarquee({ clients }: { clients: Record<ClientSector, string[]> }) {
  const names = SECTOR_ORDER.flatMap((s) => clients[s]);
  const item = (n: string, k: number, hidden: boolean) => (
    <li key={`${hidden ? "b" : "a"}${k}`} className="flex items-center gap-10 font-serif text-lg text-ink/70" aria-hidden={hidden || undefined}>
      {n}
      <span className="h-1.5 w-1.5 rounded-full bg-gold-500" aria-hidden="true" />
    </li>
  );
  return (
    <section aria-labelledby="clients-title" className="overflow-hidden py-16">
      <div className="mx-auto max-w-site px-4 text-center sm:px-6 lg:px-8">
        <p className="eyebrow justify-center">Track record</p>
        <h2 id="clients-title" className="mt-3 font-serif text-2xl font-semibold text-green-700 sm:text-3xl">
          Trusted by institutions across Pakistan
        </h2>
      </div>
      <div className="marquee relative mt-10" tabIndex={0} aria-label="Client institutions (scrolling list)" role="region">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-white to-transparent" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-white to-transparent" aria-hidden="true" />
        <ul className="flex w-max animate-marquee items-center gap-10 whitespace-nowrap">
          {names.map((n, k) => item(n, k, false))}
          {names.map((n, k) => item(n, k, true))}
        </ul>
      </div>
      <p className="mt-8 text-center">
        <Link href="/institutions#clients" className="text-sm font-semibold text-green-700 hover:text-green-900">
          See all clients and partners
        </Link>
      </p>
    </section>
  );
}
