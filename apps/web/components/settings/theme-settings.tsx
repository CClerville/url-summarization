"use client";

import { useTheme } from "next-themes";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

type Theme = "light" | "dark" | "system";

type ThemeOption = {
  value: Theme;
  title: string;
  description: string;
};

const OPTIONS: ThemeOption[] = [
  {
    value: "system",
    title: "System",
    description: "Match your device appearance.",
  },
  {
    value: "light",
    title: "Light",
    description: "Always use light mode.",
  },
  {
    value: "dark",
    title: "Dark",
    description: "Always use dark mode.",
  },
];

export function ThemeSettings() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  function handleThemeChange(value: string) {
    setTheme(value as Theme);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="text-sm font-semibold">Appearance</div>
        <div className="text-sm text-muted-foreground">
          Choose Light, Dark, or follow your system. Currently{" "}
          <span className="font-medium text-foreground">
            {resolvedTheme ?? "system"}
          </span>
          .
        </div>
      </div>

      <RadioGroup
        value={theme ?? "system"}
        onValueChange={handleThemeChange}
        className="gap-2"
      >
        {OPTIONS.map((opt) => {
          const id = `theme-${opt.value}`;
          return (
            <div
              key={opt.value}
              className="flex items-start gap-3 rounded-md border bg-background p-3"
            >
              <RadioGroupItem value={opt.value} id={id} className="mt-0.5" />
              <label htmlFor={id} className="cursor-pointer space-y-0.5">
                <div className="text-sm font-medium leading-none">
                  {opt.title}
                </div>
                <div className="text-sm text-muted-foreground">
                  {opt.description}
                </div>
              </label>
            </div>
          );
        })}
      </RadioGroup>
    </div>
  );
}
