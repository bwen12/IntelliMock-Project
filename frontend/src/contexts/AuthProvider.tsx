import { createContext, useContext, ReactNode, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { UserResponse } from "../types/UserResponse";
import { registerUserSetter } from "../stores/globalUserStore";

/**
 * Context that provides authentication-related data and functions to the rest of the application.
 * Stores the current user, loading state, and the function to set the user.
 * 
 * @context AuthContext - A React Context that holds authentication data and provides access to it.
 * 
 * @typedef {Object} AuthContextType - The shape of the AuthContext value.
 * @property {UserResponse | null} user - The current authenticated user or null if not authenticated.
 * @property {(user: UserResponse | null) => void} setUser - Function to set the user in the context.
 * @property {boolean} loading - Indicates whether authentication status is still being loaded.
 */
interface AuthContextType {
  user: UserResponse | null;
  setUser: (user: UserResponse | null) => void;
  loading: boolean;
}

/**
 * Custom hook to access the authentication context.
 * Throws an error if used outside of an `AuthProvider`.
 * 
 * @returns {AuthContextType} The current authentication context value (user, setUser, loading).
 * @throws {Error} If used outside of an `AuthProvider`.
 */
const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Custom hook to access the authentication context.
 * 
 * @returns {AuthContextType} The current authentication context value (user, setUser, loading).
 * @throws {Error} If used outside of an `AuthProvider`.
 */
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};

/**
 * AuthProvider component that wraps the application and provides authentication context.
 * It uses the `useAuth` hook to manage authentication state and provides it to the rest of the app.
 * 
 * @param {ReactNode} children - The child components to be rendered within the provider.
 * @returns {JSX.Element} The AuthContext provider with the authentication state and functions.
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { user, setUser, loading } = useAuth();

  useEffect(() => {
    registerUserSetter(setUser);
  }, [setUser]);

  if (loading) return <div>Loading...</div>;

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
