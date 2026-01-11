/**
 * Shared UI types
 * Types used across UI components but not part of core domain
 */

/**
 * Time-travel scope
 * CANONICAL SOURCE - moved from time_travel_status_bar.tsx
 */
export type TimeTravelScope = 'global' | 'events';

/**
 * Action button types
 * Common UI action categories
 * CANONICAL SOURCE - merged from action_button.tsx (unified all values)
 */
export type ActionType = 
  | 'primary'      // Blue gradient, main actions
  | 'success'      // Green, positive actions (goals, approvals)
  | 'warning'      // Amber/Yellow, cautionary actions (fouls, warnings)
  | 'danger'       // Red, destructive actions (red cards, deletions)
  | 'destructive'  // Alias for 'danger' (keep for backward compat)
  | 'info'         // Cyan, informational actions
  | 'secondary'    // Slate, secondary actions
  | 'ghost'        // Transparent, tertiary actions
  | 'edit'         // Edit action (custom for action_button)
  | 'expand'       // Expand/collapse action (custom)
  | 'test';        // Test action (audio test buttons)

/**
 * Button variants
 */
export type ButtonVariant = 'default' | 'outline' | 'ghost' | 'destructive';

/**
 * Sheet positions
 */
export type SheetPosition = 'bottom' | 'right' | 'left';

/**
 * Card variants (for DashboardCard)
 */
export type CardVariant = 'default' | 'highlight' | 'warning' | 'success' | 'danger';
