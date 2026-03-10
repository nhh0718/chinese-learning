import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: any) => Promise<void>;
  register: (credentials: any) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/auth`;

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const res = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
          });
          
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Login failed');
          
          set({ 
            user: { id: data._id, name: data.name, email: data.email, role: data.role, createdAt: '' }, 
            token: data.token, 
            isAuthenticated: true, 
             isLoading: false 
          });
        } catch (err: any) {
          set({ error: err.message, isLoading: false });
        }
      },

      register: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const res = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
          });
          
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Registration failed');
          
          set({ 
            user: { id: data._id, name: data.name, email: data.email, role: data.role, createdAt: '' }, 
            token: data.token, 
             isAuthenticated: true, 
             isLoading: false 
          });
        } catch (err: any) {
          set({ error: err.message, isLoading: false });
        }
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },

      clearError: () => {
        set({ error: null });
      }
    }),
    {
      name: 'auth-storage', // name of item in the storage (must be unique)
      partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
