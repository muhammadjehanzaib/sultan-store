import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create test users
  const testUsers = [
    {
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      name: 'Admin User',
      password: 'admin123',
      role: 'admin',
    },
    {
      email: 'manager@example.com',
      firstName: 'Manager',
      lastName: 'User',
      name: 'Manager User',
      password: 'manager123',
      role: 'manager',
    },
    {
      email: 'support@example.com',
      firstName: 'Support',
      lastName: 'User',
      name: 'Support User',
      password: 'support123',
      role: 'support',
    },
    {
      email: 'user@example.com',
      firstName: 'Test',
      lastName: 'User',
      name: 'Test User',
      password: 'user123',
      role: 'viewer',
    }
  ];

  for (const userData of testUsers) {
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        name: userData.name,
        password: hashedPassword,
        role: userData.role,
      },
    });

    console.log(`Created user: ${user.email} (${user.role})`);
  }

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
