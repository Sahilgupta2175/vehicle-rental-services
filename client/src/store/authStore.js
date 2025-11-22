import { create } from "zustand";
import { authApi } from "../api/auth";

const useAuthStore = create((set, get) => ({
    user: null,
    loading: false,
    isAuthenticated: false,

    init: async () => {
        const token = localStorage.getItem("vr_token");

        if (!token) {
            return;
        }
        
        try {
            set({ loading: true });
            const { data } = await authApi.me();
            set({ user: data.user, isAuthenticated: true, loading: false });
        } catch (err) {
            console.error("Init auth failed", err);
            localStorage.removeItem("vr_token");
            set({ user: null, isAuthenticated: false, loading: false });
        }
    },

    login: async (credentials) => {
        set({ loading: true });

        try {
            const { data } = await authApi.login(credentials);
            localStorage.setItem("vr_token", data.token);
            set({ user: data.user, isAuthenticated: true, loading: false });
            return { success: true };
        } catch (err) {
            set({ loading: false });
            const msg = err.response?.data?.error || "Login failed";
            return { success: false, message: msg };
        }
    },

    register: async (payload) => {
        set({ loading: true });
        
        try {
            const { data } = await authApi.register(payload);
            localStorage.setItem("vr_token", data.token);
            set({ user: data.user, isAuthenticated: true, loading: false });
            return { success: true };
        } catch (err) {
            set({ loading: false });
            const msg = err.response?.data?.error || "Registration failed";
            return { success: false, message: msg };
        }
    },

    logout: () => {
        localStorage.removeItem("vr_token");
        set({ user: null, isAuthenticated: false });
    },
}));

export default useAuthStore;