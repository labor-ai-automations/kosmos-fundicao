"use client";

import { DashboardHeader } from "@/components/DashboardHeader";
import { Sidebar } from "@/components/Sidebar";
import { SidebarProvider, useSidebar } from "@/contexts/sidebar-context";
import { cn } from "@/lib/utils";

function AppShellLayout({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-mansure-black">
      <Sidebar />
      <div
        className={cn(
          "flex min-h-screen flex-col transition-all duration-300",
          collapsed ? "md:pl-[4.5rem]" : "md:pl-72"
        )}
      >
        <DashboardHeader />
        <main className="flex-1 px-4 py-4 lg:px-8 lg:py-5">{children}</main>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppShellLayout>{children}</AppShellLayout>
    </SidebarProvider>
  );
}
