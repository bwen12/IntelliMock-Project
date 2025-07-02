import type React from "react"
import { forwardRef } from "react"
import { cn } from "../../lib/utils"

/**
 * `Label` is a reusable form label component that provides a styled label element with customizable properties.
 * It extends the standard HTML `label` element, offering flexible styling and utility classes.
 * 
 * This component can be used to label form inputs, making it accessible and easy to pair with other form elements.
 * It includes default styles for font size, font weight, and disabled state, while allowing customization via the `className` prop.
 * 
 * Props:
 * - `className` (string, optional): Additional custom CSS classes to apply to the label element.
 * - `...props` (LabelHTMLAttributes<HTMLLabelElement>, optional): Any other valid HTML attributes for a `label` element (e.g., `for`, `id`, etc.).
 */
export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

const Label = forwardRef<HTMLLabelElement, LabelProps>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className,
    )}
    {...props}
  />
))
Label.displayName = "Label"

export { Label }
