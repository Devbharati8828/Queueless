import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for existing session
    const savedUser = localStorage.getItem('queueless_user');
    const savedToken = localStorage.getItem('queueless_token');
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedToken) setToken(savedToken);
    setLoading(false);
  }, []);

  const login = async (email, password, role = 'user') => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Login failed');
      }

      const data = await response.json();
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('queueless_user', JSON.stringify(data.user));
      localStorage.setItem('queueless_token', data.token);
      return data.user;
    } catch (err) {
      throw err;
    }
  };

  const register = async (name, email, password, role = 'user') => {
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Registration failed');
      }

      const data = await response.json();
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('queueless_user', JSON.stringify(data.user));
      localStorage.setItem('queueless_token', data.token);
      return data.user;
    } catch (err) {
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('queueless_user');
    localStorage.removeItem('queueless_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
