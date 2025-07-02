"use client"

import type React from "react"

import { createContext, forwardRef, useContext, useState } from "react"
import { cn } from "../../lib/utils"


/**
 * Tabs component provides a simple way to create tabbed navigation and content, with support for both controlled and uncontrolled usage.
 * The `Tabs` component contains a list of `TabsTrigger` elements that allow users to switch between different `TabsContent` elements.
 * 
 * The state of the selected tab is managed through the `TabsContext`, and you can control the selected tab either using the `value` prop or by using the `defaultValue` for an uncontrolled state.
 * 
 * **Tabs Provider (`TabsContext`)**: 
 * - Manages the active tab state.
 * - `value` (string): The current selected tab value.
 * - `onValueChange`: A callback function that is triggered when the tab value changes.
 * 
 * **Props**:
 * - `defaultValue`: The default value for the selected tab (only used for uncontrolled tabs).
 * - `value`: The controlled value for the selected tab.
 * - `onValueChange`: A callback function that is triggered when the selected tab changes.
 * - `children`: The tab triggers and content that should be rendered inside the `Tabs` component.
 * 
 * **Subcomponents**:
 * 1. **TabsList**: The container for the tab triggers.
 *    - `className`: Optional additional classes for styling the list.
 * 
 * 2. **TabsTrigger**: A button element used to trigger tab changes. This should be used inside the `TabsList`.
 *    - `value`: The value that identifies this tab.
 *    - `className`: Optional additional classes for styling the trigger button.
 * 
 * 3. **TabsContent**: The content that corresponds to a specific tab, rendered when the tab is selected.
 *    - `value`: The value that corresponds to the active tab.
 *    - `className`: Optional additional classes for styling the content.
 * 
 * **Context**:
 * `useTabs`: A custom hook that allows consuming the current selected tab value and the `onValueChange` function.
 * 
 */
type TabsContextValue = {
  value: string
  onValueChange: (value: string) => void
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined)

/**
 * useTabs is a custom hook that provides access to the TabsContext.
 * It allows components to consume the current selected tab value and the onValueChange function.
 * 
 * @returns {TabsContextValue} The current selected tab value and the onValueChange function.
 * @throws {Error} If used outside of a TabsProvider.
 */
function useTabs() {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error("useTabs must be used within a TabsProvider")
  }
  return context
}

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
}

const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  ({ defaultValue, value, onValueChange, children, ...props }, ref) => {

    /**
     * The state of the selected tab. This is used for uncontrolled tabs.
     * If `value` is provided, this state will be ignored.
     */
    const [tabValue, setTabValue] = useState(value || defaultValue || "")

    /**
     * 
     * @param newValue The new value to set for the selected tab.
     */
    const handleValueChange = (newValue: string) => {
      setTabValue(newValue)
      onValueChange?.(newValue)
    }

    return (
      <TabsContext.Provider
        value={{
          value: value !== undefined ? value : tabValue,
          onValueChange: onValueChange || handleValueChange,
        }}
      >
        <div ref={ref} {...props}>
          {children}
        </div>
      </TabsContext.Provider>
    )
  },
)
Tabs.displayName = "Tabs"

const TabsList = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    role="tablist"
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
      className,
    )}
    {...props}
  />
))
TabsList.displayName = "TabsList"

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
}

const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(({ className, value, ...props }, ref) => {
  const { value: selectedValue, onValueChange } = useTabs()
  const isSelected = selectedValue === value

  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      aria-selected={isSelected}
      data-state={isSelected ? "active" : "inactive"}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isSelected ? "bg-background text-foreground shadow-sm" : "hover:bg-background/50 hover:text-foreground",
        className,
      )}
      onClick={() => onValueChange(value)}
      {...props}
    />
  )
})
TabsTrigger.displayName = "TabsTrigger"

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(({ className, value, ...props }, ref) => {
  const { value: selectedValue } = useTabs()
  const isSelected = selectedValue === value

  if (!isSelected) return null

  return (
    <div
      ref={ref}
      role="tabpanel"
      data-state={isSelected ? "active" : "inactive"}
      className={cn(
        "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className,
      )}
      {...props}
    />
  )
})
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }
