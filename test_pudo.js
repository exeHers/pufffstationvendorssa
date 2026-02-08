const https = require('https');

const url = 'https://sandbox.api-pudo.co.za/api/v1/lockers-data';

console.log('Fetching:', url);

https.get(url, (res) => {
  console.log('Status:', res.statusCode);
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
        const json = JSON.parse(data);
        console.log('First Item:', JSON.stringify(json[0], null, 2));
        console.log('Count:', json.length);
    } catch (e) {
        console.log('Response (first 100 chars):', data.substring(0, 100));
    }
  });
}).on('error', (e) => {
  console.error('Error:', e.message);
});
