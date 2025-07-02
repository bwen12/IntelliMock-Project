import type React from "react"
import { forwardRef } from "react"
import { cn } from "../../lib/utils"

/**
 * `Input` is a reusable form input component that provides a styled text input with customizable properties.
 * It extends the standard HTML input element by adding a flexible and customizable style system, 
 * built using utility classes and the `cn` function to handle conditional class names.
 * 
 * This component can be used for various types of input, including text, password, email, etc.
 * 
 * Props:
 * - `className` (string, optional): Additional custom CSS classes to apply to the input element.
 * - `type` (string, optional): The type of the input (e.g., "text", "password", "email", etc.). Defaults to "text".
 * - `...props` (InputHTMLAttributes<HTMLInputElement>, optional): Any other valid HTML attributes for an input element (e.g., `id`, `placeholder`, `value`, etc.).
 * 
 */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = "Input"

export { Input }
