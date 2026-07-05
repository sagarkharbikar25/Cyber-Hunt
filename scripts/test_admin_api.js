const http = require('http');
http.get('http://localhost:3000/api/admin/submissions', (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log('Status:', res.statusCode, 'Body length:', body.length));
}).on('error', console.error);
