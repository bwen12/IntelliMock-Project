import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * A utility function that combines the functionality of `clsx` and `tailwind-merge` 
 * to conditionally join Tailwind CSS class names and resolve conflicts in the final result.
 * 
 * This function helps to handle conditional class names more efficiently and ensures that conflicting 
 * Tailwind utility classes are resolved correctly, keeping the final set of class names optimized.
 * 
 * @param inputs - A variable number of class names or conditional expressions that can be evaluated to
 *                 strings or falsy values. These will be passed through `clsx` for conditional joining.
 * @returns A string representing the final class names after resolving any conflicts with `tailwind-merge`.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
