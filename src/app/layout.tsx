import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { OrganizationProvider } from "@/lib/contexts/organization-context";
import { UserProfileProvider } from "@/lib/contexts/user-profile-context";
import { ProjectProvider } from "@/lib/contexts/project-context";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Breeqa",
  description:
    "A modern Next.js application with shadcn/ui components and theme switching",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <UserProfileProvider>
            <OrganizationProvider>
              <ProjectProvider>{children}</ProjectProvider>
            </OrganizationProvider>
          </UserProfileProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
