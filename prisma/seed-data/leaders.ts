// Leadership messages from the 2026 A4 Institutional Profile (a4/index.html: Chairman's foreword, Strategic direction,
// Leadership navigation). Photos are real supplied portraits, served locally (never uploaded to Spaces).
export const leaderPhotos = {
  chairman: {
    key: "local/img/leaders/niaz-ahmed-akhtar.jpg",
    url: "/img/leaders/niaz-ahmed-akhtar.jpg",
    mime: "image/jpeg",
    width: 400,
    height: 400,
    alt: "Prof. Dr Niaz Ahmed Akhtar",
  },
  executiveDirector: {
    key: "local/img/leaders/zia-ul-haq.jpg",
    url: "/img/leaders/zia-ul-haq.jpg",
    mime: "image/jpeg",
    width: 300,
    height: 300,
    alt: "Dr. Zia Ul Haq",
  },
  ceo: {
    key: "local/img/leaders/imtiaz-haider.jpg",
    url: "/img/leaders/imtiaz-haider.jpg",
    mime: "image/jpeg",
    width: 300,
    height: 300,
    alt: "Dr Muhammad Imtiaz Haider",
  },
} as const;

const p = (...paragraphs: string[]) => paragraphs.map((t) => `<p>${t}</p>`).join("");

export const leaders = [
  {
    role: "CHAIRMAN",
    name: "Prof. Dr Niaz Ahmed Akhtar",
    title: "Chairman, Higher Education Commission",
    photoKey: leaderPhotos.chairman.key,
    quote: "A fair test opens a door. Our responsibility is to ensure that it opens on the strength of merit.",
    messageHtml: p(
      "The Education Testing Council (ETC), established under the auspices of the Higher Education Commission (HEC), plays an important role in advancing fair, reliable and transparent assessments in Pakistan. Its work supports merit-based access to education, scholarships, employment and professional opportunities.",
      "For a candidate, a single test result can influence the course of a life. We must therefore treat every assessment as a public trust. Candidates should be judged on their knowledge and ability, regardless of their background or connections. Consistent procedures, secure examinations and sound test design are essential to upholding that trust.",
      "ETC has developed into a national assessment platform serving universities, government departments, regulatory bodies and professional councils. The confidence placed in ETC by these institutions brings with it a responsibility to maintain the integrity of every assessment it conducts.",
      "As we look ahead, HEC will support ETC in improving the quality of its questions, strengthening examination security and communicating more clearly with candidates. Continued investment in technology, research and skilled people will help ETC respond to changing needs while maintaining the reliability, validity and fairness of its assessments.",
      "I commend the ETC team and its partner institutions for their work. Together, we can build a culture in which opportunity follows merit and every candidate can have confidence in the result they receive.",
    ),
  },
  {
    role: "EXECUTIVE_DIRECTOR",
    name: "Dr. Zia Ul Haq",
    title: "Executive Director, Higher Education Commission",
    photoKey: leaderPhotos.executiveDirector.key,
    quote: "Strengthening assessment through integrity, innovation, standardization and excellent service.",
    messageHtml:
      p(
        "The Higher Education Commission established the Education Testing Council to give Pakistan a credible, professionally managed and self-sustaining national testing body. Our aim is straightforward: access to higher education and professional opportunities should be decided by merit, through processes that are open, consistent and trusted.",
        "Institutions need tests that are standardized, secure and quick to report; candidates need clear information and fair treatment. ETC responds by combining sound measurement methods with appropriate technology. Every stage is guided by evidence and checked for quality.",
        "We will continue to build institutional confidence through good governance, professional capacity, secure examinations and timely results. Collaboration with universities, public-sector organizations, employers and professional bodies will help make assessment more accessible, efficient and responsive.",
      ) +
      "<h4>Strategic priorities</h4><ul>" +
      [
        "<strong>Excellence</strong>: reliable, well-designed assessments.",
        "<strong>Integrity</strong>: credible examinations and secure delivery.",
        "<strong>Digital transformation</strong>: technology-enabled tests and candidate services.",
        "<strong>Confidence</strong>: transparent, responsive stakeholder relationships.",
        "<strong>Capacity</strong>: professional standards, governance and improvement.",
      ]
        .map((t) => `<li>${t}</li>`)
        .join("") +
      "</ul>",
  },
  {
    role: "CEO",
    name: "Dr Muhammad Imtiaz Haider",
    title: "Chief Executive Officer, Education Testing Council",
    photoKey: leaderPhotos.ceo.key,
    quote: "Building confidence in assessment by placing merit, integrity and the candidate experience at the heart of everything we do.",
    messageHtml: p(
      "At ETC, we hold ourselves to one simple principle: every candidate deserves a test that is fair, transparent, secure and consistent. Whether a young person is applying to a law college, a scholarship holder is entering a PhD programme, or a professional is seeking a licence, they should be able to trust that the result reflects their own ability.",
      "To make this possible, we have built our work on professional standards and operational discipline. Each question in our item bank is written by trained subject experts, reviewed by several committees, tried out on real candidates and analysed statistically before it is used to make decisions. After every live test, we study the results again, so that weak or unclear questions are corrected or removed. This cycle of checking and improving is what gives our scores their meaning.",
      "Technology is an important partner in this effort. We use automated paper generation from a calibrated item bank, optical scanning for fast and accurate marking, and online services for registration and results. As we move forward, we plan a gradual shift to computer-based testing, stronger identity verification and smarter monitoring, always with careful safeguards for data protection and confidentiality.",
      "Our responsibility does not end with conducting examinations. We work closely with institutions to help them identify talent and make sound decisions. We listen to candidates, answer their concerns and treat complaints seriously. We believe a testing body must earn trust through its actions: open processes, accountable governance, responsive service and a culture of quality.",
      "I thank our Board of Governors, the Higher Education Commission, our subject experts and the entire ETC team for their commitment. Together, we will continue to grow ETC into an institution that Pakistan can rely on for fair and meaningful assessment.",
    ),
  },
] as const;
