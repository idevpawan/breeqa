import { Navbar } from "@/components/navbar";
import { HeroSection } from "@/components/hero-section";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen mx-auto bg-background">
      <Navbar />
      <HeroSection />
    </div>
  );
}
