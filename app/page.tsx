"use client";

import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { useLanguage } from "@/context/language";

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {t("home.welcome")}
          </h1>
        </div>
      </main>
      <Footer />
    </div>
  );
}
