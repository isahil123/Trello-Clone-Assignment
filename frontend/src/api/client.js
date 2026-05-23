import axios from "axios";

// Create an Axios instance configured to point to our Express backend.
// Centralizing this makes it easy to add Auth headers later if needed.
const apiClient = axios.create({
  // Use a relative `/api` in development so Vite can proxy requests and avoid CORS.
  baseURL: import.meta.env.VITE_API_URL || "/api", // Uses env var in prod, fallback to proxied /api in dev
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;
