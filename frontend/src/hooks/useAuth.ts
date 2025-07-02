import { useState, useEffect } from "react";
import * as authService from "../services/authService";
import { UserResponse } from "../types/UserResponse";


/**
 * Custom hook to manage authentication and user state.
 * 
 * This hook handles fetching the current user from the authentication service, retries 
 * fetching the user data if the initial attempt fails (through token refresh), and 
 * tracks the loading state while performing these operations.
 * 
 * @hook useAuth
 * 
 * @returns {Object} - An object containing the following properties and methods:
 *   - {UserResponse | null} user - The currently authenticated user object or null if not authenticated.
 *   - {Function} setUser - A function to manually set the user state.
 *   - {boolean} loading - A boolean indicating if the authentication process is still loading.
 */
export function useAuth() {
 const [user, setUser] = useState<UserResponse | null>(null);
 const [loading, setLoading] = useState<boolean>(true);
 const [hasRetried, setHasRetried] = useState(false);


 useEffect(() => {
   const fetchUser = async () => {
     try {
       const data = await authService.getCurrentUser();
       setUser(data);
     } catch {
       if (!hasRetried) {
         setHasRetried(true);
         try {
           await authService.refreshToken();
           const data = await authService.getCurrentUser();
           setUser(data);
         } catch {
           setUser(null);
         }
       } else {
         setUser(null);
       }
     } finally {
       setLoading(false);
     }
   };


   fetchUser();
 }, [hasRetried]);


 return { user, setUser, loading };
}

