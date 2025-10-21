import { useState } from 'react';
import { saveToken } from '../utils/auth.js';

export default function Login() {
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('viewer');

  const handleSignup = async () => {
    const res = await fetch('/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, role }),
    });
    const data = await res.json();
    saveToken(data.token);
    window.location.href = '/';
  };

  const handleLogin = async () => {
    const res = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    });
    const data = await res.json();
    saveToken(data.token);
    window.location.href = '/';
  };

  return (
    <div>
      <h2>Login or Signup</h2>
      <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" />
      <select value={role} onChange={e => setRole(e.target.value)}>
        <option value="viewer">Viewer</option>
        <option value="creator">Creator</option>
        <option value="council">Council</option>
        <option value="jacob">Jacob</option>
      </select>
      <button onClick={handleSignup}>Sign Up</button>
      <button onClick={handleLogin}>Log In</button>
    </div>
  );
}
