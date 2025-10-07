import { PrismaClient } from "@prisma/client"

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient
}

let prisma: PrismaClient

try {
  if (typeof window !== "undefined") {
    // Running in browser (v0 preview), create a mock client
    throw new Error("Prisma not available in browser environment")
  }

  if (process.env["NODE_ENV"] !== "production") {
    if (!global.prismaGlobal) {
      global.prismaGlobal = new PrismaClient({
        log: process.env["NODE_ENV"] === "development" ? ["error", "warn"] : ["error"],
      })
    }
    prisma = global.prismaGlobal
  } else {
    prisma = new PrismaClient({
      log: ["error"],
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    })
  }

  prisma
    .$connect()
    .then(() => {
      console.log("✅ Database connected successfully to PostgreSQL")
    })
    .catch((error) => {
      console.error("❌ Failed to connect to database:", error)
      // Don't throw - allow app to start and retry connections
    })

  // Graceful shutdown
  process.on("beforeExit", async () => {
    await prisma.$disconnect()
  })
} catch (error) {
  console.error("Failed to initialize Prisma client:", error)
  prisma = {
    $connect: async () => {},
    $disconnect: async () => {},
  } as any
}

export default prisma
