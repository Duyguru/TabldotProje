// check-users.js - Veritabanındaki kullanıcıları listele
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    console.log('📋 Veritabanındaki Kullanıcılar:');
    console.log('─────────────────────────────────');
    
    if (users.length === 0) {
      console.log('❌ Veritabanında kullanıcı bulunamadı!');
      console.log('💡 Yeni admin oluşturmak için: node create-admin.js');
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. ID: ${user.id}`);
        console.log(`   E-posta: ${user.email}`);
        console.log(`   İsim: ${user.name || '-'}`);
        console.log(`   Rol: ${user.role}`);
        console.log('');
      });
    }
  } catch (error) {
    console.error('❌ Hata:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();

