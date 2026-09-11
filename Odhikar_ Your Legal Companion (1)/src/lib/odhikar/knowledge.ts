// Public legal-knowledge repository (seeded, review-oriented, Bangladesh context).
// Structured so a CMS/database can replace `KNOWLEDGE_ARTICLES` without UI changes.

export interface KnowledgeCategory {
  id: string;
  slug: string;
  nameBn: string;
  nameEn: string;
  descriptionBn: string;
  icon: string;
}

export interface KnowledgeSection {
  /** Section kind, so the UI can order and label consistently. */
  kind: "meaning" | "need" | "documents" | "human-help" | "where";
  titleBn: string;
  titleEn: string;
  points: string[];
}

export interface HelpContact {
  labelBn: string;
  labelEn: string;
  value: string;
}

export interface KnowledgeArticle {
  id: string;
  slug: string;
  categoryId: string;
  titleBn: string;
  titleEn: string;
  summaryBn: string;
  tags: string[];
  status: "reviewed-template" | "draft";
  reviewedOn: string;
  sections: KnowledgeSection[];
  related: string[];
  contacts: HelpContact[];
}

export interface KnowledgeSource {
  titleBn: string;
  titleEn: string;
  authority: string;
  officialUrl?: string;
  status: "verified-official" | "verification-required";
}

const OFFICIAL_LAWS = "https://bdlaws.minlaw.gov.bd/";
export const KNOWLEDGE_SOURCES: Record<string, KnowledgeSource[]> = {
  family: [{ titleBn:"পারিবারিক আদালত আইন, ২০২৩",titleEn:"Family Courts Act, 2023",authority:"Government of Bangladesh — Laws of Bangladesh",officialUrl:OFFICIAL_LAWS,status:"verified-official" }],
  dower: [{ titleBn:"মুসলিম পারিবারিক আইন অধ্যাদেশ, ১৯৬১",titleEn:"Muslim Family Laws Ordinance, 1961",authority:"Government of Bangladesh — Laws of Bangladesh",officialUrl:OFFICIAL_LAWS,status:"verified-official" }],
  dowry: [{ titleBn:"যৌতুক নিরোধ আইন, ২০১৮",titleEn:"Dowry Prohibition Act, 2018",authority:"Government of Bangladesh — Laws of Bangladesh",officialUrl:OFFICIAL_LAWS,status:"verified-official" }],
  safety: [{ titleBn:"পারিবারিক সহিংসতা (প্রতিরোধ ও সুরক্ষা) আইন, ২০১০",titleEn:"Domestic Violence (Prevention and Protection) Act, 2010",authority:"Government of Bangladesh — Laws of Bangladesh",officialUrl:OFFICIAL_LAWS,status:"verified-official" }],
  land: [{ titleBn:"বাংলাদেশের ভূমি আইন ও সরকারি সেবা",titleEn:"Bangladesh land laws and public services",authority:"Ministry of Land / Laws of Bangladesh",status:"verification-required" }],
  employment: [{ titleBn:"বাংলাদেশ শ্রম আইন, ২০০৬",titleEn:"Bangladesh Labour Act, 2006",authority:"Government of Bangladesh — Laws of Bangladesh",officialUrl:OFFICIAL_LAWS,status:"verified-official" }],
  police: [{ titleBn:"পুলিশ আইন ও সাধারণ ডায়েরি সম্পর্কিত সরকারি নির্দেশনা",titleEn:"Police law and official General Diary guidance",authority:"Bangladesh Police",status:"verification-required" }],
  "legal-aid": [{ titleBn:"আইনগত সহায়তা প্রদান আইন, ২০০০",titleEn:"Legal Aid Services Act, 2000",authority:"Government of Bangladesh / NLASO",officialUrl:OFFICIAL_LAWS,status:"verified-official" }],
  identity: [{ titleBn:"জন্ম ও মৃত্যু নিবন্ধন আইন, ২০০৪",titleEn:"Births and Deaths Registration Act, 2004",authority:"Government of Bangladesh — Laws of Bangladesh",officialUrl:OFFICIAL_LAWS,status:"verified-official" }],
};

export const getSourcesForArticle = (article: KnowledgeArticle) => KNOWLEDGE_SOURCES[article.categoryId] ?? [];

export const KNOWLEDGE_CATEGORIES: KnowledgeCategory[] = [
  {
    id: "family",
    slug: "family",
    nameBn: "পারিবারিক আইন",
    nameEn: "Family law",
    descriptionBn: "বিবাহ, বিচ্ছেদ, সন্তানের হেফাজত ও পারিবারিক আদালতের প্রাথমিক ধারণা।",
    icon: "users",
  },
  {
    id: "dower",
    slug: "dower-maintenance",
    nameBn: "দেনমোহর, ভরণপোষণ ও বিবাহ",
    nameEn: "Dower, maintenance & marriage",
    descriptionBn: "কাবিননামা, দেনমোহরের দাবি এবং ভরণপোষণ সম্পর্কিত সাধারণ তথ্য।",
    icon: "heart-handshake",
  },
  {
    id: "dowry",
    slug: "dowry",
    nameBn: "যৌতুক",
    nameEn: "Dowry",
    descriptionBn: "যৌতুক দাবি, প্রমাণ সংরক্ষণ ও অভিযোগের সাধারণ পথ।",
    icon: "ban",
  },
  {
    id: "safety",
    slug: "domestic-violence-safety",
    nameBn: "পারিবারিক সহিংসতা ও নিরাপত্তা",
    nameEn: "Domestic violence & safety",
    descriptionBn: "তাৎক্ষণিক নিরাপত্তা, সহায়তা নম্বর ও চিকিৎসা প্রমাণের গুরুত্ব।",
    icon: "shield-alert",
  },
  {
    id: "land",
    slug: "land-inheritance",
    nameBn: "জমি ও উত্তরাধিকার",
    nameEn: "Land & inheritance",
    descriptionBn: "দলিল, খতিয়ান, নামজারি ও উত্তরাধিকার সংক্রান্ত মৌলিক তথ্য।",
    icon: "landmark",
  },
  {
    id: "wages",
    slug: "employment-wages",
    nameBn: "কাজ ও মজুরি",
    nameEn: "Employment & wages",
    descriptionBn: "বকেয়া মজুরি, কাজের হিসাব ও শ্রম সংক্রান্ত অভিযোগের ধারণা।",
    icon: "hard-hat",
  },
  {
    id: "police",
    slug: "police-complaint",
    nameBn: "থানা ও অভিযোগের প্রাথমিক নিয়ম",
    nameEn: "Police & complaint basics",
    descriptionBn: "সাধারণ ডায়েরি, এজাহার ও থানায় অভিযোগের সাধারণ ধাপ।",
    icon: "file-text",
  },
  {
    id: "legal-aid",
    slug: "legal-aid",
    nameBn: "আইন সহায়তা কোথায় পাবেন",
    nameEn: "Legal aid & where to get help",
    descriptionBn: "জাতীয় আইনগত সহায়তা সংস্থা ও স্থানীয় আইন সহায়তা কেন্দ্র।",
    icon: "life-buoy",
  },
  {
    id: "identity",
    slug: "birth-registration-identity",
    nameBn: "জন্মনিবন্ধন ও পরিচয়পত্র",
    nameEn: "Birth registration & identity",
    descriptionBn: "জন্মনিবন্ধন, জাতীয় পরিচয়পত্র ও কাগজপত্র সংশোধনের প্রাথমিক তথ্য।",
    icon: "id-card",
  },
];

const contactsDefault: HelpContact[] = [
  { labelBn: "জাতীয় জরুরি সেবা", labelEn: "National emergency service", value: "999" },
  { labelBn: "জাতীয় আইনগত সহায়তা হেল্পলাইন", labelEn: "National legal aid helpline", value: "16430" },
];

const contactsWomen: HelpContact[] = [
  { labelBn: "জাতীয় জরুরি সেবা", labelEn: "National emergency service", value: "999" },
  { labelBn: "নারী ও শিশু নির্যাতন প্রতিরোধে সহায়তা", labelEn: "Women & children support", value: "109" },
  { labelBn: "জাতীয় আইনগত সহায়তা হেল্পলাইন", labelEn: "National legal aid helpline", value: "16430" },
];

export const KNOWLEDGE_ARTICLES: KnowledgeArticle[] = [
  {
    id: "a1",
    slug: "denmohor-basics",
    categoryId: "dower",
    titleBn: "দেনমোহর কী এবং কীভাবে দাবি করা যায়",
    titleEn: "What dower (denmohor) is and how it can be claimed",
    summaryBn:
      "দেনমোহর স্ত্রীর নিজের অধিকার। কাবিননামায় লেখা অঙ্ক, কত পরিশোধ হয়েছে এবং কত বাকি — এই তিনটি তথ্যই মূল ভিত্তি।",
    tags: ["দেনমোহর", "কাবিননামা", "বিবাহ"],
    status: "reviewed-template",
    reviewedOn: "2026-08-01",
    sections: [
      {
        kind: "meaning",
        titleBn: "এর অর্থ কী",
        titleEn: "What this means",
        points: [
          "দেনমোহর বিয়ের সময় নির্ধারিত একটি অর্থ বা সম্পদ, যা স্ত্রীর নিজের প্রাপ্য।",
          "এটি চাওয়ার জন্য কারও অনুমতি লাগে না, এবং বিচ্ছেদ না হলেও দাবি করা যায়।",
          "কাবিননামায় সাধারণত পরিমাণ ও পরিশোধের ধরন লেখা থাকে।",
        ],
      },
      {
        kind: "need",
        titleBn: "আপনার যা লাগতে পারে",
        titleEn: "What you may need",
        points: [
          "কাবিননামায় লেখা দেনমোহরের পরিমাণ।",
          "এ পর্যন্ত কত টাকা বা সম্পদ পরিশোধ হয়েছে।",
          "বিয়ের তারিখ এবং বর্তমানে কোথায় আছেন সেই তথ্য।",
        ],
      },
      {
        kind: "documents",
        titleBn: "সাধারণ কাগজ ও প্রমাণ",
        titleEn: "Common documents & evidence",
        points: ["কাবিননামার কপি", "জাতীয় পরিচয়পত্র", "পরিশোধের রসিদ বা সাক্ষীর নাম"],
      },
      {
        kind: "human-help",
        titleBn: "কখন মানুষের সহায়তা নেবেন",
        titleEn: "When to seek human help",
        points: [
          "কাবিননামা হারিয়ে গেলে বা পরিমাণ নিয়ে দ্বিমত থাকলে।",
          "পরিবারে চাপ, হুমকি বা নিরাপত্তার ঝুঁকি থাকলে সঙ্গে সঙ্গে।",
        ],
      },
      {
        kind: "where",
        titleBn: "কোথায় সহায়তা পাবেন",
        titleEn: "Where to get help",
        points: [
          "জেলা আইনগত সহায়তা কমিটি (লিগ্যাল এইড অফিস)।",
          "স্থানীয় আইন সহায়তা কেন্দ্র বা প্যারালিগ্যাল।",
        ],
      },
    ],
    related: ["kabinnama-care", "maintenance-basics"],
    contacts: contactsDefault,
  },
  {
    id: "a2",
    slug: "maintenance-basics",
    categoryId: "dower",
    titleBn: "ভরণপোষণ: কে, কখন, কীভাবে",
    titleEn: "Maintenance: who, when and how",
    summaryBn:
      "ভরণপোষণ দেনমোহর থেকে আলাদা দাবি। মাসিক খরচ, সন্তানের সংখ্যা ও বর্তমান অবস্থার তথ্য গুছিয়ে রাখা জরুরি।",
    tags: ["ভরণপোষণ", "সন্তান", "পারিবারিক আদালত"],
    status: "reviewed-template",
    reviewedOn: "2026-08-01",
    sections: [
      {
        kind: "meaning",
        titleBn: "এর অর্থ কী",
        titleEn: "What this means",
        points: [
          "ভরণপোষণ হলো নিয়মিত খরচের সহায়তা, যা দেনমোহরের সঙ্গে গুলিয়ে ফেলা উচিত নয়।",
          "স্ত্রী এবং সন্তানের জন্য আলাদা আলাদা দাবি হতে পারে।",
        ],
      },
      {
        kind: "need",
        titleBn: "আপনার যা লাগতে পারে",
        titleEn: "What you may need",
        points: ["মাসিক প্রয়োজনীয় খরচের হিসাব", "সন্তানের সংখ্যা ও বয়স", "সর্বশেষ কবে খরচ দেওয়া হয়েছে"],
      },
      {
        kind: "documents",
        titleBn: "সাধারণ কাগজ ও প্রমাণ",
        titleEn: "Common documents & evidence",
        points: ["কাবিননামা", "সন্তানের জন্মনিবন্ধন", "খরচ বা লেনদেনের প্রমাণ (বিকাশ/ব্যাংক)"],
      },
      {
        kind: "human-help",
        titleBn: "কখন মানুষের সহায়তা নেবেন",
        titleEn: "When to seek human help",
        points: ["দীর্ঘদিন খরচ বন্ধ থাকলে", "সন্তানের হেফাজত নিয়ে বিরোধ থাকলে"],
      },
      {
        kind: "where",
        titleBn: "কোথায় সহায়তা পাবেন",
        titleEn: "Where to get help",
        points: ["জেলা লিগ্যাল এইড অফিস", "স্থানীয় আইন সহায়তা কেন্দ্র"],
      },
    ],
    related: ["denmohor-basics"],
    contacts: contactsDefault,
  },
  {
    id: "a3",
    slug: "dowry-demands",
    categoryId: "dowry",
    titleBn: "যৌতুক দাবি হলে কী করবেন",
    titleEn: "What to do when dowry is demanded",
    summaryBn:
      "বিয়ের আগে বা পরে যৌতুক চাওয়া বাংলাদেশে নিষিদ্ধ। কে কত দিয়েছে, কবে দিয়েছে ও কারা সাক্ষী — এসব লিখে রাখা সবচেয়ে জরুরি।",
    tags: ["যৌতুক", "প্রমাণ", "অভিযোগ"],
    status: "reviewed-template",
    reviewedOn: "2026-08-01",
    sections: [
      {
        kind: "meaning",
        titleBn: "এর অর্থ কী",
        titleEn: "What this means",
        points: [
          "যৌতুক চাওয়া, নেওয়া বা দেওয়া — সবই আইনত নিষিদ্ধ।",
          "যৌতুকের জন্য চাপ বা নির্যাতন আলাদা ও গুরুতর বিষয়।",
        ],
      },
      {
        kind: "need",
        titleBn: "আপনার যা লাগতে পারে",
        titleEn: "What you may need",
        points: ["কত টাকা বা কী সম্পদ দেওয়া হয়েছে", "কবে ও কার হাতে দেওয়া হয়েছে", "সাক্ষীদের নাম ও মোবাইল নম্বর"],
      },
      {
        kind: "documents",
        titleBn: "সাধারণ কাগজ ও প্রমাণ",
        titleEn: "Common documents & evidence",
        points: ["ব্যাংক বা বিকাশের লেনদেনের প্রমাণ", "কাবিননামা", "মেসেজ বা কল রেকর্ড (যদি নিরাপদে রাখা যায়)"],
      },
      {
        kind: "human-help",
        titleBn: "কখন মানুষের সহায়তা নেবেন",
        titleEn: "When to seek human help",
        points: ["হুমকি বা শারীরিক নির্যাতন হলে সঙ্গে সঙ্গে", "পরিবার থেকে বের করে দেওয়ার চাপ থাকলে"],
      },
      {
        kind: "where",
        titleBn: "কোথায় সহায়তা পাবেন",
        titleEn: "Where to get help",
        points: ["লিগ্যাল এইড হেল্পলাইন ১৬৪৩০", "স্থানীয় আইন সহায়তা কেন্দ্র"],
      },
    ],
    related: ["safety-first-steps", "denmohor-basics"],
    contacts: contactsWomen,
  },
  {
    id: "a4",
    slug: "safety-first-steps",
    categoryId: "safety",
    titleBn: "নিরাপত্তা ঝুঁকিতে থাকলে প্রথম পদক্ষেপ",
    titleEn: "First steps when you are at risk",
    summaryBn:
      "আঘাত, হুমকি বা তাৎক্ষণিক বিপদ হলে আইনি হিসাব পরে — আগে নিরাপত্তা। ৯৯৯ এবং ১০৯ নম্বর সবসময় খোলা।",
    tags: ["নিরাপত্তা", "সহিংসতা", "জরুরি"],
    status: "reviewed-template",
    reviewedOn: "2026-08-01",
    sections: [
      {
        kind: "meaning",
        titleBn: "এর অর্থ কী",
        titleEn: "What this means",
        points: [
          "তাৎক্ষণিক বিপদে থাকলে প্রথমে নিরাপদ জায়গায় যান।",
          "আঘাত থাকলে দ্রুত চিকিৎসা নিন — চিকিৎসার কাগজ পরে গুরুত্বপূর্ণ প্রমাণ হয়।",
        ],
      },
      {
        kind: "need",
        titleBn: "আপনার যা লাগতে পারে",
        titleEn: "What you may need",
        points: ["নিরাপদ একটি ঠিকানা বা আশ্রয়", "বিশ্বস্ত একজন মানুষের নম্বর", "ঘটনার তারিখ ও সময়"],
      },
      {
        kind: "documents",
        titleBn: "সাধারণ কাগজ ও প্রমাণ",
        titleEn: "Common documents & evidence",
        points: ["হাসপাতালের কাগজ বা প্রেসক্রিপশন", "আঘাতের ছবি (নিরাপদ হলে)", "সাক্ষীদের নাম"],
      },
      {
        kind: "human-help",
        titleBn: "কখন মানুষের সহায়তা নেবেন",
        titleEn: "When to seek human help",
        points: ["এখনই, যদি হুমকি বা আঘাতের ঝুঁকি থাকে।"],
      },
      {
        kind: "where",
        titleBn: "কোথায় সহায়তা পাবেন",
        titleEn: "Where to get help",
        points: ["জরুরি সেবা ৯৯৯", "নারী ও শিশু সহায়তা ১০৯", "লিগ্যাল এইড ১৬৪৩০"],
      },
    ],
    related: ["dowry-demands", "police-complaint-basics"],
    contacts: contactsWomen,
  },
  {
    id: "a5",
    slug: "land-papers",
    categoryId: "land",
    titleBn: "জমির কাগজ: দলিল, খতিয়ান ও নামজারি",
    titleEn: "Land papers: deed, khatian and mutation",
    summaryBn:
      "জমি-জমা বিরোধে কাগজের নাম ও দাগ নম্বর সবচেয়ে বেশি কাজে লাগে। কোন কাগজ আছে আর কোনটি নেই — সেটি আগে ঠিক করুন।",
    tags: ["জমি", "দলিল", "খতিয়ান", "নামজারি"],
    status: "reviewed-template",
    reviewedOn: "2026-08-01",
    sections: [
      {
        kind: "meaning",
        titleBn: "এর অর্থ কী",
        titleEn: "What this means",
        points: [
          "দলিল হলো মালিকানা হস্তান্তরের মূল কাগজ।",
          "খতিয়ান ও দাগ নম্বর জমি চিহ্নিত করে।",
          "নামজারি (মিউটেশন) না হলে সরকারি খাতায় নাম ওঠে না।",
        ],
      },
      {
        kind: "need",
        titleBn: "আপনার যা লাগতে পারে",
        titleEn: "What you may need",
        points: ["জমির পরিমাণ ও অবস্থান", "কার নামে কাগজ আছে", "বিরোধ কবে শুরু হয়েছে"],
      },
      {
        kind: "documents",
        titleBn: "সাধারণ কাগজ ও প্রমাণ",
        titleEn: "Common documents & evidence",
        points: ["দলিলের কপি", "খতিয়ান/পর্চা", "খাজনার রসিদ", "নামজারির কাগজ"],
      },
      {
        kind: "human-help",
        titleBn: "কখন মানুষের সহায়তা নেবেন",
        titleEn: "When to seek human help",
        points: ["দখল নিয়ে বিরোধ বা হুমকি থাকলে", "কাগজ জাল বলে সন্দেহ হলে"],
      },
      {
        kind: "where",
        titleBn: "কোথায় সহায়তা পাবেন",
        titleEn: "Where to get help",
        points: ["ইউনিয়ন ভূমি অফিস", "জেলা লিগ্যাল এইড অফিস"],
      },
    ],
    related: ["inheritance-basics"],
    contacts: contactsDefault,
  },
  {
    id: "a6",
    slug: "inheritance-basics",
    categoryId: "land",
    titleBn: "উত্তরাধিকার: অংশ বুঝে নেওয়ার প্রাথমিক ধারণা",
    titleEn: "Inheritance basics",
    summaryBn:
      "উত্তরাধিকারের হিসাব ধর্মীয় ও পারিবারিক আইনের ভিত্তিতে হয়। ওয়ারিশ সনদ ও মৃত্যুসনদ প্রথম ধাপ।",
    tags: ["উত্তরাধিকার", "ওয়ারিশ", "সম্পত্তি"],
    status: "reviewed-template",
    reviewedOn: "2026-08-01",
    sections: [
      {
        kind: "meaning",
        titleBn: "এর অর্থ কী",
        titleEn: "What this means",
        points: [
          "মৃত ব্যক্তির সম্পত্তি ওয়ারিশদের মধ্যে ভাগ হয়।",
          "কে কত অংশ পাবেন তা আইন ও পারিবারিক অবস্থার উপর নির্ভর করে — এটি সাধারণ তথ্য, ব্যক্তিগত পরামর্শ নয়।",
        ],
      },
      {
        kind: "need",
        titleBn: "আপনার যা লাগতে পারে",
        titleEn: "What you may need",
        points: ["ওয়ারিশদের তালিকা", "সম্পত্তির বিবরণ", "আগে কোনো ভাগ হয়েছে কি না"],
      },
      {
        kind: "documents",
        titleBn: "সাধারণ কাগজ ও প্রমাণ",
        titleEn: "Common documents & evidence",
        points: ["মৃত্যু সনদ", "ওয়ারিশ সনদ (ইউনিয়ন পরিষদ/পৌরসভা)", "জমির দলিল ও খতিয়ান"],
      },
      {
        kind: "human-help",
        titleBn: "কখন মানুষের সহায়তা নেবেন",
        titleEn: "When to seek human help",
        points: ["ভাগ নিয়ে পরিবারে বিরোধ হলে", "কেউ অংশ দিতে অস্বীকার করলে"],
      },
      {
        kind: "where",
        titleBn: "কোথায় সহায়তা পাবেন",
        titleEn: "Where to get help",
        points: ["ইউনিয়ন পরিষদ", "জেলা লিগ্যাল এইড অফিস"],
      },
    ],
    related: ["land-papers"],
    contacts: contactsDefault,
  },
  {
    id: "a7",
    slug: "unpaid-wages",
    categoryId: "wages",
    titleBn: "বকেয়া মজুরি আদায়ের প্রাথমিক ধাপ",
    titleEn: "First steps for unpaid wages",
    summaryBn:
      "লিখিত চুক্তি না থাকলেও কাজের মজুরি পাওয়া আপনার অধিকার। কতদিন কাজ, দিনে কত টাকা, কত পেয়েছেন — এই হিসাবই মূল।",
    tags: ["মজুরি", "শ্রম", "হিসাব"],
    status: "reviewed-template",
    reviewedOn: "2026-08-01",
    sections: [
      {
        kind: "meaning",
        titleBn: "এর অর্থ কী",
        titleEn: "What this means",
        points: [
          "কাজ করলে মজুরি প্রাপ্য — মৌখিক চুক্তিও গুরুত্বপূর্ণ।",
          "মোট প্রাপ্য থেকে যা পেয়েছেন তা বাদ দিলে বকেয়া বের হয়।",
        ],
      },
      {
        kind: "need",
        titleBn: "আপনার যা লাগতে পারে",
        titleEn: "What you may need",
        points: ["কাজ শুরু ও শেষের তারিখ", "দৈনিক বা মাসিক হার", "এ পর্যন্ত কত টাকা পেয়েছেন"],
      },
      {
        kind: "documents",
        titleBn: "সাধারণ কাগজ ও প্রমাণ",
        titleEn: "Common documents & evidence",
        points: ["হাজিরা খাতা বা ছবি", "বিকাশ/ব্যাংক লেনদেন", "সহকর্মী সাক্ষীর নাম ও নম্বর"],
      },
      {
        kind: "human-help",
        titleBn: "কখন মানুষের সহায়তা নেবেন",
        titleEn: "When to seek human help",
        points: ["মালিক যোগাযোগ বন্ধ করলে", "হুমকি বা চাকরিচ্যুতির ভয় দেখালে"],
      },
      {
        kind: "where",
        titleBn: "কোথায় সহায়তা পাবেন",
        titleEn: "Where to get help",
        points: ["স্থানীয় শ্রম দপ্তর", "জেলা লিগ্যাল এইড অফিস"],
      },
    ],
    related: ["police-complaint-basics"],
    contacts: contactsDefault,
  },
  {
    id: "a8",
    slug: "police-complaint-basics",
    categoryId: "police",
    titleBn: "থানায় অভিযোগ: জিডি ও এজাহারের পার্থক্য",
    titleEn: "Police complaints: GD vs FIR",
    summaryBn:
      "সাধারণ ডায়েরি (জিডি) ঘটনার রেকর্ড রাখে; এজাহার একটি ফৌজদারি অভিযোগ। দুটোরই কপি নিজের কাছে রাখা জরুরি।",
    tags: ["থানা", "জিডি", "এজাহার", "অভিযোগ"],
    status: "reviewed-template",
    reviewedOn: "2026-08-01",
    sections: [
      {
        kind: "meaning",
        titleBn: "এর অর্থ কী",
        titleEn: "What this means",
        points: [
          "জিডি সাধারণত ঘটনা বা আশঙ্কা লিখিতভাবে রেকর্ড করে রাখে।",
          "এজাহার গুরুতর অপরাধের আনুষ্ঠানিক অভিযোগ।",
          "যেকোনো অভিযোগের প্রাপ্তি স্বীকার বা কপি সংগ্রহ করুন।",
        ],
      },
      {
        kind: "need",
        titleBn: "আপনার যা লাগতে পারে",
        titleEn: "What you may need",
        points: ["ঘটনার তারিখ, সময় ও স্থান", "কারা জড়িত", "কী ক্ষতি হয়েছে"],
      },
      {
        kind: "documents",
        titleBn: "সাধারণ কাগজ ও প্রমাণ",
        titleEn: "Common documents & evidence",
        points: ["জাতীয় পরিচয়পত্র", "ঘটনার লিখিত বিবরণ", "ছবি, মেসেজ বা চিকিৎসার কাগজ"],
      },
      {
        kind: "human-help",
        titleBn: "কখন মানুষের সহায়তা নেবেন",
        titleEn: "When to seek human help",
        points: ["অভিযোগ নিতে অস্বীকার করা হলে", "নিরাপত্তার ঝুঁকি থাকলে"],
      },
      {
        kind: "where",
        titleBn: "কোথায় সহায়তা পাবেন",
        titleEn: "Where to get help",
        points: ["জরুরি সেবা ৯৯৯", "জেলা লিগ্যাল এইড অফিস", "স্থানীয় প্যারালিগ্যাল"],
      },
    ],
    related: ["safety-first-steps", "legal-aid-where"],
    contacts: contactsDefault,
  },
  {
    id: "a9",
    slug: "legal-aid-where",
    categoryId: "legal-aid",
    titleBn: "সরকারি আইন সহায়তা কীভাবে পাবেন",
    titleEn: "How to access government legal aid",
    summaryBn:
      "জাতীয় আইনগত সহায়তা প্রদান সংস্থা (NLASO) এর মাধ্যমে বিনামূল্যে আইনি সহায়তা পাওয়া যায়। হেল্পলাইন ১৬৪৩০।",
    tags: ["আইন সহায়তা", "লিগ্যাল এইড", "১৬৪৩০"],
    status: "reviewed-template",
    reviewedOn: "2026-08-01",
    sections: [
      {
        kind: "meaning",
        titleBn: "এর অর্থ কী",
        titleEn: "What this means",
        points: [
          "আর্থিকভাবে অসচ্ছল ব্যক্তিরা সরকারি খরচে আইনজীবীর সহায়তা পেতে পারেন।",
          "প্রতিটি জেলায় লিগ্যাল এইড অফিস রয়েছে।",
        ],
      },
      {
        kind: "need",
        titleBn: "আপনার যা লাগতে পারে",
        titleEn: "What you may need",
        points: ["জাতীয় পরিচয়পত্র", "আয়ের অবস্থা সম্পর্কে তথ্য", "বিষয়টির সংক্ষিপ্ত বিবরণ"],
      },
      {
        kind: "documents",
        titleBn: "সাধারণ কাগজ ও প্রমাণ",
        titleEn: "Common documents & evidence",
        points: ["পরিচয়পত্র", "সংশ্লিষ্ট কাগজপত্রের কপি"],
      },
      {
        kind: "human-help",
        titleBn: "কখন মানুষের সহায়তা নেবেন",
        titleEn: "When to seek human help",
        points: ["কোন দপ্তরে যাবেন বুঝতে না পারলে", "আবেদন পূরণে সহায়তা লাগলে"],
      },
      {
        kind: "where",
        titleBn: "কোথায় সহায়তা পাবেন",
        titleEn: "Where to get help",
        points: ["হেল্পলাইন ১৬৪৩০", "জেলা ও উপজেলা লিগ্যাল এইড কমিটি"],
      },
    ],
    related: ["police-complaint-basics"],
    contacts: contactsDefault,
  },
  {
    id: "a10",
    slug: "birth-registration",
    categoryId: "identity",
    titleBn: "জন্মনিবন্ধন ও পরিচয়পত্রের প্রাথমিক তথ্য",
    titleEn: "Birth registration and identity basics",
    summaryBn:
      "জন্মনিবন্ধন সন্তানের স্কুল, ভাতা ও উত্তরাধিকারের ক্ষেত্রে কাজে লাগে। ভুল থাকলে সংশোধনের সুযোগ আছে।",
    tags: ["জন্মনিবন্ধন", "এনআইডি", "কাগজপত্র"],
    status: "reviewed-template",
    reviewedOn: "2026-08-01",
    sections: [
      {
        kind: "meaning",
        titleBn: "এর অর্থ কী",
        titleEn: "What this means",
        points: [
          "জন্মনিবন্ধন একজন মানুষের প্রথম আইনি পরিচয়।",
          "নাম বা তারিখে ভুল থাকলে নির্দিষ্ট প্রক্রিয়ায় সংশোধন করা যায়।",
        ],
      },
      {
        kind: "need",
        titleBn: "আপনার যা লাগতে পারে",
        titleEn: "What you may need",
        points: ["শিশুর জন্ম তারিখ ও স্থান", "মা-বাবার পরিচয়পত্র"],
      },
      {
        kind: "documents",
        titleBn: "সাধারণ কাগজ ও প্রমাণ",
        titleEn: "Common documents & evidence",
        points: ["হাসপাতালের ছাড়পত্র বা টিকা কার্ড", "মা-বাবার এনআইডি", "বিদ্যমান নিবন্ধনের কপি"],
      },
      {
        kind: "human-help",
        titleBn: "কখন মানুষের সহায়তা নেবেন",
        titleEn: "When to seek human help",
        points: ["সংশোধনের আবেদন বারবার আটকে গেলে"],
      },
      {
        kind: "where",
        titleBn: "কোথায় সহায়তা পাবেন",
        titleEn: "Where to get help",
        points: ["ইউনিয়ন পরিষদ / সিটি কর্পোরেশন", "স্থানীয় আইন সহায়তা কেন্দ্র"],
      },
    ],
    related: ["legal-aid-where"],
    contacts: contactsDefault,
  },
  {
    id: "a11",
    slug: "kabinnama-care",
    categoryId: "family",
    titleBn: "কাবিননামা: কেন এটি সবচেয়ে জরুরি কাগজ",
    titleEn: "Kabinnama: why it matters most",
    summaryBn:
      "কাবিননামা বিয়ের প্রমাণ এবং দেনমোহরের ভিত্তি। কপি নিরাপদ জায়গায় রাখুন এবং ছবি তুলে রাখুন।",
    tags: ["কাবিননামা", "বিবাহ", "প্রমাণ"],
    status: "reviewed-template",
    reviewedOn: "2026-08-01",
    sections: [
      {
        kind: "meaning",
        titleBn: "এর অর্থ কী",
        titleEn: "What this means",
        points: [
          "কাবিননামা বিবাহ নিবন্ধনের দলিল।",
          "দেনমোহর, শর্ত ও তারিখ এখানেই লেখা থাকে।",
        ],
      },
      {
        kind: "need",
        titleBn: "আপনার যা লাগতে পারে",
        titleEn: "What you may need",
        points: ["নিবন্ধনের তারিখ", "কাজী অফিসের নাম বা এলাকা"],
      },
      {
        kind: "documents",
        titleBn: "সাধারণ কাগজ ও প্রমাণ",
        titleEn: "Common documents & evidence",
        points: ["কাবিননামার মূল কপি বা ছবি", "সাক্ষীদের নাম"],
      },
      {
        kind: "human-help",
        titleBn: "কখন মানুষের সহায়তা নেবেন",
        titleEn: "When to seek human help",
        points: ["কপি হারিয়ে গেলে নকল কপি তোলার প্রক্রিয়ায়"],
      },
      {
        kind: "where",
        titleBn: "কোথায় সহায়তা পাবেন",
        titleEn: "Where to get help",
        points: ["নিকাহ রেজিস্ট্রার (কাজী) অফিস", "স্থানীয় আইন সহায়তা কেন্দ্র"],
      },
    ],
    related: ["denmohor-basics", "maintenance-basics"],
    contacts: contactsDefault,
  },
];

export const getArticle = (slug: string) => KNOWLEDGE_ARTICLES.find((a) => a.slug === slug);
export const getCategory = (id: string) => KNOWLEDGE_CATEGORIES.find((c) => c.id === id);
