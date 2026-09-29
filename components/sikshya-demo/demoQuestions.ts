export type DemoQuestion = {
  id: number
  question: string
  answer: string
  stepLabel?: string
}

export const demoQuestions: DemoQuestion[] = [
  {
    id: 1,
    question: 'Which colleges in Kathmandu offer BCA?',
    stepLabel: 'Sikshya answer',
    answer: `Over 45 constituent and affiliated colleges offer Bachelor of Computer Applications (BCA) in Kathmandu Valley under Tribhuvan University, Pokhara University, and Purbanchal University.

Key factors to compare across institutions:
1. Affiliation – TU FOHSS, Pokhara University, or Purbanchal University curriculum.
2. Verified fee structure – Total 4-year tuition typically ranges from NPR 3.5 Lakhs (constituent/community) to NPR 8.5 Lakhs (private).
3. Practical labs & internships – Software project mentorship, cloud labs, and placement ties.
4. Location & travel – Central accessibility in Koteshwor, Baneshwor, Putalisadak, or Lalitpur.

Sikshya Nepal verifies official seat quotas and intake notices directly from university gazettes.`,
  },
  {
    id: 2,
    question: 'How can I compare colleges in Nepal?',
    stepLabel: 'Comparison guide',
    answer: `Start by comparing the factors that matter most to your educational journey:

1. Program & Curriculum – Verify whether the college offers your desired specialization and syllabus revision year.
2. University Affiliation – Confirm constituent vs. affiliated status under TU, KU, PU, or CTEVT.
3. Dated Fee Breakdown – Compare verified semester tuition, lab charges, and exam fees without hidden consultancy costs.
4. Campus Facilities – Inspect computer labs, digital libraries, and faculty credentials.
5. Location & Commute – Factor in daily travel time and public transport connectivity.

Sikshya Nepal catalogs verified data from official board notices so you can compare without marketing spin.`,
  },
  {
    id: 3,
    question: 'What should I check before choosing a BCA college?',
    stepLabel: 'Checklist',
    answer: `A solid BCA comparison goes far beyond prospectus marketing.

Essential checkpoints before enrolling:
• University Affiliation: TU (Faculty of Humanities), PU, or Purbanchal recognition.
• Curriculum Balance: Practical programming credits versus theory examinations.
• Tech Infrastructure: High-speed developer labs, Git/Linux environments, and project mentorship.
• Internship Support: Documented campus placement records with domestic and remote tech firms.
• Transparent Costs: Total 8-semester fee schedule documented in writing before paying admission fees.`,
  },
  {
    id: 4,
    question: 'What is the difference between BCA and BSc CSIT in Nepal?',
    stepLabel: 'Course comparison',
    answer: `Both are popular 4-year computing degrees, but they differ in eligibility, focus, and faculty:

• Eligibility:
  - BSc CSIT requires +2 Science with Physics & Mathematics (minimum Grade C).
  - BCA welcomes students from Science, Management, Humanities, or Education (minimum 1.6 GPA / D+).

• Academic Focus:
  - BSc CSIT (TU IOST) emphasizes theoretical computer science, algorithms, calculus, and hardware systems.
  - BCA (TU FOHSS) emphasizes software engineering, database applications, and business computing.

Both degrees qualify graduates for software engineering roles and global Master's programs.`,
  },
  {
    id: 5,
    question: 'What should I consider before choosing a course after +2?',
    stepLabel: 'Academic planning',
    answer: `Start with three fundamentals: your natural problem-solving interests, subjects you genuinely enjoy, and long-term career pathways.

Evaluation framework:
1. Core Syllabus – Read the actual 4-year subject list rather than just the degree title.
2. Further Study Options – Check international degree equivalency and Master's prerequisites.
3. Market Alignment – Balance personal interest with industry demand in Nepal and abroad.
4. Practical Exposure – Look for degrees that incorporate internships and project defense.

The best choice matches your strengths rather than following peer trends.`,
  },
  {
    id: 6,
    question: 'How can Sikshya Nepal help me research colleges?',
    stepLabel: 'Platform guide',
    answer: `Sikshya Nepal gathers verified academic data into one clean, distraction-free portal:

• 1,200+ Constituent & Affiliated Campuses – Filter by university, district, and faculty.
• Live Intake Deadlines – Track application closing dates and official entrance announcements.
• Board Result Lookups – Direct verification guides for NEB, TU Balkhu, KU, and CTEVT.
• GPA Calculator – Accurate NEB theory and practical credit weighting.
• Zero Paid Rankings – Every institution profile is presented objectively without sponsored placement.`,
  },
  {
    id: 7,
    question: 'How do scholarship quotas work for Bachelors in Nepal?',
    stepLabel: 'Scholarship notice',
    answer: `Higher education scholarships in Nepal are primarily governed by university central quotas and government regulations:

1. Central Entrance Merit – Top ranks in TU IOE, CMAT, IOST, or KU CAT receive open merit scholarships.
2. Institutional 10% Quota – Affiliated private colleges must reserve 10% of seats for deserving and underprivileged students nominated by university boards.
3. Reserved Categories – Government-mandated reservations for female, Janajati, Dalit, Madhesi, and remote district applicants.
4. College Merit Awards – Semester-wise tuition waivers based on board examination performance.

Always apply through official university scholarship windows before private admission deadlines close.`,
  },
  {
    id: 8,
    question: 'Which courses are best suited after +2 Management?',
    stepLabel: 'Stream pathways',
    answer: `+2 Management graduates have diverse options across business, tech, hospitality, and law:

• Business & Finance: BBA, BBS, BBM, and BBA-BI for banking, entrepreneurship, and corporate roles.
• Tech & Computing: BCA, BIM (Bachelor of Information Management), and BSc IT (available for students with business mathematics).
• Hospitality: BHM and BTTM for tourism management.
• Legal Studies: 5-year Integrated BALLB or BBA-LLB.

BBA offers high presentation and case-study exposure, while BBS provides flexible scheduling and affordable tuition at community colleges.`,
  },
  {
    id: 9,
    question: 'What is the fee difference between constituent and private colleges in Nepal?',
    stepLabel: 'Tuition breakdown',
    answer: `Tuition structures vary significantly depending on the college ownership model:

• Constituent / Government Campuses (e.g., Patan, ASCOL, Shankar Dev, Pulchowk):
  - Subsidized by university grants.
  - 4-year tuition ranges from NPR 45,000 to NPR 3,80,000 depending on regular vs. full-fee quota.

• Community Campuses (Public Trust):
  - Non-profit community management.
  - Typical 4-year costs range from NPR 1.8 Lakhs to NPR 4.5 Lakhs.

• Private Affiliated Colleges:
  - Self-financed infrastructure and faculty.
  - 4-year programs typically range from NPR 4.5 Lakhs to NPR 14 Lakhs.

Sikshya Nepal displays the verified fee range on each college profile so families can plan transparently.`,
  },
  {
    id: 10,
    question: 'What are the eligibility requirements for Kathmandu University BTech?',
    stepLabel: 'KU Admission',
    answer: `Kathmandu University School of Engineering requires:

1. Academic Standing: Minimum 2.0 GPA in +2 Science or equivalent (with minimum C in Physics, Chemistry, and Mathematics).
2. Entrance Examination: Passing the Kathmandu University Computer-Based Test (KU-CBT).
3. Score Distribution: CBT tests Mathematics and Physics/Chemistry with negative marking for incorrect attempts.
4. Document Verification: Original academic transcripts and character certificates.

Admission offers are made strictly based on KU-CBT merit score rankings.`,
  },
  {
    id: 11,
    question: 'How does the CTEVT 3-year diploma pathway work?',
    stepLabel: 'Technical education',
    answer: `CTEVT (Council for Technical Education and Vocational Training) offers 3-year technical diplomas for students completing SEE:

• Key Programs: Diploma in Civil Engineering, Computer Engineering, Electrical Engineering, Pharmacy, and Agriculture.
• Eligibility: Minimum GPA 1.6 / Grade C in SEE with Science and Mathematics.
• Higher Education Bridge: CTEVT 3-year engineering diploma holders are legally eligible to enter Bachelor of Engineering (BE) programs after passing university entrance exams.
• Practical Focus: 70% hands-on laboratory, workshop, and on-the-job training.`,
  },
  {
    id: 12,
    question: 'What should I know before paying admission consultancy fees?',
    stepLabel: 'Student advisory',
    answer: `Stay informed to avoid common admission traps:

• Direct Applications: Domestic colleges in Nepal do not require third-party consultancies. You can apply directly on the college portal or campus office.
• Central University Entrances: TU CMAT, IOE, IOST, and KU CAT require official central registrations. Third parties cannot guarantee seats.
• Fee Receipts: Never pay cash without receiving an official university/college receipt with registered PAN.
• Affiliation Verification: Confirm the college is genuinely affiliated for your academic session on the official university website.`,
  },
  {
    id: 13,
    question: 'How do I check my NEB Grade 12 or SEE board results?',
    stepLabel: 'Results guide',
    answer: `Board results are published through official government and council servers:

1. Web Verification: Visit the official NEB portal (neb.gov.np) or Nepal Telecom result site (neb.ntc.net.np).
2. Required Details: Enter your exact Symbol Number (e.g., 2401884X) and Date of Birth in BS format (YYYY/MM/DD).
3. SMS Service: Send 'NEB <space> SymbolNumber' to 1600.
4. Official Ledger: Grade sheets are distributed to schools 15–20 days following online publication.

Sikshya Nepal provides direct links to official verification portals without ads or redirects.`,
  },
  {
    id: 14,
    question: 'What is BIM and how does it compare to BCA and BBA?',
    stepLabel: 'Curriculum breakdown',
    answer: `Bachelor of Information Management (BIM) is a 4-year TU degree run under the Faculty of Management:

• BIM Formula: Roughly 60% IT / Software Engineering + 40% Business Management and Economics.
• Comparison with BCA: BCA is more software development heavy (FOHSS), while BIM prepares students for IT Project Management, Business Analytics, and ERP consulting.
• Comparison with BBA: BBA focuses purely on marketing, finance, and general administration with minimal coding.

BIM is ideal for students who want tech literacy combined with corporate management acumen.`,
  },
  {
    id: 15,
    question: 'Can students from non-science streams pursue IT degrees in Nepal?',
    stepLabel: 'Eligibility guide',
    answer: `Yes, multiple computing degree programs welcome students from Management, Humanities, or Education backgrounds:

• BCA (TU, PU, Purbanchal) – Open to all streams with minimum 1.6 GPA / D+ overall.
• BIM (TU) – Open to +2 graduates from any stream with minimum 1.8 GPA / C in English & Mathematics.
• BIT (Purbanchal / Foreign Affiliations) – Open to students who completed +2 with basic mathematics or computer science.
• BCIS (Pokhara University) – Business Information Systems open to Management and Science students.

Only BSc CSIT and BE Computer specifically mandate +2 Science with Physics and Chemistry.`,
  },
  {
    id: 16,
    question: 'How do entrance examination timelines work in Nepal?',
    stepLabel: 'Annual timeline',
    answer: `Most universities follow an annual academic calendar following the publication of NEB Grade 12 results:

• Shrawan – Bhadra (July – August): NEB results published; TU CMAT (BBA/BCA/BIM), IOE Engineering, and KU-CBT registration forms open.
• Ashwin – Kartik (September – October): Central entrance examinations conducted; merit lists published.
• Mangsir (November): Counseling rounds, fee deposits, and orientation classes commence.

Sikshya Nepal tracks live admission countdowns so you never miss an official registration deadline.`,
  },
]
