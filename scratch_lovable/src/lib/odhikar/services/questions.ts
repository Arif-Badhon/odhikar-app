// Dynamic follow-up question generation: derived from the current case state's
// missing fields, never from a scenario's predefined list.
import type { FollowUpQuestion, MissingField } from "./types";

const BANK: Record<string, Omit<FollowUpQuestion, "id">> = {
  respondent: {
    field: "respondent",
    bn: "কার বিরুদ্ধে আপনার অভিযোগ? নাম ও সম্পর্ক বলুন।",
    en: "Who is this complaint against? Their name and relationship to you.",
  },
  marriageDate: {
    field: "marriageDate",
    bn: "আপনার বিয়ে কবে হয়েছিল?",
    en: "When did your marriage take place?",
    options: [
      { bn: "এক বছরের কম আগে", en: "Less than a year ago", value: "less than a year ago" },
      { bn: "১–৩ বছর আগে", en: "1–3 years ago", value: "1-3 years ago" },
      { bn: "৩ বছরের বেশি আগে", en: "More than 3 years ago", value: "more than 3 years ago" },
    ],
  },
  dower: {
    field: "dower",
    bn: "কাবিননামায় দেনমোহর কত টাকা লেখা আছে?",
    en: "What dower amount is written in the kabinnama?",
  },
  dowryPaid: {
    field: "dowryPaid",
    bn: "যৌতুক হিসেবে মোট কত টাকা বা সম্পদ দেওয়া হয়েছে?",
    en: "How much money or property was given as dowry in total?",
  },
  dependants: {
    field: "dependants",
    bn: "আপনার সাথে কি সন্তান বা নির্ভরশীল কেউ আছে?",
    en: "Are there children or dependants with you?",
    options: [
      { bn: "না, কেউ নেই", en: "No one", value: "none" },
      { bn: "একজন সন্তান", en: "One child", value: "1 child" },
      { bn: "একাধিক সন্তান", en: "More than one child", value: "more than one child" },
    ],
  },
  daysWorked: {
    field: "daysWorked",
    bn: "আপনি মোট কত দিন কাজ করেছেন?",
    en: "How many days in total did you work?",
  },
  dailyRate: {
    field: "dailyRate",
    bn: "দিনে কত টাকা মজুরি ঠিক হয়েছিল?",
    en: "What daily wage was agreed?",
  },
  wagesPaid: {
    field: "wagesPaid",
    bn: "এ পর্যন্ত মালিক কত টাকা দিয়েছেন?",
    en: "How much has the employer paid so far?",
  },
  evidence: {
    field: "evidence",
    bn: "আপনার কাছে কি কোনো কাগজ বা সাক্ষী আছে?",
    en: "Do you have any documents or witnesses?",
    options: [
      { bn: "সাক্ষী আছে", en: "There are witnesses", value: "witnesses available" },
      { bn: "কাগজ আছে", en: "I have documents", value: "documents available" },
      { bn: "কিছুই নেই", en: "Nothing", value: "no evidence" },
    ],
  },
  evidenceLocation: {
    field: "evidenceLocation",
    bn: "কাগজপত্র এখন কার কাছে আছে?",
    en: "Who is holding the documents right now?",
    options: [
      { bn: "আমার কাছে", en: "With me", value: "with the applicant" },
      { bn: "পরিবারের কারো কাছে", en: "With a family member", value: "with a family member" },
      { bn: "অপর পক্ষের কাছে", en: "With the other party", value: "with the opposing party" },
    ],
  },
  landArea: {
    field: "landArea",
    bn: "কত জমি নিয়ে বিরোধ চলছে?",
    en: "How much land is in dispute?",
  },
  saleRisk: {
    field: "saleRisk",
    bn: "জমিটি কি বিক্রির চেষ্টা চলছে?",
    en: "Is the land being sold or transferred?",
    options: [
      { bn: "হ্যাঁ, শুনেছি", en: "Yes, I have heard so", value: "sale attempt reported" },
      { bn: "না", en: "No", value: "no sale attempt" },
    ],
  },
  who: { field: "who", bn: "‘ওরা’ বলতে আপনি কাদের বোঝাচ্ছেন?", en: "Who do you mean by “they”?" },
  what: {
    field: "what",
    bn: "টাকাটা কীসের জন্য পাওনা — কাজের মজুরি, ধার, নাকি অন্য কিছু?",
    en: "What is the money for — wages, a loan, or something else?",
    options: [
      { bn: "কাজের মজুরি", en: "Wages for work", value: "wages" },
      { bn: "ধার দেওয়া টাকা", en: "Money I lent", value: "loan" },
      { bn: "পারিবারিক পাওনা", en: "A family entitlement", value: "family entitlement" },
    ],
  },
  howLong: {
    field: "howLong",
    bn: "কতদিন ধরে টাকাটা পাচ্ছেন না?",
    en: "How long has the money been unpaid?",
    options: [
      { bn: "কয়েক সপ্তাহ", en: "A few weeks", value: "a few weeks" },
      { bn: "কয়েক মাস", en: "A few months", value: "a few months" },
      { bn: "এক বছরের বেশি", en: "Over a year", value: "over a year" },
    ],
  },
};

/** Next single question for the first unresolved gap, or null when complete. */
export function nextQuestion(
  missing: MissingField[],
  asked: Record<string, string>,
): FollowUpQuestion | null {
  for (const m of missing) {
    if (asked[m.key] !== undefined) continue;
    const q = BANK[m.key];
    if (q) return { id: `q-${m.key}`, ...q };
    return {
      id: `q-${m.key}`,
      field: m.key,
      bn: `${m.labelBn} — একটু বলবেন?`,
      en: `Could you tell us: ${m.labelEn.toLowerCase()}?`,
    };
  }
  return null;
}

export const MAX_FOLLOW_UPS = 5;
