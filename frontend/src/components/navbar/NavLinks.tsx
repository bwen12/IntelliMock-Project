"use client"

import { Link, useLocation } from "react-router-dom"
import type { UserResponse } from "../../types/UserResponse"

/**
 * NavLinks component
 */
interface Route {
  href: string
  label: string
  protected: boolean
}

/**
 * NavLinks component is responsible for rendering navigation links in the application.
 * It conditionally displays links based on the user's authentication status.
 */
interface NavLinksProps {
  user: UserResponse | null
  className?: string
  onClick?: () => void
}

/**
 * The NavLinks component renders navigation links for the application.
 * The links displayed depend on the user's authentication status.
 * It includes routes that are publicly accessible and others that are only available to authenticated users.
 * 
 * Props:
 * - `user` (UserResponse | null): The current authenticated user. If the user is not authenticated, certain routes will be hidden.
 * - `className` (string, optional): Additional CSS class names to style the navigation links container.
 * - `onClick` (function, optional): A callback function to be called when any link is clicked, useful for closing mobile menus or other UI updates.
 * 
 * Behavior:
 * - The component checks the current user's authentication status and filters the navigation routes accordingly.
 * - Links that are protected (i.e., require authentication) will only be shown if a user is logged in.
 * - The component uses React Router's `Link` to handle navigation, and highlights the active route using the `location.pathname` property.
 * 
 * Routes:
 * - Public routes: "/Home"
 * - Protected routes (only available to authenticated users): "/mock-interview", "/summary"
 * 
 */
export default function NavLinks({ user, className = "", onClick }: NavLinksProps) {
  /**
   * useLocation hook to access the current location object.
   * This is used to determine the active route for styling purposes.
   */
  const location = useLocation()

  /**
   * Routes array
   * Each route object contains:
   * - `href`: The path of the route.
   * - `label`: The display name of the route.
   * - `protected`: A boolean indicating if the route requires authentication.
   */
  const routes: Route[] = [
    { href: "/", label: "Home", protected: false },
    { href: "/mock-interview", label: "Mock Interview", protected: true },
    { href: "/summary", label: "Summary", protected: true },
  ]

  // filter routes based on authentication status
  const filteredRoutes = routes.filter((route) => !route.protected || (route.protected && user))

  return (
    <nav className={className}>
      {filteredRoutes.map((route) => (
        <Link
          key={route.href}
          to={route.href}
          className={`transition-colors hover:text-foreground/80 ${
            location.pathname === route.href ? "text-foreground" : "text-foreground/60"
          }`}
          onClick={onClick}
        >
          {route.label}
        </Link>
      ))}
    </nav>
  )
}
