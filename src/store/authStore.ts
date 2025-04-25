// src/store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  role: string | null;
  setAuth: (data: { isAuthenticated: boolean; user: User | null; role: string | null }) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      role: null,
      setAuth: (data) => set(data),
      clearAuth: () => set({ isAuthenticated: false, user: null, role: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);