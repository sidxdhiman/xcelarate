import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: "http://172.20.10.2:9000/",
    withCredentials: true,
});

export {axiosInstance};