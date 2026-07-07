import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind classes safely.
 * This is crucial for reusable UI components where we want to pass custom classes
 * that might override the default ones.
 * 
 * @param {...(string | undefined | null | false)} inputs 
 * @returns {string} merged tailwind class string
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
