"use client";

import { useEffect, useRef, useState } from "react";
import Image from "@/components/ui/image";
import { Icon } from "@/components/ui/icon";
import type { GalleryCategory, GalleryPhoto } from "@/lib/content/types";

const CATEGORIES: Record<GalleryCategory, string> = {
  preparation: "Tests & preparation",
  operations: "Test operations",
  institutions: "Institutions",
};

const viewerControl = "grid size-11 shrink-0 place-items-center rounded-lg border border-white/25 text-white hover:bg-white/10";

export function PhotoGallery({ photos }: { photos: GalleryPhoto[] }) {
  const [category, setCategory] = useState<GalleryCategory | "all">("all");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const viewer = useRef<HTMLDialogElement>(null);
  const visible = category === "all" ? photos : photos.filter((photo) => photo.category === category);
  const active = activeIndex === null ? undefined : visible[activeIndex];
  const filters = (["all", ...Object.keys(CATEGORIES)] as (GalleryCategory | "all")[])
    .filter((key) => key === "all" || photos.some((photo) => photo.category === key));

  useEffect(() => {
    const dialog = viewer.current;
    if (activeIndex !== null && dialog && !dialog.open) dialog.showModal();
  }, [activeIndex]);

  function changePhoto(delta: number) {
    if (activeIndex === null || visible.length < 2) return;
    setActiveIndex((activeIndex + delta + visible.length) % visible.length);
  }

  return (
    <section aria-label="Browse photos" className="mx-auto max-w-site px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {photos.length === 0 ? (
        <p className="rounded-xl border border-line bg-mint-50 p-6 text-muted">Photos will appear here when they are available.</p>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-5">
            <div role="group" aria-label="Filter photos" className="flex flex-wrap gap-2">
              {filters.map((key) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={category === key}
                  onClick={() => setCategory(key)}
                  className="min-h-11 rounded-full border border-line px-4 py-2 text-sm font-semibold text-green-800 hover:bg-mint-50 aria-pressed:border-green-700 aria-pressed:bg-green-700 aria-pressed:text-white"
                >
                  {key === "all" ? "All photos" : CATEGORIES[key]}
                </button>
              ))}
            </div>
            <p role="status" className="text-sm text-muted">{visible.length} {visible.length === 1 ? "photo" : "photos"}</p>
          </div>

          <ul aria-label="Photos" className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((photo, index) => (
              <li key={photo.key}>
                <button
                  type="button"
                  aria-label={`View photo: ${photo.title}`}
                  aria-haspopup="dialog"
                  onClick={() => setActiveIndex(index)}
                  className="group relative block aspect-[4/3] w-full overflow-hidden rounded-xl border border-line bg-mint-50 shadow-card hover:border-green-500 hover:shadow-lift motion-safe:transition-shadow"
                >
                  <Image
                    src={photo.url}
                    alt=""
                    fill
                    sizes="(min-width: 1280px) 392px, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-[1.03]"
                  />
                  <span className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-white/95 text-green-800 shadow-sm">
                    <Icon name="expand" className="size-4" />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      <dialog
        ref={viewer}
        id="photo-viewer"
        aria-labelledby="photo-viewer-title"
        data-noprint
        onClose={() => setActiveIndex(null)}
        onKeyDown={(event) => {
          if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
          event.preventDefault();
          changePhoto(event.key === "ArrowRight" ? 1 : -1);
        }}
        className="on-dark m-auto max-h-[calc(100dvh-1rem)] w-[min(64rem,calc(100%-1rem))] overflow-y-auto overscroll-contain rounded-2xl bg-green-950 p-0 text-white shadow-lift backdrop:bg-green-950/85 sm:max-h-[calc(100dvh-2rem)] sm:w-[min(64rem,calc(100%-2rem))]"
      >
        {active && activeIndex !== null && (
          <>
            <div className="flex items-center justify-between gap-3 px-3 py-2 sm:px-5">
              <p role="status" className="text-sm font-medium text-white/80">Photo {activeIndex + 1} of {visible.length}</p>
              <button type="button" aria-label="Close photo viewer" onClick={() => viewer.current?.close()} className={viewerControl}>
                <Icon name="close" />
              </button>
            </div>
            <div className="relative mx-3 h-[min(62dvh,42rem)] overflow-hidden rounded-lg bg-black/25 sm:mx-5">
              <Image
                key={active.key}
                src={active.url}
                alt={active.alt || active.title}
                fill
                sizes="(min-width: 1056px) 980px, 100vw"
                loading="eager"
                className="object-contain"
              />
            </div>
            <div className="flex items-center justify-between gap-3 px-3 py-3 sm:px-5 sm:py-4">
              <div>
                <p className="text-xs font-semibold text-gold-300">{CATEGORIES[active.category]}</p>
                <h2 id="photo-viewer-title" className="mt-1 font-serif text-lg font-semibold leading-snug sm:text-xl">{active.title}</h2>
              </div>
              {visible.length > 1 && (
                <div className="flex shrink-0 gap-2">
                  <button type="button" aria-label="Previous photo" onClick={() => changePhoto(-1)} className={viewerControl}><Icon name="prev" /></button>
                  <button type="button" aria-label="Next photo" onClick={() => changePhoto(1)} className={viewerControl}><Icon name="next" /></button>
                </div>
              )}
            </div>
          </>
        )}
      </dialog>
    </section>
  );
}
