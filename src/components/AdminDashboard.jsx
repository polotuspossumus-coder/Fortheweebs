import { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminDashboard() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    axios.get('/api/admin/events').then(res => setEvents(res.data));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <table className="w-full border">
        <thead>
          <tr>
            <th>User</th>
            <th>Type</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {events.map((e, i) => (
            <tr key={i}>
              <td>{e.userId}</td>
              <td>{e.type}</td>
              <td>{new Date(e.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
