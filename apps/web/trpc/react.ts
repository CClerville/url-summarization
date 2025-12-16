import { createTRPCReact } from "@trpc/react-query";

import type { AppRouter } from "../server/api/root";

export const trpc: ReturnType<typeof createTRPCReact<AppRouter>> =
  createTRPCReact<AppRouter>();


