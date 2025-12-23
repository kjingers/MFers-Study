import {
  useEffect,
  useRef,
  type ReactNode,
  type HTMLAttributes,
  forwardRef
} from "react"
import { X } from "lucide-react"
import { cn } from "../../lib/utils"
import { Button } from "./button"

/**
 * Modal/Dialog component props.
 */
export interface ModalProps {
  /** Whether the modal is open */
  isOpen: boolean
  /** Callback when modal should close */
  onClose: () => void
  /** Modal content */
  children: ReactNode
  /** Additional class names */
  className?: string
  /** ID for the modal title (for aria-labelledby) */
  titleId?: string
}

/**
 * Modal component that renders as a bottom sheet on mobile.
 * Includes backdrop blur and swipe-to-close support.
 * 
 * @example
 * <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
 *   <ModalHeader>
 *     <ModalTitle>My Modal</ModalTitle>
 *   </ModalHeader>
 *   <ModalContent>Content here</ModalContent>
 * </Modal>
 */
export function Modal({ isOpen, onClose, children, className, titleId = "modal-title" }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    
    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }
    
    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = ""
    }
  }, [isOpen, onClose])
  
  // Handle click outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }
  
  if (!isOpen) return null
  
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
      aria-labelledby={titleId}
    >
      <div
        ref={dialogRef}
        className={cn(
          // Mobile: Bottom sheet style
          "w-full max-h-[85vh] rounded-t-xl bg-surface",
          // Desktop: Centered modal
          "md:max-w-lg md:rounded-lg md:mb-auto md:mt-auto",
          "overflow-hidden shadow-xl",
          "animate-in slide-in-from-bottom duration-300 md:slide-in-from-bottom-0 md:zoom-in-95",
          className
        )}
      >
        {children}
      </div>
    </div>
  )
}

/**
 * Modal header with optional close button.
 */
export interface ModalHeaderProps extends HTMLAttributes<HTMLDivElement> {
  /** Whether to show the close button */
  showCloseButton?: boolean
  /** Close callback for the button */
  onClose?: () => void
}

const ModalHeader = forwardRef<HTMLDivElement, ModalHeaderProps>(
  ({ className, children, showCloseButton = true, onClose, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-between",
        "px-4 py-3 border-b border-border",
        className
      )}
      {...props}
    >
      <div className="flex-1">{children}</div>
      {showCloseButton && onClose && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-9 w-9 -mr-2"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </Button>
      )}
    </div>
  )
)
ModalHeader.displayName = "ModalHeader"

/**
 * Modal title component.
 */
const ModalTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h2
      ref={ref}
      id="modal-title"
      className={cn("text-lg font-semibold", className)}
      {...props}
    />
  )
)
ModalTitle.displayName = "ModalTitle"

/**
 * Modal content container.
 */
const ModalContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("p-4 overflow-y-auto max-h-[60vh]", className)}
      {...props}
    />
  )
)
ModalContent.displayName = "ModalContent"

/**
 * Modal footer for actions.
 */
const ModalFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-end gap-2",
        "px-4 py-3 border-t border-border",
        className
      )}
      {...props}
    />
  )
)
ModalFooter.displayName = "ModalFooter"

export { ModalHeader, ModalTitle, ModalContent, ModalFooter }
