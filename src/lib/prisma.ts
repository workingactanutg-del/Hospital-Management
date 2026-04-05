/* eslint-disable @typescript-eslint/no-require-imports */
const { Pool } = require("pg")
const { PrismaPg } = require("@prisma/adapter-pg")
const { PrismaClient } = require("@prisma/client")

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PrismaClientInstance = any

const prismaClientSingleton = (): PrismaClientInstance => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}





// Cast globalThis to avoid 'property does not exist' TS error in dev singleton pattern
const g = globalThis as typeof globalThis & { _prisma?: PrismaClientInstance }

const prisma: PrismaClientInstance = g._prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== "production") g._prisma = prisma
