import { Button } from "@/components/ui/button";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative bg-background flex h-screen items-center justify-center overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex text-sm font-medium items-center gap-2 justify-center mb-8">
          <p>⭐️⭐️⭐️⭐️⭐️ 4.9/5 Reviews</p>{" "}
          <span className="text-gray-400">|</span>
          <p>Rated ⭐️ 4.8/5 on Capterra</p>
        </div>
        <p className="text-5xl leading-tight font-bold text-center text-foreground">
          Ready to Redefine <br /> Your Team's Productivity?
        </p>
        <p className="text-center max-w-4xl mt-4 mx-auto text-muted-foreground">
          Our roubst task management solution provide the tools to help you
          radically streamline your workflow, comprehensive visibility into your
          team's progress, and the insights to make data-driven decisions.
        </p>
        <div className="flex gap-4 justify-center mt-8">
          <Button
            size="lg"
            asChild
            className="rounded-full hover:bg-yellow-500 py-6  bg-yellow-400 text-black font-semibold hover:scale-105 transition-all duration-300"
          >
            <Link href="/auth?mode=signup">Try 14 Day Free Trial</Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="rounded-full py-6 px-8 hover:bg-white hover:text-black border-black text-black font-semibold hover:scale-105 transition-all duration-300"
          >
            Watch Demo Video
          </Button>
        </div>
      </div>
    </section>
  );
}
