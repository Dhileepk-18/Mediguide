import { create } from 'zustand';
export const useAppStore = create(set => ({
  toasts: [],
  addToast: toast => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    set(state => ({ toasts: [...state.toasts, { ...toast, id }] }));
    const duration = toast.duration || 4000;
    setTimeout(() => {
      set(state => ({ toasts: state.toasts.filter(t => t.id !== id) }));
    }, duration);
  },
  removeToast: id => {
    set(state => ({ toasts: state.toasts.filter(t => t.id !== id) }));
  },
}));
