import { createTRPCRouter } from "./trpc";
import { urlSummaryRouter } from "./routers/urlSummary";

export const appRouter = createTRPCRouter({
  urlSummary: urlSummaryRouter,
});

export type AppRouter = typeof appRouter;


