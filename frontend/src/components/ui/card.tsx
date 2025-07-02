import type React from "react"
import { forwardRef } from "react"
import { cn } from "../../lib/utils"

/**
 * Card component system with individual parts for easy composition. The Card system includes a main container (`Card`),
 * header (`CardHeader`), title (`CardTitle`), description (`CardDescription`), content (`CardContent`), and footer (`CardFooter`).
 * These components can be used independently or together to create a flexible, structured card UI.
 * 
 * The Card component system is designed to be used in a variety of contexts, such as displaying content, information, or actions.
 * The utility function `cn` is used to conditionally apply classes for customization based on props like `className`.
 * 
 * Components:
 * 
 * - `Card`: The main container of the card. This component provides a rounded container with a border, background, and shadow.
 * 
 * - `CardHeader`: The header section of the card, typically used for titles, navigation, or icons.
 * 
 * - `CardTitle`: The title section of the card, often used for prominent text, such as headings or titles.
 * 
 * - `CardDescription`: A smaller text section for additional descriptive content, often placed under the title.
 * 
 * - `CardContent`: The main content area of the card, usually containing text, images, or other content elements.
 * 
 * - `CardFooter`: The footer section of the card, typically used for actions, links, or additional information.
 * 
 * Each of these components can accept the following props:
 * - `className` (string, optional): Additional custom CSS classes to apply to the component.
 * - `...props` (HTMLAttributes<T>, optional): Any other valid HTML attributes that can be passed to the respective element (like `id`, `style`, etc.).
 *
 */

const Card = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)} {...props} />
))
Card.displayName = "Card"

const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
))
CardHeader.displayName = "CardHeader"

const CardTitle = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props} />
  ),
)
CardTitle.displayName = "CardTitle"

const CardDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  ),
)
CardDescription.displayName = "CardDescription"

const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
