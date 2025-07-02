import type React from "react"
import { forwardRef } from "react"
import { cn } from "../../lib/utils"

/**
 * Textarea component that renders a styled text area with full customization through props.
 * The `Textarea` component provides a rich set of props for customization, ensuring it can fit within any form or layout.
 * 
 * **Props**:
 * - `className`: Optional custom class names to modify the appearance of the textarea.
 * - `...props`: All other standard `TextareaHTMLAttributes` can be passed, such as `value`, `onChange`, `placeholder`, `rows`, and `cols`.
 * 
 * **Styling**:
 * The textarea comes with:
 * - `min-height`: 80px, ensuring the area has some initial vertical space.
 * - Border, padding, and background styling that is customizable via `className`.
 * - Focus, disabled, and placeholder text styling.
 * 
 */
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
