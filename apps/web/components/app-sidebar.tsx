"use client";

import type { ReactNode } from "react";
import { useCallback, useState } from "react";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  Clock,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Settings,
  X,
} from "lucide-react";

import { cn } from "../lib/utils";
import { ThemeSettings } from "./settings/theme-settings";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

export type AppSidebarProps = {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  mobile?: boolean;
  onNavigate?: () => void;
};

export function AppSidebar({
  collapsed,
  onToggleCollapsed,
  mobile = false,
  onNavigate,
}: AppSidebarProps) {
  const widthClass = collapsed ? "w-14" : "w-64";
  const [mobileSettingsOpen, setMobileSettingsOpen] = useState(false);

  const NavButton = useCallback(
    ({ icon, label }: { icon: ReactNode; label: string }) => {
      function handleClick() {
        onNavigate?.();
      }

      return (
        <Button
          type="button"
          variant="ghost"
          className={cn(
            "w-full justify-start gap-2",
            collapsed && !mobile && "justify-center px-0"
          )}
          onClick={handleClick}
        >
          {icon}
          {collapsed && !mobile ? null : (
            <span className="truncate">{label}</span>
          )}
        </Button>
      );
    },
    [collapsed, mobile, onNavigate]
  );

  return (
    <aside
      data-slot="app-sidebar"
      className={cn(
        "h-svh border-r bg-background",
        "transition-[width] duration-200 ease-in-out",
        widthClass
      )}
    >
      <div className="flex h-full flex-col">
        <div
          className={cn(
            "flex h-12 items-center gap-2 px-2",
            collapsed && !mobile && "justify-center px-0"
          )}
        >
          {collapsed && !mobile ? null : (
            <div className="min-w-0 px-1 text-sm font-semibold tracking-tight">
              Url Summarizer
            </div>
          )}
          <div className={cn("ml-auto", collapsed && !mobile && "ml-0")}>
            {!mobile ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                onClick={onToggleCollapsed}
              >
                {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
              </Button>
            ) : null}
          </div>
        </div>

        <div className="flex-1" />

        <div className="px-2 py-2">
          <NavButton icon={<Plus />} label="New summary" />
        </div>

        <div className="border-t p-2">
          {mobile ? (
            <DialogPrimitive.Root
              open={mobileSettingsOpen}
              onOpenChange={setMobileSettingsOpen}
            >
              <DialogPrimitive.Trigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  className={cn("w-full justify-start gap-2")}
                >
                  <Settings />
                  <span className="truncate">Settings</span>
                </Button>
              </DialogPrimitive.Trigger>
              <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
                <DialogPrimitive.Content className="fixed inset-0 z-50 bg-background p-4 outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0">
                  <DialogPrimitive.Title className="sr-only">
                    Settings
                  </DialogPrimitive.Title>
                  <div className="mx-auto flex h-full w-full max-w-md flex-col">
                    <div className="flex items-center justify-between border-b pb-3">
                      <div className="text-sm font-semibold">Settings</div>
                      <DialogPrimitive.Close asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label="Close"
                        >
                          <X />
                        </Button>
                      </DialogPrimitive.Close>
                    </div>

                    <div className="flex-1 overflow-auto pt-4">
                      <ThemeSettings />
                    </div>
                  </div>
                </DialogPrimitive.Content>
              </DialogPrimitive.Portal>
            </DialogPrimitive.Root>
          ) : (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-2",
                    collapsed && "justify-center px-0"
                  )}
                >
                  <Settings />
                  {collapsed ? null : (
                    <span className="truncate">Settings</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent side="right" align="start" className="w-80">
                <ThemeSettings />
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>
    </aside>
  );
}
