import { createContext, useContext, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import type { AuthUser } from '../types';

interface AuthContextType {
  user: AuthUser | null;
  login: (userData: AuthUser) => void;
  logout: () => void;
  updateUser: (updated: Partial<AuthUser>) => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

function loadStoredUser(): AuthUser | null {
  try {
    const stored = localStorage.getItem('auth');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(loadStoredUser);
  const navigate = useNavigate();

  function login(userData: AuthUser) {
    localStorage.setItem('auth', JSON.stringify(userData));
    setUser(userData);
  }

  function updateUser(updated: Partial<AuthUser>) {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...updated };
      localStorage.setItem('auth', JSON.stringify(next));
      return next;
    });
  }

  async function logout() {
    const stored = localStorage.getItem('auth');
    if (stored) {
      try {
        const { refreshToken } = JSON.parse(stored);
        if (refreshToken) await authService.logout(refreshToken);
      } catch {
        // ignore logout errors
      }
    }
    localStorage.removeItem('auth');
    setUser(null);
    navigate('/');
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        updateUser,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
