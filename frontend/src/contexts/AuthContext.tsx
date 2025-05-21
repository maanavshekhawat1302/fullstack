import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack';

interface User {
  id: string;
  username: string;
  email: string;
  phone: string;
  dateOfBirth: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, phone: string, dateOfBirth: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
  loginWithOtp: (phone: string, otp: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!token);
  const [loading, setLoading] = useState<boolean>(true);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check auth state on mount and after Google OAuth
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get('/api/auth/me', { withCredentials: true });
        setUser(res.data.user);
        setIsAuthenticated(true);
        // Show success toast only if user was not previously authenticated (i.e., just logged in)
        if (!isAuthenticated) {
          enqueueSnackbar('Successfully logged in!', { variant: 'success' });
        }
      } catch (err) {
        setUser(null);
        setIsAuthenticated(false);
        // Show error toast only if there was a previous authentication
        if (isAuthenticated) {
          enqueueSnackbar('Authentication failed. Please try again.', { variant: 'error' });
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [enqueueSnackbar, isAuthenticated]);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post('/api/auth/login', {
        email,
        password,
      }, { withCredentials: true });
      const { user } = response.data;
      setUser(user);
      setIsAuthenticated(true);
    } catch (error) {
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string, phone: string, dateOfBirth: string) => {
    try {
      const response = await axios.post('/api/auth/signup', {
        username,
        email,
        password,
        phone,
        dateOfBirth,
      }, { withCredentials: true });
      const { user } = response.data;
      setUser(user);
      setIsAuthenticated(true);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Clear backend session if needed
      await axios.post('/api/auth/logout', {}, { withCredentials: true });
    } catch (error) {
      // Optionally handle error
    } finally {
      // Clear frontend state
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      // Clear any stored tokens
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      enqueueSnackbar('Successfully logged out!', { variant: 'info' });
    }
  };

  const loginWithOtp = async (phone: string, otp: string) => {
    try {
      const response = await axios.post('/api/auth/verify-otp', { phone, otp }, { withCredentials: true });
      const { user } = response.data;
      setUser(user);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(user));
      // Do NOT store token in localStorage; token is managed via HTTP-only cookies
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isAuthenticated, loading, loginWithOtp }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 