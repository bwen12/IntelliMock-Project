import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "../../lib/utils"

/**
 * `Progress` is a customizable progress bar component built using Radix UI's `Progress` primitives.
 * It visually indicates the completion status of a task or process with a linear progress bar.
 * 
 * This component allows you to pass a `value` prop to dynamically control the progress state, and supports all props available in the `ProgressPrimitive.Root`.
 * You can customize the appearance using the `className` prop, which applies additional styles to the progress bar.
 * 
 * Props:
 * - `className` (string, optional): Additional custom CSS classes to apply to the progress bar container.
 * - `value` (number, optional): The current value of the progress, represented as a percentage (0-100).
 * - `...props` (ProgressPrimitive.RootProps, optional): Any other props from Radix UI's `ProgressRoot` component, such as `aria-*` attributes for accessibility.
 * 
 */
const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn("relative h-2 w-full overflow-hidden rounded-full bg-muted", className)}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-primary transition-all"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
