"use client"

import type React from "react"

import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuthContext } from "../contexts/AuthProvider"

/**
 * A higher-order component that protects routes from being accessed by unauthenticated users.
 * If the user is not authenticated, they are redirected to the login page. 
 * If the user is authenticated, the children components (route contents) are rendered.
 * 
 * @returns {React.Element} A loading message while authentication state is being resolved, 
 *                         a redirect to the login page if the user is not authenticated, 
 *                         or the child routes if the user is authenticated.
 */
export const ProtectedRoute = () => {
  const { user, loading } = useAuthContext()
  const location = useLocation()

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!user) {
    // redirect to login page with the return url
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}

/**
 * A higher-order component that protects routes from being accessed by authenticated users.
 * If the user is authenticated, they are redirected to the home page. 
 * If the user is not authenticated, the children components (route contents) are rendered.
 * 
 * @returns {React.Element} A loading message while authentication state is being resolved, 
 *                         a redirect to the home page if the user is authenticated, 
 *                         or the child routes if the user is not authenticated.
 */
export const PublicOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuthContext()
  const location = useLocation()
  const from = location.state?.from?.pathname || "/"

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (user) {
    return <Navigate to={from} replace />
  }

  return <>{children}</>
}
