const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
const RESTAURANT_ID = 'f46275c0-9917-44fc-b144-e1e9cff89075';
const TEST_TABLE_ID = '7b1dceb2-6553-4522-9907-5683a1775f8a';

async function testTableEndpoints() {
  console.log('🧪 Testing Table Management Endpoints...\n');

  try {
    // Test 1: GET all tables
    console.log('1️⃣ GET /tables - Fetch all tables');
    const tablesRes = await axios.get(`${BASE_URL}/restaurants/${RESTAURANT_ID}/tables`);
    console.log(`✅ Status: ${tablesRes.status}`);
    console.log(`   Found ${tablesRes.data.data.length} tables\n`);

    // Test 2: GET table layout
    console.log('2️⃣ GET /tables/layout - Fetch table layout');
    const layoutRes = await axios.get(`${BASE_URL}/restaurants/${RESTAURANT_ID}/tables/layout`);
    console.log(`✅ Status: ${layoutRes.status}`);
    console.log(`   Layout contains ${layoutRes.data.data.length} tables\n`);

    // Test 3: GET single table
    console.log('3️⃣ GET /tables/:id - Fetch single table');
    const tableRes = await axios.get(`${BASE_URL}/restaurants/${RESTAURANT_ID}/tables/${TEST_TABLE_ID}`);
    console.log(`✅ Status: ${tableRes.status}`);
    console.log(`   Table: ${tableRes.data.data.number} (${tableRes.data.data.status})\n`);

    // Test 4: PATCH table status
    console.log('4️⃣ PATCH /tables/:id/status - Update table status');
    const statusRes = await axios.patch(
      `${BASE_URL}/restaurants/${RESTAURANT_ID}/tables/${TEST_TABLE_ID}/status`,
      { status: 'occupied' }
    );
    console.log(`✅ Status: ${statusRes.status}`);
    console.log(`   New status: ${statusRes.data.data.status}\n`);

    // Test 5: PATCH table position
    console.log('5️⃣ PATCH /tables/:id/position - Update table position');
    const positionRes = await axios.patch(
      `${BASE_URL}/restaurants/${RESTAURANT_ID}/tables/${TEST_TABLE_ID}/position`,
      { position: { x: 250, y: 250 } }
    );
    console.log(`✅ Status: ${positionRes.status}`);
    console.log(`   New position: ${positionRes.data.data.position}\n`);

    // Test 6: GET table availability
    console.log('6️⃣ GET /tables/availability/check - Check availability');
    const availRes = await axios.get(
      `${BASE_URL}/restaurants/${RESTAURANT_ID}/tables/availability/check?date=2025-10-15&time=19:00`
    );
    console.log(`✅ Status: ${availRes.status}`);
    console.log(`   Available tables: ${availRes.data.data.availableTables || 'N/A'}\n`);

    // Test 7: GET table analytics
    console.log('7️⃣ GET /tables/analytics/stats - Get analytics');
    const analyticsRes = await axios.get(
      `${BASE_URL}/restaurants/${RESTAURANT_ID}/tables/analytics/stats?start_date=2025-10-01&end_date=2025-10-31`
    );
    console.log(`✅ Status: ${analyticsRes.status}`);
    console.log(`   Total tables: ${analyticsRes.data.data.totalTables || 'N/A'}\n`);

    // Test 8: POST create table
    console.log('8️⃣ POST /tables - Create new table');
    const createRes = await axios.post(
      `${BASE_URL}/restaurants/${RESTAURANT_ID}/tables`,
      {
        number: 'TEST-' + Date.now(),
        capacity: 4,
        location: 'Test Area',
        status: 'available'
      }
    );
    console.log(`✅ Status: ${createRes.status}`);
    console.log(`   Created table: ${createRes.data.data.number}\n`);
    const newTableId = createRes.data.data.id;

    // Test 9: PUT update table
    console.log('9️⃣ PUT /tables/:id - Update table');
    const updateRes = await axios.put(
      `${BASE_URL}/restaurants/${RESTAURANT_ID}/tables/${newTableId}`,
      {
        capacity: 6,
        location: 'Updated Area'
      }
    );
    console.log(`✅ Status: ${updateRes.status}`);
    console.log(`   Updated capacity: ${updateRes.data.data.capacity}\n`);

    // Test 10: PATCH bulk update positions
    console.log('🔟 PATCH /tables/positions/bulk - Bulk update positions');
    const bulkRes = await axios.patch(
      `${BASE_URL}/restaurants/${RESTAURANT_ID}/tables/positions/bulk`,
      {
        positions: [
          { id: TEST_TABLE_ID, position: { x: 200, y: 200 } },
          { id: newTableId, position: { x: 400, y: 400 } }
        ]
      }
    );
    console.log(`✅ Status: ${bulkRes.status}`);
    console.log(`   Updated ${bulkRes.data.data?.updated || 2} positions\n`);

    // Test 11: DELETE table
    console.log('1️⃣1️⃣ DELETE /tables/:id - Delete table');
    const deleteRes = await axios.delete(
      `${BASE_URL}/restaurants/${RESTAURANT_ID}/tables/${newTableId}`
    );
    console.log(`✅ Status: ${deleteRes.status}`);
    console.log(`   ${deleteRes.data.message}\n`);

    console.log('🎉 All tests passed successfully!');
    console.log('✅ Phase 3 Backend Table Management - VERIFIED');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

testTableEndpoints();
