/**
 * Simple Load Test: 100 Orders Sequential
 * 
 * Creates 100 orders sequentially to avoid concurrency issues
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
const RESTAURANT_ID = '2c88c32a-03ba-4ef3-96e4-f37cf4b165de';

// Real menu items and tables from database
const MENU_ITEMS = [
  '40e92c7b-e63e-4886-a759-62e84b5365ed', // Truffle Arancini
  'a13c792a-c754-4943-8d54-0d455585393a', // Pan-Seared Scallops
  'a0417d74-22b9-4b6f-876f-c36a7f9af352', // Grilled Salmon
  'c8fde4b0-e958-46a0-ad7c-1e46cde01420', // Beef Tenderloin
  '5de4ea5a-3c9b-4532-8a5a-406cbcd5277c', // Vegetarian Risotto
];

const TABLES = [
  '5f2a3507-03a5-4a75-9998-00c8240f6bb4', // T001
  'a338df34-eb9a-4343-a237-7235b4e7d709', // T002
  '270d5555-7f6c-40ab-8317-b74d7fe548ff', // T003
  'cf184646-d523-461e-aee9-e9e413e2f255', // P001
];

const CONFIG = {
  totalOrders: 100,
  delayBetweenOrders: 100, // 100ms delay between each order
};

const stats = {
  created: 0,
  failed: 0,
  error429: 0,
  error500: 0,
  responseTimes: [],
  startTime: null,
  endTime: null,
};

const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

async function createOrder(index) {
  const orderTypes = ['dine_in', 'takeout', 'delivery'];
  const orderType = randomFrom(orderTypes);
  
  const order = {
    order_type: orderType,
    table_id: orderType === 'dine_in' ? randomFrom(TABLES) : undefined,
    items: [
      {
        menu_item_id: randomFrom(MENU_ITEMS),
        quantity: randomInt(1, 3),
      }
    ],
  };

  try {
    const start = Date.now();
    await axios.post(`${BASE_URL}/restaurants/${RESTAURANT_ID}/orders`, order);
    const duration = Date.now() - start;
    
    stats.created++;
    stats.responseTimes.push(duration);
    
    process.stdout.write(`\r✅ Created ${stats.created}/${CONFIG.totalOrders} orders (${duration}ms)`);
    return true;
  } catch (error) {
    stats.failed++;
    if (error.response?.status === 429) stats.error429++;
    if (error.response?.status === 500) stats.error500++;
    
    process.stdout.write(`\r❌ Failed at order ${index + 1} (${error.response?.status || 'error'})`);
    return false;
  }
}

async function runTest() {
  console.log('\n🧪 Sequential Load Test: Creating 100 Orders\n');
  console.log(`Configuration:`);
  console.log(`  - Total Orders: ${CONFIG.totalOrders}`);
  console.log(`  - Delay: ${CONFIG.delayBetweenOrders}ms between orders\n`);
  console.log('='.repeat(60) + '\n');
  
  stats.startTime = Date.now();
  
  for (let i = 0; i < CONFIG.totalOrders; i++) {
    await createOrder(i);
    if (CONFIG.delayBetweenOrders > 0) {
      await new Promise(resolve => setTimeout(resolve, CONFIG.delayBetweenOrders));
    }
    
    // Stop if too many failures
    if (stats.failed > 20) {
      console.log('\n\n⚠️ Too many failures, stopping test...\n');
      break;
    }
  }
  
  stats.endTime = Date.now();
  
  // Print report
  console.log('\n\n' + '='.repeat(60));
  console.log('📊 TEST REPORT');
  console.log('='.repeat(60));
  
  const totalTime = ((stats.endTime - stats.startTime) / 1000).toFixed(2);
  const avgTime = stats.responseTimes.length > 0
    ? (stats.responseTimes.reduce((a, b) => a + b, 0) / stats.responseTimes.length).toFixed(2)
    : 0;
  
  const sorted = [...stats.responseTimes].sort((a, b) => a - b);
  const p50 = sorted[Math.floor(sorted.length * 0.5)] || 0;
  const p95 = sorted[Math.floor(sorted.length * 0.95)] || 0;
  const p99 = sorted[Math.floor(sorted.length * 0.99)] || 0;
  const max = sorted[sorted.length - 1] || 0;
  
  console.log(`\n📦 Orders:`);
  console.log(`   Created:  ${stats.created}/${CONFIG.totalOrders} (${(stats.created/CONFIG.totalOrders*100).toFixed(1)}%)`);
  console.log(`   Failed:   ${stats.failed}`);
  
  console.log(`\n⚡ Performance:`);
  console.log(`   Total Time:   ${totalTime}s`);
  console.log(`   Avg Response: ${avgTime}ms`);
  console.log(`   P50:          ${p50}ms`);
  console.log(`   P95:          ${p95}ms`);
  console.log(`   P99:          ${p99}ms`);
  console.log(`   Max:          ${max}ms`);
  console.log(`   Throughput:   ${(stats.created / (totalTime / 60)).toFixed(1)} orders/min`);
  
  console.log(`\n🛡️ Errors:`);
  console.log(`   429 (Rate Limit): ${stats.error429}`);
  console.log(`   500 (Server):     ${stats.error500}`);
  console.log(`   Other:            ${stats.failed - stats.error429 - stats.error500}`);
  
  console.log('\n' + '='.repeat(60));
  
  const success = stats.created >= CONFIG.totalOrders * 0.95 && stats.error429 === 0;
  if (success) {
    console.log('✅ TEST PASSED - System can handle 100 orders!');
  } else {
    console.log('❌ TEST FAILED - System needs optimization');
  }
  
  console.log('='.repeat(60) + '\n');
}

// Check connection and run
axios.get(`${BASE_URL}/health`)
  .then(() => {
    console.log('✅ Backend is ready!\n');
    runTest();
  })
  .catch(() => {
    console.error('❌ Backend is not running!');
    console.error('Please start: cd backend && npm run dev\n');
    process.exit(1);
  });
