"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@/components/ui/icon";
import { activeSection, HEADER_NAV } from "@/lib/nav";

const FOCUSABLE = 'a[href], button, summary, [tabindex]:not([tabindex="-1"])';
// Must match the close transition below (duration-200), so the drawer leaves the page only once it has slid out.
const CLOSE_MS = 200;

/**
 * Mobile menu: modal drawer with a focus trap; focus returns to the toggle on close. The drawer is portalled to <body>:
 * the sticky header uses backdrop-filter, which makes it the containing block for fixed children and would otherwise
 * squeeze this full-screen drawer into the header's height. Opening slides the panel in and fades the backdrop;
 * closing reverses it, then hides the drawer from the page and assistive tech. Reduced motion skips the animation.
 */
export function MobileDrawer() {
  const pathname = usePathname();
  const active = activeSection(pathname);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  // shown: in the page (not `hidden`); entered: at its animated-in position
  const [shown, setShown] = useState(false);
  const [entered, setEntered] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const close = useCallback((returnFocus = true) => {
    setOpen(false);
    if (returnFocus) toggleRef.current?.focus();
  }, []);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (open) {
      setShown(true);
      // two frames so the browser paints the off-screen start position before transitioning in
      let inner = 0;
      const outer = requestAnimationFrame(() => {
        inner = requestAnimationFrame(() => setEntered(true));
      });
      return () => {
        cancelAnimationFrame(outer);
        cancelAnimationFrame(inner);
      };
    }
    setEntered(false);
    const t = setTimeout(() => setShown(false), CLOSE_MS);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open || !shown) return;
    document.body.style.overflow = "hidden";
    const first = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, shown]);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") return close();
    if (e.key !== "Tab" || !panelRef.current) return;
    const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null);
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  const drawer = (
    <div
      id="mobile-drawer"
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      hidden={!shown}
      onKeyDown={onKeyDown}
      className="fixed inset-0 z-50 lg:hidden"
    >
      <div
        className={`absolute inset-0 bg-green-950/60 transition-opacity motion-reduce:transition-none ${
          entered ? "opacity-100 duration-300 ease-out" : "opacity-0 duration-200 ease-in"
        }`}
        onClick={() => close()}
      />
      <div
        ref={panelRef}
        className={`absolute right-0 top-0 h-full w-[88%] max-w-sm overflow-y-auto bg-white shadow-lift transition-transform motion-reduce:transition-none ${
          entered ? "translate-x-0 duration-300 ease-out" : "translate-x-full duration-200 ease-in"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-line px-5">
          <span className="font-serif text-lg text-green-700">Menu</span>
          <button type="button" onClick={() => close()} className="-mr-2 p-2 text-ink" aria-label="Close menu">
            <Icon name="close" className="h-6 w-6" />
          </button>
        </div>
        <ul className="px-5">
          {HEADER_NAV.map((item) => (
            <li key={item.id} className="border-b border-line">
              <details className="group" open={item.id === active}>
                <summary className="flex cursor-pointer list-none items-center justify-between py-3.5 font-medium text-ink [&::-webkit-details-marker]:hidden">
                  {item.label}
                  <Icon name="chevron" className="h-4 w-4 transition group-open:rotate-180" />
                </summary>
                <ul className="pb-3 pl-3">
                  {item.links.map(([label, href]) => (
                    <li key={label}>
                      <Link href={href} onClick={() => close(false)} className="block py-1.5 text-sm text-muted hover:text-green-700">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            </li>
          ))}
        </ul>
        <div className="p-5">
          <Link
            href="/tests"
            onClick={() => close(false)}
            className="flex justify-center rounded-md bg-green-700 px-4 py-3 font-semibold text-white"
          >
            Find a Test
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        ref={toggleRef}
        type="button"
        aria-controls="mobile-drawer"
        aria-expanded={open}
        aria-label="Open menu"
        onClick={() => setOpen(true)}
        className="-mr-2 p-2 text-ink lg:hidden"
      >
        <Icon name="menu" className="h-6 w-6" />
      </button>
      {mounted && createPortal(drawer, document.body)}
    </>
  );
}
