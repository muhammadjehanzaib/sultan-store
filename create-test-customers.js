#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestCustomers() {
  console.log('🧪 Creating test customer data...\n');

  try {
    const testCustomers = [
      {
        email: 'test-customer@example.com',
        firstName: 'Test',
        lastName: 'Customer',
        phone: '+966501234567'
      },
      {
        email: 'sara.ahmed@example.com',
        firstName: 'Sara',
        lastName: 'Ahmed', 
        phone: '+966507891234'
      },
      {
        email: 'mohamed.hassan@gmail.com',
        firstName: 'Mohamed',
        lastName: 'Hassan',
        phone: '+966512345678'
      },
      {
        email: 'fatima.ali@outlook.com',
        firstName: 'Fatima',
        lastName: 'Ali',
        phone: '+966555123456'
      },
      {
        email: 'omar.khaled@yahoo.com',
        firstName: 'Omar',
        lastName: 'Khaled',
        phone: '+966509876543'
      }
    ];

    for (const customerData of testCustomers) {
      // Check if customer already exists
      const existingCustomer = await prisma.user.findUnique({
        where: { email: customerData.email }
      });

      if (existingCustomer) {
        console.log(`✅ Customer already exists: ${customerData.email}`);
        continue;
      }

      // Hash a default password
      const hashedPassword = await bcrypt.hash('customer123', 12);

      // Create customer user account
      const newCustomer = await prisma.user.create({
        data: {
          email: customerData.email,
          firstName: customerData.firstName,
          lastName: customerData.lastName,
          name: `${customerData.firstName} ${customerData.lastName}`,
          phone: customerData.phone,
          password: hashedPassword,
          role: 'viewer', // Customer role
          isGuest: false,
          emailVerified: new Date()
        }
      });

      console.log(`✅ Created customer: ${newCustomer.email}`);

      // Create some sample orders for this customer
      const numOrders = Math.floor(Math.random() * 3) + 1; // 1-3 orders per customer
      
      for (let i = 0; i < numOrders; i++) {
        const orderTotal = Math.floor(Math.random() * 1000) + 100; // 100-1100 SAR
        
        await prisma.order.create({
          data: {
            customerEmail: customerData.email,
            customerName: `${customerData.firstName} ${customerData.lastName}`,
            subtotal: orderTotal * 0.87, // Subtract tax and shipping
            tax: orderTotal * 0.13,
            shipping: 15,
            total: orderTotal,
            status: ['pending', 'processing', 'shipped', 'delivered'][Math.floor(Math.random() * 4)],
            billingAddress: {
              firstName: customerData.firstName,
              lastName: customerData.lastName,
              address: '123 Test Street',
              city: 'Riyadh',
              postalCode: '12345',
              country: 'Saudi Arabia'
            },
            shippingAddress: {
              firstName: customerData.firstName,
              lastName: customerData.lastName,
              address: '123 Test Street',
              city: 'Riyadh',
              postalCode: '12345',
              country: 'Saudi Arabia'
            },
            paymentMethod: 'credit_card'
          }
        });
      }
      
      console.log(`   📦 Created ${numOrders} orders for ${customerData.email}`);
    }

    // Summary
    const totalCustomers = await prisma.user.count({
      where: { role: { notIn: ['admin', 'manager', 'support'] } }
    });
    
    const totalOrders = await prisma.order.count();
    
    console.log('\n📊 Summary:');
    console.log(`   👥 Total customers: ${totalCustomers}`);
    console.log(`   📦 Total orders: ${totalOrders}`);
    console.log('\n🎯 Test the customer modal:');
    console.log('1. Login to admin: http://localhost:3000/admin/login');
    console.log('2. Go to Customers tab');
    console.log('3. Click View or Edit on any customer');
    console.log('4. The modal should now show with customer details');

  } catch (error) {
    console.error('❌ Error creating test customers:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestCustomers();
