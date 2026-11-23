import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import type { NoticeRow } from "@/lib/content/types";
import { formatDate } from "@/lib/format";
import { SampleChip } from "./StatusChip";

export function ResultCards({ notices }: { notices: NoticeRow[] }) {
  return (
    <ul aria-label="Result notices" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {notices.map((notice) => (
        <li key={notice.slug} className="group relative flex min-w-0 flex-col rounded-xl border border-line bg-white p-4 shadow-card hover:border-green-500 sm:p-5">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
            <span className="font-semibold text-green-800">{notice.testCode}</span>
            <time dateTime={notice.publishedAt}>{formatDate(notice.publishedAt)}</time>
            {notice.isSample && <SampleChip />}
          </div>
          <h2 className="mt-2 wrap-break-word font-serif text-xl font-semibold leading-snug text-ink group-hover:text-green-700">
            <Link href={`/news/${notice.slug}`} className="after:absolute after:inset-0 after:rounded-xl">
              {notice.title}
            </Link>
          </h2>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">{notice.summary}</p>
          <Icon name="arrow" className="mt-auto size-4 self-end text-green-700" />
        </li>
      ))}
    </ul>
  );
}
