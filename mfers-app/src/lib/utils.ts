import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines class names with Tailwind CSS conflict resolution.
 * Uses clsx for conditional class joining and tailwind-merge for deduplication.
 * 
 * @param inputs - Class names, objects, or arrays to merge
 * @returns Merged class string with Tailwind conflicts resolved
 * 
 * @example
 * cn("px-4 py-2", "px-6") // "py-2 px-6"
 * cn("bg-red-500", { "bg-blue-500": true }) // "bg-blue-500"
 * cn(["flex", "items-center"], "justify-between") // "flex items-center justify-between"
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
