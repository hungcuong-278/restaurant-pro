/**
 * Quick test to create an order with test data  
 */

const testData = {
  order_type: 'dine_in',
  table_id: 'e1250430-deee-48d9-b721-386309092e67', // P001
  customer_notes: 'Test order',
  items: [
    {
      menu_item_id: 'db9c9a7d-7f23-4caf-a7a4-1c16998d8fc7',
      quantity: 2
    }
  ]
};

fetch('http://localhost:5000/api/restaurants/e4e7bcd3-3b50-47ba-8abc-3597170677bb/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(testData)
})
.then(res => res.json())
.then(data => {
  console.log('\n✅ Response:', JSON.stringify(data, null, 2));
})
.catch(err => {
  console.log('\n❌ Error:', err.message);
});
