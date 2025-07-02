"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { Menu } from "lucide-react"
import Logo from "../../assets/images/IntelliMock_Logo.png"
import { useAuthContext } from "../../contexts/AuthProvider"
import { logout } from "../../services/authService"
import NavLinks from "./NavLinks"
import AuthMenu from "./AuthMenu"
import MobileMenu from "./MobileMenu"

/**
 * The Navbar component serves as the primary navigation bar for the application.
 * It includes:
 * - A logo linking to the homepage
 * - Navigation links for authenticated users
 * - An authentication menu for login/logout functionality
 * - A mobile-responsive menu with a hamburger icon for smaller screens
 * 
 * Props:
 * - No props are directly passed to this component. The user state is managed through the `AuthContext`.
 * 
 * Behavior:
 * - Displays the application logo, which links to the homepage.
 * - Displays navigation links for authenticated users via the `NavLinks` component.
 * - Displays the `AuthMenu` component, showing either the user’s profile menu or a login button based on authentication status.
 * - For mobile screens, the hamburger menu (Menu icon) toggles the visibility of the mobile menu (`MobileMenu` component).
 * - The mobile menu contains links, login/logout options, and can be closed by clicking outside or selecting a menu option.
 * 
 * State:
 * - `isMenuOpen`: A boolean state to track if the mobile menu is open or closed.
 * 
 * Methods:
 * - `toggleMenu`: Toggles the state of the mobile menu.
 * - `closeMenu`: Closes the mobile menu by setting `isMenuOpen` to `false`.
 * 
 * This component is mobile-responsive and uses `MobileMenu` for mobile-specific navigation.
 */
export default function Navbar() {
  /**
   * useState hook to manage the mobile menu's open/closed state.
   * isMenuOpen: boolean - Indicates whether the mobile menu is currently open.
   * setIsMenuOpen: function - Function to update the isMenuOpen state.
   */
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  /**
   * useAuthContext hook to access the authentication context.
   * user: UserResponse | null - The current authenticated user. If not authenticated, this is null.
   * setUser: function - Function to update the user state in the context.
   */
  const { user, setUser } = useAuthContext()

  /**
   * logout function to handle user logout.
   * This function is imported from the authService module.
   * It is called when the user clicks the logout button in the AuthMenu component.
   */
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  
  /**
   * closeMenu function to close the mobile menu.
   * This function is called when the user clicks outside the menu or selects a menu option.
   */
  const closeMenu = () => setIsMenuOpen(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link to="/" className="flex items-center space-x-2">
            <img src={Logo || "/placeholder.svg"} alt="IntelliMock Logo" className="h-8 w-auto" />
            <span className="font-bold text-xl">IntelliMock</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-2 md:justify-end">
          <NavLinks user={user} className="hidden md:flex items-center space-x-6 text-sm font-medium" />

          {/* User profile or login button */}
          <div className="ml-auto flex gap-2">
            <AuthMenu user={user} setUser={setUser} logout={logout} />
          </div>

          <button
            className="md:hidden inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10"
            onClick={toggleMenu}
            aria-expanded={isMenuOpen}
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <MobileMenu
        isOpen={isMenuOpen}
        user={user}
        onClose={closeMenu}
      />
    </header>
  )
}
