import axios from "axios";
import { Platform } from "react-native";

const isWeb = Platform.OS === "web";

const axiosInstance = axios.create({
  baseURL: isWeb 
    ? "http://localhost:9000"        // for web
    : "http://192.168.1.13:9000",    // for mobile (Expo Go)
  withCredentials: true,
});

export { axiosInstance };

