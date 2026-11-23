"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import type { NoticeRow } from "@/lib/content/types";
import { SampleChip } from "./StatusChip";

type Headline = Pick<NoticeRow, "slug" | "title" | "isSample">;

const SAMPLE = {
  href: "/news",
  title: "Updates on upcoming test dates, registration, and results will appear here.",
  isSample: true,
};

export function LatestNewsTicker({ notices }: { notices: Headline[] }) {
  const [paused, setPaused] = useState(false);
  const headlines = notices.length ? notices.map(({ slug, ...notice }) => ({ ...notice, href: `/news/${slug}` })) : [SAMPLE];

  return (
    <section data-noprint aria-labelledby="latest-news-label" className="border-y border-gold-300/60 bg-cream-50">
      <div className="mx-auto flex h-11 max-w-site items-center gap-3 px-4 sm:gap-4 sm:px-6 lg:px-8">
        <Link id="latest-news-label" href="/news" className="shrink-0 text-[11px] font-semibold uppercase tracking-eyebrow text-gold-600 hover:underline">
          Latest News
        </Link>
        <div className="news-ticker-viewport no-scrollbar min-w-0 flex-1 overflow-clip border-l border-gold-300/60 pl-3 sm:pl-4">
          <div data-paused={paused} className="news-ticker-track flex w-max min-w-[200%] animate-news-ticker">
            {[false, true].map((copy) => (
              <ul
                key={String(copy)}
                aria-hidden={copy || undefined}
                className={`flex flex-1 items-center gap-6 whitespace-nowrap pr-6 ${copy ? "news-ticker-copy" : ""}`}
              >
                {headlines.map(({ href, title, isSample }) => (
                  <li key={href} className="flex items-center gap-6 py-1.5">
                    <Link prefetch={false} tabIndex={copy ? -1 : undefined} href={href} className="inline-flex items-center gap-2 text-[13px] font-medium text-green-800 hover:underline">
                      {isSample && <SampleChip />}
                      {title}
                    </Link>
                    <span aria-hidden="true" className="size-1 rounded-full bg-gold-500" />
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
        <button
          type="button"
          aria-label={paused ? "Play news ticker" : "Pause news ticker"}
          onClick={() => setPaused((value) => !value)}
          className="grid size-8 shrink-0 place-items-center rounded-md text-green-700 hover:bg-white motion-reduce:hidden"
        >
          <Icon name={paused ? "play" : "pause"} className="size-4" />
        </button>
      </div>
    </section>
  );
}
