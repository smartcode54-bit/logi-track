"use client";

import Navigation from "@/components/navigation";
import ContinueWithGoogleButton from "@/components/continue-with-google-button";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-card rounded-lg shadow-lg p-8 border border-border">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Login
            </h1>
            <p className="text-muted-foreground">
              Sign in to your account
            </p>
          </div>

          <div className="space-y-4">
            <ContinueWithGoogleButton />
          </div>
        </div>
      </main>
    </div>
  );
}
