import { Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import Profile from '../pages/Profile';
import Governance from '../pages/Governance';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/governance" element={<Governance />} />
    </Routes>
  );
}
