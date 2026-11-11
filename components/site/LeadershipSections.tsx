import type { LeaderRole } from "@prisma/client";
import Image from "@/components/ui/image";
import type { LeaderItem } from "@/lib/content/types";

/** Section titles and anchors from the 2026 A4 Institutional Profile (pages 5–7), in the booklet's order. */
export const LEADER_SECTIONS: Record<LeaderRole, { id: string; title: string; band: string }> = {
  CHAIRMAN: { id: "chairman", title: "Chairman’s foreword", band: "bg-cream-50 border-y border-gold-300/50" },
  EXECUTIVE_DIRECTOR: { id: "executive-director", title: "Strategic direction", band: "bg-white" },
  CEO: { id: "ceo", title: "Leadership navigation", band: "bg-mint-50 border-y border-line" },
};

/** About › one full-width section per leader (Chairman, Executive Director, CEO), fed by Leader rows. */
export function LeadershipSections({ leaders }: { leaders: LeaderItem[] }) {
  return (
    <div id="leadership" className="scroll-mt-48">
      {leaders.map((l) => {
        const s = LEADER_SECTIONS[l.role];
        return (
          <section key={l.role} id={s.id} aria-labelledby={`${s.id}-title`} className={`scroll-mt-48 ${s.band}`}>
            <div className="mx-auto grid max-w-site gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-12 lg:gap-16 lg:px-8">
              {/* phones: compact portrait beside the name; desktop: large portrait above it */}
              <div className="flex items-center gap-4 lg:col-span-4 lg:block" data-reveal>
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-mint-50 ring-1 ring-line lg:aspect-square lg:h-auto lg:w-full lg:max-w-[18rem]">
                  {l.photo && (
                    <Image src={l.photo.url} alt={l.photo.alt || l.name} fill sizes="(min-width: 1024px) 288px, 96px" className="object-cover object-top" />
                  )}
                </div>
                <div className="lg:mt-5">
                  <p className="text-lg font-semibold text-ink">{l.name}</p>
                  <p className="mt-1 text-sm text-muted">{l.title}</p>
                </div>
              </div>
              <div className="lg:col-span-8" data-reveal>
                <p className="eyebrow">Leadership</p>
                <h2 id={`${s.id}-title`} className="mt-3 font-serif text-3xl font-semibold text-green-700 sm:text-4xl">
                  {s.title}
                </h2>
                <blockquote className="mt-6 border-l-4 border-gold-500 pl-5 font-serif text-2xl leading-snug text-green-800 sm:text-3xl">
                  “{l.quote}”
                </blockquote>
                <div
                  className="mt-8 max-w-3xl space-y-4 leading-relaxed text-ink/80 [&_a]:font-semibold [&_a]:text-green-700 [&_h4]:pt-4 [&_h4]:font-serif [&_h4]:text-xl [&_h4]:font-semibold [&_h4]:text-green-700 [&_li]:mt-1.5 [&_strong]:text-ink [&_ul]:list-disc [&_ul]:pl-5"
                  dangerouslySetInnerHTML={{ __html: l.messageHtml }}
                />
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
