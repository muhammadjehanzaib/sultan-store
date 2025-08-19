#!/usr/bin/env tsx

/**
 * Simple test to verify the reviews API endpoint is working
 */

const API_BASE = 'http://localhost:3000';

async function testReviewsEndpoint() {
  console.log('🔬 Testing Reviews API Endpoint...\n');
  
  try {
    // Test without authentication first to see the error
    console.log('📡 Testing /api/admin/reviews without auth...');
    const response = await fetch(`${API_BASE}/api/admin/reviews?status=all`);
    
    console.log(`Status: ${response.status}`);
    console.log(`Headers:`, Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.status === 401) {
      console.log('✅ Correctly returned 401 Unauthorized');
    } else if (response.status === 200) {
      console.log('✅ API is working and returned data');
    } else {
      console.log(`❌ Unexpected status: ${response.status}`);
    }
    
  } catch (error) {
    console.error('❌ Error testing endpoint:', error);
    
    // Check if the server is running
    try {
      const healthCheck = await fetch(`${API_BASE}/api/health`).catch(() => null);
      if (!healthCheck) {
        console.log('\n🚫 Server appears to be down. Please run: pnpm dev');
      }
    } catch (e) {
      console.log('\n🚫 Server appears to be down. Please run: pnpm dev');
    }
  }
}

// Check if server is running first
async function checkServerStatus() {
  try {
    const response = await fetch(`${API_BASE}/`, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

// Main execution
async function main() {
  const serverRunning = await checkServerStatus();
  
  if (!serverRunning) {
    console.log('🚫 Development server is not running.');
    console.log('Please start it with: pnpm dev');
    console.log('Then run this script again.');
    return;
  }
  
  console.log('✅ Development server is running.\n');
  await testReviewsEndpoint();
}

if (require.main === module) {
  main().catch(console.error);
}
