"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";

import { AppShell } from "@/components/app-shell";
import { Link as LinkIcon } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/trpc/react";

const urlSchema = z
  .string()
  .url()
  .refine((url) => url.startsWith("https://"), {
    message: "Only HTTPS URLs are allowed",
  });

export default function Home() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const utils = trpc.useUtils();
  const createMutation = trpc.urlSummary.create.useMutation({
    onSuccess: () => {
      setUrl("");
      setError(null);
      utils.urlSummary.list.invalidate();
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  function handleUrlChange(e: ChangeEvent<HTMLInputElement>) {
    setUrl(e.target.value);
    setError(null);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    // Client-side validation
    const validationResult = urlSchema.safeParse(url);
    if (!validationResult.success) {
      setError(validationResult.error.issues[0]?.message ?? "Invalid URL");
      return;
    }

    createMutation.mutate({ url: validationResult.data });
  }

  return (
    <AppShell>
      <div className="flex h-full w-full items-center justify-center">
        <div className="w-full max-w-xl space-y-6 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Let&apos;s get to it
            </h1>
            <p className="text-sm text-muted-foreground md:text-base">
              Paste a URL to summarize and understand any content instantly
            </p>
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-2">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <LinkIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={url}
                  onChange={handleUrlChange}
                  type="url"
                  inputMode="url"
                  placeholder="https://example.com"
                  className="pl-10"
                  aria-label="URL to summarize"
                  aria-invalid={error !== null}
                  aria-describedby={error ? "url-error" : undefined}
                />
              </div>
              <Button
                type="submit"
                className="shrink-0"
                disabled={!url.trim() || createMutation.isPending}
              >
                {createMutation.isPending ? "Summarizing..." : "Summarize"}
              </Button>
            </div>
            {error && (
              <div
                id="url-error"
                role="alert"
                className="text-sm text-destructive"
              >
                {error}
              </div>
            )}
          </form>
        </div>
      </div>
    </AppShell>
  );
}
