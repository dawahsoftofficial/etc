import { getLatestNotices } from "@/lib/content/notices";
import { getSettings } from "@/lib/content/settings";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { RevealInit } from "./RevealInit";

/** Public chrome around page content. Used by the (site) layout and by the root not-found page. */
export async function SiteShell({ children }: { children: React.ReactNode }) {
  const [settings, notices] = await Promise.all([getSettings(), getLatestNotices(5)]);
  return (
    <>
      <Header settings={settings} notices={notices} />
      <main id="main">{children}</main>
      <Footer settings={settings} />
      <RevealInit />
    </>
  );
}
