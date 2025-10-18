const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();
app.use(express.json());

app.post('/relay-slab', (req, res) => {
  const { filename, code } = req.body;
  const slabsDir = path.join(__dirname, 'slabs');
  if (!fs.existsSync(slabsDir)) {
    fs.mkdirSync(slabsDir);
  }
  const filePath = path.join(slabsDir, filename);
  try {
    fs.writeFileSync(filePath, code);
    console.log(`Slab ${filename} injected.`);
    res.send({ status: 'success' });
  } catch (err) {
    console.error('Error injecting slab:', err);
    res.status(500).send({ status: 'error', error: err.message });
  }
});

app.listen(3000, () => {
  console.log('Relay listener active on port 3000');
});
