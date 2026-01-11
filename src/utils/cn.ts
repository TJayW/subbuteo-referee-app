/**
 * Conditional className utility
 * Filters out falsy values and joins class names
 * 
 * @example
 * cn('base', isActive && 'active', 'text-sm')
 * // => "base active text-sm" (if isActive is true)
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
