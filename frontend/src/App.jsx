// frontend/src/App.jsx
import React, { useState } from 'react';
import apiClient from './client';
import './App.css';

export default function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [tokens, setTokens] = useState(null);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Calls Django backend via Vite proxy: POST http://localhost:8002/api/auth/login/
      const response = await apiClient.post('/auth/login/', {
        username,
        password,
      });

      // dj-rest-auth with JWT returns { access, refresh, user }
      setTokens({
        access: response.data.access,
        refresh: response.data.refresh,
      });
      setUser(response.data.user || { username });
    } catch (err) {
      setError(
        err.response?.data?.non_field_errors?.[0] ||
        err.response?.data?.detail ||
        'Login failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout/');
    } catch {
      // Ignore logout errors
    }
    setUser(null);
    setTokens(null);
    setUsername('');
    setPassword('');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>🏥 MedFinder Auth Test</h2>
          <p>End-to-End React ↔ Django JWT Verification</p>
        </div>

        {user ? (
          <div className="auth-success">
            <div className="badge-success">✅ Authenticated</div>
            <h3>Welcome, {user.username}!</h3>
            <p><strong>User ID:</strong> {user.pk || user.id || 'N/A'}</p>
            <p><strong>Email:</strong> {user.email || 'No email associated'}</p>

            <div className="token-box">
              <h4>🔑 Access Token (JWT):</h4>
              <code>{tokens?.access?.substring(0, 45)}...</code>
            </div>

            <button onClick={handleLogout} className="btn-logout">
              Log Out
            </button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="auth-form">
            {error && <div className="alert-error">{error}</div>}

            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter superuser or username"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
