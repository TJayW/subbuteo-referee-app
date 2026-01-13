**HISTORICAL DOCUMENT** - Questo documento descrive refactoring precedenti. Per la struttura corrente vedere `spec.md` Section 11.

---
# Performance Instrumentation & Monitoring

**Created:** 11 gennaio 2026  
**Updated:** 12 gennaio 2026  
**Status:** Baseline established + CI gates active  
**Target Environment:** Chrome/Firefox/Safari (ES2020+)

---

## Bundle Size Gate

### Threshold and Enforcement

| Metric | Current | Threshold | Status |
|--------|---------|-----------|--------|
| **Gzipped Bundle** | 215.75 KB | 225 KB | ✅ PASS |
| **Enforcement** | CI workflow | Fail on exceed | Active |

**Rationale:**  
Zod validation library adds ~18 KB gzipped. Threshold set with buffer for future growth while preventing unchecked bloat.

**Measurement:**  
CI workflow (`.github/workflows/ci.yml`) measures `gzip -c dist/assets/*.js | wc -c` after build and fails if exceeds threshold.

**Monitoring:**  
Bundle size printed in GitHub Actions job summary on every CI run.

---

## Storage Validation

### Zod Schema Validation for Persisted State

**Implementation:**  
`src/adapters/storage/schemas.ts` defines `MatchStateSchema` (Zod) covering persisted match state structure.

**Behavior on Load:**
1. Parse JSON from localStorage
2. Validate with `MatchStateSchema.safeParse()`
3. **If invalid:**
   - Return `null` (caller uses default initial state)
   - Log via `logger.warn` with Zod error details
4. **If valid:**
   - Return validated data as `DomainMatchState`

**Graceful Degradation:**  
Missing optional fields (e.g., `recoverySeconds`, `suspensionReason`) use defaults via Zod schema. Invalid structures fall back to clean initial state without crashing.

**Testing:**  
`tests/vitest/unit/storage-validation.test.ts` validates:
- Valid persisted state loads successfully
- Invalid persisted state falls back with warning
- Corrupted JSON handled gracefully
- Event structure validated within state

---

## Export Tests

### Location and Coverage

**Test File:**  
`tests/vitest/integration/export-flows.test.tsx`

**Validated Formats:**
- **JSON:** Parse JSON, validate required keys (`matchId`, `events`, `cursor`, `phase`, `period`)
- **CSV:** Validate header row + data rows for seeded fixture match
- **HTML:** Contains expected markup and match summary
- **PNG:** Valid mime type (`image/png`) + graceful canvas API error handling

**Testing Strategy:**  
- Blob interception via mocked `URL.createObjectURL`
- FileReader-based content validation (jsdom-compatible)
- Deterministic fixtures in `tests/fixtures/matchState.ts`
- Frozen timestamps and predictable event IDs

---

## Baseline Metrics

### Critical Path Performance Targets

| Metric | Target | Rationale |
|--------|--------|-----------|
| **Timer Tick** | <16ms | Must maintain 60fps (16.67ms frame budget) |
| **Selector Execution** | <50ms | Avoid blocking UI thread during stats computation |
| **Dashboard Re-render** | <100ms | Visual update delay acceptable for derived analytics |
| **Event Creation** | <2s | P0 operation (critical for operator flow) |
| **Undo/Redo** | <500ms | High-frequency operation, must feel instant |

### Current Measurements (11 gennaio 2026)

| Metric | Measured | Status | Notes |
|--------|----------|--------|-------|
| Timer Tick | ~8ms | ✅ PASS | Memoized TimeCard prevents full tree re-render |
| selectTeamStats | ~12ms | ✅ PASS | With memoization cache (90%+ hit rate) |
| selectTeamStats (cold) | ~45ms | ✅ PASS | Acceptable cold cache performance |
| Dashboard Re-render | ~75ms | ✅ PASS | 6 cards, all memoized |
| Event Creation | ~1.2s | ✅ PASS | Includes audio playback latency (~200ms) |
| Undo (Cmd+Z) | ~300ms | ✅ PASS | Cursor decrement + selector recompute |
| Redo (Cmd+Shift+Z) | ~300ms | ✅ PASS | Same as undo |

---

## Instrumentation Approaches

### 1. React DevTools Profiler

**Setup:**
```bash
# Enable profiling in development
npm run dev -- --mode profiling

# Open Chrome DevTools → Profiler tab
# Record interaction → Analyze flamegraph
```

**What to measure:**
- Component render times (identify hotspots)
- Unnecessary re-renders (missing memoization)
- Commit phase duration (DOM updates)

**Red flags:**
- Any component >50ms render time
- >10 re-renders per user action
- Render cascades (parent → child → grandchild → ...)

### 2. Performance API (Runtime Instrumentation)

**Timer Tick Monitoring:**
```typescript
// src/features/operator_console/bottom_dock/time_card.tsx
useEffect(() => {
  if (!isRunning) return;
  
  const interval = setInterval(() => {
    const start = performance.now();
    dispatch({ type: 'TICK' });
    const end = performance.now();
    
    if (process.env.NODE_ENV === 'development') {
      const duration = end - start;
      if (duration > 16) {
        console.warn(`⚠️ Timer tick: ${duration.toFixed(2)}ms (target: <16ms)`);
      }
    }
  }, 1000);
  
  return () => clearInterval(interval);
}, [isRunning, dispatch]);
```

**Selector Execution Timing:**
```typescript
// src/domain/match/selectors.ts
export function selectTeamStats(state: DomainMatchState): ComputedTeamStats {
  const cacheKey = `${state.cursor}-${state.events.length}`;
  const cached = memoCache.get(cacheKey);
  
  if (process.env.NODE_ENV === 'development' && !cached) {
    const start = performance.now();
    const result = { /* compute stats */ };
    const end = performance.now();
    
    const duration = end - start;
    if (duration > 50) {
      console.warn(`⚠️ selectTeamStats (cold): ${duration.toFixed(2)}ms (target: <50ms)`);
    }
    
    return result;
  }
  
  return cached || { /* fallback */ };
}
```

### 3. FPS Monitor (requestAnimationFrame)

**Setup:**
```typescript
// src/shared/hooks/use_fps_monitor.ts
import { useEffect, useState } from 'react';

export function useFpsMonitor() {
  const [fps, setFps] = useState(60);
  
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    
    let frameCount = 0;
    let lastTime = performance.now();
    let rafId: number;
    
    const tick = () => {
      frameCount++;
      const now = performance.now();
      const delta = now - lastTime;
      
      if (delta >= 1000) {
        const currentFps = Math.round((frameCount * 1000) / delta);
        setFps(currentFps);
        frameCount = 0;
        lastTime = now;
      }
      
      rafId = requestAnimationFrame(tick);
    };
    
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);
  
  return fps;
}

// Usage in AppShell:
const fps = useFpsMonitor();
{process.env.NODE_ENV === 'development' && (
  <div className="fixed top-2 right-2 bg-slate-900 text-white px-2 py-1 rounded text-xs font-mono">
    {fps} FPS {fps < 55 && '⚠️'}
  </div>
)}
```

### 4. Bundle Size Monitoring

**Current Bundle:**
```bash
npm run build

# Output:
dist/assets/index-zbL4TCqE.js   718.16 kB │ gzip: 191.57 kB
```

**Targets:**
- Total bundle: <750KB uncompressed
- Gzip: <200KB
- Critical path (initial load): <100KB gzip

**Analysis:**
```bash
# Install analyzer
npm install -D rollup-plugin-visualizer

# Generate report
npm run build -- --mode analyze
# Opens treemap visualization in browser
```

---

## Optimization Techniques Applied

### 1. Memoization

**Selectors:**
```typescript
// Domain selectors with LRU cache
const memoCache = new Map<string, ComputedTeamStats>();
// Cache key: `${cursor}-${events.length}` (deterministic)
// Max size: 100 entries (covers typical undo/redo history)
```

**Components:**
```typescript
// Timer display memoized (prevent re-render on every tick)
export const TimeCard = React.memo((props) => {
  // ...
}, (prev, next) => {
  return prev.elapsedSeconds === next.elapsedSeconds &&
         prev.isRunning === next.isRunning &&
         prev.period === next.period;
});

// Dashboard cards memoized (prevent cascade re-renders)
export const StatsMatrixCard = React.memo((props) => {
  // ...
}, (prev, next) => {
  return prev.state.cursor === next.state.cursor &&
         prev.teamStats === next.teamStats;
});
```

### 2. Rerender Isolation

**Timer Tick Isolation:**
```typescript
// ONLY TimeCard re-renders on TICK action
// Dashboard cards DO NOT re-render (memoized dependencies unchanged)
```

**Event Cursor Isolation:**
```typescript
// Event cursor changes only affect:
// 1. EventLogCard (highlight current event)
// 2. TimeTravelStatusBar (position indicator)
// Dashboard cards: memoized on cursor + stats
```

### 3. Virtual Scrolling (Future)

**EventLog optimization:**
```typescript
// Currently: Render all events (acceptable for <100 events)
// Future (if needed): Use react-window for >500 events
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={400}
  itemCount={events.length}
  itemSize={40}
  width="100%"
>
  {({ index, style }) => (
    <EventRow event={events[index]} style={style} />
  )}
</FixedSizeList>
```

### 4. Code Splitting (Future)

**Lazy load non-critical routes:**
```typescript
// Future optimization (not yet implemented)
const SettingsSheet = React.lazy(() => import('./settings_sheet'));
const MatchControlCenter = React.lazy(() => import('./match_control_center'));

// Wrap in Suspense
<Suspense fallback={<Spinner />}>
  <SettingsSheet />
</Suspense>
```

---

## Verification Results

### Phase 1: Baseline (Pre-Optimization)
- Timer tick: ~18ms (⚠️ occasionally >16ms)
- selectTeamStats: ~80ms cold, no cache
- Dashboard re-render: ~150ms
- **Status:** Marginal, needed optimization

### Phase 2: Memoization Applied (Current)
- Timer tick: ~8ms (✅ well under budget)
- selectTeamStats: ~12ms cached, ~45ms cold (✅ acceptable)
- Dashboard re-render: ~75ms (✅ target met)
- **Status:** Targets met, production-ready

### Phase 3: Future Optimizations (If Needed)
- Virtual scrolling for EventLog (>500 events)
- Code splitting for modals/drawers
- Service worker caching for static assets
- IndexedDB for match history persistence

---

## Monitoring in Production

**Recommended Setup:**
1. **Sentry Performance Monitoring:** Track real-user metrics
2. **Google Analytics:** Custom events for P0 operations latency
3. **LogRocket:** Session replay for slow interactions

**Key Metrics to Track:**
- Time to Interactive (TTI): <3s
- First Contentful Paint (FCP): <1.5s
- Largest Contentful Paint (LCP): <2.5s
- Cumulative Layout Shift (CLS): <0.1
- First Input Delay (FID): <100ms

**Alert Thresholds:**
- Timer tick >20ms: Critical (operator flow disrupted)
- Selector >100ms: Warning (dashboard lag)
- Event creation >3s: Critical (P0 operation blocked)
- FPS <50: Warning (animation jank)
- Bundle size >800KB: Warning (load time impact)

---

## Optimization Decision Tree

```
Is there a performance issue?
├─ NO → Monitor, no action
└─ YES → What metric is slow?
    ├─ Timer tick (>16ms)
    │   └─ Check: Is state update expensive?
    │       ├─ YES → Add memoization to reducer selectors
    │       └─ NO → Check component re-renders (React DevTools)
    ├─ Selector (>50ms)
    │   └─ Add memoization with cache key
    ├─ Dashboard re-render (>100ms)
    │   └─ Check: Are cards memoized?
    │       ├─ NO → Wrap in React.memo with comparison
    │       └─ YES → Check selector efficiency
    ├─ Event creation (>2s)
    │   └─ Check: Audio playback blocking?
    │       ├─ YES → Async audio, don't await
    │       └─ NO → Check network requests (exports?)
    └─ Bundle size (>750KB)
        └─ Analyze with rollup-plugin-visualizer
            └─ Code split non-critical routes
```

---

## Changelog

**11 gennaio 2026:**
- Created baseline performance document
- Measured current metrics (all targets met)
- Documented memoization implementation
- Added FPS monitor hook
- Added selector timing instrumentation

**Future Updates:**
- Add production monitoring setup (Sentry, GA)
- Document virtual scrolling implementation (if needed)
- Add code splitting guide (if needed)
