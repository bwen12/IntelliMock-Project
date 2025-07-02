import api from "../lib/api";
import { refreshToken } from "../services/authService";


/**
 * Attaches interceptors to the API instance to handle automatic token refreshing.
 * 
 * This function adds an interceptor to the API client that listens for 401 Unauthorized errors
 * and automatically attempts to refresh the user's authentication token if it has expired. If the 
 * token refresh fails, the user is logged out and redirected to the login page. It also handles 
 * queuing requests while the token is being refreshed to prevent multiple concurrent token refresh 
 * attempts.
 * 
 * @param {Function} setUser - A function to set the user state. Used to log out the user by 
 *                            setting the user to `null` in case of token refresh failure.
 * 
 * @returns {void} - This function does not return anything. It only configures interceptors.
 */
export const attachInterceptors = (setUser: (u: null) => void) => {
 let isRefreshing = false;
 let failedQueue: any[] = [];


 const processQueue = (error: any, token: string | null = null) => {
   failedQueue.forEach((prom) => {
     if (error) {
       prom.reject(error);
     } else {
       prom.resolve(token);
     }
   });
   failedQueue = [];
 };


 api.interceptors.response.use(
   (res) => res,
   async (err) => {
     const originalRequest = err.config;


     if (
       err.response?.status === 401 &&
       !originalRequest._retry &&
       !["/auth/login", "/auth/refresh", "/auth/me"].includes(originalRequest.url)
     ) {
       if (isRefreshing) {
         return new Promise((resolve, reject) => {
           failedQueue.push({ resolve, reject });
         }).then(() => api(originalRequest));
       }


       originalRequest._retry = true;
       isRefreshing = true;


       try {
         await refreshToken();
         processQueue(null);
         return api(originalRequest);
       } catch (refreshError) {
         processQueue(refreshError, null);
         setUser(null);
         window.location.href = "/login";
         return Promise.reject(refreshError);
       } finally {
         isRefreshing = false;
       }
     }


     return Promise.reject(err);
   }
 );
};



