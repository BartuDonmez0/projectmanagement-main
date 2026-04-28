import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const rawConnectionString = process.env.DATABASE_URL;
// Bazı ortamlarda (özellikle hosted) connection string'deki `sslmode=*` parametresi,
// pg tarafında SSL davranışını override edip sertifika zinciri hatasına yol açabiliyor.
// Bu yüzden query parametrelerini atıp SSL ayarını burada deterministik veriyoruz.
const connectionString = rawConnectionString?.split("?")[0];

const adapter = new PrismaPg(
  new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  })
);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}