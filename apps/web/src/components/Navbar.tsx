"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { Scale, Globe, ShieldCheck } from "lucide-react";

export default function Navbar() {
    const { t, toggleLang } = useI18n();

    return (
        <nav className="border-b bg-white/90 backdrop-blur sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center space-x-2">
                    <Scale className="h-7 w-7 text-emerald-600" />
                    <span className="text-2xl font-bold tracking-tight text-slate-900">{t.brand}</span>
                </Link>

                <div className="flex items-center space-x-4">
                    <button
                        onClick={toggleLang}
                        className="flex items-center space-x-1 border px-3 py-1.5 rounded-md text-sm font-medium hover:bg-slate-50"
                    >
                        <Globe className="h-4 w-4 text-slate-600" />
                        <span>{t.toggle_lang}</span>
                    </button>
                    <Link
                        href="/staff/login"
                        className="text-xs text-slate-500 hover:text-slate-900 flex items-center space-x-1"
                    >
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>{t.staff_login}</span>
                    </Link>
                </div>
            </div>
        </nav>
    );
}