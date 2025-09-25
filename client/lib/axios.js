import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: "https://nonwoven-adan-drivingly.ngrok-free.dev",
    withCredentials: true,
});

export {axiosInstance};

// import axios from "axios";
// import Constants from "expo-constants";

// // Dynamically set baseURL depending on platform
// const getBaseURL = () => {
//   if (Constants.platform?.web) {
//     return "http://localhost:9000"; // web
//   } else {
//     return "http://192.168.1.3:9000"; // mobile / APK
//   }
// };

// const axiosInstance = axios.create({
//   baseURL: getBaseURL(),
//   withCredentials: true, // allows cookies/auth headers
// });

// export { axiosInstance };
