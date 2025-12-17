import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const urlSummaryRouter = createTRPCRouter({
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.urlSummary.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    });
  }),

  create: publicProcedure
    .input(
      z.object({
        url: z
          .string()
          .url()
          .refine(
            (url) => url.startsWith("https://"),
            { message: "Only HTTPS URLs are allowed" },
          ),
        summary: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.urlSummary.create({
        data: {
          url: input.url,
          summary: input.summary,
        },
      });
    }),
});


