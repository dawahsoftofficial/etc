"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Icon } from "@/components/ui/icon";
import type { NoticeRow } from "@/lib/content/types";
import { formatDate } from "@/lib/format";
import { SampleChip } from "../StatusChip";

export function LatestAnnouncement({ notice }: { notice: NoticeRow }) {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const modal = dialog.current;
    if (!modal || modal.open) return;

    try {
      const key = `etc:seen-announcement:${notice.slug}`;
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // Visitors can still see and dismiss the notice when storage is disabled.
    }

    modal.showModal();
  }, [notice.slug]);

  return (
    <dialog
      ref={dialog}
      id="latest-announcement"
      aria-labelledby="latest-announcement-label latest-announcement-title"
      aria-describedby="latest-announcement-summary"
      data-noprint
      className="m-auto max-h-[calc(100dvh-2rem)] w-[min(34rem,calc(100%-2rem))] overflow-y-auto overscroll-contain rounded-2xl border border-line bg-white p-0 text-ink shadow-lift backdrop:bg-green-950/60"
    >
      <div className="border-t-4 border-green-700 px-6 pb-6 pt-4 sm:px-8 sm:pb-8">
        <div className="flex items-center justify-between gap-3">
          <p id="latest-announcement-label" className="eyebrow">Latest announcement</p>
          <button
            type="button"
            aria-label="Dismiss announcement"
            onClick={() => dialog.current?.close()}
            className="grid size-11 shrink-0 place-items-center rounded-md text-green-700 hover:bg-mint-50"
          >
            <Icon name="close" />
          </button>
        </div>
        <h2 id="latest-announcement-title" className="mt-2 wrap-break-word font-serif text-2xl font-semibold leading-snug text-green-800 sm:text-3xl">
          {notice.title}
        </h2>
        <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted">
          <time dateTime={notice.publishedAt}>{formatDate(notice.publishedAt)}</time>
          {notice.isSample && <SampleChip />}
        </p>
        <p id="latest-announcement-summary" className="mt-4 wrap-break-word leading-relaxed text-muted">{notice.summary}</p>
        <Link
          href={`/news/${notice.slug}`}
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800"
        >
          Read full announcement <Icon name="arrow" className="size-4" />
        </Link>
      </div>
    </dialog>
  );
}
