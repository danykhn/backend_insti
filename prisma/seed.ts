import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@insti.com' },
    update: {},
    create: {
      email: 'admin@insti.com',
      firstName: 'Admin',
      lastName: 'Insti',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin user created:', admin.email);

  const datosBancarios = await prisma.datosBancarios.upsert({
    where: { cbu: '0000000000000000000001' },
    update: {},
    create: {
      alias: 'cuenta_principal',
      cbu: '0000000000000000000001',
      numeroCuenta: '000-123456/1',
      titular: 'Institución Educativa',
      nombreBanco: 'Banco Galicia',
    },
  });

  console.log('✅ Datos bancarios created:', datosBancarios.alias);

  console.log('🎉 Seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });