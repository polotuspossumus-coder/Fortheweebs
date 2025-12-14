// AUTHENTICATION SYSTEM - Supabase Auth with login/signup

import React, { useState, createContext, useContext, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import './Auth.css';

// VIP Email List - All these users get LIFETIME_VIP tier automatically
const VIP_EMAILS = [
  'polotuspossumus@gmail.com',  // Owner
  'shellymontoya82@gmail.com',  // VIP - Shelly
  'chesed04@aol.com',
  'Colbyg123f@gmail.com',
  'PerryMorr94@gmail.com',
  'remyvogt@gmail.com',
  'kh@savantenergy.com',
  'Bleska@mindspring.com',
  'palmlana@yahoo.com',
  'Billyxfitzgerald@yahoo.com',
  'Yeahitsmeangel@yahoo.com',
  'Atolbert66@gmail.com',
  'brookewhitley530@gmail.com'
];

// Check if email is VIP
const isVIPEmail = (email) => {
  if (!email) return false;
  const normalized = email.toLowerCase().trim();
  return VIP_EMAILS.some(vip => vip.toLowerCase().trim() === normalized);
};

// Grant VIP access helper
const grantVIPAccess = (user) => {
  if (!user) return;

  const email = user.email.toLowerCase();

  if (email === 'polotuspossumus@gmail.com') {
    // Owner gets full admin access
    localStorage.setItem('ownerEmail', 'polotuspossumus@gmail.com');
    localStorage.setItem('userEmail', 'polotuspossumus@gmail.com'); // CRITICAL: Set userEmail for tier checks
    localStorage.setItem('userId', 'owner');
    localStorage.setItem('adminAuthenticated', 'true');
    localStorage.setItem('ownerVerified', 'true');
    localStorage.setItem('hasOnboarded', 'true');
    localStorage.setItem('legalAccepted', 'true');
    localStorage.setItem('tosAccepted', 'true');
    localStorage.setItem('privacyAccepted', 'true');
    localStorage.setItem('userTier', 'OWNER'); // Use OWNER tier, not LIFETIME_VIP
    console.log('👑 Owner access granted - ALL PAYWALLS REMOVED');
  } else if (isVIPEmail(email)) {
    // VIP users get full access but no admin
    localStorage.setItem('userEmail', email); // CRITICAL: Set userEmail for tier checks
    localStorage.setItem('userId', user.id);
    localStorage.setItem('hasOnboarded', 'true');
    localStorage.setItem('legalAccepted', 'true');
    localStorage.setItem('tosAccepted', 'true');
    localStorage.setItem('privacyAccepted', 'true');
    localStorage.setItem('userTier', 'LIFETIME_VIP');
    console.log('👑 VIP access granted to:', email);
  }
};

// Auth Context
const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

// Auth Provider Component
function AuthProviderComponent({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user ?? null;
      setUser(user);

      // Grant VIP access if applicable
      if (user) {
        grantVIPAccess(user);
      }

      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      setUser(user);

      // Grant VIP access if applicable
      if (user) {
        grantVIPAccess(user);
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
      // Check total user count for first 100 ELITE promotion
      const { count } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });
      
      // First 100 users get ELITE tier automatically ($1000 value)
      const tier = (count !== null && count < 100) ? 'elite' : 'free';
      
      await supabase.from('users').insert([{
        id: data.user.id,
        email,
        display_name: displayName,
        tier,
        balance: 0,
        created_at: new Date().toISOString()
      }]);

      // If they got Elite, store it in localStorage
      if (tier === 'elite') {
        localStorage.setItem('userTier', 'ELITE');
        console.log(`🎉 User ${count + 1}/100 - ELITE tier granted ($1000 value)!`);
      }
    }

    return data;
  };

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    // Grant VIP access if applicable
    if (data.user) {
      grantVIPAccess(data.user);
    }

    return data;
  };

  const loginWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${globalThis.location.origin}/auth/callback`
      }
    });

    if (error) throw error;

    // Grant VIP access if applicable (OAuth will be checked on callback)
    if (data.user) {
      grantVIPAccess(data.user);
    }

    return data;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${globalThis.location.origin}/reset-password`
    });

    if (error) throw error;
  };

  const value = React.useMemo(() => ({
    user,
    loading,
    signup,
    login,
    loginWithGoogle,
    logout,
    resetPassword
  }), [user, loading]);

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

AuthProviderComponent.propTypes = {
  children: PropTypes.node
};

export const AuthProvider = AuthProviderComponent;

// Login Form Component
function LoginFormComponent({ onSuccess, onSwitchToSignup }) {
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
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="your@email.com"
          />
        </div>

        <div className="form-group">
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
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
        <span className="google-icon">🔐</span>Continue with Google
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

LoginFormComponent.propTypes = {
  onSuccess: PropTypes.func,
  onSwitchToSignup: PropTypes.func
};

export const LoginForm = LoginFormComponent;

// Signup Form Component
function SignupFormComponent({ onSuccess, onSwitchToLogin }) {
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
          <label htmlFor="signup-displayname">Display Name</label>
          <input
            id="signup-displayname"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            placeholder="Your Name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="signup-email">Email</label>
          <input
            id="signup-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="your@email.com"
          />
        </div>

        <div className="form-group">
          <label htmlFor="signup-password">Password</label>
          <input
            id="signup-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            minLength={6}
          />
        </div>

        <div className="form-group">
          <label htmlFor="signup-confirm">Confirm Password</label>
          <input
            id="signup-confirm"
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
        <span className="google-icon">🔐</span>Continue with Google
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
function AuthModalComponent({ isOpen, onClose, defaultView = 'login' }) {
  const [view, setView] = useState(defaultView);

  if (!isOpen) return null;

  const handleSuccess = () => {
    onClose();
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose} onKeyDown={(e) => e.key === 'Escape' && onClose()} role="button" tabIndex={0}>
      <div className="auth-modal-content" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()} role="dialog" tabIndex={-1}>
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

AuthModalComponent.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  defaultView: PropTypes.string
};

export const AuthModal = AuthModalComponent;

// Protected Route Component
function ProtectedRouteComponent({ children }) {
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

ProtectedRouteComponent.propTypes = {
  children: PropTypes.node
};

export const ProtectedRoute = ProtectedRouteComponent;

SignupFormComponent.propTypes = {
  onSuccess: PropTypes.func,
  onSwitchToLogin: PropTypes.func
};

export const SignupForm = SignupFormComponent;

export default {
  AuthProvider,
  LoginForm,
  SignupForm,
  AuthModal,
  ProtectedRoute,
  useAuth
};
