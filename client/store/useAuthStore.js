import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { create } from 'zustand';

const baseURL = "http://localhost:9000/";

export const useAuthStore = create((set, get) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,

    checkAuth: async () => {
        try {
          const res = await axiosInstance.get(`${baseURL}api/auth/check`);
          set({ authUser: res.data });
          get().connectSocket();
        } catch (error) {
          console.log("Error in checkAuth:", error);
          set({ authUser: null });
          toast.error("Session expired or user not authenticated");
        } finally {
          set({ isCheckingAuth: false });
        }
    },

    signup: async (data) => {
        set({ isSigningUp: true });
        try {
          const res = await axiosInstance.post(`${baseURL}signup`, data);
          set({ authUser: res.data });
          toast.success("Account created successfully");
        } catch (error) {
          console.error("Signup error:", error);
          toast.error(error?.response?.data?.message || "Signup failed");
        } finally {
          set({ isSigningUp: false });
        }
    },

    login: async (data) => {
        set({ isLoggingIn: true });
        try {
          const res = await axiosInstance.post(`${baseURL}login`, data);
          set({ authUser: res.data });
          toast.success("Logged in successfully");
          return { success: true };
        } catch (error) {
          console.error("Login error:", error);
          toast.error(error?.response?.data?.message || "Login failed");
          return { success: false };
        } finally {
          set({ isLoggingIn: false });
        }
    },

    logout: async () => {
        try {
          await axiosInstance.post(`${baseURL}api/auth/logout`);
          set({ authUser: null });
          toast.success("Logged out successfully");
          get().disconnectSocket();
        } catch (error) {
          console.error("Logout error:", error);
          toast.error(error?.response?.data?.message || "Logout failed");
        }
    },

    updateProfile: async (data) => {
        set({ isUpdatingProfile: true });
        try {
          const res = await axiosInstance.put(`${baseURL}api/auth/update-profile`, data);
          set({ authUser: res.data });
          toast.success("Profile updated successfully");
        } catch (error) {
          console.error("Error in updateProfile:", error);
          toast.error(error?.response?.data?.message || "Profile update failed");
        } finally {
          set({ isUpdatingProfile: false });
        }
    },
}));
