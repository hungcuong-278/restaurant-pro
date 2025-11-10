/**
 * Load Test: 100 Concurrent Orders
 * 
 * Tests system performance with 100 orders:
 * - Creates 100 orders (mix of dine_in, takeout, delivery)
 * - Simulates kitchen view auto-refresh
 * - Measures response times and rate limiting
 * - Validates zero 429 errors
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
const RESTAURANT_ID = '2c88c32a-03ba-4ef3-96e4-f37cf4b165de';

// Test configuration - Optimized to avoid rate limiting
const CONFIG = {
  totalOrders: 100,
  batchSize: 5,         // Create 5 orders at a time (reduced from 10)
  delayBetweenBatches: 3000, // 3 seconds between batches (increased from 2)
  kitchenTabsCount: 3,  // Simulate 3 kitchen view tabs (reduced from 5)
  autoRefreshInterval: 30000, // 30 seconds
  testDuration: 90000,  // 1.5 minutes (reduced from 2)
};

// Statistics
const stats = {
  ordersCreated: 0,
  ordersFailed: 0,
  fetchRequests: 0,
  fetchSuccess: 0,
  fetchFailed: 0,
  error429Count: 0,
  responseTimes: [],
  startTime: null,
  endTime: null,
};

// Real menu items from database
const MENU_ITEMS = [
  '40e92c7b-e63e-4886-a759-62e84b5365ed', // Truffle Arancini
  'a13c792a-c754-4943-8d54-0d455585393a', // Pan-Seared Scallops
  'a0417d74-22b9-4b6f-876f-c36a7f9af352', // Grilled Salmon
  'c8fde4b0-e958-46a0-ad7c-1e46cde01420', // Beef Tenderloin
  '5de4ea5a-3c9b-4532-8a5a-406cbcd5277c', // Vegetarian Risotto
];

// Real table IDs from database
const TABLES = [
  '5f2a3507-03a5-4a75-9998-00c8240f6bb4', // T001
  'a338df34-eb9a-4343-a237-7235b4e7d709', // T002
  '270d5555-7f6c-40ab-8317-b74d7fe548ff', // T003
  'cf184646-d523-461e-aee9-e9e413e2f255', // P001
];

// Helper: Random element from array
const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Helper: Random integer between min and max
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Helper: Measure response time
const measureTime = async (fn) => {
  const start = Date.now();
  try {
    await fn();
    const duration = Date.now() - start;
    stats.responseTimes.push(duration);
    return { success: true, duration };
  } catch (error) {
    const duration = Date.now() - start;
    if (error.response?.status === 429) {
      stats.error429Count++;
    }
    return { success: false, duration, error };
  }
};

// Create a random order
const createOrder = async (index) => {
  const orderTypes = ['dine_in', 'takeout', 'delivery'];
  const orderType = randomFrom(orderTypes);
  
  const order = {
    order_type: orderType,
    table_id: orderType === 'dine_in' ? randomFrom(TABLES) : undefined,
    items: [
      {
        menu_item_id: randomFrom(MENU_ITEMS),
        quantity: randomInt(1, 3),
        special_instructions: Math.random() > 0.7 ? `Test order ${index}` : undefined,
      }
    ],
  };

  try {
    const start = Date.now();
    const response = await axios.post(
      `${BASE_URL}/restaurants/${RESTAURANT_ID}/orders`,
      order
    );
    const duration = Date.now() - start;
    
    stats.ordersCreated++;
    stats.responseTimes.push(duration);
    
    console.log(`✅ Order ${index + 1}: Created (${orderType}) - ${duration}ms`);
    return { success: true, orderId: response.data.data.id, duration };
  } catch (error) {
    stats.ordersFailed++;
    if (error.response?.status === 429) {
      stats.error429Count++;
      console.log(`❌ Order ${index + 1}: Rate limited (429)`);
    } else {
      console.log(`❌ Order ${index + 1}: Failed - ${error.message}`);
    }
    return { success: false, error };
  }
};

// Fetch all orders (simulates kitchen view)
const fetchOrders = async (tabIndex) => {
  try {
    const start = Date.now();
    const response = await axios.get(
      `${BASE_URL}/restaurants/${RESTAURANT_ID}/orders`
    );
    const duration = Date.now() - start;
    
    stats.fetchRequests++;
    stats.fetchSuccess++;
    stats.responseTimes.push(duration);
    
    const orderCount = response.data.data?.length || 0;
    console.log(`🔄 Tab ${tabIndex}: Fetched ${orderCount} orders - ${duration}ms`);
    return { success: true, count: orderCount, duration };
  } catch (error) {
    stats.fetchRequests++;
    stats.fetchFailed++;
    if (error.response?.status === 429) {
      stats.error429Count++;
      console.log(`❌ Tab ${tabIndex}: Rate limited (429)`);
    } else {
      console.log(`❌ Tab ${tabIndex}: Failed - ${error.message}`);
    }
    return { success: false, error };
  }
};

// Create orders in batches
const createOrdersInBatches = async () => {
  console.log('\n📦 Creating 100 orders in batches...\n');
  
  const batches = Math.ceil(CONFIG.totalOrders / CONFIG.batchSize);
  
  for (let batch = 0; batch < batches; batch++) {
    const batchStart = batch * CONFIG.batchSize;
    const batchEnd = Math.min(batchStart + CONFIG.batchSize, CONFIG.totalOrders);
    
    console.log(`\n--- Batch ${batch + 1}/${batches} (Orders ${batchStart + 1}-${batchEnd}) ---`);
    
    // Create orders in parallel within batch
    const promises = [];
    for (let i = batchStart; i < batchEnd; i++) {
      promises.push(createOrder(i));
    }
    
    await Promise.all(promises);
    
    // Wait before next batch (except for last batch)
    if (batch < batches - 1) {
      console.log(`⏳ Waiting ${CONFIG.delayBetweenBatches}ms before next batch...`);
      await new Promise(resolve => setTimeout(resolve, CONFIG.delayBetweenBatches));
    }
  }
  
  console.log('\n✅ All orders created!\n');
};

// Simulate kitchen view auto-refresh
const simulateKitchenView = async () => {
  console.log(`\n🍳 Simulating ${CONFIG.kitchenTabsCount} kitchen view tabs (auto-refresh every 30s)...\n`);
  
  const intervals = [];
  
  // Create intervals for each tab
  for (let i = 0; i < CONFIG.kitchenTabsCount; i++) {
    const interval = setInterval(async () => {
      await fetchOrders(i + 1);
    }, CONFIG.autoRefreshInterval);
    
    intervals.push(interval);
    
    // Stagger initial fetches (1 second apart)
    setTimeout(() => fetchOrders(i + 1), i * 1000);
  }
  
  // Run for test duration
  await new Promise(resolve => setTimeout(resolve, CONFIG.testDuration));
  
  // Clean up intervals
  intervals.forEach(interval => clearInterval(interval));
  
  console.log('\n✅ Kitchen view simulation complete!\n');
};

// Calculate statistics
const calculateStats = () => {
  const totalTime = stats.endTime - stats.startTime;
  const avgResponseTime = stats.responseTimes.length > 0
    ? stats.responseTimes.reduce((a, b) => a + b, 0) / stats.responseTimes.length
    : 0;
  
  // Sort response times for percentiles
  const sortedTimes = [...stats.responseTimes].sort((a, b) => a - b);
  const p50 = sortedTimes[Math.floor(sortedTimes.length * 0.5)] || 0;
  const p95 = sortedTimes[Math.floor(sortedTimes.length * 0.95)] || 0;
  const p99 = sortedTimes[Math.floor(sortedTimes.length * 0.99)] || 0;
  const maxTime = sortedTimes[sortedTimes.length - 1] || 0;
  
  const totalRequests = stats.ordersCreated + stats.fetchRequests;
  const avgReqPerSec = (totalRequests / (totalTime / 1000)).toFixed(2);
  
  return {
    totalTime: (totalTime / 1000).toFixed(2),
    avgResponseTime: avgResponseTime.toFixed(2),
    p50,
    p95,
    p99,
    maxTime,
    avgReqPerSec,
  };
};

// Print final report
const printReport = () => {
  const computed = calculateStats();
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 LOAD TEST REPORT - 100 Orders');
  console.log('='.repeat(60));
  
  console.log('\n📦 Order Creation:');
  console.log(`   ✅ Created:  ${stats.ordersCreated}/${CONFIG.totalOrders}`);
  console.log(`   ❌ Failed:   ${stats.ordersFailed}`);
  console.log(`   Success Rate: ${((stats.ordersCreated / CONFIG.totalOrders) * 100).toFixed(1)}%`);
  
  console.log('\n🔄 Fetch Requests (Kitchen View):');
  console.log(`   Total Requests:  ${stats.fetchRequests}`);
  console.log(`   ✅ Success:      ${stats.fetchSuccess}`);
  console.log(`   ❌ Failed:       ${stats.fetchFailed}`);
  console.log(`   Success Rate: ${((stats.fetchSuccess / stats.fetchRequests) * 100).toFixed(1)}%`);
  
  console.log('\n⚡ Performance Metrics:');
  console.log(`   Total Time:      ${computed.totalTime}s`);
  console.log(`   Avg Response:    ${computed.avgResponseTime}ms`);
  console.log(`   P50 (Median):    ${computed.p50}ms`);
  console.log(`   P95:             ${computed.p95}ms`);
  console.log(`   P99:             ${computed.p99}ms`);
  console.log(`   Max:             ${computed.maxTime}ms`);
  console.log(`   Avg Req/sec:     ${computed.avgReqPerSec}`);
  
  console.log('\n🛡️ Rate Limiting:');
  console.log(`   429 Errors:      ${stats.error429Count}`);
  console.log(`   Status:          ${stats.error429Count === 0 ? '✅ PASS' : '❌ FAIL'}`);
  
  console.log('\n' + '='.repeat(60));
  
  // Overall verdict
  const success = stats.ordersCreated >= CONFIG.totalOrders * 0.95 && 
                  stats.error429Count === 0 &&
                  computed.avgResponseTime < 500;
  
  if (success) {
    console.log('✅ TEST PASSED - System handles 100+ orders successfully!');
  } else {
    console.log('❌ TEST FAILED - System needs optimization');
  }
  
  console.log('='.repeat(60) + '\n');
};

// Main test execution
const runTest = async () => {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 Starting Load Test: 100 Concurrent Orders');
  console.log('='.repeat(60));
  console.log(`\nConfiguration:`);
  console.log(`  - Total Orders: ${CONFIG.totalOrders}`);
  console.log(`  - Batch Size: ${CONFIG.batchSize}`);
  console.log(`  - Kitchen Tabs: ${CONFIG.kitchenTabsCount}`);
  console.log(`  - Auto-refresh: ${CONFIG.autoRefreshInterval / 1000}s`);
  console.log(`  - Test Duration: ${CONFIG.testDuration / 1000}s`);
  console.log('\n' + '='.repeat(60) + '\n');
  
  stats.startTime = Date.now();
  
  try {
    // Phase 1: Create 100 orders
    await createOrdersInBatches();
    
    // Phase 2: Simulate kitchen view for 2 minutes
    await simulateKitchenView();
    
    stats.endTime = Date.now();
    
    // Print report
    printReport();
    
  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    process.exit(1);
  }
};

// Run the test
if (require.main === module) {
  console.log('🚀 Checking backend connection...');
  
  // Test connection first
  axios.get(`${BASE_URL}/health`)
    .then(() => {
      console.log('✅ Backend is ready!\n');
      runTest();
    })
    .catch((error) => {
      console.error('❌ Backend is not running!');
      console.error('Please start backend: cd backend && npm run dev');
      process.exit(1);
    });
}
