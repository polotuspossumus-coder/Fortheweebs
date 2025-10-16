import http from 'http';

function probe(url) {
  return new Promise((resolve) => {
    const u = new URL(url);
    const opts = { hostname: u.hostname, port: u.port, path: u.pathname || '/', method: 'GET', timeout: 3000 };
    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve({ url, status: res.statusCode, snippet: data.slice(0, 200) }));
    });
    req.on('error', (err) => resolve({ url, error: String(err) }));
    req.on('timeout', () => { req.destroy(); resolve({ url, error: 'timeout' }); });
    req.end();
  });
}

async function main() {
  const urls = ['http://127.0.0.1:3000/', 'http://127.0.0.1:5173/'];
  for (const u of urls) {
    const r = await probe(u);
    if (r.error) {
      console.log(`${u} -> ERROR: ${r.error}`);
    } else {
      console.log(`${u} -> ${r.status}`);
      console.log(r.snippet);
    }
  }
}

main();
