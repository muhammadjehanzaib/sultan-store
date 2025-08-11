#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Testing SaudiSafety Notification System\n');

  try {
    // 1. Check if admin users exist
    console.log('1️⃣ Checking admin users...');
    const adminUsers = await prisma.user.findMany({
      where: {
        role: { in: ['admin', 'manager'] }
      }
    });
    
    console.log(`   Found ${adminUsers.length} admin users:`);
    adminUsers.forEach(admin => {
      console.log(`   - ${admin.email} (${admin.role})`);
    });

    if (adminUsers.length === 0) {
      console.log('   ❌ No admin users found. Run: node create-admin.js');
      return;
    }

    // 2. Check existing notifications
    console.log('\n2️⃣ Checking existing notifications...');
    const allNotifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    
    console.log(`   Found ${allNotifications.length} recent notifications:`);
    allNotifications.forEach((notif, index) => {
      console.log(`   ${index + 1}. ${notif.type} - ${notif.title_en}`);
      console.log(`      For user: ${notif.userId || 'System-wide'}`);
      console.log(`      Created: ${notif.createdAt.toLocaleString()}`);
      console.log(`      Read: ${notif.isRead ? '✅' : '❌'}`);
    });

    // 3. Create a test notification for each admin
    console.log('\n3️⃣ Creating test notifications...');
    for (const admin of adminUsers) {
      const testNotif = await prisma.notification.create({
        data: {
          userId: admin.id,
          type: 'system_alert',
          title_en: 'Test Admin Notification',
          title_ar: 'إشعار تجريبي للإدارة',
          message_en: 'This is a test notification to verify admin notifications are working.',
          message_ar: 'هذا إشعار تجريبي للتحقق من أن إشعارات الإدارة تعمل بشكل صحيح.',
          sendEmail: false,
          sendInApp: true,
          priority: 'normal'
        }
      });
      console.log(`   ✅ Created test notification for ${admin.email}: ${testNotif.id}`);
    }

    // 4. Check products for order simulation
    console.log('\n4️⃣ Checking products for order simulation...');
    const products = await prisma.product.findMany({
      take: 3
    });
    
    if (products.length === 0) {
      console.log('   ❌ No products found. Cannot simulate orders.');
    } else {
      console.log(`   Found ${products.length} products:`);
      products.forEach(product => {
        console.log(`   - ${product.name_en} (${product.price} SAR)`);
      });

      // 5. Create a test order
      console.log('\n5️⃣ Creating test order...');
      const testProduct = products[0];
      const testOrder = await prisma.order.create({
        data: {
          customerEmail: 'test-customer@example.com',
          customerName: 'Test Customer',
          subtotal: testProduct.price,
          tax: testProduct.price * 0.15,
          shipping: 15.0,
          total: testProduct.price * 1.15 + 15,
          status: 'pending',
          billingAddress: {
            firstName: 'Test',
            lastName: 'Customer',
            address: '123 Test St',
            city: 'Riyadh',
            country: 'Saudi Arabia'
          },
          shippingAddress: {
            firstName: 'Test',
            lastName: 'Customer',
            address: '123 Test St',
            city: 'Riyadh', 
            country: 'Saudi Arabia'
          },
          paymentMethod: 'credit_card',
          items: {
            create: [{
              productId: testProduct.id,
              quantity: 1,
              price: testProduct.price,
              total: testProduct.price
            }]
          }
        }
      });

      console.log(`   ✅ Created test order: ${testOrder.id}`);

      // 6. Simulate admin notifications for the order
      console.log('\n6️⃣ Creating admin order notifications...');
      for (const admin of adminUsers) {
        const orderNotif = await prisma.notification.create({
          data: {
            userId: admin.id,
            type: 'order_created',
            title_en: 'New Order Received!',
            title_ar: 'تم استلام طلب جديد!',
            message_en: `New order #${testOrder.id} from ${testOrder.customerEmail} for ${testOrder.total} SAR`,
            message_ar: `طلب جديد #${testOrder.id} من ${testOrder.customerEmail} بقيمة ${testOrder.total} ريال سعودي`,
            actionUrl: '/admin/orders',
            sendEmail: true,
            sendInApp: true,
            priority: 'high',
            metadata: {
              orderId: testOrder.id,
              customerEmail: testOrder.customerEmail,
              orderTotal: testOrder.total,
              type: 'admin_new_order'
            }
          }
        });
        console.log(`   ✅ Created order notification for ${admin.email}: ${orderNotif.id}`);
      }
    }

    // 7. Final summary
    console.log('\n📊 Final Status:');
    const finalCount = await prisma.notification.count();
    console.log(`   Total notifications in system: ${finalCount}`);

    const unreadAdmin = await prisma.notification.count({
      where: {
        userId: { in: adminUsers.map(u => u.id) },
        isRead: false
      }
    });
    console.log(`   Unread admin notifications: ${unreadAdmin}`);

    console.log('\n🎯 Next Steps:');
    console.log('1. Start dev server: pnpm run dev');
    console.log('2. Login to admin: http://localhost:3000/admin/login');
    console.log('3. Use: admin@saudisafety.com / admin123');
    console.log('4. Check notification bell in header');
    console.log('5. Should show red badge with notification count');

  } catch (error) {
    console.error('❌ Error testing notification system:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
