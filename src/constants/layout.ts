/**
 * Layout constants
 * CANONICAL SOURCE for all UI layout dimensions
 * 
 * These values define the physical layout contract and must be
 * consistent across all components to prevent layout shift.
 */

/**
 * Animation and timing constants
 * Enterprise-grade motion design for consistent UX
 */
export const ANIMATION_CONSTANTS = {
  /** Spring physics for natural motion */
  SPRING_STIFF: 300,
  SPRING_DAMPING: 30,
  
  /** Duration presets (ms) */
  DURATION_INSTANT: 100,
  DURATION_FAST: 150,
  DURATION_NORMAL: 200,
  DURATION_SLOW: 300,
  DURATION_DELIBERATE: 500,
  
  /** Easing curves */
  EASE_OUT: [0.16, 1, 0.3, 1] as const,
  EASE_IN_OUT: [0.4, 0, 0.2, 1] as const,
  EASE_SPRING: 'easeOut' as const,
  
  /** Stagger delays for lists */
  STAGGER_CHILDREN: 0.05,
  STAGGER_FAST: 0.03,
  
  /** Scale transforms */
  SCALE_TAP: 0.97,
  SCALE_HOVER: 1.02,
  
  /** Focus ring animation */
  FOCUS_RING_DURATION: 150,
} as const;

/**
 * Top bar / header heights
 */
export const LAYOUT_HEIGHTS = {
  /** Top bar height (fixed) */
  TOP_BAR: 56, // h-14 = 56px (14 * 4)
  
  /** Event status banner height (in-card only; global status now inline in TopBar) */
  STATUS_BANNER: 32, // h-8 = 32px (8 * 4) - compact context strip for event scope
  
  /** Bottom dock minimum height (mobile) */
  BOTTOM_DOCK_MIN: 48,
  
  /** Minimum touch target (accessibility) */
  MIN_TOUCH_TARGET: 44,
} as const;

/**
 * Sidebar / rail widths
 */
export const LAYOUT_WIDTHS = {
  /** Operator rail width (desktop, expanded) */
  OPERATOR_RAIL: 280, // matches lg:w-[280px]
  
  /** Operator rail width (collapsed) */
  OPERATOR_RAIL_COLLAPSED: 80, // icon-only mode
  
  /** Operator rail width (comfort/max) */
  OPERATOR_RAIL_COMFORT: 320, // optional snap point
  OPERATOR_RAIL_MAX: 360, // hard maximum
  
  /** Advanced control panel width */
  CONTROL_PANEL: 320,
  
  /** Sheet widths */
  SHEET_DEFAULT: 384, // w-96 = 384px (96 * 4)
  SHEET_SETTINGS: 600,
  
  /** Export popover width */
  EXPORT_POPOVER: 320,
} as const;

/**
 * Sidebar resize behavior
 */
export const SIDEBAR_RESIZE = {
  /** Minimum width */
  MIN_WIDTH: 80,
  
  /** Maximum width */
  MAX_WIDTH: 360,
  
  /** Default expanded width */
  DEFAULT_WIDTH: 280,
  
  /** Snap points */
  SNAP_POINTS: [80, 280, 320] as const,
  
  /** Snap threshold (px distance to trigger snap) */
  SNAP_THRESHOLD: 12,
  
  /** Keyboard step (arrow keys) */
  KEYBOARD_STEP: 8,
  
  /** Keyboard large step (shift+arrow) */
  KEYBOARD_STEP_LARGE: 24,
  
  /** Collapse threshold (width below which sidebar is "collapsed") */
  COLLAPSE_THRESHOLD: 120,
} as const;

/**
 * Maximum widths (content containers)
 */
export const LAYOUT_MAX_WIDTHS = {
  /** Dashboard maximum width */
  DASHBOARD: 1600,
  
  /** Operator control bar */
  CONTROL_BAR: 1152, // max-w-6xl
  
  /** Modal content */
  MODAL_SM: 384, // max-w-sm
  MODAL_MD: 448, // max-w-md
  MODAL_LG: 512, // max-w-lg
} as const;

/**
 * Responsive breakpoints (Tailwind defaults + enterprise console behavior)
 * For reference only - use Tailwind classes in components
 * 
 * Spec Reference: §H Responsive Design
 */
export const BREAKPOINTS = {
  SM: 640,  // sm: 40rem
  MD: 768,  // md: 48rem (tablet threshold)
  LG: 1024, // lg: 64rem (desktop threshold)
  XL: 1280, // xl: 80rem
  '2XL': 1536, // 2xl: 96rem
} as const;

/**
 * RESPONSIVE LAYOUT MODES
 * Defines layout behavior at different breakpoints
 * 
 * Spec Reference: §H Responsive Design
 */
export const RESPONSIVE_MODES = {
  /** Desktop: Full layout (1024px+) */
  DESKTOP: {
    breakpoint: 1024,
    operatorRailWidth: 280,
    dashboardColumns: 3,
    statusBarsVisible: true,
    bottomDockVisible: false,
  },
  
  /** Tablet: Narrower layout (768-1023px) */
  TABLET: {
    breakpoint: 768,
    operatorRailWidth: 240,
    dashboardColumns: 2,
    statusBarsVisible: true,
    bottomDockVisible: false,
  },
  
  /** Mobile: Collapsed layout (<768px) */
  MOBILE: {
    breakpoint: 0,
    operatorRailWidth: 0, // Collapsed to bottom dock
    dashboardColumns: 1,
    statusBarsVisible: false, // Reduced header
    bottomDockVisible: true, // Replaces operator rail
    bottomDockHeight: 64, // Taller for touch targets
  },
} as const;

/**
 * TOUCH TARGET SIZES
 * Minimum sizes for mobile accessibility
 * 
 * Spec Reference: §H Mobile Requirements
 */
export const TOUCH_TARGETS = {
  MIN_SIZE: 48, // Minimum touch target (WCAG AAA)
  COMFORTABLE_SIZE: 64, // Comfortable touch target
  BUTTON_HEIGHT: 48,
  BUTTON_WIDTH_MIN: 88,
  ICON_BUTTON_SIZE: 48,
} as const;

/**
 * ANIMATION TIMINGS
 * Transition durations and easing curves
 */
export const ANIMATION_TIMINGS = {
  /** Sidebar expand/collapse transition */
  SIDEBAR_TRANSITION_MS: 200,
  SIDEBAR_TRANSITION_EASING: 'ease-out' as const,
  
  /** Default UI transitions */
  DEFAULT_MS: 200,
  FAST_MS: 100,
  SLOW_MS: 300,
} as const;

/**
 * Z-index layers
 */
export const Z_INDEX = {
  BASE: 0,
  DROPDOWN: 10,
  STICKY: 20,
  FIXED: 30,
  MODAL_BACKDROP: 40,
  MODAL: 50,
  POPOVER: 50,
  TOOLTIP: 60,
  NOTIFICATION: 9999,
} as const;

/**
 * LAYOUT INVARIANTS - Enterprise-Grade Stability Contract
 * 
 * These values define immutable layout contracts that MUST be enforced
 * across all components to prevent layout shift and ensure operator console stability.
 * 
 * Spec Reference: §E.2 Layout Invariants
 * 
 * CRITICAL UPDATE (9 Jan 2026): Global status now inline in TopBar (no dedicated strip).
 * STATUS_BAR_HEIGHT remains 32 for event-scoped status (Event Log card header).
 */
export const LAYOUT_INVARIANTS = {
  // Heights (px) - IMMUTABLE
  TOP_BAR_HEIGHT: 56,
  STATUS_BAR_HEIGHT: 32, // Event status strip height (in-card only); global now inline
  // P0: global status inline in TopBar; event status is card-scoped
  OPERATOR_RAIL_TOP: 56, // TopBar only (global status inline, no extra strip)
  MAIN_CONTENT_TOP: 56, // below TopBar (global status inline)
  
  // Widths (px) - IMMUTABLE
  OPERATOR_RAIL_WIDTH: 280,
  // P0: in-flow sidebar (no manual margin-left hacks)
  MAIN_MARGIN_LEFT: 0,
  
  // Flex Rules - IMMUTABLE
  FLEX_NO_GROW: 0,
  FLEX_NO_SHRINK: 0,
  FLEX_FILL: 1,
  
  // Sidebar Cards (flex rules) - IMMUTABLE
  EVENT_LOG_FLEX: 'flex-1' as const, // Takes remaining space
  TEAM_CARD_FLEX: 'flex-none' as const, // Content-sized (~180px)
  TIME_CARD_FLEX: 'flex-none' as const, // Content-sized (~160px)
  
  // Scroll Rules - IMMUTABLE
  SIDEBAR_SCROLL: 'overflow-hidden' as const, // Sidebar itself NEVER scrolls
  EVENT_LOG_SCROLL: 'overflow-y-auto' as const, // Only event list scrolls
  MAIN_SCROLL: 'overflow-y-auto' as const, // Dashboard scrolls
} as const;

/**
 * SIDEBAR CARD CONSTRAINTS
 * Explicit height constraints for operator rail 3-card system
 * 
 * Spec Reference: §F.1 3-Card Fill Height Model
 */
export const SIDEBAR_CARD_CONSTRAINTS = {
  EVENT_LOG_MIN_HEIGHT: 200, // px - minimum usable height
  TEAM_CARD_HEIGHT: 180, // px - fixed
  TIME_CARD_HEIGHT: 160, // px - fixed
  GAP: 8, // px - gap-2 in Tailwind
  PADDING: 12, // px - p-3 in Tailwind
} as const;

/**
 * LAYOUT PLACEMENT RULES - Hard Boundaries
 * Defines exact position, size, and z-index for all major UI surfaces
 * 
 * Spec Reference: §B.2 UI Placement Rules
 */
export const LAYOUT_PLACEMENT_RULES = {
  // Header: Sticky/in-flow, always visible, no scroll
  TOP_BAR: {
    position: 'sticky' as const,
    height: 56, // px
    zIndex: 50,
    contains: ['logo', 'globalUndo', 'settings', 'export'] as const,
    responsive: { mobile: 'collapse-to-hamburger' } as const,
  },
  
  // Global status surface: integrated header context strip (always present)
  STATUS_GLOBAL: {
    position: 'in-header' as const,
    height: 32, // always present (shows LIVE when inactive)
    zIndex: 0,
    visibility: 'conditional' as const, // shown when globalHistory.isTimeTraveling
  },
  
  // Event status bar: MUST be card-scoped (Event Log card only)
  STATUS_EVENT: {
    position: 'in-card' as const,
    height: 32,
    visibility: 'conditional' as const,
  },
  
  // Operator Rail: In-flow sidebar, no scroll
  OPERATOR_RAIL: {
    position: 'static' as const,
    width: 280, // px
    scroll: 'none' as const, // sidebar itself does NOT scroll
    contains: ['eventLogCard', 'teamCard', 'timeCard'] as const,
    responsive: { mobile: 'collapse-to-bottom-dock' } as const,
  },
  
  // Main Dashboard: Scrollable, derived read-only
  MAIN: {
    position: 'relative' as const,
    marginLeft: 0,
    top: 0,
    scroll: 'auto' as const,
    contains: ['dashboardCards'] as const,
    mutationAllowed: false, // INVARIANT: read-only
  },
} as const;

/**
 * DASHBOARD LAYOUT
 * Spacing grammar and grid system for dashboard cards
 * 
 * Spec Reference: §G.3 Card Consistency Rules
 */
export const DASHBOARD_LAYOUT = {
  CARD_GAP: 16, // gap-4 in Tailwind
  CARD_PADDING: 16, // p-4
  CARD_MAX_WIDTH: 600, // Readable width
  GRID_COLUMNS: {
    mobile: 1,
    tablet: 2,
    desktop: 3,
  },
} as const;
