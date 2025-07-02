import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginWithGoogle, getCurrentUser } from "../services/authService";
import { useAuthContext } from "../contexts/AuthProvider";
import { useNotification } from "../hooks/useNotification";

declare global {
  interface Window {
    google: any;
  }
}

/**
 * Custom hook to handle Google login integration.
 * 
 * This hook initializes the Google Sign-In button and handles the login process. Upon successful 
 * login, the user's information is fetched using the Google credential and stored in the authentication 
 * context. If the login fails or there's an issue with the Google client ID, appropriate error messages 
 * are displayed to the user.
 * 
 * @hook useGoogleLogin
 * 
 * @returns {void} - This hook does not return any value. It manages side-effects like setting 
 *                   user data in the context and triggering navigation.
 */
export const useGoogleLogin = () => {
  const { setUser } = useAuthContext();
  const navigate = useNavigate();
  const { showError, showSuccess } = useNotification();

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      showError("Missing Google Client ID");
      return;
    }

    const onLoad = () => {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: any) => {
          try {
            await loginWithGoogle(response.credential);
            const freshUser = await getCurrentUser();
            setUser(freshUser);
            showSuccess("Login successful!");
            navigate("/chat");
          } catch (err) {
            showError("Google login failed. Please try again.");
          }
        },
      });

      window.google.accounts.id.renderButton(
        document.getElementById("google-signin-button"),
        {
          theme: "filled_black",
          size: "large",         
          shape: "pill",        
          width: 280            
        }
      );
    };

    if (window.google?.accounts) {
      onLoad();
    } else {
      const checkInterval = setInterval(() => {
        if (window.google?.accounts) {
          clearInterval(checkInterval);
          onLoad();
        }
      }, 100);
    }
  }, [setUser, navigate, showError, showSuccess]);
};
