const http = require('http');

const data = JSON.stringify({
  title: 'Test Meeting GCal',
  description: 'Test description',
  startTime: new Date().toISOString(),
  endTime: new Date(Date.now() + 3600000).toISOString(),
  type: 'meeting',
  status: 'scheduled',
  userId: '32e703aa-d942-42e8-bb7c-f8cb3f731371', // hardcoded admin user id
  location: 'Online',
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/meetings',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length,
  },
};

const req = http.request(options, res => {
  let resData = '';
  res.on('data', chunk => {
    resData += chunk;
  });
  res.on('end', () => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Body: ${resData}`);
  });
});

req.on('error', error => {
  console.error(error);
});

req.write(data);
req.end();
