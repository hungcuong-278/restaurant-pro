/**
 * Test script for Order Management API
 * Run: node test-order-api.js
 */

const restaurantId = 'e4e7bcd3-3b50-47ba-8abc-3597170677bb';
const baseUrl = 'http://localhost:5000/api';

// Sample menu item IDs (from actual database)
const sampleMenuItems = [
  'db9c9a7d-7f23-4caf-a7a4-1c16998d8fc7', // Beef Tenderloin
  '268b5422-1074-46e3-8b39-0e9058f316bf', // Grilled Salmon
];

// Sample table ID (valid table from database)
const sampleTableId = 'e1250430-deee-48d9-b721-386309092e67'; // P001 - Private Room

let createdOrderId = null;

/**
 * Test 1: Create a new order
 */
async function testCreateOrder() {
  console.log('\n🧪 Test 1: Create Order');
  console.log('='.repeat(50));
  
  const orderData = {
    order_type: 'dine_in',
    table_id: sampleTableId,
    customer_notes: 'No onions please',
    kitchen_notes: 'Rush order',
    items: [
      {
        menu_item_id: sampleMenuItems[0],
        quantity: 2,
        special_instructions: 'Extra spicy'
      },
      {
        menu_item_id: sampleMenuItems[1],
        quantity: 1
      }
    ]
  };
  
  try {
    const response = await fetch(
      `${baseUrl}/restaurants/${restaurantId}/orders`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      }
    );
    
    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ Order created successfully');
      console.log('Order Number:', result.data.order_number);
      console.log('Order ID:', result.data.id);
      console.log('Status:', result.data.status);
      console.log('Subtotal:', result.data.subtotal);
      console.log('Tax:', result.data.tax_amount);
      console.log('Total:', result.data.total_amount);
      console.log('Items:', result.data.items.length);
      
      createdOrderId = result.data.id;
      return result.data;
    } else {
      console.log('❌ Failed to create order');
      console.log('Error:', result.message);
      return null;
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    return null;
  }
}

/**
 * Test 2: Get all orders
 */
async function testGetOrders() {
  console.log('\n🧪 Test 2: Get All Orders');
  console.log('='.repeat(50));
  
  try {
    const response = await fetch(
      `${baseUrl}/restaurants/${restaurantId}/orders`
    );
    
    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ Orders fetched successfully');
      console.log('Total Orders:', result.pagination.total);
      console.log('Current Page:', result.pagination.page);
      console.log('Orders in page:', result.data.length);
      
      if (result.data.length > 0) {
        console.log('\nFirst Order:');
        console.log('  - Order Number:', result.data[0].order_number);
        console.log('  - Status:', result.data[0].status);
        console.log('  - Total:', result.data[0].total_amount);
      }
      
      return result.data;
    } else {
      console.log('❌ Failed to fetch orders');
      console.log('Error:', result.message);
      return null;
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    return null;
  }
}

/**
 * Test 3: Get single order
 */
async function testGetOrder(orderId) {
  console.log('\n🧪 Test 3: Get Single Order');
  console.log('='.repeat(50));
  
  if (!orderId) {
    console.log('⚠️  No order ID provided');
    return null;
  }
  
  try {
    const response = await fetch(
      `${baseUrl}/restaurants/${restaurantId}/orders/${orderId}`
    );
    
    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ Order fetched successfully');
      console.log('Order Number:', result.data.order_number);
      console.log('Status:', result.data.status);
      console.log('Items:');
      result.data.items.forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.item_name} x${item.quantity} - $${item.total_price}`);
      });
      console.log('Total:', result.data.total_amount);
      
      return result.data;
    } else {
      console.log('❌ Failed to fetch order');
      console.log('Error:', result.message);
      return null;
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    return null;
  }
}

/**
 * Test 4: Update order status
 */
async function testUpdateOrderStatus(orderId, newStatus) {
  console.log(`\n🧪 Test 4: Update Order Status to ${newStatus}`);
  console.log('='.repeat(50));
  
  if (!orderId) {
    console.log('⚠️  No order ID provided');
    return null;
  }
  
  try {
    const response = await fetch(
      `${baseUrl}/restaurants/${restaurantId}/orders/${orderId}/status`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      }
    );
    
    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ Order status updated successfully');
      console.log('Old Status -> New Status:', newStatus);
      console.log('Updated At:', new Date(result.data.updated_at).toLocaleString());
      
      return result.data;
    } else {
      console.log('❌ Failed to update order status');
      console.log('Error:', result.message);
      return null;
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    return null;
  }
}

/**
 * Test 5: Add item to order
 */
async function testAddItem(orderId, menuItemId) {
  console.log('\n🧪 Test 5: Add Item to Order');
  console.log('='.repeat(50));
  
  if (!orderId) {
    console.log('⚠️  No order ID provided');
    return null;
  }
  
  try {
    const response = await fetch(
      `${baseUrl}/restaurants/${restaurantId}/orders/${orderId}/items`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          menu_item_id: menuItemId,
          quantity: 1,
          special_instructions: 'Added item test'
        })
      }
    );
    
    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ Item added successfully');
      console.log('Total Items:', result.data.items.length);
      console.log('New Total:', result.data.total_amount);
      
      return result.data;
    } else {
      console.log('❌ Failed to add item');
      console.log('Error:', result.message);
      return null;
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    return null;
  }
}

/**
 * Test 6: Update order (add discount and tip)
 */
async function testUpdateOrder(orderId) {
  console.log('\n🧪 Test 6: Update Order (Add Discount & Tip)');
  console.log('='.repeat(50));
  
  if (!orderId) {
    console.log('⚠️  No order ID provided');
    return null;
  }
  
  try {
    const response = await fetch(
      `${baseUrl}/restaurants/${restaurantId}/orders/${orderId}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          discount_amount: 5.00,
          discount_reason: 'Loyalty discount',
          tip_amount: 10.00
        })
      }
    );
    
    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ Order updated successfully');
      console.log('Discount:', result.data.discount_amount);
      console.log('Tip:', result.data.tip_amount);
      console.log('New Total:', result.data.total_amount);
      
      return result.data;
    } else {
      console.log('❌ Failed to update order');
      console.log('Error:', result.message);
      return null;
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    return null;
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('\n🚀 ORDER API TESTING SUITE');
  console.log('='.repeat(50));
  console.log('Restaurant ID:', restaurantId);
  console.log('Base URL:', baseUrl);
  
  // Test 1: Create order
  const newOrder = await testCreateOrder();
  if (!newOrder) {
    console.log('\n⚠️  Cannot continue testing without a valid order');
    return;
  }
  
  // Test 2: Get all orders
  await testGetOrders();
  
  // Test 3: Get single order
  await testGetOrder(createdOrderId);
  
  // Test 4: Update order status to confirmed
  await testUpdateOrderStatus(createdOrderId, 'confirmed');
  
  // Test 5: Add item to order
  if (sampleMenuItems.length > 1) {
    await testAddItem(createdOrderId, sampleMenuItems[1]);
  }
  
  // Test 6: Update order (discount & tip)
  await testUpdateOrder(createdOrderId);
  
  // Final status
  console.log('\n📊 FINAL ORDER STATUS');
  console.log('='.repeat(50));
  await testGetOrder(createdOrderId);
  
  console.log('\n✨ Testing Complete!');
  console.log('Order ID for manual testing:', createdOrderId);
}

// Run tests
runAllTests().catch(console.error);
