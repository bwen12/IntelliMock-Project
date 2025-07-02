"use client"

import { useState, useRef, useEffect } from "react"
import { Link } from "react-router-dom"
import { LogOut } from "lucide-react"
import type { UserResponse } from "../../types/UserResponse"
import { useNotification } from "../../hooks/useNotification"

/**
 * AuthMenuProps defines the properties for the AuthMenu component.
 */
interface AuthMenuProps {
  user: UserResponse | null
  setUser: (user: UserResponse | null) => void
  logout: () => Promise<{ message: string }>
}

/**
 * AuthMenu component renders a user authentication menu with login, logout, and profile features.
 * 
 * If a user is logged in, it displays their profile picture, name, and email with an option to log out.
 * If no user is logged in, it displays a button to sign in.
 * 
 * @param {Object} props - The component properties.
 * @param {UserResponse | null} props.user - The current logged-in user data (null if not logged in).
 * @param {(user: UserResponse | null) => void} props.setUser - Function to update the user state.
 * @param {() => Promise<{ message: string }>} props.logout - Function to handle the logout process.
 * 
 * @returns {JSX.Element} The rendered authentication menu component.
 */
export default function AuthMenu({ user, setUser, logout }: AuthMenuProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { showSuccess, showError } = useNotification()

  // default profile picture if user doesn't have one
  const defaultProfilePic = user
    ? `https://api.dicebear.com/7.x/initials/svg?seed=${user.firstName}+${user.lastName}`
    : "https://api.dicebear.com/7.x/initials/svg?seed=User"

  /**
   * Sets up an event listener to detect clicks outside the dropdown menu and close it when clicked outside.
   */
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  /**
   * Handles the logout process by calling the logout function, updating the user state to null,
   * and displaying a success notification.
   */
  const handleLogout = async () => {
    try {
      await logout()
      setUser(null)
      showSuccess("Logged out successfully")
      setIsDropdownOpen(false)
    } catch (error) {
      showError("Logout failed. Please try again.");
    }
  }

  /**
   * If the user is not logged in, display a sign-in button that redirects to the login page.
   */
  if (!user) {
    return (
      <Link to="/login">
        <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
          Sign in
        </button>
      </Link>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="flex items-center justify-center rounded-full overflow-hidden h-10 w-10 border-2 border-primary/20 hover:border-primary/50 transition-colors"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        aria-label="User menu"
        aria-expanded={isDropdownOpen}
      >
        <img
          src={`${import.meta.env.VITE_API_BASE_URL}/auth/avatar`}
          alt={`${user.firstName} ${user.lastName}`}
          className="h-full w-full object-cover rounded-full"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = defaultProfilePic;
          }}
        />

      </button>

      {/* Dropdown menu */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-card border border-border overflow-hidden z-50">
          <div className="py-2 px-4 border-b border-border">
            <p className="text-sm font-medium">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center px-4 py-2 text-sm hover:bg-accent/50 transition-colors"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </button>
        </div>
      )}
    </div>
  )
}
