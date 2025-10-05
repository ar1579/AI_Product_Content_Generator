import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient;
}

let prisma: PrismaClient;

try {
  if (process.env.NODE_ENV !== "production") {
    if (!global.prismaGlobal) {
      global.prismaGlobal = new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
      });
    }
    prisma = global.prismaGlobal;
  } else {
    prisma = new PrismaClient({
      log: ["error"],
    });
  }
} catch (error) {
  console.error("Failed to initialize Prisma client:", error);
  throw new Error("Database initialization failed. Please check your database configuration.");
}

// Test database connection on startup
prisma.$connect()
  .then(() => {
    console.log("✅ Database connected successfully");
  })
  .catch((error) => {
    console.error("❌ Failed to connect to database:", error);
    process.exit(1);
  });

// Graceful shutdown
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

export default prisma;
