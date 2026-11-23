import type { Metadata } from "next";
import Link from "next/link";
import { PhotoGallery } from "@/components/site/gallery/PhotoGallery";
import Image from "@/components/ui/image";
import { getGalleryPhotos } from "@/lib/content/gallery";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Photo Gallery",
  description: "Browse the Education Testing Council’s photo collection, from candidate preparation and test centres to institutional settings.",
  path: "/gallery",
});

export default async function GalleryPage() {
  const photos = await getGalleryPhotos();
  const [cover, companion] = photos;

  return (
    <>
      <section className="on-dark relative overflow-hidden bg-green-900 text-white">
        <div className="pattern-dots absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-site gap-8 px-4 py-10 sm:px-6 sm:py-14 md:grid-cols-2 md:items-center lg:gap-14 lg:px-8">
          <div>
            <nav aria-label="Breadcrumb" className="text-sm text-white/75">
              <ol className="flex items-center gap-2">
                <li><Link href="/" className="hover:text-white hover:underline">Home</Link></li>
                <li aria-hidden="true">/</li>
                <li aria-current="page" className="text-white">Gallery</li>
              </ol>
            </nav>
            <h1 className="mt-5 font-serif text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">Photo Gallery</h1>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-white/85 sm:text-lg">
              Explore ETC’s photo collection, from test day and candidate preparation to campus and institutional settings.
            </p>
          </div>
          {cover && (
            <div aria-hidden="true" className={`grid h-40 gap-3 sm:h-52 lg:h-60 ${companion ? "grid-cols-[3fr_2fr]" : ""}`}>
              <div className="relative overflow-hidden rounded-xl bg-green-800 ring-1 ring-white/15">
                <Image src={cover.url} alt="" fill sizes="(min-width: 768px) 30vw, 60vw" className="object-cover" priority />
              </div>
              {companion && (
                <div className="relative mt-4 overflow-hidden rounded-xl bg-green-800 ring-1 ring-white/15">
                  <Image src={companion.url} alt="" fill sizes="(min-width: 768px) 20vw, 40vw" className="object-cover" loading="eager" />
                </div>
              )}
            </div>
          )}
        </div>
      </section>
      <PhotoGallery photos={photos} />
    </>
  );
}
