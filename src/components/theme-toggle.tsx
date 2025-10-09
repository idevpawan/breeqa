"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // useEffect only runs on the client, so now we can safely show the UI
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button className="size-7" variant="outline" size="icon">
        <Sun className="h-[1rem] w-[1rem]" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  return (
    <Button
      className="size-7 cursor-pointer bg-transparent border hover:bg-transparent"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      {theme === "light" ? (
        <Moon className="h-[1rem] w-[1rem]" />
      ) : (
        <Sun className="h-[1rem] w-[1rem]" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
