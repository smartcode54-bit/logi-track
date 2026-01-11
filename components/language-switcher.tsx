"use client";

import Image from "next/image";
import { useLanguage } from "@/context/language";
import { Button } from "@/components/ui/button";

export function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage();

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={() => setLanguage(language === "en" ? "th" : "en")}
            className="w-auto min-w-[100px] font-medium flex items-center gap-2"
            title={language === "en" ? "Switch to Thai" : "Switch to English"}
        >
            <Image
                src={language === "en" ? "/england_round_icon_64.png" : "/thailand_round_icon_64.png"}
                alt={language === "en" ? "English flag" : "Thai flag"}
                width={20}
                height={14}
                className="object-cover rounded-sm"
                style={{ width: "30px", height: "30px" }}
            />
            <span>{language === "en" ? "English" : "ไทย"}</span>
        </Button>
    );
}
