import { PrismaClient } from "../generated/prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const getPrismaClient = (): PrismaClient => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  // Explicitly configure SSL to avoid pg deprecation warning about ambiguous ssl modes.
  // In production Vercel/cloud environments, most managed Postgres requires SSL.
  const isProduction = process.env.NODE_ENV === "production";
  const pool = new Pool({
    connectionString,
    ssl: isProduction ? { rejectUnauthorized: true } : false,
  });

  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
};

function getOrCreatePrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = getPrismaClient();
  }
  return globalForPrisma.prisma;
}

// Lazy proxy: only instantiates Prisma when a property is first accessed at runtime
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getOrCreatePrisma();
    const value = (client as unknown as Record<string | symbol, unknown>)[prop];
    return typeof value === "function" ? value.bind(client) : value;
  },
});
