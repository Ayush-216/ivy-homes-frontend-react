
import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchApi } from '../lib/api';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('ivy_user');
    const storedToken = localStorage.getItem('ivy_token');

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    const actualToken = data.access_token || data.token;
    const refreshToken = data.refresh_token;

    if (!actualToken) {
      throw new Error('No access token returned from server');
    }

    localStorage.setItem('ivy_token', actualToken);

    if (refreshToken) {
      localStorage.setItem('ivy_refresh_token', refreshToken);
    }

    localStorage.setItem('ivy_user', JSON.stringify(data.user));

    setUser(data.user);

    navigate('/listings');
  };

  const logout = () => {
    fetchApi('/auth/logout', { method: 'POST' }).catch(console.error);

    localStorage.removeItem('ivy_token');
    localStorage.removeItem('ivy_refresh_token');
    localStorage.removeItem('ivy_user');

    setUser(null);

    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};