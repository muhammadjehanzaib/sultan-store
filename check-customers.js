#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCustomers() {
  try {
    console.log('🔍 Checking customers in database...\n');
    
    const users = await prisma.user.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`Found ${users.length} users:`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Name: ${user.name || 'N/A'}`);
      console.log(`   First Name: ${user.firstName || 'N/A'}`);
      console.log(`   Last Name: ${user.lastName || 'N/A'}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Is Guest: ${user.isGuest}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log('');
    });
    
    const orders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`Found ${orders.length} orders:`);
    orders.forEach((order, index) => {
      console.log(`${index + 1}. Order ID: ${order.id}`);
      console.log(`   Customer: ${order.customerEmail}`);
      console.log(`   Customer Name: ${order.customerName}`);
      console.log(`   Total: ${order.total} SAR`);
      console.log(`   Status: ${order.status}`);
      console.log(`   Created: ${order.createdAt}`);
      console.log('');
    });
    
    // Check if we have actual customer data (non-admin users)
    const actualCustomers = await prisma.user.findMany({
      where: {
        role: { notIn: ['admin', 'manager', 'support'] }
      },
      take: 5
    });
    
    console.log(`Found ${actualCustomers.length} actual customers (non-admin users):`);
    actualCustomers.forEach((customer, index) => {
      console.log(`${index + 1}. ${customer.email} - Role: ${customer.role}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCustomers();
