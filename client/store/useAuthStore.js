import {axiosInstance} from "../lib/axios";
// import Toast from "react-native-toast-message";
import { create } from 'zustand';

const baseURL = "http://localhost:9000/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isAddingUser: false,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
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
      // Toast.show({
      //   type:'success',
      //   text1:'Yay!',
      //   text2:'You are Signed in'
      // });
    } catch (error) {
      console.error("Signup error:", error);
      // Toast.show({
      //   type:'success',
      //   text1:'Yay!',
      //   text2:'You are Signed in'
      // });
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post(`${baseURL}loginUser`, data);
      set({ authUser: res.data });
      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false };
    } finally {
      set({ isLoggingIn: false });
    }
  },

  uploadBulkUsers: async (formData) => {
    try {
      const response = await axios.post(`${baseURL}users/bulk`, formData, {
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

  addUser: async (userData) => {
    try {
      const response = await axiosInstance.post(`${baseURL}users`, userData);
      toast.success("User added successfully");
      console.log(response.data);
      return { success: true };
    } catch (error) {
      console.error("AddUser error:", error);
      toast.error(error?.response?.data?.message || "Failed to add user");
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

  modifyUser: async (userId, updatedUserData) => {
    set({ isModifyingUser: true }); // Start modifying user
    try {
      const res = await axiosInstance.put(`${baseURL}users/${userId}`, updatedUserData);
      set({ authUser: res.data }); // Update the authUser with modified data
      toast.success("User updated successfully");
      return { success: true };
    } catch (error) {
      console.error("ModifyUser error:", error);
      toast.error(error?.response?.data?.message || "Failed to modify user");
      return { success: false };
    } finally {
      set({ isModifyingUser: false }); // End modifying user
    }
  },

  deleteUser: async (_id) => {
    set({ isDeletingUser: true });
    try {
      const res = await axiosInstance.delete(`${baseURL}users/${_id}`);
      set({ authUser: null });
      toast.success('User deleted successfully');
      return { success: true };
    } catch (error) {
      console.error('Error in deleteUser:', error);
      toast.error(error?.response?.data?.message || 'User deletion failed');
      return { success: false };
    } finally {
      set({ isDeletingUser: false });
    }
  },
}));
