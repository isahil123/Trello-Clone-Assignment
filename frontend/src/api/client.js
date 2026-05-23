import axios from 'axios';

// Create an Axios instance configured to point to our Express backend.
// Centralizing this makes it easy to add Auth headers later if needed.
const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api', // Matches the backend port
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
