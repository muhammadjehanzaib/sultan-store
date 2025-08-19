#!/usr/bin/env tsx

/**
 * Migration script for review status system
 * 
 * This script:
 * 1. Updates existing reviews to have default status of 'approved' (since they were previously auto-approved)
 * 2. Handles the database schema migration safely
 * 
 * Run this after updating the Prisma schema and before deploying
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateReviews() {
  console.log('🚀 Starting review migration...');
  
  try {
    // First, let's check if the migration has already been applied
    console.log('📊 Checking current review data...');
    
    const reviewCount = await prisma.review.count();
    console.log(`Found ${reviewCount} total reviews`);
    
    if (reviewCount === 0) {
      console.log('✅ No reviews to migrate');
      return;
    }
    
    // Check if status field exists and has data
    const reviewsWithStatus = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM "Review" 
      WHERE status IS NOT NULL AND status != ''
    `;
    
    const statusCount = (reviewsWithStatus as any)[0]?.count || 0;
    console.log(`Found ${statusCount} reviews with status already set`);
    
    if (parseInt(statusCount) === reviewCount) {
      console.log('✅ All reviews already have status set, migration not needed');
      return;
    }
    
    // Update reviews without status to 'approved' (existing reviews were auto-approved)
    console.log('📝 Setting default status for existing reviews...');
    
    const updateResult = await prisma.review.updateMany({
      where: {
        OR: [
          { status: null },
          { status: '' }
        ]
      },
      data: {
        status: 'approved',
        updatedAt: new Date()
      }
    });
    
    console.log(`✅ Updated ${updateResult.count} reviews with default status 'approved'`);
    
    // Verify the migration
    const verificationCount = await prisma.review.count({
      where: {
        status: 'approved'
      }
    });
    
    console.log(`📊 Verification: ${verificationCount} reviews now have 'approved' status`);
    
    console.log('✅ Review migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during migration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration if this file is executed directly
if (require.main === module) {
  migrateReviews()
    .then(() => {
      console.log('🎉 Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration failed:', error);
      process.exit(1);
    });
}

export { migrateReviews };
