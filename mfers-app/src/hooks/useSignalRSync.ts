import { useCallback, useEffect, useRef, useState } from "react";
import * as signalR from "@microsoft/signalr";

/**
 * SignalR connection info from negotiate endpoint.
 */
interface SignalRConnectionInfo {
  available: boolean;
  url?: string;
  accessToken?: string;
}

/**
 * Highlight change message from server.
 */
interface HighlightMessage {
  weekId: string;
  questionId: string | null;
}

/**
 * Options for useSignalRSync hook.
 */
export interface SignalRSyncOptions {
  /** Week ID to sync highlights for */
  weekId: string;
  /** Callback when highlight changes from another client */
  onHighlightChange: (questionId: string | null) => void;
  /** Whether sync is enabled (default: true) */
  enabled?: boolean;
  /** Polling interval in ms when SignalR unavailable (default: 5000) */
  pollingInterval?: number;
}

/**
 * Return type for useSignalRSync hook.
 */
export interface SignalRSyncResult {
  /** Whether connected to SignalR */
  isConnected: boolean;
  /** Whether currently connecting */
  isConnecting: boolean;
  /** Connection error, if any */
  error: Error | null;
  /** Connection mode: 'live' (SignalR), 'polling', or 'local' */
  mode: "live" | "polling" | "local";
  /** Broadcast a highlight change to other clients */
  broadcastHighlight: (questionId: string | null) => void;
}

/**
 * API base URL - uses relative path for same-origin API
 */
const API_BASE = "/api";

/**
 * Negotiate with the SignalR service.
 */
async function negotiate(): Promise<SignalRConnectionInfo> {
  try {
    const response = await fetch(`${API_BASE}/negotiate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    
    if (!response.ok) {
      return { available: false };
    }
    
    return await response.json() as SignalRConnectionInfo;
  } catch {
    return { available: false };
  }
}

/**
 * Broadcast highlight change to server.
 */
async function postHighlight(weekId: string, questionId: string | null): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/highlight`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weekId, questionId }),
    });
    
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Get current highlight from server (polling fallback).
 */
async function getHighlight(weekId: string): Promise<{ questionId: string | null; updatedAt: string | null } | null> {
  try {
    const response = await fetch(`${API_BASE}/highlight/${weekId}`);
    
    if (!response.ok) {
      return null;
    }
    
    return await response.json() as { questionId: string | null; updatedAt: string | null };
  } catch {
    return null;
  }
}

/**
 * Hook for real-time highlight synchronization using Azure SignalR.
 * Falls back to polling when SignalR is unavailable, and to local-only mode when offline.
 *
 * @param options - Configuration options
 * @returns Sync state and broadcast function
 *
 * @example
 * const { isConnected, mode, broadcastHighlight } = useSignalRSync({
 *   weekId: "2025-01-28",
 *   onHighlightChange: (questionId) => setActiveQuestion(weekId, questionId),
 * });
 */
export function useSignalRSync(options: SignalRSyncOptions): SignalRSyncResult {
  const { weekId, onHighlightChange, enabled = true, pollingInterval = 5000 } = options;
  
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [mode, setMode] = useState<"live" | "polling" | "local">("local");
  
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastUpdatedAtRef = useRef<string | null>(null);
  const reconnectAttemptRef = useRef(0);
  const maxReconnectAttempts = 5;
  
  // Cleanup function for polling
  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);
  
  // Start polling fallback
  const startPolling = useCallback(() => {
    stopPolling();
    
    const poll = async () => {
      const result = await getHighlight(weekId);
      if (result && result.updatedAt && result.updatedAt !== lastUpdatedAtRef.current) {
        lastUpdatedAtRef.current = result.updatedAt;
        onHighlightChange(result.questionId);
      }
    };
    
    // Initial poll
    poll();
    
    // Set up interval
    pollingRef.current = setInterval(poll, pollingInterval);
    setMode("polling");
  }, [weekId, onHighlightChange, pollingInterval, stopPolling]);
  
  // Cleanup function for SignalR connection
  const disconnect = useCallback(async () => {
    stopPolling();
    
    if (connectionRef.current) {
      try {
        await connectionRef.current.stop();
      } catch {
        // Ignore disconnect errors
      }
      connectionRef.current = null;
    }
    
    setIsConnected(false);
    setIsConnecting(false);
  }, [stopPolling]);
  
  // Connect to SignalR
  const connect = useCallback(async () => {
    if (!enabled) {
      setMode("local");
      return;
    }
    
    setIsConnecting(true);
    setError(null);
    
    try {
      // First, negotiate to check if SignalR is available
      const connectionInfo = await negotiate();
      
      if (!connectionInfo.available || !connectionInfo.url) {
        // SignalR not available, fall back to polling
        setIsConnecting(false);
        startPolling();
        return;
      }
      
      // Create SignalR connection
      const connection = new signalR.HubConnectionBuilder()
        .withUrl(connectionInfo.url, {
          accessTokenFactory: () => connectionInfo.accessToken || "",
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            // Exponential backoff: 1s, 2s, 4s, 8s, 16s, max 30s
            if (retryContext.previousRetryCount >= maxReconnectAttempts) {
              return null; // Stop reconnecting
            }
            return Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 30000);
          },
        })
        .configureLogging(signalR.LogLevel.Warning)
        .build();
      
      // Handle connection events
      connection.onclose((err) => {
        setIsConnected(false);
        if (err) {
          setError(new Error(`SignalR connection closed: ${err.message}`));
          // Fall back to polling on connection close
          startPolling();
        }
      });
      
      connection.onreconnecting((err) => {
        setIsConnected(false);
        setIsConnecting(true);
        if (err) {
          console.warn("SignalR reconnecting:", err.message);
        }
      });
      
      connection.onreconnected(() => {
        setIsConnected(true);
        setIsConnecting(false);
        setMode("live");
        reconnectAttemptRef.current = 0;
        stopPolling();
        
        // Re-join the week group
        connection.invoke("JoinGroup", weekId).catch(console.error);
      });
      
      // Handle highlight change messages
      connection.on("highlightChange", (message: HighlightMessage) => {
        if (message.weekId === weekId) {
          onHighlightChange(message.questionId);
        }
      });
      
      // Start the connection
      await connection.start();
      connectionRef.current = connection;
      
      // Join the week's group
      try {
        await connection.invoke("JoinGroup", weekId);
      } catch {
        // Group join might not be implemented on server, continue anyway
      }
      
      setIsConnected(true);
      setIsConnecting(false);
      setMode("live");
      reconnectAttemptRef.current = 0;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.warn("SignalR connection failed, falling back to polling:", errorMessage);
      setError(err instanceof Error ? err : new Error(errorMessage));
      setIsConnecting(false);
      
      // Fall back to polling
      startPolling();
    }
  }, [enabled, weekId, onHighlightChange, startPolling, stopPolling]);
  
  // Broadcast highlight change
  const broadcastHighlight = useCallback((questionId: string | null) => {
    // Always post to server for persistence
    postHighlight(weekId, questionId).catch(console.error);
    
    // If connected via SignalR, also send through the hub
    if (connectionRef.current && isConnected) {
      connectionRef.current
        .invoke("BroadcastHighlight", weekId, questionId)
        .catch(console.error);
    }
  }, [weekId, isConnected]);
  
  // Connect on mount, disconnect on unmount
  useEffect(() => {
    // Schedule connection to avoid synchronous setState in effect
    // This is the recommended pattern for async initialization
    const timeoutId = setTimeout(() => {
      void connect();
    }, 0);
    
    return () => {
      clearTimeout(timeoutId);
      void disconnect();
    };
  }, [connect, disconnect]);
  
  // Reconnect when weekId changes
  useEffect(() => {
    if (connectionRef.current && isConnected) {
      // Leave old group and join new one
      connectionRef.current.invoke("LeaveGroup", weekId).catch(() => {});
      connectionRef.current.invoke("JoinGroup", weekId).catch(console.error);
    }
    
    // Reset last updated at for polling
    lastUpdatedAtRef.current = null;
  }, [weekId, isConnected]);
  
  return {
    isConnected,
    isConnecting,
    error,
    mode,
    broadcastHighlight,
  };
}
