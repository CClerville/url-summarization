"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import { Menu } from "lucide-react";

import { AppSidebar } from "./app-sidebar";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

const SIDEBAR_COLLAPSED_KEY = "url-summarization:sidebar-collapsed";

function readInitialCollapsedState() {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1";
  } catch {
    return false;
  }
}

export function AppShell({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(readInitialCollapsedState);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        SIDEBAR_COLLAPSED_KEY,
        isCollapsed ? "1" : "0"
      );
    } catch {
      // ignore (private mode, denied, etc.)
    }
  }, [isCollapsed]);

  function handleToggleCollapsed() {
    setIsCollapsed((v) => !v);
  }

  function handleMobileNavigate() {
    setMobileOpen(false);
  }

  function handleNoOp() {
    // No-op handler for mobile sidebar toggle
  }

  return (
    <div className="min-h-svh bg-background text-foreground">
      <div className="flex min-h-svh w-full">
        {/* Desktop sidebar */}
        <div className="hidden md:block">
          <AppSidebar
            collapsed={isCollapsed}
            onToggleCollapsed={handleToggleCollapsed}
          />
        </div>

        {/* Mobile sidebar (sheet) */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="fixed left-3 top-3 z-40 md:hidden"
              aria-label="Open sidebar"
            >
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent className="p-0 md:hidden">
            <AppSidebar
              collapsed={false}
              onToggleCollapsed={handleNoOp}
              mobile
              onNavigate={handleMobileNavigate}
            />
          </SheetContent>
        </Sheet>

        {/* Main content */}
        <main className="flex min-h-svh min-w-0 flex-1 flex-col">
          <div className="flex-1 p-4 pt-16 md:p-8 md:pt-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
