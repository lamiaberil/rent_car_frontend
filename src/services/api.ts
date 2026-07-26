import axios from 'axios';

// Create an Axios instance for future backend integration.
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor logic can be added here
api.interceptors.request.use((config) => {
  // e.g., Add Authorization headers
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle global errors here
    return Promise.reject(error);
  }
);

export const extractData = (response: any) => {
  if (response.data?.success !== undefined) {
    return response.data.data;
  }

  return response.data;
};