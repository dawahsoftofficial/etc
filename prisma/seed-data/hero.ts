// Homepage hero slides. The first mirrors the 2026 A4 Institutional Profile cover; the others are ported from
// mockup/index.html. *Asterisks* in a title show those words in gold.
export const heroCoverPhoto = {
  key: "local/img/hero/cover-assessment.jpg",
  url: "/img/hero/cover-assessment.jpg",
  mime: "image/jpeg",
  width: 1713,
  height: 918,
  alt: "Candidates sitting an ETC assessment",
};

export const heroSlides = [
  {
    eyebrow: "Higher Education Commission · Pakistan",
    title: "Assessment, Testing and *Evaluation.*",
    body: "A national assessment platform opening pathways to education, scholarships and professional opportunity through merit.",
    cta1Label: "Find a Test",
    cta1Href: "/tests",
    cta2Label: "About ETC",
    cta2Href: "/about",
    order: 0,
    published: true,
    imageRef: heroCoverPhoto.key,
  },
  {
    eyebrow: "USAT · December 2026 session",
    title: "Registration is open for USAT.",
    body: "All six categories — from Pre-Engineering and Pre-Medical to Commerce and Arts & Humanities — for undergraduate admissions and HEC scholarships.",
    cta1Label: "Read the notice",
    cta1Href: "/news/usat-reg-dec-2026",
    cta2Label: "USAT details",
    cta2Href: "/tests/usat",
    order: 1,
    published: true,
    imageRef: "heroCampus",
  },
  {
    eyebrow: "LAT & LAW-GAT",
    title: "National gateways to legal education and the Bar.",
    body: "Conducted by ETC on behalf of the Higher Education Commission, as directed by the Supreme Court of Pakistan.",
    cta1Label: "Law Admission Test",
    cta1Href: "/tests/lat",
    cta2Label: "LAW-GAT",
    cta2Href: "/tests/law-gat",
    order: 2,
    published: true,
    imageRef: "heroLaw",
  },
];
