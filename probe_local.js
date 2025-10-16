import http from 'http';

const timeoutMs = 3000;

function probePort(host, port) {
  return new Promise((resolve) => {
    const req = http.request({ hostname: host, port, path: '/', method: 'GET', timeout: timeoutMs }, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve({ ok: true, port, status: res.statusCode, snippet: data.slice(0, 200) }));
    });
    req.on('error', (err) => resolve({ ok: false, port, error: String(err) }));
    req.on('timeout', () => { req.destroy(); resolve({ ok: false, port, error: 'timeout' }); });
    req.end();
  });
}

async function findServer() {
  const host = '127.0.0.1';
  const ports = [3000, 5173, 5174, 5175, 5176, 5177, 5178, 5179, 5180];
  for (const p of ports) {
    const r = await probePort(host, p);
    if (r.ok) return r;
    console.log(`${host}:${p} -> ${r.error}`);
  }
  return null;
}

(async function(){
  const found = await findServer();
  if (found) {
    console.log(`FOUND: http://127.0.0.1:${found.port}/ -> ${found.status}`);
    console.log(found.snippet || '');
    process.exit(0);
  }
  console.log('No running dev server detected on common ports.');
  process.exit(2);
})();
