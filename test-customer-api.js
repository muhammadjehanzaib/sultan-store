#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testCustomerAPI() {
  try {
    console.log('🧪 Testing Customer API functionality...\n');

    // Get a test customer
    const customer = await prisma.user.findFirst({
      where: { role: 'viewer' }
    });
    
    if (!customer) {
      console.log('❌ No customer found. Run: node create-test-customers.js');
      return;
    }

    console.log('✅ Found test customer:', customer.email);
    console.log('   ID:', customer.id);
    console.log('   Name:', `${customer.firstName} ${customer.lastName}`);

    // Simulate the API call that happens when viewing customer details
    console.log('\n🔍 Testing customer details API call...');
    
    // Get customer details (simulating the API call)
    const customerDetails = await prisma.user.findUnique({
      where: { id: customer.id },
      include: {
        accounts: true,
        sessions: true,
        _count: {
          select: {
            accounts: true,
            sessions: true,
          }
        }
      }
    });

    if (!customerDetails) {
      console.log('❌ Customer details not found');
      return;
    }

    // Get customer's orders
    const orders = await prisma.order.findMany({
      where: { customerEmail: customer.email },
      include: {
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate order statistics
    const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;

    // Get last login from sessions (mock)
    const lastSession = await prisma.session.findFirst({
      where: { userId: customer.id },
      orderBy: { expires: 'desc' }
    });

    const customerResponse = {
      id: customerDetails.id,
      firstName: customerDetails.firstName || '',
      lastName: customerDetails.lastName || '',
      email: customerDetails.email,
      phone: customerDetails.phone || '',
      avatar: customerDetails.image || '',
      createdAt: customerDetails.createdAt,
      lastLoginAt: lastSession?.expires || customerDetails.updatedAt,
      totalOrders,
      totalSpent,
      status: 'active',
      addresses: [],
      orders: orders.map(order => ({
        id: order.id,
        items: order.items.map(item => ({
          product: {
            id: item.product.id,
            name: item.product.name_en,
            slug: item.product.slug,
            price: item.product.price,
            image: item.product.image,
            category: item.product.categoryId,
            description: item.product.description_en,
            inStock: item.product.inStock,
            rating: item.product.rating,
            reviews: item.product.reviews
          },
          quantity: item.quantity,
          price: item.price,
          total: item.total,
          selectedAttributes: item.selectedAttributes
        })),
        subtotal: order.subtotal,
        tax: order.tax,
        shipping: order.shipping,
        total: order.total,
        billingAddress: order.billingAddress,
        shippingAddress: order.shippingAddress,
        paymentMethod: { id: 'card', type: 'card', name: order.paymentMethod },
        status: order.status,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        trackingNumber: order.trackingNumber,
        trackingProvider: order.trackingProvider
      }))
    };

    console.log('✅ Customer API response generated successfully:');
    console.log('   Total Orders:', customerResponse.totalOrders);
    console.log('   Total Spent:', customerResponse.totalSpent, 'SAR');
    console.log('   Recent Orders:', customerResponse.orders.length);
    
    console.log('\n📋 Sample Customer Data:');
    console.log(JSON.stringify({
      id: customerResponse.id,
      firstName: customerResponse.firstName,
      lastName: customerResponse.lastName,
      email: customerResponse.email,
      totalOrders: customerResponse.totalOrders,
      totalSpent: customerResponse.totalSpent,
      status: customerResponse.status
    }, null, 2));

    console.log('\n🎯 Next Steps:');
    console.log('1. The customer modal should work now');
    console.log('2. If still blank, check browser console for errors');
    console.log('3. Check if React components are rendering correctly');

  } catch (error) {
    console.error('❌ Error testing customer API:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCustomerAPI();
