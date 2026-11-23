import Image from "@/components/ui/image";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import type { NoticeRow } from "@/lib/content/types";
import type { SiteSettings } from "@/lib/validation/content";
import { Brand } from "./Brand";
import { LatestNewsTicker } from "./LatestNewsTicker";
import { MegaMenu } from "./MegaMenu";
import { MobileDrawer } from "./MobileDrawer";

function UtilityBar({ settings }: { settings: SiteSettings }) {
  return (
    <div data-noprint className="on-dark bg-green-950 text-xs text-white/80">
      <div className="mx-auto flex h-9 max-w-site items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <p className="truncate">
          <span className="hidden sm:inline">An autonomous body of the </span>Higher Education Commission, Government of Pakistan
        </p>
        <ul className="flex shrink-0 items-center gap-4">
          <li className="hidden items-center gap-1.5 md:flex">
            <Icon name="phone" className="h-3.5 w-3.5" /> Helpline: <span className="text-white">{settings.helpline}</span>
          </li>
          <li>
            <Link className="inline-flex items-center gap-1.5 hover:text-white" href="/candidate-services#accessibility">
              <Icon name="access" className="h-3.5 w-3.5" />
              Accessibility
            </Link>
          </li>
          <li>
            <Link className="hover:text-white" href="/contact">
              Contact
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}

// A fragment, not a wrapper: the header's `sticky` only holds within its parent, and the page's section navs
// (About, Quality) are offset to sit directly below it, so it must stay pinned for the whole page.
export function Header({ settings, notices }: { settings: SiteSettings; notices: NoticeRow[] }) {
  return (
    <>
      <UtilityBar settings={settings} />
      <header data-noprint className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
        <div className="relative">
          <div className="mx-auto flex h-[72px] max-w-site items-center justify-between gap-4 px-4 sm:h-20 sm:px-6 lg:px-8">
            <Brand />
            <div className="flex shrink-0 items-center gap-1 sm:gap-3">
              <Image
                src="/brand/hec-crest.png"
                alt="Higher Education Commission crest"
                width={422}
                height={480}
                className="hidden h-12 w-auto opacity-90 md:block"
              />
              <span className="mx-1 hidden h-10 w-px bg-line md:block" />
              <Link
                href="/resources"
                className="hidden rounded-full p-2 text-ink/70 hover:bg-mint-50 hover:text-green-700 sm:block"
                aria-label="Search the site"
              >
                <Icon name="search" />
              </Link>
              <Link
                href="/tests"
                className="hidden items-center gap-2 rounded-md bg-green-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-800 sm:inline-flex"
              >
                Find a Test
                <Icon name="arrow" className="h-4 w-4" />
              </Link>
              <MobileDrawer />
            </div>
          </div>
          <MegaMenu />
        </div>
      </header>
      <LatestNewsTicker notices={notices.map(({ slug, title, isSample }) => ({ slug, title, isSample }))} />
    </>
  );
}
