// src/lib/api-client.ts
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config) => {
    // Check if we're in the browser
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      console.log(`ApiClient - Request to ${config.url}`, token ? "Token found" : "NO TOKEN");
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.warn(`No token found for request to ${config.url}`);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);


export default apiClient;
