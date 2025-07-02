import axios from "axios";


/**
 * Axios instance for making HTTP requests.
 * 
 * This module exports a pre-configured Axios instance that can be used to send HTTP requests 
 * to the backend API. It is set up with the base URL, credentials, and default headers for 
 * the application. The base URL is fetched from the environment variable `VITE_API_BASE_URL`, 
 * or defaults to `http://localhost:8080` if not set. The instance is configured to send 
 * requests with credentials (e.g., cookies) and specifies that requests and responses should 
 * be in JSON format.
 * 
 * 
 * @module api
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  }
});

export default api;
