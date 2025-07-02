import { useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import Logo from "../assets/images/IntelliMock_Logo.png"
import { useGoogleLogin } from "../hooks/useGoogleLogin"
import { useAuthContext } from "../contexts/AuthProvider"

/**
 * LoginPage component renders a login page that allows users to sign in with their Google account.
 * If the user is already logged in, they are automatically redirected to their previous page or home.
 */
export default function LoginPage() {
  // Check if the user is already logged in
  const { user } = useAuthContext()
  const navigate = useNavigate()
  // Get the location object to determine where to redirect after login
  const location = useLocation()

  const from = location.state?.from?.pathname || "/"

  useGoogleLogin()
  
  // If the user is already logged in, redirect them to the previous page or home
  useEffect(() => {
    if (user) {
      navigate(from, { replace: true })
    }
  }, [user, navigate, from])

  if (user) return null

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-14rem)] py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex flex-col items-center space-y-2">
            <img src={Logo || "/placeholder.svg"} alt="IntelliMock Logo" className="h-12 w-auto" />
            <CardTitle className="text-2xl font-bold">Welcome to IntelliMock</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div id="google-signin-button" data-testid="google-signin-button" className="w-full flex justify-center" />
        </CardContent>
        <CardFooter>
          <p className="text-center text-sm text-muted-foreground w-full">
            You will be redirected to sign in via Google.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
