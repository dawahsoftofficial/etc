import Link from "next/link";

export function DirectoryHeader({ title, description }: { title: string; description: string }) {
  return (
    <section className="on-dark relative bg-green-900 text-white">
      <div className="pattern-dots absolute inset-0" aria-hidden="true" />
      <div className="relative mx-auto max-w-site px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <nav aria-label="Breadcrumb" className="text-sm text-white/75">
          <ol className="flex flex-wrap items-center gap-2">
            <li><Link href="/" className="hover:text-white hover:underline">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-white">{title}</li>
          </ol>
        </nav>
        <h1 className="mt-5 font-serif text-4xl font-semibold leading-tight sm:text-5xl">{title}</h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-white/85 sm:text-lg">{description}</p>
      </div>
    </section>
  );
}
