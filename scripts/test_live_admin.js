const https = require('https');

const options = {
  hostname: 'cyber-hunt-azure.vercel.app',
  path: '/api/admin/submissions',
  method: 'GET',
  headers: {
    'Cookie': 'cyberhunt_admin_token=VERIFIED'
  }
};

const start = Date.now();
const req = https.request(options, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    const time = Date.now() - start;
    console.log('Status:', res.statusCode);
    console.log('Time:', time, 'ms');
    console.log('Body length:', body.length);
  });
});

req.on('error', error => console.error(error));
req.end();
