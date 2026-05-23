import axios from 'axios';

// Create an Axios instance configured to point to our Express backend.
// Centralizing this makes it easy to add Auth headers later if needed.
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', // Uses env var in prod, fallback in dev
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
