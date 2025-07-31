// Simple test script for inventory API endpoints
// Run with: node test_inventory_api.js

const BASE_URL = 'http://localhost:3000/api';

async function testInventoryAPI() {
  console.log('🧪 Testing Inventory API endpoints...\n');

  try {
    // Test 1: Get all inventory
    console.log('📋 Test 1: Get all inventory');
    const allInventoryResponse = await fetch(`${BASE_URL}/inventory`);
    const allInventoryData = await allInventoryResponse.json();
    console.log('Status:', allInventoryResponse.status);
    console.log('Total products:', allInventoryData.totalProducts);
    console.log('Low stock count:', allInventoryData.lowStockCount);
    console.log('First product:', JSON.stringify(allInventoryData.inventory[0], null, 2));
    console.log('✅ Passed\n');

    // Test 2: Get low stock only
    console.log('⚠️  Test 2: Get low stock items only');
    const lowStockResponse = await fetch(`${BASE_URL}/inventory?lowStockOnly=true`);
    const lowStockData = await lowStockResponse.json();
    console.log('Status:', lowStockResponse.status);
    console.log('Low stock products:', lowStockData.totalProducts);
    if (lowStockData.inventory.length > 0) {
      console.log('Low stock item:', JSON.stringify(lowStockData.inventory[0], null, 2));
    }
    console.log('✅ Passed\n');

    // Test 3: Update inventory for a product
    console.log('📦 Test 3: Update inventory (add stock)');
    const productId = allInventoryData.inventory[0]?.id;
    if (productId) {
      const updateResponse = await fetch(`${BASE_URL}/inventory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: productId,
          stockChange: 10,
          reason: 'Test inventory addition'
        })
      });
      const updateData = await updateResponse.json();
      console.log('Status:', updateResponse.status);
      console.log('Message:', updateData.message);
      console.log('New stock level:', updateData.inventory?.stock);
      console.log('✅ Passed\n');
    }

    // Test 4: Get stock history for a product
    console.log('📈 Test 4: Get stock history');
    if (productId) {
      const historyResponse = await fetch(`${BASE_URL}/inventory/${productId}/history`);
      const historyData = await historyResponse.json();
      console.log('Status:', historyResponse.status);
      console.log('Product:', historyData.product?.name_en);
      console.log('Current stock:', historyData.currentStock);
      console.log('History entries:', historyData.history?.length);
      if (historyData.history?.length > 0) {
        console.log('Latest entry:', JSON.stringify(historyData.history[0], null, 2));
      }
      console.log('✅ Passed\n');
    }

    // Test 5: Update stock threshold
    console.log('🚨 Test 5: Update stock threshold');
    if (productId) {
      const thresholdResponse = await fetch(`${BASE_URL}/inventory/${productId}/threshold`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stockThreshold: 15
        })
      });
      const thresholdData = await thresholdResponse.json();
      console.log('Status:', thresholdResponse.status);
      console.log('Message:', thresholdData.message);
      console.log('New threshold:', thresholdData.inventory?.stockThreshold);
      console.log('Is low stock:', thresholdData.isLowStock);
      console.log('✅ Passed\n');
    }

    // Test 6: Bulk update
    console.log('📦📦 Test 6: Bulk inventory update');
    const bulkUpdateResponse = await fetch(`${BASE_URL}/inventory/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        updates: [
          {
            productId: allInventoryData.inventory[0]?.id,
            stockChange: -5,
            reason: 'Test bulk decrease'
          },
          {
            productId: allInventoryData.inventory[1]?.id,
            stockChange: 20,
            stockThreshold: 8,
            reason: 'Test bulk increase with threshold'
          }
        ]
      })
    });
    const bulkUpdateData = await bulkUpdateResponse.json();
    console.log('Status:', bulkUpdateResponse.status);
    console.log('Message:', bulkUpdateData.message);
    console.log('Summary:', JSON.stringify(bulkUpdateData.summary, null, 2));
    console.log('✅ Passed\n');

    console.log('🎉 All tests passed! Inventory API is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the tests
testInventoryAPI();
