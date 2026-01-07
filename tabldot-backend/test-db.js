// test-db.js
const { PrismaClient } = require('@prisma/client');

// Aşağıdaki tırnak içine kendi Neon bağlantı adresini yapıştır:
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://neondb_owner:npg_JngVv2oLQS8B@ep-ancient-pond-adyv5qv8.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&connect_timeout=60",
    },
  },
});

async function main() {
  console.log("⏳ Veritabanına bağlanılıyor...");
  try {
    await prisma.$connect();
    console.log("✅ BAŞARILI! Veritabanına bağlandık.");
  } catch (error) {
    console.error("❌ HATA: Bağlanamadı.", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();