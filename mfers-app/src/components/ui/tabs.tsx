import {
  createContext,
  forwardRef,
  useContext,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "../../lib/utils";

/**
 * Tabs context for managing active tab state.
 */
interface TabsContextValue {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs components must be used within a Tabs provider");
  }
  return context;
}

/**
 * Tabs root component props.
 */
export interface TabsProps extends HTMLAttributes<HTMLDivElement> {
  /** Currently active tab value */
  value?: string;
  /** Default tab value (uncontrolled) */
  defaultValue?: string;
  /** Callback when tab changes */
  onValueChange?: (value: string) => void;
  /** Tab content */
  children: ReactNode;
}

/**
 * Tabs container component for tabbed navigation.
 *
 * @example
 * <Tabs defaultValue="tab1">
 *   <TabsList>
 *     <TabsTrigger value="tab1">Tab 1</TabsTrigger>
 *     <TabsTrigger value="tab2">Tab 2</TabsTrigger>
 *   </TabsList>
 *   <TabsContent value="tab1">Content 1</TabsContent>
 *   <TabsContent value="tab2">Content 2</TabsContent>
 * </Tabs>
 */
export function Tabs({
  value,
  defaultValue = "",
  onValueChange,
  children,
  className,
  ...props
}: TabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);

  const activeTab = value ?? internalValue;
  const setActiveTab = (newValue: string) => {
    setInternalValue(newValue);
    onValueChange?.(newValue);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={cn("w-full", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

/**
 * Container for tab triggers.
 */
const TabsList = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      role="tablist"
      className={cn(
        "inline-flex h-10 items-center justify-center",
        "rounded-md bg-muted p-1",
        "text-muted-foreground",
        className
      )}
      {...props}
    />
  )
);
TabsList.displayName = "TabsList";

/**
 * Tab trigger button props.
 */
export interface TabsTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  /** Unique value for this tab */
  value: string;
  /** Whether the tab is disabled */
  disabled?: boolean;
}

/**
 * Individual tab trigger button.
 */
const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, disabled, ...props }, ref) => {
    const { activeTab, setActiveTab } = useTabsContext();
    const isActive = activeTab === value;

    return (
      <button
        ref={ref}
        role="tab"
        type="button"
        id={`tab-${value}`}
        aria-selected={isActive}
        aria-controls={`tabpanel-${value}`}
        data-state={isActive ? "active" : "inactive"}
        disabled={disabled}
        onClick={() => setActiveTab(value)}
        className={cn(
          "inline-flex items-center justify-center",
          "whitespace-nowrap rounded-sm px-3 py-1.5",
          "text-sm font-medium",
          "ring-offset-background",
          "transition-all duration-150",
          "focus-visible:outline-none focus-visible:ring-2",
          "focus-visible:ring-accent focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          "min-h-9 min-w-15", // Touch-friendly, scales with text
          isActive && "bg-background text-foreground shadow-sm",
          className
        )}
        {...props}
      />
    );
  }
);
TabsTrigger.displayName = "TabsTrigger";

/**
 * Tab content panel props.
 */
export interface TabsContentProps extends HTMLAttributes<HTMLDivElement> {
  /** Value matching the corresponding trigger */
  value: string;
}

/**
 * Content panel for a tab.
 */
const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, ...props }, ref) => {
    const { activeTab } = useTabsContext();
    const isActive = activeTab === value;

    if (!isActive) return null;

    return (
      <div
        ref={ref}
        role="tabpanel"
        id={`tabpanel-${value}`}
        aria-labelledby={`tab-${value}`}
        tabIndex={0}
        className={cn(
          "mt-2 ring-offset-background",
          "focus-visible:outline-none focus-visible:ring-2",
          "focus-visible:ring-accent focus-visible:ring-offset-2",
          className
        )}
        {...props}
      />
    );
  }
);
TabsContent.displayName = "TabsContent";

export { TabsContent, TabsList, TabsTrigger };
