import { getMediaByKeys, SECTION_IMAGES } from "./media";
import type { GalleryPhoto } from "./types";

// The public site’s photo collection, including the original homepage imagery.
const SUBJECTS: Pick<GalleryPhoto, "key" | "title" | "category">[] = [
  { key: "mockup/site/hero/cover-assessment.jpg", title: "Candidates sitting an assessment", category: "operations" },
  { key: "mockup/images/hero-campus.jpg", title: "Students on campus", category: "institutions" },
  { key: "mockup/site/tests/nsct-cbt.jpg", title: "Computer-based testing", category: "operations" },
  { key: "mockup/images/test-usat.jpg", title: "Preparing for university admissions", category: "preparation" },
  { key: SECTION_IMAGES.candidateCentre, title: "Checking in at a test centre", category: "operations" },
  { key: "mockup/images/hero-law.jpg", title: "A law graduate at the high court", category: "preparation" },
  { key: SECTION_IMAGES.qualityOmr, title: "Scanning answer sheets", category: "operations" },
  { key: "mockup/images/test-hat.jpg", title: "Studying in the university library", category: "preparation" },
  { key: SECTION_IMAGES.institutions, title: "Institutional partners reviewing reports", category: "institutions" },
  { key: "mockup/images/hero-exam-hall.jpg", title: "Inside an examination hall", category: "operations" },
  { key: "mockup/images/test-lat.jpg", title: "Preparing for the Law Admission Test", category: "preparation" },
  { key: "mockup/images/test-lawgat.jpg", title: "Law reports, gavel and scales", category: "preparation" },
  { key: "mockup/images/test-haat.jpg", title: "Postgraduate research in the laboratory", category: "preparation" },
  { key: SECTION_IMAGES.qualitySealed, title: "Secure storage of examination papers", category: "operations" },
  { key: SECTION_IMAGES.aboutBuilding, title: "Institutional building in Islamabad", category: "institutions" },
  { key: SECTION_IMAGES.noticeDefault, title: "A test notice board", category: "operations" },
];

export async function getGalleryPhotos(): Promise<GalleryPhoto[]> {
  const media = await getMediaByKeys(SUBJECTS.map(({ key }) => key));
  return SUBJECTS.flatMap((subject) => {
    const photo = media[subject.key];
    return photo ? [{ ...photo, ...subject }] : [];
  });
}
