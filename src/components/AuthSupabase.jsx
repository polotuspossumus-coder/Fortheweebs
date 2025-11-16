// AUTHENTICATION SYSTEM - Supabase Auth with login/signup

import React, { useState, createContext, useContext, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import './Auth.css';

// Auth Context
const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

// Auth Provider Component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user ?? null;
      setUser(user);

      // Check if owner email on session restore
      if (user && user.email.toLowerCase() === 'polotuspossumus@gmail.com') {
        localStorage.setItem('ownerEmail', 'polotuspossumus@gmail.com');
        localStorage.setItem('userId', 'owner');
        localStorage.setItem('adminAuthenticated', 'true');
        localStorage.setItem('ownerVerified', 'true');
        localStorage.setItem('hasOnboarded', 'true');
        localStorage.setItem('legalAccepted', 'true');
        localStorage.setItem('tosAccepted', 'true');
        localStorage.setItem('privacyAccepted', 'true');
        localStorage.setItem('userTier', 'LIFETIME_VIP');
        console.log('👑 Owner session restored - Admin access granted');
      }

      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      setUser(user);

      // Check if owner email on auth change
      if (user && user.email.toLowerCase() === 'polotuspossumus@gmail.com') {
        localStorage.setItem('ownerEmail', 'polotuspossumus@gmail.com');
        localStorage.setItem('userId', 'owner');
        localStorage.setItem('adminAuthenticated', 'true');
        localStorage.setItem('ownerVerified', 'true');
        localStorage.setItem('hasOnboarded', 'true');
        localStorage.setItem('legalAccepted', 'true');
        localStorage.setItem('tosAccepted', 'true');
        localStorage.setItem('privacyAccepted', 'true');
        localStorage.setItem('userTier', 'LIFETIME_VIP');
        console.log('👑 Owner auth state changed - Admin access granted');
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signup = async (email, password, displayName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName
        }
      }
    });

    if (error) throw error;

    // Create user profile in database
    if (data.user) {
      await supabase.from('users').insert([{
        id: data.user.id,
        email,
        display_name: displayName,
        tier: 'free',
        balance: 0,
        created_at: new Date().toISOString()
      }]);
    }

    return data;
  };

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    // Check if owner email and grant admin access
    if (data.user && data.user.email.toLowerCase() === 'polotuspossumus@gmail.com') {
      localStorage.setItem('ownerEmail', 'polotuspossumus@gmail.com');
      localStorage.setItem('userId', 'owner');
      localStorage.setItem('adminAuthenticated', 'true');
      localStorage.setItem('ownerVerified', 'true');
      localStorage.setItem('hasOnboarded', 'true');
      localStorage.setItem('legalAccepted', 'true');
      localStorage.setItem('tosAccepted', 'true');
      localStorage.setItem('privacyAccepted', 'true');
      localStorage.setItem('userTier', 'LIFETIME_VIP');
      console.log('👑 Owner logged in - Admin access granted');
    }

    return data;
  };

  const loginWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) throw error;

    // Check if owner email after OAuth (will be checked on callback)
    if (data.user && data.user.email.toLowerCase() === 'polotuspossumus@gmail.com') {
      localStorage.setItem('ownerEmail', 'polotuspossumus@gmail.com');
      localStorage.setItem('userId', 'owner');
      localStorage.setItem('adminAuthenticated', 'true');
      localStorage.setItem('ownerVerified', 'true');
      localStorage.setItem('hasOnboarded', 'true');
      localStorage.setItem('legalAccepted', 'true');
      localStorage.setItem('tosAccepted', 'true');
      localStorage.setItem('privacyAccepted', 'true');
      localStorage.setItem('userTier', 'LIFETIME_VIP');
      console.log('👑 Owner logged in via Google - Admin access granted');
    }

    return data;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });

    if (error) throw error;
  };

  const value = {
    user,
    loading,
    signup,
    login,
    loginWithGoogle,
    logout,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Login Form Component
export function LoginForm({ onSuccess, onSwitchToSignup }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      await loginWithGoogle();
      // OAuth will redirect, so no need to call onSuccess
    } catch (err) {
      setError(err.message || 'Failed to login with Google');
      setLoading(false);
    }
  };

  return (
    <div className="auth-form">
      <h2>Welcome Back!</h2>
      {error && <div className="auth-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="your@email.com"
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />
        </div>

        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div className="auth-divider">
        <span>OR</span>
      </div>

      <button
        className="google-auth-button"
        onClick={handleGoogleLogin}
        disabled={loading}
      >
        <span className="google-icon">🔐</span>
        Continue with Google
      </button>

      <div className="auth-footer">
        <p>
          Don't have an account?{' '}
          <button onClick={onSwitchToSignup} className="auth-link">
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}

// Signup Form Component
export function SignupForm({ onSuccess, onSwitchToLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup, loginWithGoogle } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await signup(email, password, displayName);
      alert('Check your email to confirm your account!');
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError('');
    setLoading(true);

    try {
      await loginWithGoogle();
      // OAuth will redirect, so no need to call onSuccess
    } catch (err) {
      setError(err.message || 'Failed to signup with Google');
      setLoading(false);
    }
  };

  return (
    <div className="auth-form">
      <h2>Create Account</h2>
      {error && <div className="auth-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Display Name</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            placeholder="Your Name"
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="your@email.com"
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            minLength={6}
          />
        </div>

        <div className="form-group">
          <label>Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="••••••••"
          />
        </div>

        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>

      <div className="auth-divider">
        <span>OR</span>
      </div>

      <button
        className="google-auth-button"
        onClick={handleGoogleSignup}
        disabled={loading}
      >
        <span className="google-icon">🔐</span>
        Continue with Google
      </button>

      <div className="auth-footer">
        <p>
          Already have an account?{' '}
          <button onClick={onSwitchToLogin} className="auth-link">
            Login
          </button>
        </p>
      </div>
    </div>
  );
}

// Auth Modal Component
export function AuthModal({ isOpen, onClose, defaultView = 'login' }) {
  const [view, setView] = useState(defaultView);

  if (!isOpen) return null;

  const handleSuccess = () => {
    onClose();
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={onClose}>
          ✕
        </button>

        {view === 'login' ? (
          <LoginForm
            onSuccess={handleSuccess}
            onSwitchToSignup={() => setView('signup')}
          />
        ) : (
          <SignupForm
            onSuccess={handleSuccess}
            onSwitchToLogin={() => setView('login')}
          />
        )}
      </div>
    </div>
  );
}

// Protected Route Component
export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="auth-loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="auth-gate">
        <h2>🔒 Login Required</h2>
        <p>You need to be logged in to access this page.</p>
        <AuthModal isOpen={true} onClose={() => { }} defaultView="login" />
      </div>
    );
  }

  return children;
}

export default {
  AuthProvider,
  LoginForm,
  SignupForm,
  AuthModal,
  ProtectedRoute,
  useAuth
};
