import { Routes, Route, useLocation } from "react-router-dom"
import Navbar from "./components/navbar/Navbar"
import Footer from "./components/footer"
import HomePage from "./pages/home"
import LoginPage from "./pages/login"
import MockInterviewPage from "./pages/mock-interview"
import InterviewSession from "./pages/interview-session"
import InterviewResults from "./pages/interview-results"
import SummaryPage from "./pages/summary"
import SessionDetailPage from "./pages/session-detail"
import { AuthProvider } from "./contexts/AuthProvider"
import { ProtectedRoute, PublicOnlyRoute } from "./components/ProtectedRoute"

/**
 * Main application component that handles routing and page layout.
 * 
 * This component defines the structure of the app, including the Navbar, Footer, and the routing of different pages. 
 * It uses React Router to manage routes and applies conditional rendering to show or hide the Navbar based on the current path.
 * 
 * The component uses the `AuthProvider` context to manage user authentication state and the `ProtectedRoute` and 
 * `PublicOnlyRoute` components to ensure proper access control.
 */

function App() {
  const location = useLocation()
  const hideNavbar = location.pathname.startsWith("/interview-session");

  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen">
        {!hideNavbar && <Navbar />}
        <main className={`flex-1 ${hideNavbar ? "pt-0" : ""}`}>
          <Routes>
            <Route path="/" element={<HomePage />} />

            {/* Public routes - only accessible when not logged in */}
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <LoginPage />
                </PublicOnlyRoute>
              }
            />

            {/* Protected Routes - require authentication */}
            <Route element={<ProtectedRoute />}>
              <Route path="/mock-interview" element={<MockInterviewPage />} />
              <Route path="/interview-session/:chatId" element={<InterviewSession />} />
              <Route path="/interview-results" element={<InterviewResults />} />
              <Route path="/summary" element={<SummaryPage />} />
              <Route path="/summary/:sessionId" element={<SessionDetailPage />} />
            </Route>
          </Routes>
        </main>
        {!hideNavbar && <Footer />}
      </div>
    </AuthProvider>
  )
}

export default App
