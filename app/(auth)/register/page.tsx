"use client";

import Navigation from "@/components/navigation";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Register Page
          </h1>
          <p className="text-muted-foreground">
            Register functionality will be implemented here
          </p>
        </div>
      </main>
    </div>
  );
}

