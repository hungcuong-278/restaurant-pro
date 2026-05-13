// Simple HTTP server log viewer
const http = require('http');

console.log('Making request to table API...\n');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/restaurants/f46275c0-9917-44fc-b144-e1e9cff89075/tables',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  console.log(`Headers:`, JSON.stringify(res.headers, null, 2));
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('\nResponse Body:');
    try {
      const parsed = JSON.parse(data);
      console.log(JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.log(data);
    }
  });
});

req.on('error', (error) => {
  console.error('Request Error:', error.message);
});

req.end();

// Wait a bit to see server logs
setTimeout(() => {
  console.log('\n--- Check server window for logs ---');
  process.exit(0);
}, 2000);
