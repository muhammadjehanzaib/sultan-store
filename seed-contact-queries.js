import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Creating sample contact queries...');

  const sampleQueries = [
    {
      name: 'Ahmed Rashid',
      email: 'ahmed.rashid@example.com',
      subject: 'Order Status Inquiry',
      message: 'Hi, I placed order #12345 three days ago but have not received any shipping confirmation. Could you please provide an update on my order status?',
      status: 'new'
    },
    {
      name: 'Fatima Al-Zahra',
      email: 'fatima.alzahra@example.com',
      subject: 'Product Return Request',
      message: 'I received my order yesterday, but the smartwatch I ordered is not working properly. The screen keeps flickering and it won\'t turn on sometimes. I would like to return it and get a refund.',
      status: 'in progress'
    },
    {
      name: 'Mohammed Hassan',
      email: 'mohammed.hassan@example.com',
      subject: 'Product Inquiry - Bluetooth Speaker',
      message: 'I\'m interested in purchasing the Bluetooth speaker on your website. Can you tell me if it\'s waterproof and what the battery life is like?',
      status: 'resolved'
    },
    {
      name: 'Sarah Abdullah',
      email: 'sarah.abdullah@example.com',
      subject: 'Shipping Options',
      message: 'Hello, I need to order some items urgently for a gift. Do you offer same-day or next-day delivery in Riyadh? What are the additional charges?',
      status: 'new'
    },
    {
      name: 'Omar Al-Mansouri',
      email: 'omar.mansouri@example.com',
      subject: 'Account Login Issues',
      message: 'I\'m having trouble logging into my account. I keep getting an error message that says my password is incorrect, even though I\'m sure it\'s right. Can you help me reset it?',
      status: 'in progress'
    },
    {
      name: 'Layla Khalil',
      email: 'layla.khalil@example.com',
      subject: 'Bulk Order Inquiry',
      message: 'I represent a small business and would like to place a bulk order for 20 wireless headphones. Do you offer any discounts for bulk purchases? What would be the total cost including shipping?',
      status: 'new'
    },
    {
      name: 'Khalid Al-Otaibi',
      email: 'khalid.otaibi@example.com',
      subject: 'Payment Method Question',
      message: 'I noticed you accept cash on delivery. Is there an additional fee for COD? Also, do you accept cash payment in Saudi Riyals only?',
      status: 'resolved'
    }
  ];

  for (const query of sampleQueries) {
    await prisma.contactQuery.create({
      data: {
        ...query,
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random date within last week
      },
    });
  }

  console.log(`✅ Created ${sampleQueries.length} sample contact queries`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
