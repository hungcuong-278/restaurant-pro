// Test Table and Reservation APIs
console.log('Testing Table Management API...\n');

const baseURL = 'http://localhost:5000/api';
const restaurantId = 'f46275c0-9917-44fc-b144-e1e9cff89075'; // Use actual restaurant ID

// Test 1: Get all tables
async function testGetTables() {
  try {
    const response = await fetch(`${baseURL}/restaurants/${restaurantId}/tables`);
    const data = await response.json();
    console.log('✅ GET Tables:', data);
    return data;
  } catch (error) {
    console.error('❌ GET Tables Error:', error);
  }
}

// Test 2: Create a table
async function testCreateTable() {
  try {
    const tableData = {
      number: 'T001',
      capacity: 4,
      location: 'Main Hall',
      position: { x: 100, y: 150 }
    };
    
    const response = await fetch(`${baseURL}/restaurants/${restaurantId}/tables`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tableData)
    });
    
    const data = await response.json();
    console.log('✅ CREATE Table:', data);
    return data;
  } catch (error) {
    console.error('❌ CREATE Table Error:', error);
  }
}

// Test 3: Update table status
async function testUpdateTableStatus(tableId) {
  try {
    const response = await fetch(`${baseURL}/restaurants/${restaurantId}/tables/${tableId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'occupied' })
    });
    
    const data = await response.json();
    console.log('✅ UPDATE Table Status:', data);
    return data;
  } catch (error) {
    console.error('❌ UPDATE Table Status Error:', error);
  }
}

// Test 4: Get available slots for reservations
async function testGetAvailableSlots() {
  try {
    const date = new Date().toISOString().split('T')[0]; // Today's date
    const response = await fetch(`${baseURL}/restaurants/${restaurantId}/reservations/availability/slots?date=${date}&party_size=4`);
    const data = await response.json();
    console.log('✅ GET Available Slots:', data);
    return data;
  } catch (error) {
    console.error('❌ GET Available Slots Error:', error);
  }
}

// Test 5: Create a reservation
async function testCreateReservation() {
  try {
    const reservationData = {
      customer_name: 'John Doe',
      customer_email: 'john@example.com',
      customer_phone: '+1234567890',
      party_size: 4,
      reservation_date: new Date().toISOString().split('T')[0],
      reservation_time: '19:00',
      special_requests: 'Window table preferred'
    };
    
    const response = await fetch(`${baseURL}/restaurants/${restaurantId}/reservations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reservationData)
    });
    
    const data = await response.json();
    console.log('✅ CREATE Reservation:', data);
    return data;
  } catch (error) {
    console.error('❌ CREATE Reservation Error:', error);
  }
}

// Test 6: Get all reservations
async function testGetReservations() {
  try {
    const response = await fetch(`${baseURL}/restaurants/${restaurantId}/reservations`);
    const data = await response.json();
    console.log('✅ GET Reservations:', data);
    return data;
  } catch (error) {
    console.error('❌ GET Reservations Error:', error);
  }
}

// Run all tests
async function runTests() {
  console.log('🧪 Starting API Tests...\n');
  
  // Test tables first
  const tables = await testGetTables();
  const newTable = await testCreateTable();
  
  if (newTable?.data?.id) {
    await testUpdateTableStatus(newTable.data.id);
  }
  
  // Test reservations
  await testGetAvailableSlots();
  const newReservation = await testCreateReservation();
  await testGetReservations();
  
  console.log('\n🎉 All tests completed!');
}

// Start tests
runTests().catch(console.error);