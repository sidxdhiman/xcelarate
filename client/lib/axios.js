import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: "http://192.168.1.6:9000/",
    withCredentials: true,
});

// const axiosInstance = axios.create({
//     baseURL: "https://bc94-2401-4900-1c31-3c25-53ee-62e7-4cea-17ab.ngrok-free.app",
//     withCredentials: true,
// });

export {axiosInstance};