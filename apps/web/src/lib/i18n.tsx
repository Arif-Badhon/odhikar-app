"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "bn" | "en";

const translations = {
    bn: {
        brand: "অধিকার",
        tagline: "আইনি সুরক্ষা ও সহযোগিতায় আপনার পাশে",
        emergency_call: "জরুরি সেবা: ৯৯৯ | লিগ্যাল এইড: ১৬৪৩০ | নারী ও শিশু হেল্পলাইন: ১০৯",
        journey_victim_title: "আমি ভিকটিম / আইনি সহায়তা চাই",
        journey_victim_desc: "পারিবারিক দেনমোহর, যৌতুক, মজুরি বা জমি নিয়ে সমস্যা? বাংলায় কথা বলে সহজে আইনি আবেদন তৈরি করুন।",
        journey_victim_btn: "সহায়তা শুরু করুন",
        journey_report_title: "আমি অপরাধ প্রত্যক্ষ করেছি / রিপোর্ট করতে চাই",
        journey_report_desc: "সাইবার অপরাধ, প্রতারণা বা চাঁদাবাজি সংক্রান্ত বিষয়ে নিরাপদ জিডি (GD) খসড়া তৈরি করুন।",
        journey_report_btn: "রিপোর্ট প্রস্তুত করুন",
        journey_knowledge_title: "আইনি অধিকার ও তথ্যভাণ্ডার",
        journey_knowledge_desc: "বাংলাদেশের প্রচলিত আইন ও নির্দেশিকা সম্পর্কে জানুন এবং সংশ্লিষ্ট আইনের উৎস যাচাই করুন।",
        journey_knowledge_btn: "তথ্য দেখুন",
        staff_login: "প্যারালেগাল / স্টাফ লগইন",
        toggle_lang: "English",
    },
    en: {
        brand: "Odhikar",
        tagline: "Empowering Legal Aid and Justice in Bangladesh",
        emergency_call: "Emergency: 999 | Legal Aid: 16430 | Violence Helpline: 109",
        journey_victim_title: "I am a Victim / Seek Legal Aid",
        journey_victim_desc: "Issues with dower, dowry, unpaid wages, or land? Speak in Bangla to draft your structured intake.",
        journey_victim_btn: "Get Legal Aid",
        journey_report_title: "I Witnessed / Want to Report a Crime",
        journey_report_desc: "Prepare a self-service General Diary (GD) draft for cyber or general crimes safely.",
        journey_report_btn: "Prepare Report",
        journey_knowledge_title: "Browse Legal Knowledge",
        journey_knowledge_desc: "Explore verified, source-backed Bangladesh statutory laws and guidance.",
        journey_knowledge_btn: "Browse Knowledge",
        staff_login: "Paralegal / Staff Login",
        toggle_lang: "বাংলা",
    }
};

const I18nContext = createContext<{
    lang: Language;
    t: typeof translations["bn"];
    toggleLang: () => void;
}>({
    lang: "bn",
    t: translations.bn,
    toggleLang: () => { },
});

export const I18nProvider = ({ children }: { children: React.ReactNode }) => {
    const [lang, setLang] = useState<Language>("bn");

    const toggleLang = () => {
        setLang((prev) => (prev === "bn" ? "en" : "bn"));
    };

    return (
        <I18nContext.Provider value={{ lang, t: translations[lang], toggleLang }}>
            {children}
        </I18nContext.Provider>
    );
};

export const useI18n = () => useContext(I18nContext);