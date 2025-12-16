import { initTRPC } from "@trpc/server";
import superjson from "superjson";

import { prisma } from "@repo/db";

export function createTRPCContext(opts: { req: Request }) {
  return {
    req: opts.req,
    prisma,
  };
}

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;


