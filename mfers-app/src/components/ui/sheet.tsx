import { X } from "lucide-react";
import {
  forwardRef,
  useEffect,
  useRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "../../lib/utils";
import { Button } from "./button";

/**
 * Sheet/Bottom sheet component props.
 */
export interface SheetProps {
  /** Whether the sheet is open */
  isOpen: boolean;
  /** Callback when sheet should close */
  onClose: () => void;
  /** Sheet content */
  children: ReactNode;
  /** Additional class names */
  className?: string;
  /** Title for the sheet header */
  title?: string;
}

/**
 * Bottom sheet component for mobile-friendly selection menus.
 * Slides up from the bottom with backdrop.
 *
 * @example
 * <Sheet isOpen={isOpen} onClose={() => setIsOpen(false)} title="Select Week">
 *   <SheetContent>...</SheetContent>
 * </Sheet>
 */
export function Sheet({
  isOpen,
  onClose,
  children,
  className,
  title,
}: SheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  // Handle click outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-end justify-center",
        "bg-black/50 backdrop-blur-sm",
        "animate-in fade-in duration-200"
      )}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "sheet-title" : undefined}
    >
      <div
        ref={sheetRef}
        className={cn(
          "w-full max-h-[70vh] rounded-t-xl bg-surface",
          "overflow-hidden shadow-xl",
          "animate-in slide-in-from-bottom duration-300",
          className
        )}
      >
        {/* Drag handle indicator */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
        </div>

        {/* Header with title and close */}
        {title && (
          <div className="flex items-center justify-between px-4 pb-3 border-b border-border">
            <h2 id="sheet-title" className="text-lg font-semibold">
              {title}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Close"
              className="min-w-[44px] min-h-[44px]"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </Button>
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(70vh-80px)]">
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * Sheet content wrapper for consistent padding.
 */
const SheetContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-4", className)} {...props} />
  )
);
SheetContent.displayName = "SheetContent";

export { SheetContent };
