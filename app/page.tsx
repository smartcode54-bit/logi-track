import Navigation from "@/components/navigation";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Welcome to Fire Home Course
          </h1>
        </div>
      </main>
    </div>
  );
}
