// Crime / witness reporting domain data. Bangla-first, Bangladesh context.
// Seeded static content today; a CMS or database can replace SOURCES later.

export type ReportGroup = "cyber" | "general";

export interface ReportIncidentType {
  id: string;
  group: ReportGroup;
  titleBn: string;
  titleEn: string;
  descBn: string;
  /** Plain-language references to Bangladeshi law — general information only. */
  lawsBn: string[];
  /** Evidence a person should preserve before it disappears. */
  evidenceBn: string[];
  /** Where this normally goes. */
  routeBn: string[];
  urgent?: boolean;
}

export const INCIDENT_TYPES: ReportIncidentType[] = [
  {
    id: "online-harassment",
    group: "cyber",
    titleBn: "অনলাইনে হয়রানি / ব্ল্যাকমেইল",
    titleEn: "Online harassment or blackmail",
    descBn: "হুমকি, অনুমতি ছাড়া ছবি-ভিডিও ছড়ানো, বারবার বিরক্ত করা।",
    lawsBn: [
      "সাইবার নিরাপত্তা সংক্রান্ত আইনে অনুমতি ছাড়া ব্যক্তিগত ছবি বা ভিডিও প্রকাশ শাস্তিযোগ্য অপরাধ।",
      "নারী ও শিশু নির্যাতন দমন আইনে ব্ল্যাকমেইল ও যৌন হয়রানির অভিযোগ করা যায়।",
      "থানায় সাধারণ ডায়েরি (জিডি) করা আপনার অধিকার — এতে কোনো ফি লাগে না।",
    ],
    evidenceBn: [
      "সব মেসেজ ও কলের স্ক্রিনশট (তারিখ-সময় দেখা যায় এমনভাবে)",
      "প্রোফাইল লিংক ও ইউজারনেম কপি করে রাখুন",
      "কিছু মুছবেন না — ব্লক করার আগে প্রমাণ সংরক্ষণ করুন",
    ],
    routeBn: ["থানায় জিডি", "পুলিশ সাইবার সাপোর্ট ফর উইমেন (PCSW)", "আইন সহায়তা কেন্দ্র"],
    urgent: true,
  },
  {
    id: "financial-fraud",
    group: "cyber",
    titleBn: "আর্থিক প্রতারণা / স্ক্যাম",
    titleEn: "Financial fraud or scam",
    descBn: "বিকাশ-নগদ প্রতারণা, ফিশিং, অনুমতি ছাড়া টাকা কেটে নেওয়া।",
    lawsBn: [
      "প্রতারণা করে টাকা নেওয়া দণ্ডবিধির আওতায় শাস্তিযোগ্য অপরাধ।",
      "মোবাইল ব্যাংকিং প্রতারণার ক্ষেত্রে দ্রুত অভিযোগ করলে লেনদেন আটকানোর সম্ভাবনা বাড়ে।",
    ],
    evidenceBn: [
      "ট্রানজেকশন আইডি ও এসএমএস সংরক্ষণ করুন",
      "যে নম্বর বা অ্যাকাউন্টে টাকা গেছে তা লিখে রাখুন",
      "সংশ্লিষ্ট সেবার হেল্পলাইনে সঙ্গে সঙ্গে জানান",
    ],
    routeBn: ["থানায় জিডি / অভিযোগ", "সিআইডি সাইবার ক্রাইম", "সেবাদাতার হেল্পলাইন"],
  },
  {
    id: "account-takeover",
    group: "cyber",
    titleBn: "অ্যাকাউন্ট হ্যাক",
    titleEn: "Hacking or account takeover",
    descBn: "ফেসবুক, ইমেইল বা ব্যাংক অ্যাকাউন্ট অন্য কারো নিয়ন্ত্রণে চলে গেছে।",
    lawsBn: [
      "অনুমতি ছাড়া কারো অ্যাকাউন্টে প্রবেশ সাইবার আইনে অপরাধ।",
      "হ্যাক করা অ্যাকাউন্ট থেকে করা পোস্টের দায় আপনার নয় — জিডি করে রাখলে তা প্রমাণ হিসেবে কাজ করে।",
    ],
    evidenceBn: [
      "লগইন নোটিফিকেশন ও রিকভারি ইমেইলের স্ক্রিনশট",
      "অ্যাকাউন্টে করা অস্বাভাবিক পোস্ট বা মেসেজের স্ক্রিনশট",
      "অন্য অ্যাকাউন্টগুলোর পাসওয়ার্ড দ্রুত বদলান",
    ],
    routeBn: ["থানায় জিডি", "সিআইডি সাইবার ক্রাইম", "প্ল্যাটফর্মে রিপোর্ট"],
  },
  {
    id: "impersonation",
    group: "cyber",
    titleBn: "ভুয়া পরিচয় / নকল প্রোফাইল",
    titleEn: "Identity theft or fake profile",
    descBn: "কেউ আপনার নাম-ছবি ব্যবহার করে ভুয়া প্রোফাইল চালাচ্ছে।",
    lawsBn: [
      "অন্যের পরিচয় ব্যবহার করে প্রতারণা সাইবার আইনে অপরাধ।",
      "ভুয়া প্রোফাইলের কারণে ক্ষতি হলে ক্ষতিপূরণের দাবি করা যেতে পারে।",
    ],
    evidenceBn: [
      "ভুয়া প্রোফাইলের লিংক ও স্ক্রিনশট",
      "কারা বার্তা পেয়েছেন তাদের নাম",
      "আপনার নিজের আসল প্রোফাইলের প্রমাণ (এনআইডি/ছবি)",
    ],
    routeBn: ["থানায় জিডি", "প্ল্যাটফর্মে রিপোর্ট", "পুলিশ সাইবার সাপোর্ট"],
  },
  {
    id: "assault",
    group: "general",
    titleBn: "মারধর / শারীরিক আঘাত",
    titleEn: "Assault or physical harm",
    descBn: "কাউকে মারধর করা হয়েছে বা আঘাত করা হয়েছে।",
    lawsBn: [
      "শারীরিক আঘাত দণ্ডবিধির আওতায় শাস্তিযোগ্য অপরাধ।",
      "আঘাত গুরুতর হলে হাসপাতালের সার্টিফিকেট গুরুত্বপূর্ণ প্রমাণ।",
    ],
    evidenceBn: [
      "চিকিৎসার কাগজ ও ব্যবস্থাপত্র",
      "আঘাতের ছবি (তারিখসহ)",
      "প্রত্যক্ষদর্শীদের নাম ও মোবাইল নম্বর",
    ],
    routeBn: ["থানায় অভিযোগ", "জরুরি সেবা ৯৯৯", "আইন সহায়তা কেন্দ্র"],
    urgent: true,
  },
  {
    id: "theft",
    group: "general",
    titleBn: "চুরি / ছিনতাই",
    titleEn: "Theft or robbery",
    descBn: "জিনিসপত্র বা টাকা চুরি বা জোর করে নিয়ে যাওয়া হয়েছে।",
    lawsBn: [
      "চুরি ও ছিনতাই দণ্ডবিধির আওতায় শাস্তিযোগ্য অপরাধ।",
      "হারানো জিনিসের জন্য থানায় জিডি করলে পরে কাজে লাগে।",
    ],
    evidenceBn: [
      "যা হারিয়েছে তার তালিকা ও আনুমানিক দাম",
      "আশেপাশের সিসি ক্যামেরার তথ্য",
      "প্রত্যক্ষদর্শীদের নাম",
    ],
    routeBn: ["থানায় জিডি / অভিযোগ", "স্থানীয় পুলিশ ফাঁড়ি"],
  },
  {
    id: "extortion",
    group: "general",
    titleBn: "চাঁদাবাজি / হুমকি",
    titleEn: "Extortion or threats",
    descBn: "টাকা দাবি করে ভয় দেখানো বা হুমকি দেওয়া হচ্ছে।",
    lawsBn: [
      "ভয় দেখিয়ে টাকা আদায় দণ্ডবিধির আওতায় শাস্তিযোগ্য।",
      "হুমকি অব্যাহত থাকলে দ্রুত জিডি করা নিরাপত্তার জন্য জরুরি।",
    ],
    evidenceBn: ["হুমকির কল রেকর্ড বা মেসেজ", "কারা উপস্থিত ছিলেন", "টাকা দেওয়া হলে তার প্রমাণ"],
    routeBn: ["থানায় জিডি", "জরুরি সেবা ৯৯৯"],
    urgent: true,
  },
  {
    id: "other",
    group: "general",
    titleBn: "অন্য কোনো ঘটনা",
    titleEn: "Something else",
    descBn: "উপরের কোনোটির সাথে মিলছে না — নিজের ভাষায় লিখুন।",
    lawsBn: [
      "আমরা কোনো আইনি সিদ্ধান্ত অনুমান করছি না। খসড়া যাচাই করে প্রয়োজনে 16430-এ আইন সহায়তা নিন।",
    ],
    evidenceBn: ["যা কিছু আছে — ছবি, কাগজ, মেসেজ — নিরাপদে রাখুন"],
    routeBn: ["আইন সহায়তা কেন্দ্রে পরামর্শ"],
  },
];

export interface District {
  id: string;
  nameBn: string;
  nameEn: string;
  thanas: string[];
}

export const DISTRICTS: District[] = [
  {
    id: "dhaka",
    nameBn: "ঢাকা",
    nameEn: "Dhaka",
    thanas: ["রমনা থানা", "ধানমন্ডি থানা", "মিরপুর মডেল থানা", "উত্তরা পশ্চিম থানা", "গুলশান থানা"],
  },
  {
    id: "chattogram",
    nameBn: "চট্টগ্রাম",
    nameEn: "Chattogram",
    thanas: ["কোতোয়ালী থানা", "পাঁচলাইশ থানা", "ডবলমুরিং থানা", "হালিশহর থানা"],
  },
  {
    id: "khulna",
    nameBn: "খুলনা",
    nameEn: "Khulna",
    thanas: ["সোনাডাঙ্গা থানা", "খালিশপুর থানা", "দৌলতপুর থানা"],
  },
  {
    id: "rajshahi",
    nameBn: "রাজশাহী",
    nameEn: "Rajshahi",
    thanas: ["বোয়ালিয়া থানা", "রাজপাড়া থানা", "মতিহার থানা"],
  },
  {
    id: "sylhet",
    nameBn: "সিলেট",
    nameEn: "Sylhet",
    thanas: ["কোতোয়ালী থানা", "জালালাবাদ থানা", "দক্ষিণ সুরমা থানা"],
  },
  {
    id: "rangpur",
    nameBn: "রংপুর",
    nameEn: "Rangpur",
    thanas: ["কোতোয়ালী থানা", "হাজিরহাট থানা", "তাজহাট থানা"],
  },
  {
    id: "barishal",
    nameBn: "বরিশাল",
    nameEn: "Barishal",
    thanas: ["কোতোয়ালী থানা", "বন্দর থানা", "এয়ারপোর্ট থানা"],
  },
  {
    id: "mymensingh",
    nameBn: "ময়মনসিংহ",
    nameEn: "Mymensingh",
    thanas: ["কোতোয়ালী থানা", "ত্রিশাল থানা", "মুক্তাগাছা থানা"],
  },
];

export const REPORT_HELPLINES = [
  { labelBn: "জাতীয় জরুরি সেবা", number: "999" },
  { labelBn: "পুলিশ সাইবার সাপোর্ট ফর উইমেন", number: "01320-000888" },
  { labelBn: "সিআইডি সাইবার ক্রাইম", number: "01320-0119998" },
  { labelBn: "জাতীয় আইনগত সহায়তা", number: "16430" },
  { labelBn: "নারী ও শিশু সহায়তা", number: "109" },
];

export type ReporterRole = "victim" | "witness";

export interface ReportInput {
  incidentTypeId: string;
  reporterRole: ReporterRole;
  districtId: string;
  thana: string;
  whenLabel: string;
  narrative: string;
  suspectInfo: string;
  evidenceHeld: string[];
  contact: string;
  anonymous: boolean;
}

/** Structured report details retained for compatibility with older locally stored demo cases. */
export interface ReportDetails {
  incidentTypeId: string;
  incidentTitleBn: string;
  incidentTitleEn: string;
  group: ReportGroup;
  reporterRole: ReporterRole;
  districtNameBn: string;
  thana: string;
  whenLabel: string;
  suspectInfo: string;
  evidenceHeld: string[];
  contact: string;
  anonymous: boolean;
  gdDraft: string;
}

export const findIncident = (id: string): ReportIncidentType | undefined =>
  INCIDENT_TYPES.find((t) => t.id === id);

/** Builds a Thana-ready General Diary draft. Placeholders stay visible when unknown. */
export function buildGdDraft(input: ReportInput, caseId: string): string {
  const inc = findIncident(input.incidentTypeId);
  const district = DISTRICTS.find((d) => d.id === input.districtId);
  const gap = (v: string, label: string) => (v.trim() ? v.trim() : `[${label} — উল্লেখ করা হয়নি]`);

  return [
    "বরাবর",
    `অফিসার ইন-চার্জ, ${gap(input.thana, "থানা")}${district ? `, ${district.nameBn}` : ""}`,
    "",
    `বিষয়: ${inc?.titleBn ?? "ঘটনা"} সংক্রান্ত সাধারণ ডায়েরি (জিডি)।`,
    "",
    "জনাব,",
    `আমি নিম্নস্বাক্ষরকারী ${gap(input.anonymous ? "" : input.contact, "নাম ও যোগাযোগ")} এই মর্মে জানাচ্ছি যে,`,
    `${gap(input.whenLabel, "ঘটনার তারিখ/সময়")} সময়ে নিম্নলিখিত ঘটনাটি ঘটে।`,
    "",
    "ঘটনার বিবরণ:",
    gap(input.narrative, "ঘটনার বিবরণ"),
    "",
    "অভিযুক্ত সম্পর্কে তথ্য:",
    gap(input.suspectInfo, "অভিযুক্তের তথ্য"),
    "",
    "সংরক্ষিত প্রমাণ:",
    input.evidenceHeld.length ? input.evidenceHeld.map((e) => `• ${e}`).join("\n") : "• [কোনো প্রমাণের কথা উল্লেখ করা হয়নি]",
    "",
    `আমি ${input.reporterRole === "witness" ? "ঘটনার প্রত্যক্ষদর্শী হিসেবে" : "ভুক্তভোগী হিসেবে"} বিষয়টি আপনাকে অবহিত করছি। অনুগ্রহ করে বিষয়টি সাধারণ ডায়েরিভুক্ত করে প্রয়োজনীয় ব্যবস্থা গ্রহণ করবেন।`,
    "",
    "নিবেদক,",
    gap(input.anonymous ? "" : input.contact, "নাম ও মোবাইল নম্বর"),
    `রেফারেন্স: ${caseId} (অধিকার — খসড়া; তথ্য যাচাই ও প্রয়োজনীয় ফাঁকা অংশ পূরণ করে ব্যবহার করুন)`,
  ].join("\n");
}
