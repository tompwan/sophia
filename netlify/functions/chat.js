const https = require('https');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  const { system, messages } = JSON.parse(event.body);

  const payload = JSON.stringify({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    system: system || undefined,
    messages
  });

  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('Anthropic status:', res.statusCode);
        console.log('Anthropic response:', data);
        resolve({
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: data
        });
      });
    });
    req.on('error', (e) => {
      console.log('Request error:', e.message);
      resolve({
        statusCode: 500,
        body: JSON.stringify({ error: e.message })
      });
    });
    req.write(payload);
    req.end();
  });
};
