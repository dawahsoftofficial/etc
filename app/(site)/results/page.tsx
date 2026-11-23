import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/site/EmptyState";
import { FilterForm } from "@/components/site/FilterForm";
import { Pagination } from "@/components/site/Pagination";
import { PortalLink } from "@/components/site/PortalLink";
import { ResultCards } from "@/components/site/ResultCards";
import { ResultCount } from "@/components/site/ResultCount";
import { searchNotices } from "@/lib/content/notices";
import { getSettings } from "@/lib/content/settings";
import { getTestOptions } from "@/lib/content/tests";
import { NEWS_PER_PAGE, parseNoticeFilters, type SP } from "@/lib/filters";
import { todayInKarachi } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Results",
  description: "Find published Education Testing Council result notices by test or session.",
  path: "/results",
});

const field = "mt-1.5 w-full rounded-md border border-line bg-white px-4 py-2.5";

export default async function ResultsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const [params, tests, settings] = await Promise.all([searchParams, getTestOptions(), getSettings()]);
  const { q, test, page } = parseNoticeFilters(params, tests.map(({ slug }) => slug));
  const results = await searchNotices({ q, test, page, type: "RESULT" }, todayInKarachi());
  const filtered = Boolean(q || test);
  const first = (results.page - 1) * NEWS_PER_PAGE + 1;
  const last = first + results.items.length - 1;
  const count = results.total ? `Showing ${first}–${last} of ${results.total} result notices` : "0 result notices";
  const hrefs = Array.from({ length: results.pages }, (_, index) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (test) params.set("test", test);
    if (index > 0) params.set("page", String(index + 1));
    return params.size ? `/results?${params}` : "/results";
  });

  return (
    <>
      <section className="on-dark relative bg-green-900 text-white">
        <div className="pattern-dots absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto max-w-site px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <nav aria-label="Breadcrumb" className="text-sm text-white/75">
            <ol className="flex items-center gap-2">
              <li><Link href="/" className="hover:text-white hover:underline">Home</Link></li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-white">Results</li>
            </ol>
          </nav>
          <h1 className="mt-5 font-serif text-4xl font-semibold leading-tight sm:text-5xl">Test Results</h1>
          <p className="mt-4 max-w-2xl leading-relaxed text-white/85 sm:text-lg">
            Browse published result notices by test or session. Open a notice for release details and any attached documents.
          </p>
          {settings.portalResultsUrl.startsWith("https://") && (
            <PortalLink which="results" settings={settings} className="mt-6 inline-flex items-center gap-2 rounded-md bg-gold-300 px-4 py-2.5 font-semibold text-green-950 hover:bg-gold-100">
              Check individual scores
            </PortalLink>
          )}
        </div>
      </section>

      <section aria-label="Browse results" className="mx-auto max-w-site scroll-mt-40 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <FilterForm label="Filter results" className="grid gap-4 rounded-xl border border-line bg-mint-50 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-[2fr_1fr_auto] lg:items-end">
          <div>
            <label htmlFor="results-query" className="block text-sm font-semibold">Search result notices</label>
            <input id="results-query" name="q" type="search" defaultValue={q} placeholder="e.g. USAT" className={field} />
          </div>
          <div>
            <label htmlFor="results-test" className="block text-sm font-semibold">Related test</label>
            <select id="results-test" name="test" defaultValue={test ?? ""} className={field}>
              <option value="">All tests</option>
              {tests.map(({ slug, code }) => <option key={slug} value={slug}>{code}</option>)}
              <option value="general">General</option>
            </select>
          </div>
          <div className="flex flex-wrap gap-2 sm:col-span-2 lg:col-span-1">
            <button type="submit" className="rounded-md bg-green-700 px-5 py-2.5 font-semibold text-white hover:bg-green-800">Search</button>
            {filtered && <Link href="/results" className="rounded-md px-4 py-2.5 font-semibold text-green-800 hover:bg-white">Clear</Link>}
          </div>
        </FilterForm>
        <div className="mb-4 mt-6"><ResultCount text={count} /></div>
        {results.items.length ? (
          <ResultCards notices={results.items} />
        ) : filtered ? (
          <EmptyState noun="results" resetHref="/results" />
        ) : (
          <p className="rounded-xl border border-line bg-mint-50 p-5 text-muted">No results have been published yet.</p>
        )}
        <Pagination page={results.page} hrefs={hrefs} />
      </section>
    </>
  );
}
