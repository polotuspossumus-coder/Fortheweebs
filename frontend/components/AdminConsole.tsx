import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminConsole() {
  const [protocols, setProtocols] = useState([]);
  const [validators, setValidators] = useState([]);

  useEffect(() => {
    axios.get('/api/protocols').then(res => setProtocols(res.data));
    axios.get('/api/validators').then(res => setValidators(res.data));
  }, []);

  return (
    <div>
      <h2>🧾 Protocol Registry</h2>
      <ul>
        {protocols.map(p => (
          <li key={p.id}>
            <strong>{p.name}</strong> — {p.status} ({new Date(p.createdAt).toLocaleDateString()})
          </li>
        ))}
      </ul>

      <h2>🧠 Validator Memory</h2>
      <ul>
        {validators.map((v, i) => (
          <li key={i}>
            #{i + 1} {v.wallet} — {v.tier} ({new Date(v.timestamp).toLocaleString()})
          </li>
        ))}
      </ul>
    </div>
  );
}
