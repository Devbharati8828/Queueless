import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for existing session
    const savedUser = localStorage.getItem('queueless_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (email, password, role = 'user') => {
    // Mock authentication
    const mockUser = {
      id: role === 'provider' ? 'prov-001' : 'user-001',
      name: role === 'provider' ? 'Dr. Rajesh Sharma' : 'Rahul Kumar',
      email,
      role,
      avatar: null,
      createdAt: new Date().toISOString(),
    };
    setUser(mockUser);
    localStorage.setItem('queueless_user', JSON.stringify(mockUser));
    return mockUser;
  };

  const register = (name, email, password, role = 'user') => {
    const mockUser = {
      id: `${role}-${Date.now()}`,
      name,
      email,
      role,
      avatar: null,
      createdAt: new Date().toISOString(),
    };
    setUser(mockUser);
    localStorage.setItem('queueless_user', JSON.stringify(mockUser));
    return mockUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('queueless_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
