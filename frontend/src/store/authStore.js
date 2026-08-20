import { create } from 'zustand';
import { api } from '../services/api.js';
export const useAuthStore = create((set) => ({
    user: null,
    token: localStorage.getItem('mediguide_token'),
    isLoading: true,
    error: null,
    isAuthenticated: false,
    initialize: async () => {
        const token = localStorage.getItem('mediguide_token');
        if (!token) {
            set({ isLoading: false, isAuthenticated: false, user: null });
            return;
        }
        try {
            set({ isLoading: true, error: null });
            const res = await api.getMe();
            if (res.success && res.user) {
                set({ user: res.user, isAuthenticated: true, isLoading: false });
            }
            else {
                localStorage.removeItem('mediguide_token');
                set({ user: null, token: null, isAuthenticated: false, isLoading: false });
            }
        }
        catch {
            localStorage.removeItem('mediguide_token');
            set({ user: null, token: null, isAuthenticated: false, isLoading: false });
        }
    },
    login: async (email, password) => {
        try {
            set({ isLoading: true, error: null });
            const res = await api.login(email, password);
            if (res.success && res.token) {
                localStorage.setItem('mediguide_token', res.token);
                set({ user: res.user, token: res.token, isAuthenticated: true, isLoading: false });
                return true;
            }
            return false;
        }
        catch (err) {
            set({ error: err.message || 'Login failed', isLoading: false });
            return false;
        }
    },
    demoLogin: async (role) => {
        try {
            set({ isLoading: true, error: null });
            const res = await api.demoLogin(role);
            if (res.success && res.token) {
                localStorage.setItem('mediguide_token', res.token);
                set({ user: res.user, token: res.token, isAuthenticated: true, isLoading: false });
                return true;
            }
            return false;
        }
        catch (err) {
            set({ error: err.message || 'Demo login failed', isLoading: false });
            return false;
        }
    },
    register: async (userData) => {
        try {
            set({ isLoading: true, error: null });
            const res = await api.register(userData);
            if (res.success && res.token) {
                localStorage.setItem('mediguide_token', res.token);
                set({ user: res.user, token: res.token, isAuthenticated: true, isLoading: false });
                return true;
            }
            return false;
        }
        catch (err) {
            set({ error: err.message || 'Registration failed', isLoading: false });
            return false;
        }
    },
    logout: () => {
        localStorage.removeItem('mediguide_token');
        set({ user: null, token: null, isAuthenticated: false, error: null });
    },
    updateUser: async (updates) => {
        try {
            const res = await api.updateProfile(updates);
            if (res.success && res.user) {
                set({ user: res.user });
                return true;
            }
            return false;
        }
        catch {
            return false;
        }
    },
}));
