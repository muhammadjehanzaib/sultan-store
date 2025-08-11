#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🧪 Testing Admin Notifications...\n');

    // First, ensure we have an admin user
    const adminUser = await prisma.user.findFirst({
      where: { role: 'admin' }
    });

    if (!adminUser) {
      console.log('❌ No admin user found. Please run: node create-admin.js');
      return;
    }

    console.log('✅ Found admin user:', adminUser.email);

    // Check if we have any products
    const product = await prisma.product.findFirst();
    
    if (!product) {
      console.log('❌ No products found in database');
      return;
    }

    console.log('✅ Found product:', product.name_en);

    // Create a test order
    const testOrder = await prisma.order.create({
      data: {
        customerEmail: 'test-customer@example.com',
        customerName: 'Test Customer',
        subtotal: 100.0,
        tax: 15.0,
        shipping: 15.0,
        total: 130.0,
        status: 'pending',
        billingAddress: {
          firstName: 'Test',
          lastName: 'Customer',
          address: '123 Test St',
          city: 'Riyadh',
          postalCode: '12345',
          country: 'Saudi Arabia'
        },
        shippingAddress: {
          firstName: 'Test',
          lastName: 'Customer',
          address: '123 Test St',
          city: 'Riyadh',
          postalCode: '12345',
          country: 'Saudi Arabia'
        },
        paymentMethod: 'credit_card',
        items: {
          create: [{
            productId: product.id,
            quantity: 1,
            price: product.price,
            total: product.price
          }]
        }
      }
    });

    console.log('✅ Test order created:', testOrder.id);

    // Now manually trigger the admin notification (simulating what checkout does)
    console.log('🔔 Triggering admin notification...');
    
    // Import the notification service
    const { notificationService } = require('./src/lib/notificationService.ts');
    
    try {
      await notificationService.notifyAdminNewOrder(
        testOrder.id,
        testOrder.customerEmail,
        testOrder.total
      );
      console.log('✅ Admin notification sent successfully!');
    } catch (error) {
      console.error('❌ Failed to send admin notification:', error.message);
    }

    // Check notifications in database
    const notifications = await prisma.notification.findMany({
      where: {
        userId: adminUser.id,
        type: 'order_created'
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    console.log('\n📧 Recent admin notifications:');
    notifications.forEach((notif, index) => {
      console.log(`${index + 1}. ${notif.title_en} - ${notif.message_en}`);
      console.log(`   Created: ${notif.createdAt.toLocaleString()}`);
      console.log(`   Read: ${notif.isRead ? '✅' : '❌'}`);
    });

    console.log('\n🎯 Next Steps:');
    console.log('1. Start the dev server: pnpm run dev');
    console.log('2. Login to admin at: http://localhost:3000/admin/login');
    console.log('3. Credentials: admin@saudisafety.com / admin123');
    console.log('4. Check the notification bell in the header');

  } catch (error) {
    console.error('❌ Error testing admin notifications:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
