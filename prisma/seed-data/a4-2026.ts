// Content from the updated 2026 A4 Institutional Profile (Shoaib 3c92ccd): the NSCT, result validity per test, the
// "Our Clients" list, and the result-validity FAQ. Used by the seed (new databases) and scripts/apply-a4-content.ts.
import type { ClientSector } from "@prisma/client";

export const nsctPhoto = {
  key: "mockup/site/tests/nsct-cbt.jpg",
  url: "https://sbsi-cdn.sgp1.digitaloceanspaces.com/ETC/mockup/site/tests/nsct-cbt.jpg",
  size: 131323,
  mime: "image/jpeg",
  width: 1600,
  height: 686,
  alt: "Candidates taking a computer-based test at ETC",
};

/** Booklet page 12, "Test validity". Tests not listed (HAAT, NSCT, customized) show no validity. */
export const TEST_VALIDITY: Record<string, string> = { lat: "2 years", hat: "2 years", usat: "1 year", "law-gat": "Lifetime" };

/** Booklet page 12: the National Skill Competency Test. Fee and dates are not in the booklet, so they read "As announced". */
export const nsctTest = {
  slug: "nsct",
  code: "NSCT",
  name: "National Skill Competency Test",
  short: "A national test of industry readiness for Computing & IT graduates.",
  category: "SKILLS" as const,
  level: "Undergraduate (final year)",
  audience: "7th and 8th semester Computer Science and IT students",
  purpose:
    "The NSCT is a standardized national-level assessment for 7th and 8th semester students in Computer Science and IT-related degree programmes at Higher Education Institutions (HEIs) across Pakistan. It assesses the application of technical knowledge, problem-solving skills and professional competencies to practical scenarios and real-world industry requirements.",
  eligibility: "Students in the 7th and 8th semester of Computer Science and IT-related degree programmes at Higher Education Institutions (HEIs) across Pakistan.",
  measures: "The application of technical knowledge, problem-solving skills and professional competencies to practical scenarios and real-world industry requirements.",
  frequency: "As announced",
  frequencyNote: "Session dates are published in official ETC notices.",
  validity: null,
  fee: null,
  resultsUse:
    "Results assess industry readiness; identify gaps between academic preparation, practical skills and market requirements; benchmark graduate competencies across institutions; strengthen academia–industry linkages for relevant curricula and practical learning; and enhance employability through targeted skills development, industry engagement, internships and employment pathways.",
  patternNote: "Section weightings, number of questions and timing are published in the official NSCT announcement.",
  reliability: "Reliability and item analysis follow ETC’s standard pre-test and post-hoc process for every administration.",
  syllabus: ["Technical knowledge in Computing & IT", "Problem-solving", "Professional competencies", "Application to real-world industry scenarios"],
  categories: null,
  sortOrder: 5,
  published: true,
  seoTitle: null,
  seoDescription: null,
  sections: [
    { name: "Technical knowledge", items: null, detail: "Applying Computing and IT knowledge to practical scenarios." },
    { name: "Problem-solving", items: null, detail: "Working through real-world industry problems." },
    { name: "Professional competencies", items: null, detail: "The professional skills employers expect of a new graduate." },
  ],
};

export const RESULT_VALIDITY_FAQ = {
  question: "How long is my result valid?",
  answer:
    "LAT and HAT results are valid for 2 years and USAT results for 1 year; a LAW-GAT pass does not expire. For other tests, check the official notice for your test and the admission criteria of the university or programme.",
};

/** Booklet pages 29–30, "Our Clients", in the booklet's numbering, grouped by the site's client sectors. */
export const CLIENTS_2026: [name: string, sector: ClientSector][] = [
  ["Supreme Court of Pakistan", "FEDERAL"],
  ["Gilgit-Baltistan Chief Court", "PROVINCIAL"],
  ["Election Commission Gilgit-Baltistan", "PROVINCIAL"],
  ["National AML / CFT Recruitment Tests", "FEDERAL"],
  ["Federal Ombudsman (Wafaqi Mohtasib) Secretariat", "FEDERAL"],
  ["Ministry of Federal Education & Professional Training (Daanish Schools Authority)", "FEDERAL"],
  ["Shaheed Zulfiqar Ali Bhutto Medical University (SZABMU) – MDCAT", "UNIVERSITY"],
  ["Pakistan Infrastructure Development Company Limited (PIDCL)", "FEDERAL"],
  ["Federal Directorate of Education", "FEDERAL"],
  ["Balochistan Public Procurement Regulatory Authority (BPPRA)", "PROVINCIAL"],
  ["GB Board of Revenue", "PROVINCIAL"],
  ["NAVTTC", "FEDERAL"],
  ["GB Police Recruitment Tests", "PROVINCIAL"],
  ["GB Health Department", "PROVINCIAL"],
  ["HEC (HRM and HRD Divisions)", "FEDERAL"],
  ["Rawalpindi Women University", "UNIVERSITY"],
  ["Emerson University Multan", "UNIVERSITY"],
  ["Interim Placement of Fresh PhDs (IPFP)", "OTHER"],
  ["University of Karachi", "UNIVERSITY"],
  ["University of Mianwali", "UNIVERSITY"],
  ["Shah Abdul Latif University, Khairpur", "UNIVERSITY"],
  ["Pakistan Social Protection Authority (PSPA)", "FEDERAL"],
  ["University of Education Lahore", "UNIVERSITY"],
  ["University of Loralai", "UNIVERSITY"],
  ["University of Turbat", "UNIVERSITY"],
  ["University of Layyah", "UNIVERSITY"],
  ["Allama Iqbal Open University (AIOU)", "UNIVERSITY"],
  ["University of Baltistan", "UNIVERSITY"],
  ["University of Haripur", "UNIVERSITY"],
  ["University of Haveli Kahuta, AJK", "UNIVERSITY"],
  ["National Curriculum Council", "FEDERAL"],
  ["Fatima Jinnah Women University", "UNIVERSITY"],
  ["Drug Regulatory Authority of Pakistan (DRAP)", "FEDERAL"],
  ["Ministry of Defence Production (MODP)", "FEDERAL"],
  ["Chief Minister’s Inspection Team Balochistan (CMIT)", "PROVINCIAL"],
  ["University of Makran, Panjgur, Balochistan", "UNIVERSITY"],
  ["University of Engineering and Technology, Taxila", "UNIVERSITY"],
  ["Balochistan Residential College (BRC)", "PROVINCIAL"],
  ["Quaid-i-Azam University, Islamabad (Undergraduate Admission Test)", "UNIVERSITY"],
  ["PMU-BESP (Project / Education Sector)", "OTHER"],
  ["Balochistan Education Endowment Fund (BEEF) Scholarship – LLM and Bar at Law", "OTHER"],
  ["BALFATA Scholarship", "OTHER"],
  ["SZABMU – MDCAT (Saudi Arabia & Dubai)", "UNIVERSITY"],
  ["Afghan Student Scholarship", "OTHER"],
  ["Sri Lanka Student Scholarship", "OTHER"],
  ["Bangladesh Scholarship", "OTHER"],
  ["BRC Zhob", "PROVINCIAL"],
  ["BRC Khuzdar", "PROVINCIAL"],
];
