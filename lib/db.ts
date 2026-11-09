import { PrismaClient } from "@prisma/client";

// One client per process; reused across dev hot reloads so connections aren't leaked.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Bulk saves (settings, stats, clients, notice/test children) run several statements in one transaction. Prisma's
// 5 s default is too tight when the managed MySQL is a long round trip away (e.g. local dev against sgp1).
export const TRANSACTION_OPTIONS = { maxWait: 10_000, timeout: 20_000 } as const;

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ transactionOptions: TRANSACTION_OPTIONS });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
