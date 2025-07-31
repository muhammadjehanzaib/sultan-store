const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearOrders() {
  console.log('🗑️  Clearing existing orders...');
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  console.log('✅ Orders cleared');
}

async function seedOrders() {
  console.log('🌱 Seeding fake orders...');

  // Fetch products and variants
  const products = await prisma.product.findMany({ include: { variants: true } });
  if (products.length < 2) {
    console.log('Not enough products to seed orders.');
    return;
  }

  // Example: create 2 orders, each with 2 items
  const orderData = [
    {
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      billingAddress: {
        firstName: 'John', lastName: 'Doe', email: 'john@example.com', phone: '+1234567890', address: '123 Main St', city: 'New York', state: 'NY', zipCode: '10001', country: 'USA'
      },
      shippingAddress: {
        firstName: 'John', lastName: 'Doe', email: 'john@example.com', phone: '+1234567890', address: '123 Main St', city: 'New York', state: 'NY', zipCode: '10001', country: 'USA'
      },
      paymentMethod: 'card',
      status: 'processing',
      items: [
        {
          product: products[0],
          variant: products[0].variants[0],
          quantity: 1
        },
        {
          product: products[1],
          variant: products[1].variants[0],
          quantity: 2
        }
      ]
    },
    {
      customerName: 'Jane Smith',
      customerEmail: 'jane@example.com',
      billingAddress: {
        firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', phone: '+1987654321', address: '456 Oak Ave', city: 'Los Angeles', state: 'CA', zipCode: '90210', country: 'USA'
      },
      shippingAddress: {
        firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', phone: '+1987654321', address: '456 Oak Ave', city: 'Los Angeles', state: 'CA', zipCode: '90210', country: 'USA'
      },
      paymentMethod: 'paypal',
      status: 'pending',
      items: [
        {
          product: products[1],
          variant: products[1].variants[1],
          quantity: 1
        },
        {
          product: products[0],
          variant: products[0].variants[1],
          quantity: 1
        }
      ]
    }
  ];

  for (const order of orderData) {
    let subtotal = 0;
    const items = order.items.map(item => {
      const price = item.variant && item.variant.price ? Number(item.variant.price) : Number(item.product.price);
      const total = price * item.quantity;
      subtotal += total;
      return {
        productId: item.product.id,
        quantity: item.quantity,
        price,
        total,
        selectedAttributes: item.variant ? item.variant.attributeValues : null
      };
    });
    const tax = +(subtotal * 0.1).toFixed(2);
    const shipping = 10;
    const total = subtotal + tax + shipping;

    await prisma.order.create({
      data: {
        customerEmail: order.customerEmail,
        customerName: order.customerName,
        subtotal,
        tax,
        shipping,
        total,
        status: order.status,
        billingAddress: order.billingAddress,
        shippingAddress: order.shippingAddress,
        paymentMethod: order.paymentMethod,
        items: {
          create: items
        }
      }
    });
    console.log(`✅ Created order for ${order.customerName}`);
  }
}

async function main() {
  try {
    await clearOrders();
    await seedOrders();
  } catch (error) {
    console.error('❌ Error seeding orders:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 