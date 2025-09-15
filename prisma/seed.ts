import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminEmail = 'admin@example.com';
  
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: UserRole.ADMIN },
    create: {
      name: 'Admin User',
      email: adminEmail,
      role: UserRole.ADMIN,
    },
  });
  
  console.log('Admin user created/updated successfully');


  // Create regular user
  const userEmail = 'user@example.com';
  
  await prisma.user.upsert({
    where: { email: userEmail },
    update: { role: UserRole.USER },
    create: {
      name: 'Regular User',
      email: userEmail,
      role: UserRole.USER,
    },
  });
  
  console.log('Regular user created/updated successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });