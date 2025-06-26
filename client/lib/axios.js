import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: "http://192.168.1.6:9000/",
    withCredentials: true,
});

export {axiosInstance};