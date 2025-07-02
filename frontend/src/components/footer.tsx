import { Link } from "react-router-dom"

/**
 * Footer component displays a simple footer with branding and copyright information.
 * 
 * **Functionality**:
 * - Includes a link to the home page (`/`).
 * - Displays the copyright message with the current year dynamically generated.
 * 
 * **Styling**:
 * - The footer has a top border (`border-t`) and vertical padding (`py-6` on small screens, `md:py-8` on medium screens).
 * - On medium screens and larger (`md:flex-row`), the footer items are displayed in a horizontal row with spacing between them.
 * - On smaller screens, the footer content is stacked vertically (`flex-col`).
 * 
 */
export default function Footer() {
  return (
    <footer className="border-t py-6 md:py-8">
      <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex flex-col items-center gap-4 md:flex-row md:gap-6">
          <Link to="/" className="flex items-center space-x-2">
            <span className="font-medium">IntelliMock</span>
          </Link>
          <p className="text-center text-sm text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} IntelliMock. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
