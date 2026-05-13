/**
 * Test error handling
 */

// Test 1: Invalid table ID
fetch('http://localhost:5000/api/restaurants/e4e7bcd3-3b50-47ba-8abc-3597170677bb/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    order_type: 'dine_in',
    table_id: 'invalid-table-id',
    items: [
      {
        menu_item_id: 'db9c9a7d-7f23-4caf-a7a4-1c16998d8fc7',
        quantity: 1
      }
    ]
  })
})
.then(res => res.json())
.then(data => {
  console.log('\n❌ Test 1: Invalid Table ID');
  console.log('Response:', JSON.stringify(data, null, 2));
})
.catch(err => console.error('Error:', err.message));

// Test 2: Invalid menu item ID
setTimeout(() => {
  fetch('http://localhost:5000/api/restaurants/e4e7bcd3-3b50-47ba-8abc-3597170677bb/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      order_type: 'dine_in',
      table_id: 'e1250430-deee-48d9-b721-386309092e67',
      items: [
        {
          menu_item_id: 'invalid-menu-item-id',
          quantity: 1
        }
      ]
    })
  })
  .then(res => res.json())
  .then(data => {
    console.log('\n❌ Test 2: Invalid Menu Item ID');
    console.log('Response:', JSON.stringify(data, null, 2));
  })
  .catch(err => console.error('Error:', err.message));
}, 1000);

// Test 3: Missing required fields
setTimeout(() => {
  fetch('http://localhost:5000/api/restaurants/e4e7bcd3-3b50-47ba-8abc-3597170677bb/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      // Missing order_type
      items: []  // Empty items
    })
  })
  .then(res => res.json())
  .then(data => {
    console.log('\n❌ Test 3: Missing Required Fields');
    console.log('Response:', JSON.stringify(data, null, 2));
  })
  .catch(err => console.error('Error:', err.message));
}, 2000);
