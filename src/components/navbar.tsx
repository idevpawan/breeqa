"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className=" absolute top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-20">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold text-foreground">
                  Breeqa.
                </span>
              </div>
            </Link>
            {/* Desktop Navigation */}
            <div className="hidden text-[13px] md:flex items-center space-x-8">
              <p className="hover:text-primary cursor-pointer transition-all duration-300">
                Features
              </p>
              <p className="hover:text-primary cursor-pointer transition-all duration-300">
                Pricing
              </p>
              <p className="hover:text-primary cursor-pointer transition-all duration-300">
                About
              </p>
              <p className="hover:text-primary cursor-pointer transition-all duration-300">
                Contact
              </p>
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2">
              <Button variant="ghost" size="lg" asChild>
                <Link href="/auth?mode=login">Login</Link>
              </Button>
              <Button size="lg" asChild className="rounded-full">
                <Link href="/auth?mode=signup">Try 14 Day Trial</Link>
              </Button>
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    isMenuOpen
                      ? "M6 18L18 6M6 6l12 12"
                      : "M4 6h16M4 12h16M4 18h16"
                  }
                />
              </svg>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t bg-background">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                href="/features"
                className="block px-3 py-2 text-base font-medium text-foreground hover:text-accent-foreground hover:bg-accent rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="/pricing"
                className="block px-3 py-2 text-base font-medium text-foreground hover:text-accent-foreground hover:bg-accent rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link
                href="/about"
                className="block px-3 py-2 text-base font-medium text-foreground hover:text-accent-foreground hover:bg-accent rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/contact"
                className="block px-3 py-2 text-base font-medium text-foreground hover:text-accent-foreground hover:bg-accent rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              <div className="px-3 py-2 space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  asChild
                >
                  <Link href="/auth">Sign In</Link>
                </Button>
                <Button size="sm" className="w-full" asChild>
                  <Link href="/auth">Get Started</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
