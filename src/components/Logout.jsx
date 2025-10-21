import { clearToken } from '../utils/auth.js';

export default function Logout() {
  const handleLogout = () => {
    clearToken();
    window.location.reload();
  };

  return <button onClick={handleLogout}>Logout</button>;
}
