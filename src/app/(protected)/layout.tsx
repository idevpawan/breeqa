"use client";

import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ToastProvider } from "@/components/toast-provider";
import { usePathname } from "next/navigation";

export default function Page({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";
  const segments = pathname.split("/").filter(Boolean);

  const toTitle = (segment: string) =>
    segment
      .split("-")
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(" ");

  const buildHref = (index: number) =>
    "/" + segments.slice(0, index + 1).join("/");

  return (
    <ToastProvider>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "16rem",
          } as React.CSSProperties
        }
      >
        <AppSidebar />
        <SidebarInset>
          <header className="bg-background sticky top-0 flex shrink-0 items-center gap-2 border-b p-3">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                {segments.length === 0 ? (
                  <BreadcrumbItem>
                    <BreadcrumbPage>Home</BreadcrumbPage>
                  </BreadcrumbItem>
                ) : (
                  segments.map((segment, index) => (
                    <div key={index}>
                      {index > 0 && (
                        <BreadcrumbSeparator
                          key={`sep-${index}`}
                          className="hidden md:block"
                        />
                      )}
                      <BreadcrumbItem
                        key={`item-${index}`}
                        className={
                          index < segments.length - 1
                            ? "hidden md:block"
                            : undefined
                        }
                      >
                        {index < segments.length - 1 ? (
                          <BreadcrumbLink href={buildHref(index)}>
                            {toTitle(segment)}
                          </BreadcrumbLink>
                        ) : (
                          <BreadcrumbPage>{toTitle(segment)}</BreadcrumbPage>
                        )}
                      </BreadcrumbItem>
                    </div>
                  ))
                )}
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          {children}
        </SidebarInset>
      </SidebarProvider>
    </ToastProvider>
  );
}
