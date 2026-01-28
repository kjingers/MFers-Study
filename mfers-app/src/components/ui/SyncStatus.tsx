import { cn } from "../../lib/utils";

/**
 * Sync mode type for visual indicator.
 */
export type SyncMode = "live" | "polling" | "local";

/**
 * Props for SyncStatus component.
 */
export interface SyncStatusProps {
  /** Current sync mode */
  mode: SyncMode;
  /** Whether currently connecting */
  isConnecting?: boolean;
  /** Optional additional class names */
  className?: string;
}

/**
 * Visual status indicator for sync connection state.
 * Shows a small pill with colored dot and status text.
 *
 * - Green dot + "Live" = Connected to SignalR
 * - Yellow dot + "Connecting" = Currently reconnecting
 * - Blue dot + "Syncing" = Polling mode
 * - Gray dot + "Local" = Offline/fallback mode
 *
 * @example
 * <SyncStatus mode="live" />
 * <SyncStatus mode="polling" isConnecting />
 */
export function SyncStatus({ mode, isConnecting, className }: SyncStatusProps) {
  // Determine visual state
  const isLive = mode === "live" && !isConnecting;
  const isPolling = mode === "polling" && !isConnecting;

  // Status dot colors
  const dotColorClass = isConnecting
    ? "bg-amber-400"
    : isLive
      ? "bg-emerald-400"
      : isPolling
        ? "bg-sky-400"
        : "bg-zinc-400";

  // Status text
  const statusText = isConnecting
    ? "Connecting"
    : isLive
      ? "Live"
      : isPolling
        ? "Syncing"
        : "Local";

  // Pulsing animation for connecting state
  const pulseClass = isConnecting ? "animate-pulse" : "";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full",
        "text-xs font-medium",
        "bg-zinc-800/60 backdrop-blur-sm",
        "border border-zinc-700/50",
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={`Sync status: ${statusText}`}
    >
      {/* Status dot */}
      <span
        className={cn(
          "w-2 h-2 rounded-full",
          "shadow-[0_0_4px_currentColor]",
          dotColorClass,
          pulseClass
        )}
        aria-hidden="true"
      />
      
      {/* Status text */}
      <span className="text-zinc-300">{statusText}</span>
    </div>
  );
}
