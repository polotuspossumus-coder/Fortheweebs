import AppRoutes from './routes';
import Login from './components/Login.jsx';
import { getToken } from './utils/auth.js';
import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './theme';
import { AuthProvider } from './context/AuthContext';

export default function App() {
  const token = getToken();

  useEffect(() => {
    if (token) {
      // Optional: validate token or fetch user data
      console.log('User is authenticated');
    }
  }, [token]);

  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          {token ? <AppRoutes /> : <Login />}
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
