import { create } from "zustand";
import axiosInstance from "../lib/axios";
import Toast from "react-native-toast-message";

export const useAuthStore = create((set, get) => ({
  axiosInstance,
  authUser: null,
  isAddingUser: false,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isDeleting: false,
  isUploading: false,
  isCheckingAuth: true,
  isModifyingUser: false,

  // --- Auth Check ---
  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      get().connectSocket?.();
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
      Toast.show({
        type: "error",
        text1: "Session expired or user not authenticated",
      });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  // --- Signup ---
  signup: async (signupData) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/signupUser", signupData);
      set({ authUser: res.data });
    } catch (error) {
      console.error("Signup error:", error);
      // Toast.show({ type: "error", text1: "Signup failed" });
    } finally {
      set({ isSigningUp: false });
    }
  },

  // --- Login ---
  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/loginUser", data);
      if (res.data.success) {
        set({ authUser: res.data.data });
        return { success: true, ...res.data.data };
      } else {
        return { success: false };
      }
    } catch (error) {
      console.log("Login error:", error);
      return { success: false };
    } finally {
      set({ isLoggingIn: false });
    }
  },

  // --- Logout ---
  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      Toast.show({ type: "success", text1: "Logged out successfully" });
      get().disconnectSocket?.();
    } catch (error) {
      console.error("Logout error:", error);
      Toast.show({
        type: "error",
        text1: error?.response?.data?.message || "Logout failed",
      });
    }
  },

  // --- Add User ---
  addUser: async (data) => {
    try {
      const res = await axiosInstance.post("/postUser", data);
      console.log(res.data);
      return { success: true };
    } catch (error) {
      console.error("AddUser error:", error);
      return { success: false };
    }
  },

  // --- Bulk Upload Users ---
  uploadBulkUsers: async (formData) => {
    try {
      const res = await axiosInstance.post("/bulkUserUpload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    } catch (error) {
      console.error("Bulk upload error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Upload failed",
      };
    }
  },

  // --- Update Profile ---
  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const { email, ...updateData } = data;
      const res = await axiosInstance.patch(
          `/users/${encodeURIComponent(email)}`,
          updateData
      );
      set({ authUser: res.data.data });
      Toast.show({ type: "success", text1: "Profile updated successfully" });
    } catch (error) {
      console.error("Error in updateProfile:", error);
      Toast.show({
        type: "error",
        text1: error?.response?.data?.message || "Profile update failed",
      });
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  // --- Fetch User by Email ---
  fetchUserByEmail: async (email) => {
    try {
      const res = await axiosInstance.get(
          `/users/${encodeURIComponent(email)}`
      );
      return res.data;
    } catch (error) {
      console.error("FetchUserByEmail error:", error);
      Toast.show({
        type: "error",
        text1: "Error fetching user",
        text2: error?.response?.data?.message || "Something went wrong",
      });
      return null;
    }
  },

  // --- Modify User ---
  modifyUser: async (email, updatedUserData) => {
    set({ isModifyingUser: true });
    try {
      const res = await axiosInstance.patch(
          `/users/${encodeURIComponent(email)}`,
          updatedUserData
      );
      set({ authUser: res.data.data });
      return { success: true };
    } catch (error) {
      console.error("ModifyUser error:", error);
      return { success: false };
    } finally {
      set({ isModifyingUser: false });
    }
  },

  // --- Delete User ---
  deleteUser: async (email) => {
    try {
      const res = await axiosInstance.delete(
          `/users/${encodeURIComponent(email)}`
      );
      return { success: true, message: res.data.message };
    } catch (error) {
      console.error("DeleteUser error:", error);
      Toast.show({ type: "error", text1: "Delete user failed" });
      return { success: false };
    }
  },

  // --- Fetch Organisations ---
  fetchOrganisations: async () => {
    try {
      const res = await axiosInstance.get("/organisations/");
      return { success: true, data: res.data };
    } catch (error) {
      console.error("FetchOrganisations error:", error);
      return { success: false, data: [] };
    }
  },

  // --- Add Organisation ---
  addOrganisation: async (orgData) => {
    try {
      const res = await axiosInstance.post("/organisations/", orgData);
      return { success: true, data: res.data };
    } catch (error) {
      console.error("AddOrganisation error:", error);
      return { 
        success: false, 
        message: error.response?.data?.message || error.response?.data || "Failed to add organisation" 
      };
    }
  },
}));