import { create } from "zustand";

interface User {
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  login: async (email: string, password: string) => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    set({
      user: { name: email.split("@")[0], email },
      isAuthenticated: true,
      isLoading: false,
    });
    return true;
  },
  signup: async (name: string, email: string, password: string) => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    set({
      user: { name, email },
      isAuthenticated: true,
      isLoading: false,
    });
    return true;
  },
  logout: () => {
    set({ user: null, isAuthenticated: false });
  },
}));
