import {axiosInstance} from "../lib/axios";
// import Toast from "react-native-toast-message";
import { create } from 'zustand';
import Toast from "react-native-toast-message";
import axios from "axios";

const baseURL = "http://localhost:9000/";

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
  isModifyingUser: false, // New state for modifying user

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

  signup: async (signupData) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post(`${baseURL}signupUser`, signupData);
      set({ authUser: res.data });
    } catch (error) {
      console.error("Signup error:", error);
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
  set({ isLoggingIn: true });
  try {
    const res = await axiosInstance.post(`${baseURL}loginUser`, data);
    if (res.data.success) {
      set({ authUser: res.data.data });  // <-- only the nested `data` object
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
  
  uploadBulkUsers: async (formData) => {
    try {
      const response = await axiosInstance.post(`${baseURL}bulkUserUpload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      return response.data;
    } catch (error) {
      console.error('Bulk upload error:', error);
      return { success: false, message: error.response?.data?.message || 'Upload failed' };
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

  addUser: async (data) => {
    try {
      const response = await axiosInstance.post(`${baseURL}postUser`, data);
      console.log(response.data);
      return { success: true };
    } catch (error) {
      console.error("AddUser error:", error);
      return { success: false };
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
  fetchUserByEmail: async (email) => {
    try {
      const res = await axiosInstance.get(`${baseURL}users/${email}`);
      return res.data;
    } catch (error) {
      console.error("FetchUserByEmail error:", error);
      Toast.show({
        type: 'error',
        text1: 'Error fetching user',
        text2: error?.response?.data?.message || "Something went wrong",
      });
      return null;
    }
  },

  modifyUser: async (email, updatedUserData) => {
  set({ isModifyingUser: true });
  try {
    const res = await axiosInstance.patch(
      `/users/${encodeURIComponent(email)}`,
      updatedUserData
    );
    set({ authUser: res.data.data }); // assuming response contains updated user in res.data.data
    return { success: true };
  } catch (error) {
    console.error("ModifyUser error:", error);
    return { success: false };
  } finally {
    set({ isModifyingUser: false });
  }
},
  

  deleteUser: async (email) => {
    try {
      // Assuming your delete API endpoint expects the email in the URL
      const res = await axiosInstance.delete(`/users/${encodeURIComponent(email)}`);
      return { success: true, message: res.data.message }; // Assuming your response includes a message
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error; // This can be caught in the component
    }
  },  


}));
