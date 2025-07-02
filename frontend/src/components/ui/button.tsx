import type React from "react"
import { forwardRef } from "react"
import { cn } from "../../lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

/**
 * The Button component renders a customizable button element that can be styled based on various `variant` and `size` options.
 * It accepts standard button attributes in addition to custom properties like `variant` and `size` for styling purposes.
 * The `Button` component supports multiple visual states, such as default, destructive, outline, and more.
 *
 * Props:
 * - `variant` (string, optional): The style variant of the button. Options include:
 *    - `"default"`: The default button with primary styling.
 *    - `"destructive"`: A button styled for destructive actions (e.g., deletions).
 *    - `"outline"`: A button with a border and transparent background.
 *    - `"secondary"`: A secondary styled button.
 *    - `"ghost"`: A transparent button with hover effects.
 *    - `"link"`: A link-styled button with underlined text.
 * - `size` (string, optional): The size of the button. Options include:
 *    - `"default"`: Standard button size.
 *    - `"sm"`: Smaller button size.
 *    - `"lg"`: Larger button size.
 *    - `"icon"`: A button sized for icon use, typically circular.
 * - `className` (string, optional): Additional custom CSS classes to apply to the button.
 * - `...props` (ButtonHTMLAttributes<HTMLButtonElement>, optional): Any other standard button properties (like `onClick`, `disabled`, etc.).
 *
 * Behavior:
 * - The component uses a `cn` utility function to conditionally apply classes based on `variant`, `size`, and custom `className`.
 * - It supports focus-visible styles for accessibility and disables pointer events/opacity when the button is disabled.
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          variant === "default" && "bg-primary text-primary-foreground hover:bg-primary/90",
          variant === "destructive" && "bg-destructive text-destructive-foreground hover:bg-destructive/90",
          variant === "outline" && "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
          variant === "secondary" && "bg-secondary text-secondary-foreground hover:bg-secondary/80",
          variant === "ghost" && "hover:bg-accent hover:text-accent-foreground",
          variant === "link" && "text-primary underline-offset-4 hover:underline",
          size === "default" && "h-10 px-4 py-2",
          size === "sm" && "h-9 rounded-md px-3",
          size === "lg" && "h-11 rounded-md px-8",
          size === "icon" && "h-10 w-10",
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = "Button"

export { Button }
