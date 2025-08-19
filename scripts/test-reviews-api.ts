#!/usr/bin/env tsx

/**
 * Test script to verify review API functionality
 * This script tests the review endpoints directly with the database
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testReviewsAPI() {
  console.log('🧪 Testing Reviews API functionality...\n');
  
  try {
    // Test 1: Check if reviews exist in database
    console.log('📊 Test 1: Checking existing reviews...');
    const reviewCount = await prisma.review.count();
    console.log(`Found ${reviewCount} total reviews in database`);
    
    if (reviewCount > 0) {
      const reviews = await prisma.review.findMany({
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              name: true,
              email: true,
            }
          },
          product: {
            select: {
              name_en: true,
              name_ar: true,
              slug: true,
            }
          }
        },
        take: 5 // Just show first 5
      });
      
      console.log('\nSample reviews:');
      reviews.forEach((review, index) => {
        console.log(`${index + 1}. Review ID: ${review.id}`);
        console.log(`   Product: ${review.product?.name_en || 'Unknown'}`);
        console.log(`   Customer: ${review.user.firstName && review.user.lastName 
          ? `${review.user.firstName} ${review.user.lastName}`
          : review.user.name || 'Anonymous'}`);
        console.log(`   Rating: ${review.rating}/5`);
        console.log(`   Status: ${review.status || 'No status set'}`);
        console.log(`   Created: ${review.createdAt}`);
        console.log(`   Updated: ${review.updatedAt || 'Not set'}`);
        console.log(`   Deleted: ${review.deletedAt ? 'Yes' : 'No'}`);
        console.log('');
      });
    }
    
    // Test 2: Check review statuses
    console.log('📈 Test 2: Checking review status distribution...');
    const statusCounts = await prisma.review.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
      where: {
        deletedAt: null
      }
    });
    
    console.log('Status distribution:');
    statusCounts.forEach(({ status, _count }) => {
      console.log(`  ${status || 'null'}: ${_count.status} reviews`);
    });
    
    // Test 3: Test the transformed data structure
    console.log('\n🔄 Test 3: Testing data transformation...');
    const sampleReview = await prisma.review.findFirst({
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            name: true,
            email: true,
          }
        },
        product: {
          select: {
            name_en: true,
            name_ar: true,
            slug: true,
          }
        }
      }
    });
    
    if (sampleReview) {
      const transformedReview = {
        id: sampleReview.id,
        productId: sampleReview.productId,
        customerId: sampleReview.userId,
        customerName: sampleReview.user.firstName && sampleReview.user.lastName 
          ? `${sampleReview.user.firstName} ${sampleReview.user.lastName}`
          : sampleReview.user.name || 'Anonymous',
        customerEmail: sampleReview.user.email,
        rating: sampleReview.rating,
        title: `Review for ${sampleReview.product?.name_en || 'Product'}`,
        comment: sampleReview.comment,
        status: sampleReview.status || 'approved',
        createdAt: sampleReview.createdAt,
        updatedAt: sampleReview.updatedAt || sampleReview.createdAt,
        helpful: 0,
        verified: true,
        product: sampleReview.product,
      };
      
      console.log('Sample transformed review:');
      console.log(JSON.stringify(transformedReview, null, 2));
    }
    
    console.log('\n✅ All tests completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Start your development server: pnpm dev');
    console.log('2. Navigate to /admin/reviews in your browser');
    console.log('3. Check if reviews are loading properly');
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testReviewsAPI()
    .then(() => {
      console.log('\n🎉 Test script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Test script failed:', error);
      process.exit(1);
    });
}

export { testReviewsAPI };
