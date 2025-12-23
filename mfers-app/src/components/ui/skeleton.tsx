import { forwardRef, type HTMLAttributes } from "react"
import { cn } from "../../lib/utils"

/**
 * Skeleton component props.
 */
export type SkeletonProps = HTMLAttributes<HTMLDivElement>

/**
 * Skeleton loading placeholder component.
 * Displays an animated shimmer effect while content loads.
 * 
 * @example
 * <Skeleton className="h-4 w-full" />
 * <Skeleton className="h-12 w-12 rounded-full" />
 */
const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-md bg-muted animate-shimmer",
        className
      )}
      {...props}
    />
  )
)
Skeleton.displayName = "Skeleton"

/**
 * Card skeleton for loading week data.
 */
export function CardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-surface p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Skeleton className="h-5 w-5 rounded" />
        <Skeleton className="h-5 w-24" />
      </div>
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  )
}

/**
 * Question list skeleton for loading questions.
 */
export function QuestionListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="rounded-lg border border-border bg-surface p-4"
        >
          <div className="flex gap-3">
            <Skeleton className="h-6 w-6 rounded" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Full page skeleton for initial load.
 */
export function WeekPageSkeleton() {
  return (
    <div className="p-4 space-y-4">
      {/* Header skeleton */}
      <div className="flex items-center justify-between h-14">
        <Skeleton className="h-10 w-10 rounded" />
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-10 w-10 rounded" />
      </div>
      
      {/* Reading card skeleton */}
      <CardSkeleton />
      
      {/* Dinner card skeleton */}
      <CardSkeleton />
      
      {/* Questions section */}
      <div className="mt-6">
        <Skeleton className="h-6 w-40 mb-3" />
        <QuestionListSkeleton />
      </div>
    </div>
  )
}

/**
 * Verse content skeleton for modal loading.
 */
export function VerseSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="h-3 w-32 mt-4" />
    </div>
  )
}

export { Skeleton }
