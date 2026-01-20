import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: number;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  avatar?: string | null;
  isActive: boolean;
  emailVerified: boolean;
  role: string;
}

interface AuthContextType {
  user: User | null;
  roles: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: 'ADMIN' | 'STAFF' | 'CUSTOMER';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = '/api';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Get tokens from localStorage
  const getAccessToken = () => localStorage.getItem('accessToken');
  const getRefreshToken = () => localStorage.getItem('refreshToken');
  const setTokens = (accessToken: string, refreshToken: string) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  };
  const clearTokens = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  // Fetch current user
  const fetchUser = async () => {
    const token = getAccessToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setRoles(data.roles || []);
      } else if (response.status === 401) {
        // Try to refresh token
        await refreshToken();
      } else {
        clearTokens();
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      clearTokens();
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh access token
  const refreshToken = async () => {
    const refresh = getRefreshToken();
    if (!refresh) {
      clearTokens();
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: refresh }),
      });

      if (response.ok) {
        const data = await response.json();
        setTokens(data.accessToken, data.refreshToken);
        await fetchUser();
      } else {
        clearTokens();
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Failed to refresh token:', error);
      clearTokens();
      setIsLoading(false);
    }
  };

  // Login
  const login = async (email: string, password: string): Promise<User> => {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    setTokens(data.accessToken, data.refreshToken);
    setUser(data.user);
    setRoles(data.roles || []);
    return data.user;
  };

  // Register
  const register = async (data: RegisterData) => {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }

    const result = await response.json();
    setTokens(result.accessToken, result.refreshToken);
    setUser(result.user);
    setRoles([data.role || 'CUSTOMER']);
  };

  // Logout
  const logout = async () => {
    const refresh = getRefreshToken();
    if (refresh) {
      try {
        await fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: refresh }),
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }

    clearTokens();
    setUser(null);
    setRoles([]);
    navigate('/login');
  };

  // Refresh auth state
  const refreshAuth = async () => {
    await fetchUser();
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const value: AuthContextType = {
    user,
    roles,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Helper to check if user has specific role
export function useHasRole(role: string) {
  const { roles } = useAuth();
  return roles.includes(role);
}

// Helper to check if user has any of the roles
export function useHasAnyRole(...rolesToCheck: string[]) {
  const { roles } = useAuth();
  return rolesToCheck.some((role) => roles.includes(role));
}
