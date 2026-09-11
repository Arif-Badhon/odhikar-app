// Seeded synthetic demo data for Odhikar. No real client data.
import {
  calc,
  ex,
  inf,
  unk,
  type Appointment,
  type CaseRecord,
  type Clinic,
  type FollowUpQuestion,
} from "./types";

export const CLINICS: Clinic[] = [
  {
    id: "cl-1",
    name: "Manikganj Legal Aid Clinic",
    nameBn: "মানিকগঞ্জ আইন সহায়তা কেন্দ্র",
    address: "Shaheed Rafiq Road, Manikganj Sadar",
    addressBn: "শহীদ রফিক সড়ক, মানিকগঞ্জ সদর",
    phone: "01711-000101",
    distanceKm: 3.2,
  },
  {
    id: "cl-2",
    name: "Singair Community Legal Desk",
    nameBn: "সিংগাইর কমিউনিটি আইন ডেস্ক",
    address: "Union Parishad Bhaban, Singair",
    addressBn: "ইউনিয়ন পরিষদ ভবন, সিংগাইর",
    phone: "01711-000202",
    distanceKm: 8.7,
  },
  {
    id: "cl-3",
    name: "Saturia Women's Support Clinic",
    nameBn: "সাটুরিয়া নারী সহায়তা কেন্দ্র",
    address: "Bazar Road, Saturia",
    addressBn: "বাজার রোড, সাটুরিয়া",
    phone: "01711-000303",
    distanceKm: 12.4,
  },
];

export const SLOTS: Appointment[] = [
  { id: "s1", clinicId: "cl-1", dateLabelBn: "আগামীকাল", dateLabelEn: "Tomorrow", time: "10:00" },
  { id: "s2", clinicId: "cl-1", dateLabelBn: "আগামীকাল", dateLabelEn: "Tomorrow", time: "11:30" },
  {
    id: "s3",
    clinicId: "cl-1",
    dateLabelBn: "পরশু",
    dateLabelEn: "Day after tomorrow",
    time: "09:30",
    taken: true,
  },
  { id: "s4", clinicId: "cl-2", dateLabelBn: "আগামীকাল", dateLabelEn: "Tomorrow", time: "14:00" },
  {
    id: "s5",
    clinicId: "cl-2",
    dateLabelBn: "পরশু",
    dateLabelEn: "Day after tomorrow",
    time: "10:00",
  },
  { id: "s6", clinicId: "cl-3", dateLabelBn: "বৃহস্পতিবার", dateLabelEn: "Thursday", time: "11:00" },
  { id: "s7", clinicId: "cl-3", dateLabelBn: "বৃহস্পতিবার", dateLabelEn: "Thursday", time: "15:00" },
];

export interface Scenario {
  id: string;
  letter: string;
  titleBn: string;
  titleEn: string;
  descriptionEn: string;
  transcriptBn: string;
  transcriptEn: string;
  audioDurationSec: number;
  asrFails?: boolean;
  safetyOnTurn?: number; // index of follow-up question after which safety triggers
  questions: FollowUpQuestion[];
  build: (caseId: string) => CaseRecord;
  expected: string[];
}

const base = (
  id: string,
  transcriptBn: string,
  audioDurationSec: number,
): Pick<
  CaseRecord,
  "id" | "createdAt" | "receivedLabel" | "transcriptBn" | "audioRef" | "audioDurationSec"
> => ({
  id,
  createdAt: new Date().toISOString(),
  receivedLabel: "just now",
  transcriptBn,
  audioRef: `audio/${id.toLowerCase()}-intake.ogg`,
  audioDurationSec,
});

/* ---------------------------- Scenario A: Dowry + Dower ---------------------------- */
const A_TRANSCRIPT = `আমার বিয়ে হয়েছিল ২০২২ সালের ডিসেম্বরে। বিয়ের পর থেকে আমার স্বামী আর শাশুড়ি বাবার কাছ থেকে টাকা চাইতে থাকে। বাবা জমি বিক্রি করে প্রায় আশি হাজার টাকা দিয়েছে। কাবিননামায় দেনমোহর এক লাখ বিশ হাজার টাকা লেখা আছে, কিন্তু আজ পর্যন্ত এক টাকাও দেয়নি। এখন তারা বলছে আমাকে বাড়ি থেকে চলে যেতে হবে। কাবিননামা আমার বাবার কাছে আছে।`;

const A_TRANSCRIPT_EN = `My marriage took place in December 2022. Since then my husband and mother-in-law kept demanding money from my father. My father sold land and paid about eighty thousand taka. The kabinnama records dower of one hundred twenty thousand taka, but not one taka has been paid. Now they are saying I must leave the house. The kabinnama is with my father.`;

/* ---------------------------- Scenario B: Unpaid wages ---------------------------- */
const B_TRANSCRIPT = `আমি রফিক মিয়ার ইটভাটায় দশ দিন কাজ করেছি। দিনে সাড়ে পাঁচশো টাকা করে দেওয়ার কথা ছিল। উনি মাত্র তিন হাজার টাকা দিয়েছেন, বাকি টাকা আর দিচ্ছেন না। কোনো লিখিত চুক্তি নাই, তবে আমার সাথে আরও দুইজন কাজ করেছে, তারা সাক্ষী দিতে পারবে। আমার আইডি কার্ড আছে।`;

/* ---------------------------- Scenario C: Safety ---------------------------- */
const C_TRANSCRIPT = `বিয়ের সময় দেনমোহর দেড় লাখ টাকা ধার্য হয়েছিল, কিছুই দেয়নি। গত সপ্তাহে আমার স্বামী আমাকে খুব মারধর করেছে, হাতে আঘাত লেগেছে কিন্তু ডাক্তারের কাছে যেতে দেয়নি। কাল রাতে বলেছে আবার হাত তুললে আমি বাঁচব না।`;

/* ---------------------------- Scenario D: Out of scope ---------------------------- */
const D_TRANSCRIPT = `আমার ছেলে ছয় মাস ধরে স্কুলে ভর্তি হতে পারছে না। প্রধান শিক্ষক বলছেন জন্মনিবন্ধন সনদ ছাড়া ভর্তি নেবেন না, ইউনিয়ন অফিসেও ঘুরছি কিন্তু সনদ পাচ্ছি না।`;

/* ---------------------------- Scenario E: Near-zero info ---------------------------- */
const E_TRANSCRIPT = `ওরা আমার টাকা দিচ্ছে না। অনেকদিন হয়ে গেছে।`;

/* ---------------------------- Scenario F: Land ---------------------------- */
const F_TRANSCRIPT = `আমার বাবা মারা যাওয়ার পর তিন ভাই মিলে জমি ভাগ করে নিয়েছে, আমাকে কিছুই দেয়নি। প্রায় বাহান্ন শতাংশ জমি। দলিল-পর্চা সব বড় ভাইয়ের কাছে। শুনেছি ওরা জমিটা বিক্রি করার জন্য দালাল ঠিক করেছে।`;

export const SCENARIOS: Scenario[] = [
  {
    id: "A",
    letter: "A",
    titleBn: "যৌতুক দাবি ও অপরিশোধিত দেনমোহর",
    titleEn: "Dowry demand + unpaid dower",
    descriptionEn: "Multi-category result, placeholders in draft, referral.",
    transcriptBn: A_TRANSCRIPT,
    transcriptEn: A_TRANSCRIPT_EN,
    audioDurationSec: 68,
    questions: [
      {
        id: "q1",
        field: "Respondent names",
        bn: "যাদের বিরুদ্ধে অভিযোগ, তাদের নাম কী?",
        en: "What are the names of the people you are complaining about?",
      },
      {
        id: "q2",
        field: "Children / dependants",
        bn: "আপনার কোনো সন্তান আছে কি?",
        en: "Do you have any children?",
        options: [
          { bn: "হ্যাঁ, একজন", en: "Yes, one", value: "One child" },
          { bn: "না", en: "No", value: "No children" },
        ],
      },
      {
        id: "q3",
        field: "Current residence",
        bn: "এখন আপনি কোথায় থাকছেন?",
        en: "Where are you staying now?",
        options: [
          { bn: "স্বামীর বাড়িতে", en: "At husband's house", value: "Husband's house" },
          { bn: "বাবার বাড়িতে", en: "At father's house", value: "Father's house" },
        ],
      },
      {
        id: "q4",
        field: "Previous attempts",
        bn: "এর আগে কি কারো কাছে সাহায্য চেয়েছেন?",
        en: "Have you asked anyone for help before?",
        options: [
          { bn: "গ্রাম সালিশে", en: "Village shalish", value: "Village shalish, no result" },
          { bn: "না", en: "No", value: "No previous attempt" },
        ],
      },
    ],
    expected: [
      "Primary: Dowry, secondary Dower & Maintenance",
      "Confidence ≥ 0.85",
      "Amounts: 80,000 paid / 120,000 dower outstanding",
      "No safety flag",
    ],
    build: (caseId) => ({
      ...base(caseId, A_TRANSCRIPT, 68),
      transcriptEn: A_TRANSCRIPT_EN,
      status: "New",
      urgency: "Normal",
      classification: {
        primary: "Dowry",
        secondary: "Dower & Maintenance",
        confidence: 0.91,
        rationale:
          "Explicit demands for money from the bride's family after marriage (dowry) plus an unpaid kabinnama dower amount.",
      },
      applicants: [
        {
          id: "ap1",
          role: "applicant",
          name: unk("Name not stated in narrative"),
          relationship: ex("Wife of respondent 1"),
        },
      ],
      respondents: [
        {
          id: "rp1",
          role: "respondent",
          name: unk(),
          relationship: ex("Husband"),
        },
        {
          id: "rp2",
          role: "respondent",
          name: unk(),
          relationship: ex("Mother-in-law"),
        },
      ],
      keyDates: [
        { id: "d1", label: "Date of marriage", value: ex("December 2022") },
        {
          id: "d2",
          label: "Dowry payment by father",
          value: inf("After Dec 2022", "Stated as 'after the marriage', exact date not given"),
        },
        { id: "d3", label: "Pressure to leave home", value: inf("Ongoing / current") },
      ],
      amounts: {
        dower: ex(120000, "Recorded in kabinnama"),
        dowryPaid: ex(80000, "Approximate, father sold land"),
        outstanding: calc(120000, "Dower 120,000 − paid 0 = 120,000 outstanding"),
      },
      timeline: [
        { id: "t1", when: ex("Dec 2022"), what: "Marriage solemnised; dower of BDT 120,000 fixed" },
        {
          id: "t2",
          when: inf("2023"),
          what: "Husband and mother-in-law demanded money from applicant's father",
        },
        { id: "t3", when: inf("2023"), what: "Father sold land and paid approx. BDT 80,000" },
        { id: "t4", when: ex("Present"), what: "Applicant pressured to leave the marital home" },
      ],
      claimedHarm: ex(
        "Repeated dowry demands, non-payment of dower, pressure to leave the marital home",
      ),
      currentSituation: ex("Still residing at the marital home under pressure to leave"),
      dependants: unk("Not mentioned"),
      evidence: [
        { id: "e1", item: ex("Kabinnama (marriage contract)"), location: ex("With her father") },
        { id: "e2", item: inf("Land sale record for dowry payment"), location: unk() },
      ],
      previousActions: unk("No previous complaint or mediation mentioned"),
      safetyFlag: false,
      missing: [
        "Applicant's full name and address",
        "Respondents' names and address",
        "Exact date of dowry payment",
        "Whether any children are involved",
      ],
      scenarioId: "A",
    }),
  },
  {
    id: "B",
    letter: "B",
    titleBn: "বকেয়া মজুরি",
    titleEn: "Unpaid wages",
    descriptionEn: "Arithmetic shown as CALCULATED, evidence captured.",
    transcriptBn: B_TRANSCRIPT,
    transcriptEn:
      "I worked ten days at Rafiq Mia's brick kiln. The agreed rate was 550 taka a day. He paid only three thousand taka and is not paying the rest. There is no written contract, but two others worked with me and can be witnesses. I have my ID card.",
    audioDurationSec: 51,
    asrFails: true,
    questions: [
      {
        id: "q1",
        field: "Last working day",
        bn: "শেষ কবে কাজ করেছেন?",
        en: "When did you last work there?",
        options: [
          { bn: "গত মাসে", en: "Last month", value: "Last month" },
          { bn: "এই মাসে", en: "This month", value: "This month" },
        ],
      },
      {
        id: "q2",
        field: "Employer contact",
        bn: "মালিকের কাছে কি টাকা চেয়েছেন?",
        en: "Have you asked the employer for the money?",
        options: [
          { bn: "হ্যাঁ, কয়েকবার", en: "Yes, several times", value: "Asked several times, refused" },
          { bn: "না", en: "No", value: "Not yet asked" },
        ],
      },
      {
        id: "q3",
        field: "Witnesses",
        bn: "সাক্ষীরা কি কথা বলতে রাজি আছেন?",
        en: "Are the witnesses willing to speak?",
        options: [
          { bn: "হ্যাঁ", en: "Yes", value: "Two co-workers willing" },
          { bn: "জানি না", en: "I don't know", value: "Unknown" },
        ],
      },
    ],
    expected: [
      "Category: Unpaid Wages, confidence ≥ 0.9",
      "Outstanding BDT 2,500 tagged CALCULATED",
      "ASR failure → typing fallback offered",
    ],
    build: (caseId) => ({
      ...base(caseId, B_TRANSCRIPT, 51),
      status: "New",
      urgency: "Normal",
      classification: {
        primary: "Unpaid Wages",
        confidence: 0.94,
        rationale: "Day-rate labour performed, partial payment made, remainder withheld.",
      },
      applicants: [
        {
          id: "ap1",
          role: "applicant",
          name: unk(),
          relationship: ex("Day labourer at the brick kiln"),
        },
      ],
      respondents: [
        {
          id: "rp1",
          role: "respondent",
          name: ex("Rafiq Mia"),
          relationship: ex("Employer / kiln owner"),
        },
      ],
      keyDates: [
        { id: "d1", label: "Work period", value: ex("10 working days") },
        { id: "d2", label: "Exact start date", value: unk() },
      ],
      amounts: {
        wagesTotal: calc(5500, "10 days × BDT 550/day = BDT 5,500"),
        wagesPaid: ex(3000),
        outstanding: calc(2500, "BDT 5,500 − BDT 3,000 paid = BDT 2,500 outstanding"),
      },
      timeline: [
        { id: "t1", when: inf("Recent"), what: "Worked 10 days at agreed BDT 550/day" },
        { id: "t2", when: inf("Recent"), what: "Received partial payment of BDT 3,000" },
        { id: "t3", when: ex("Present"), what: "Remaining BDT 2,500 withheld" },
      ],
      claimedHarm: ex("Non-payment of earned wages of BDT 2,500"),
      currentSituation: ex("No longer working at the kiln; payment still refused"),
      dependants: unk(),
      evidence: [
        { id: "e1", item: ex("Two co-worker witnesses"), location: ex("Same locality") },
        { id: "e2", item: ex("National ID card"), location: ex("With the applicant") },
        { id: "e3", item: ex("No written contract"), location: unk("Does not exist") },
      ],
      previousActions: unk(),
      safetyFlag: false,
      missing: [
        "Applicant's name and address",
        "Kiln address",
        "Exact dates worked",
        "Whether wages were ever recorded in writing",
      ],
      scenarioId: "B",
    }),
  },
  {
    id: "C",
    letter: "C",
    titleBn: "নিরাপত্তা ঝুঁকি",
    titleEn: "Safety escalation",
    descriptionEn: "Violence + prevented medical care + forward-looking threat.",
    transcriptBn: C_TRANSCRIPT,
    transcriptEn:
      "Dower of 150,000 taka was fixed at marriage and nothing was paid. Last week my husband beat me badly, my arm was injured but he would not let me go to a doctor. Last night he said if he raises his hand again I will not survive.",
    audioDurationSec: 44,
    safetyOnTurn: 1,
    questions: [
      {
        id: "q1",
        field: "Marriage date",
        bn: "আপনার বিয়ে কবে হয়েছিল?",
        en: "When did your marriage take place?",
        options: [{ bn: "মনে নেই", en: "I don't remember", value: "Unknown" }],
      },
      {
        id: "q2",
        field: "Safety",
        bn: "এখন কি আপনি নিরাপদ জায়গায় আছেন?",
        en: "Are you in a safe place right now?",
      },
    ],
    expected: [
      "Safety detection fires mid-flow",
      "Automated flow stops, helpline 16430 shown",
      "URGENT queue entry created",
    ],
    build: (caseId) => ({
      ...base(caseId, C_TRANSCRIPT, 44),
      status: "New",
      urgency: "Urgent",
      classification: {
        primary: "Dower & Maintenance",
        confidence: 0.72,
        rationale:
          "Unpaid dower stated, but the dominant issue is disclosed physical violence — routed to a human immediately.",
      },
      applicants: [
        { id: "ap1", role: "applicant", name: unk(), relationship: ex("Wife of respondent") },
      ],
      respondents: [{ id: "rp1", role: "respondent", name: unk(), relationship: ex("Husband") }],
      keyDates: [
        { id: "d1", label: "Physical assault", value: inf("Last week") },
        { id: "d2", label: "Threat made", value: ex("Last night") },
      ],
      amounts: { dower: ex(150000), outstanding: calc(150000, "Dower 150,000 − paid 0") },
      timeline: [
        { id: "t1", when: unk(), what: "Marriage; dower of BDT 150,000 fixed, never paid" },
        { id: "t2", when: inf("Last week"), what: "Physical assault causing arm injury" },
        { id: "t3", when: inf("Last week"), what: "Prevented from seeking medical treatment" },
        { id: "t4", when: ex("Last night"), what: "Explicit threat to her life" },
      ],
      claimedHarm: ex("Physical assault, denial of medical care, threat to life, unpaid dower"),
      currentSituation: ex("Believed to be still in the same household as the respondent"),
      dependants: unk(),
      evidence: [{ id: "e1", item: inf("Visible arm injury"), location: unk("No medical record") }],
      previousActions: unk(),
      safetyFlag: true,
      safetyNote:
        "Recent physical violence, denial of medical access, and a forward-looking threat to life. Automated flow stopped and escalated to human support.",
      missing: [
        "Applicant's name and current location",
        "Whether she has a safe place to go",
        "Presence of children in the household",
      ],
      scenarioId: "C",
    }),
  },
  {
    id: "D",
    letter: "D",
    titleBn: "আওতার বাইরে",
    titleEn: "Out of scope",
    descriptionEn: "No supported category — routes to a human, no forced classification.",
    transcriptBn: D_TRANSCRIPT,
    transcriptEn:
      "My son has not been able to enrol in school for six months. The headmaster says he will not admit him without a birth registration certificate, and the union office is not issuing it.",
    audioDurationSec: 33,
    questions: [],
    expected: ["No category forced", "Explicitly marked out of scope", "Routed to clinic / human"],
    build: (caseId) => ({
      ...base(caseId, D_TRANSCRIPT, 33),
      status: "New",
      urgency: "Normal",
      classification: {
        primary: "Out of scope",
        confidence: 0.34,
        rationale:
          "Concerns birth registration and school admission — none of the four supported categories apply. Not classified; routed to a human.",
        outOfScope: true,
      },
      applicants: [{ id: "ap1", role: "applicant", name: unk(), relationship: ex("Parent") }],
      respondents: [
        { id: "rp1", role: "respondent", name: unk(), relationship: inf("School headmaster") },
      ],
      keyDates: [{ id: "d1", label: "Problem ongoing since", value: inf("About six months") }],
      amounts: {},
      timeline: [
        { id: "t1", when: inf("6 months ago"), what: "School admission refused without birth certificate" },
      ],
      claimedHarm: ex("Child unable to enrol in school"),
      currentSituation: ex("Still without a birth registration certificate"),
      dependants: ex("One school-age child"),
      evidence: [],
      previousActions: ex("Repeated visits to the union office"),
      safetyFlag: false,
      missing: ["Applicant's name and union", "Which office refused issuance"],
      scenarioId: "D",
    }),
  },
  {
    id: "E",
    letter: "E",
    titleBn: "প্রায় কোনো তথ্য নেই",
    titleEn: "Near-zero information",
    descriptionEn: "Low confidence → disambiguating follow-ups instead of guessing.",
    transcriptBn: E_TRANSCRIPT,
    transcriptEn: "They aren't giving me my money. It has been a long time.",
    audioDurationSec: 9,
    questions: [
      {
        id: "q1",
        field: "Respondent identity",
        bn: "‘ওরা’ বলতে কাদের বোঝাচ্ছেন?",
        en: "Who are 'they'?",
        options: [
          { bn: "কাজের মালিক", en: "An employer", value: "Employer" },
          { bn: "স্বামী / শ্বশুরবাড়ি", en: "Husband / in-laws", value: "Husband or in-laws" },
          { bn: "আত্মীয়", en: "A relative", value: "Relative" },
        ],
      },
      {
        id: "q2",
        field: "Nature of the money",
        bn: "এই টাকাটা কিসের?",
        en: "What is the money for?",
        options: [
          { bn: "কাজের মজুরি", en: "Wages for work", value: "Wages" },
          { bn: "দেনমোহর", en: "Dower", value: "Dower" },
          { bn: "জানি না", en: "I don't know", value: "Unknown" },
        ],
      },
      {
        id: "q3",
        field: "Duration",
        bn: "কত দিন ধরে টাকা পাচ্ছেন না?",
        en: "How long have you been waiting for the money?",
        options: [
          { bn: "কয়েক সপ্তাহ", en: "A few weeks", value: "A few weeks" },
          { bn: "কয়েক মাস", en: "A few months", value: "A few months" },
          { bn: "জানি না", en: "I don't know", value: "Unknown" },
        ],
      },
    ],
    expected: [
      "Confidence below threshold → disambiguation asked",
      "No category guessed before answers",
      "Missing fields preserved",
    ],
    build: (caseId) => ({
      ...base(caseId, E_TRANSCRIPT, 9),
      status: "New",
      urgency: "Normal",
      classification: {
        primary: "Unpaid Wages",
        confidence: 0.31,
        rationale:
          "Only 'money not given' was stated. Confidence is below the 0.6 threshold — disambiguating questions were asked instead of assigning a category.",
      },
      applicants: [{ id: "ap1", role: "applicant", name: unk(), relationship: unk() }],
      respondents: [{ id: "rp1", role: "respondent", name: unk("Referred to only as 'they'"), relationship: unk() }],
      keyDates: [{ id: "d1", label: "Since when", value: unk("'A long time' — not quantified") }],
      amounts: { outstanding: unk("Amount not stated") },
      timeline: [],
      claimedHarm: ex("Money owed and not paid"),
      currentSituation: unk(),
      dependants: unk(),
      evidence: [],
      previousActions: unk(),
      safetyFlag: false,
      missing: [
        "Who the respondents are",
        "What the money is for",
        "How much money is owed",
        "How long it has been outstanding",
      ],
      scenarioId: "E",
    }),
  },
  {
    id: "F",
    letter: "F",
    titleBn: "জমি ও উত্তরাধিকার",
    titleEn: "Land / inheritance",
    descriptionEn: "Three respondents, documents held by opposing party, possible sale in progress.",
    transcriptBn: F_TRANSCRIPT,
    transcriptEn:
      "After my father died, my three brothers divided the land among themselves and gave me nothing. About 52 decimals. All the deeds and porcha are with the eldest brother. I have heard they have engaged a broker to sell the land.",
    audioDurationSec: 47,
    questions: [
      {
        id: "q1",
        field: "Brothers' names",
        bn: "আপনার ভাইদের নাম কী?",
        en: "What are your brothers' names?",
      },
      {
        id: "q2",
        field: "Sale status",
        bn: "জমি বিক্রি কি ইতিমধ্যে হয়ে গেছে?",
        en: "Has the land already been sold?",
        options: [
          { bn: "জানি না", en: "I don't know", value: "Unknown" },
          { bn: "না, চেষ্টা করছে", en: "No, they are trying", value: "Sale attempt ongoing" },
        ],
      },
    ],
    expected: [
      "Category: Land Dispute",
      "Three respondents captured",
      "Urgency: Time-sensitive (non-safety)",
    ],
    build: (caseId) => ({
      ...base(caseId, F_TRANSCRIPT, 47),
      status: "New",
      urgency: "Time-sensitive",
      classification: {
        primary: "Land Dispute",
        confidence: 0.88,
        rationale:
          "Inheritance share withheld after the father's death; possible sale in progress makes it time-sensitive.",
      },
      applicants: [
        { id: "ap1", role: "applicant", name: unk(), relationship: ex("Daughter of the deceased") },
      ],
      respondents: [
        { id: "rp1", role: "respondent", name: unk(), relationship: ex("Eldest brother"), detail: ex("Holds the deeds and porcha") },
        { id: "rp2", role: "respondent", name: unk(), relationship: ex("Brother") },
        { id: "rp3", role: "respondent", name: unk(), relationship: ex("Brother") },
      ],
      keyDates: [
        { id: "d1", label: "Father's death", value: unk("Not stated") },
        { id: "d2", label: "Division of land", value: inf("After father's death") },
      ],
      amounts: {},
      timeline: [
        { id: "t1", when: unk(), what: "Father died" },
        { id: "t2", when: inf("After the death"), what: "Three brothers divided approx. 52 decimals among themselves" },
        { id: "t3", when: ex("Present"), what: "Broker reportedly engaged to sell the land" },
      ],
      claimedHarm: ex("Denied inheritance share of approx. 52 decimals of land"),
      currentSituation: ex("Possible sale of the disputed land in progress"),
      dependants: unk(),
      evidence: [
        { id: "e1", item: ex("Deeds and porcha"), location: ex("Held by the eldest brother") },
        { id: "e2", item: inf("Mutation / khatian records"), location: unk("Union land office") },
      ],
      previousActions: unk(),
      safetyFlag: false,
      missing: [
        "Applicant's name",
        "Names of the three brothers",
        "Mouza and dag numbers of the land",
        "Date of the father's death",
      ],
      scenarioId: "F",
    }),
  },
];

export const getScenario = (id: string) => SCENARIOS.find((s) => s.id === id);

/* --------------------------- Seeded paralegal queue --------------------------- */
export function seedQueue(): CaseRecord[] {
  const a = getScenario("A")!.build("ODH-2026-0417");
  const b = getScenario("B")!.build("ODH-2026-0416");
  const c = getScenario("C")!.build("ODH-2026-0419");
  const f = getScenario("F")!.build("ODH-2026-0411");
  const d409 = getScenario("A")!.build("ODH-2026-0409");

  c.receivedLabel = "12 min ago";
  a.receivedLabel = "1 hr ago";
  b.receivedLabel = "3 hrs ago";
  f.receivedLabel = "Yesterday";
  f.status = "Assigned";
  d409.receivedLabel = "Yesterday";
  d409.status = "Booked";
  d409.classification = {
    primary: "Dower & Maintenance",
    confidence: 0.86,
    rationale: "Unpaid dower after separation.",
  };
  d409.appointment = {
    clinicId: "cl-2",
    slotId: "s4",
    label: "Singair Community Legal Desk — Tomorrow 14:00",
  };
  return [c, a, b, f, d409];
}
