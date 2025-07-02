"use client"

import { Link } from "react-router-dom"
import type { UserResponse } from "../../types/UserResponse"
import NavLinks from "./NavLinks"

/**
 * MobileMenu component
 * 
 * This component renders a mobile navigation menu that appears when the `isOpen` prop is true.
 * It includes navigation links, a login button if the user is not authenticated, and a logout button if the user is authenticated.
 * The menu is styled to be displayed on mobile screens only.
 */
interface MobileMenuProps {
  isOpen: boolean
  user: UserResponse | null
  onClose: () => void
}

/**
 * MobileMenu component is a navigation menu designed for mobile screen sizes.
 * It includes navigation links, login/logout functionality, and a dark overlay background.
 * The component is only visible when the `isOpen` prop is `true`.
 * 
 * Props:
 * - `isOpen` (boolean): Controls the visibility of the mobile menu. If `false`, the menu is hidden.
 * - `user` (UserResponse | null): The current authenticated user. If not authenticated, a login option is shown.
 * - `onClose` (function): Callback function to close the menu. Typically triggered when a menu item is clicked.
 * - `onLogout` (function): Callback function to log the user out. Typically called when the logout button is clicked.
 * 
 * Behavior:
 * - Displays navigation links using the `NavLinks` component.
 * - Shows a login button if there is no authenticated user.
 * - Shows a logout button if a user is authenticated, which calls the `onLogout` function and then closes the menu.
 * 
 * The menu is styled to be displayed on mobile screens (using `md:hidden` to hide on larger screens).
 */
export default function MobileMenu({ isOpen, user, onClose }: MobileMenuProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 top-16 z-50 md:hidden">
      <div className="absolute inset-0 bg-[#0B0E1A] opacity-100"></div>
      <div className="relative h-full flex flex-col">
        <div className="container grid gap-6 py-6 bg-[#0B0E1A]">
          <NavLinks user={user} className="grid gap-6" onClick={onClose} />

          {!user && (
            <Link to="/login" className="text-lg font-medium text-white" onClick={onClose}>
              Login
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
