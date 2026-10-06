import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import { getCloudflareContext } from "@opennextjs/cloudflare";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  databaseUrl?: string;
};

function getDatabaseUrl() {
  try {
    const databaseUrl = (getCloudflareContext().env as { DATABASE_URL?: string }).DATABASE_URL;
    if (databaseUrl) return databaseUrl;
  } catch {
    // Local Next.js development does not have a Cloudflare request context.
  }

  const databaseUrl = process.env["DATABASE_URL"];
  if (!databaseUrl) {
    throw new Error("DATABASE_URL não está configurada no ambiente do Worker.");
  }
  return databaseUrl;
}

export function getPrisma() {
  const databaseUrl = getDatabaseUrl();
  if (globalForPrisma.prisma && globalForPrisma.databaseUrl === databaseUrl) {
    return globalForPrisma.prisma;
  }

  const prisma = new PrismaClient({
    adapter: new PrismaNeon({ connectionString: databaseUrl }),
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
  globalForPrisma.prisma = prisma;
  globalForPrisma.databaseUrl = databaseUrl;
  return prisma;
}
