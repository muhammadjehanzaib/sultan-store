#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔧 Creating admin user for notification testing...\n');

    const adminEmail = 'admin@saudisafety.com';
    
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (existingAdmin) {
      console.log('✅ Admin user already exists:', existingAdmin.email);
      console.log('🔧 Updating role to admin...');
      
      const updatedAdmin = await prisma.user.update({
        where: { email: adminEmail },
        data: { role: 'admin' }
      });
      
      console.log('✅ Admin user updated successfully');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 12);

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Admin User',
        firstName: 'Admin',
        lastName: 'User',
        password: hashedPassword,
        role: 'admin',
        isGuest: false,
        emailVerified: new Date(),
      }
    });

    console.log('✅ Admin user created successfully:');
    console.log('📧 Email:', adminUser.email);
    console.log('👤 Name:', adminUser.name);
    console.log('🔑 Role:', adminUser.role);
    console.log('🔐 Password: admin123');
    
    console.log('\n🔔 Testing Admin Notifications:');
    console.log('1. Login to admin panel at http://localhost:3000/admin/login');
    console.log('2. Use credentials: admin@saudisafety.com / admin123');
    console.log('3. Place a new order on the main site');
    console.log('4. Check the notification bell in admin header');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
