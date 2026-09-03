import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Standard utility for combining conditional classes and merging Tailwind CSS utility classes.
 * Powers Animate UI, Inspira UI, and modern UI component primitives.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
