import { PrismaClient } from "@prisma/client";
import fs from "fs";
import os from "os";
import path from "path";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function resolveDatabaseUrl(): string {
  if (process.env.DEMO_MODE !== "1") {
    return process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  }

  // Guest/demo deployments have no external database. Each cold start copies a
  // pre-seeded, read-write SQLite snapshot into the OS temp dir (the only writable
  // path in Vercel's serverless runtime), so the app works fully but resets on restart.
  const tmpDbPath = path.join(os.tmpdir(), "demo.db");
  if (!fs.existsSync(tmpDbPath)) {
    const seedDbPath = path.join(process.cwd(), "prisma", "demo-seed.db");
    // Copy to a per-process temp name then rename atomically, so concurrent
    // cold starts / build workers racing on the same path can't corrupt it
    // or throw EBUSY from two processes writing the same file at once.
    const stagingPath = `${tmpDbPath}.${process.pid}.tmp`;
    try {
      fs.copyFileSync(seedDbPath, stagingPath);
      fs.renameSync(stagingPath, tmpDbPath);
    } catch (err) {
      fs.rmSync(stagingPath, { force: true });
      if (!fs.existsSync(tmpDbPath)) throw err;
    }
  }
  return `file:${tmpDbPath}`;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasources: { db: { url: resolveDatabaseUrl() } },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
