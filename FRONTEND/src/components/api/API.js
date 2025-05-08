import axios from "axios";
import { toast } from "react-toastify";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_BASE_URL}`,
  withCredentials: true,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include authentication token
API.interceptors.request.use(async (config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => {
    
    // Return response normally if successful
    return response;
  },
  (error) => {
    // Check if the error response indicates unauthorized access
    const message = error?.response?.data?.message || '';
    const status = error?.response?.status;
    // toast.error(message)
    // if (status === 401 || message.toLowerCase().includes("unauthorized")) {
    //   toast.info("User Logged Out Please login Again")
    //   localStorage.clear(); // Clear localStorage
    //   window.location.reload(); // Reload the current page
    // }

    return Promise.reject(error); // Propagate the error
  }
);

export default API;