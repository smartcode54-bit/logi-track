"use client";

import { useLanguage } from "@/context/language";
import { Button } from "@/components/ui/button";

export function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage();

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={() => setLanguage(language === "en" ? "th" : "en")}
            className="w-16 font-medium"
            title={language === "en" ? "Switch to Thai" : "Switch to English"}
        >
            {language === "en" ? "🇺🇸 EN" : "🇹🇭 TH"}
        </Button>
    );
}
