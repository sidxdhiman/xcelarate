import axios from "axios";
import { Platform } from "react-native";

const isWeb = Platform.OS === "web";

const axiosInstance = axios.create({
   baseURL: "https://xcelarate-backend.onrender.com/api",
   // baseURL: "http://localhost:4000/api",
  withCredentials: true,
});

export default axiosInstance;
