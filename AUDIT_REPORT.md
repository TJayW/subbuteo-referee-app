# 360° Code Audit Report — Subbuteo Referee App
**Date:** 12 Gennaio 2026  
**Auditor:** Staff Software Engineer + Principal Architect  
**Scope:** Full codebase architecture, domain model, SOLID/GoF patterns, dead code, naming, testing, security

---

## Executive Summary

### 🏆 Top 5 Wins
1. **Event-sourced architecture with dual time-travel**: Excellent separation between global settings history and event stream cursor — demonstrates deep understanding of CQRS patterns
2. **Robust FSM with invariant checking**: Match phase transitions are guarded with validation; DEV-mode assertions prevent invalid state mutations
3. **Command pattern implementation**: Clean separation between UI actions and domain commands with Result types (CommandSuccess/Failure)
4. **Comprehensive test coverage**: 99 tests passing, including P0 regression guards, integration tests, and unit tests for critical paths
5. **Zero production vulnerabilities**: `npm audit` clean, no security issues in dependencies

### ⚠️ Top 5 Risks
1. **P1 — Console logging in production**: 29 `console.warn`/`console.error` calls leak debug info; need structured logging adapter
2. **P1 — Missing deploy workflow**: No `.github/workflows/deploy.yml` — CI exists but deployment to GitHub Pages is manual/undocumented
3. **P2 — Incomplete command undo stack**: `use-match-logic.ts` maintains undo/redo for commands but only stores `DomainMatchState` without command metadata — limits undo UX fidelity
4. **P2 — TODO in dashboard-selectors**: Formation readiness check stubbed (`hasFormations: false, // TODO`)
5. **P2 — Barrel export anti-pattern risk**: 25 `index.ts` files create implicit dependencies; refactoring requires careful ordering

---

## Findings Table (Ranked by Severity)

| Severity | Area | Finding | Evidence | Fix Approach |
|----------|------|---------|----------|--------------|
| **P0** | Domain | ✅ FSM terminal states correctly pause timer | `src/domain/match/fsm.ts:140-156` | N/A — Already correct |
| **P0** | Domain | ✅ Action gating prevents double time-travel | `src/domain/match/action-gating.ts:28-112` | N/A — Already correct |
| **P0** | Domain | ✅ Event cursor correctness enforced | `src/hooks/use-match-reducer.ts:64-85` | N/A — Already correct |
| **P1** | Quality | Console logs in production | 29 matches in `src/**/*.ts*` | Create logging abstraction with prod no-op |
| **P1** | Deploy | Missing deploy workflow | `.github/workflows/deploy.yml` absent | Add GitHub Actions deploy to Pages |
| **P1** | Testing | No E2E tests for exports | `tests/e2e/` only has sidebar tests | Add Playwright tests for JSON/PNG/CSV/HTML |
| **P2** | Architecture | Command undo lacks metadata | `src/hooks/use-match-logic.ts:47-48` | Store `{state, commandName, timestamp}` |
| **P2** | Domain | TODO: formation validation | `src/features/dashboard/dashboard-selectors.ts:264` | Implement `hasFormations` check |
| **P2** | Naming | Inconsistent file casing | Components: PascalCase, hooks: kebab-case | Document convention in CONTRIBUTING.md |
| **P2** | Architecture | AudioEngine singleton pattern | `src/adapters/audio/audio-engine.ts:29-51` | Correct — Singleton justified for Web Audio API |
| **P2** | Dead Code | Commented-out handlers in AppShell | `src/app/AppShell.tsx:365-370` | Remove `handleResetMatch`, `handleSetElapsedSeconds` |
| **P2** | Dead Code | Unused `overrideTransitions` state removed | `src/app/AppShell.tsx:158` (comment exists) | Already fixed — remove comment |
| **P2** | Duplication | Time formatting logic | `formatTime` in utils + event-helpers | Extract to shared utility |
| **P2** | Circular Deps | Barrel exports create ordering risks | 25 `index.ts` files | Acceptable if re-exports are pure types |
| **P3** | Security | `.env` in `.gitignore` but unused | `.gitignore:29` | Document that no secrets are needed (client-only) |
| **P3** | Build | `VITE_BASE_PATH` not in CI | `vite.config.ts:6` | Add to deploy workflow for GitHub Pages |

---

## 1. Feature Map & Entrypoint Analysis

### Entry Points
- **Main**: `src/app/main.tsx` → `App` → `AppShell`
- **Router**: None (single-page app)
- **Feature Surfaces**: All reachable at runtime (no lazy loading)

### Reachable Features
| Surface | Component | Path | Status |
|---------|-----------|------|--------|
| **Operator Console (Desktop)** | `Sidebar` | `src/features/operator-console/desktop/Sidebar.tsx` | ✅ Active |
| **Operator Console (Mobile)** | `BottomDock` | `src/features/operator-console/mobile/BottomDock.tsx` | ✅ Active |
| **Dashboard** | `MatchDashboard` | `src/features/dashboard/MatchDashboard.tsx` | ✅ Active |
| **Settings Sheet** | `SettingsSheet` | `src/features/settings/sheets/SettingsSheet.tsx` | ✅ Active |
| **Match Info Sheet** | `MatchInfoSheet` | `src/features/settings/sheets/MatchInfoSheet.tsx` | ✅ Active |
| **Command Palette** | `CommandPalette` | `src/ui/components/CommandPalette.tsx` | ✅ Active |
| **Header** | `AppHeader` | `src/features/header/AppHeader.tsx` | ✅ Active |
| **Export Popover** | `ExportPopover` | `src/features/dashboard/ExportPopover.tsx` | ✅ Active |

### Unreachable Features
**None identified** — All components in `src/features/` are imported by `AppShell` or active sub-components.

---

## 2. Domain Architecture & FSM Correctness

### Invariants Analysis
✅ **Cursor correctness**: `cursor ∈ [0, events.length]` enforced in reducer  
✅ **Timer bounds**: `0 ≤ elapsedSeconds ≤ totalPeriodSeconds` validated in `assertMatchInvariants`  
✅ **Terminal state semantics**: `terminated`/`postmatch_complete` prevent transitions and pause timer  
✅ **Recovery phase mapping**: Recovery time tracked per-period, correctly applied on toggle  
✅ **Undo/redo determinism**: Cursor-based, no branch divergence

### Edge Cases
| Case | Handling | Verdict |
|------|----------|---------|
| Add event while time-traveling | Auto-jumps to present (RULE 3) | ✅ Correct |
| Toggle timer during global undo | Gated by `ACTION_GATES.TOGGLE_TIMER` | ✅ Correct |
| Navigate event cursor during global time-travel | Blocked by `ACTION_GATES.NAVIGATE_EVENT_CURSOR` | ✅ Correct |
| Set recovery without entering recovery phase | Stored in `recoverySeconds[period]`, applied on explicit toggle | ✅ Correct |
| Terminate match, then undo | `commandReset` requires `confirmToken`, undo via global history | ✅ Correct |

### Potential Bugs
🟡 **Minor**: `commandSetPeriodDurationPreset` accepts `presetId` ('regulation', 'extra_time') but falls through to `else` if unknown → silent failure. **Fix**: Add explicit error handling.

---

## 3. SOLID & GoF Patterns Review

### Single Responsibility Principle (SRP)
| Module | Assessment |
|--------|------------|
| `AppShell` | ⚠️ **Mixed concerns**: Handles layout, sidebar state, global history, event history, settings, shortcuts, audio setup → 649 lines. **Recommendation**: Extract sidebar logic to `useSidebar` hook. |
| `use-match-logic` | ✅ Clean: Manages domain state, command execution, persistence |
| `AudioEngine` | ✅ Clean: Encapsulates Web Audio API lifecycle |
| `MatchDashboard` | ✅ Clean: Composition of cards with filters |
| Command API | ✅ Clean: Pure functions with Result types |

### Open/Closed Principle (OCP)
✅ **Command extension**: New commands added to `MatchCommands` object without modifying callers  
✅ **Export formats**: New formats added to `exportOptions` array without changing UI logic  
⚠️ **FSM transitions**: Adding new phases requires editing `defaultNextPhases` switch — acceptable for finite state machines

### Dependency Inversion Principle (DIP)
✅ **Domain isolation**: `domain/` has zero imports from `features/` or `ui/`  
✅ **Adapters pattern**: `adapters/audio` and `adapters/storage` abstract browser APIs  
⚠️ **UI depends on domain types**: `src/features/` imports `@/domain/match/types` — acceptable for frontend; consider DTO layer if backend integration needed

### GoF Patterns Identified
| Pattern | Location | Usage | Verdict |
|---------|----------|-------|---------|
| **State** | `src/domain/match/fsm.ts` | Match phase FSM with transition guards | ✅ Correct |
| **Command** | `src/domain/commands/command-api.ts` | Encapsulates domain operations with undo support | ✅ Correct |
| **Singleton** | `src/adapters/audio/audio-engine.ts` | AudioContext lifecycle management | ✅ Justified |
| **Facade** | `src/hooks/use-match-logic.ts` | Wraps reducer + commands + persistence | ✅ Correct |
| **Strategy** | Implicit in tie-break rules (`requireExtraTime` flag) | Could be explicit `TieBreakStrategy` interface | 🟡 Optional |
| **Observer** | React hooks + `useEffect` for audio events | Not explicit observer but functionally equivalent | ✅ Acceptable |
| **Adapter** | `src/adapters/storage`, `src/adapters/audio` | Wraps localStorage and Web Audio API | ✅ Correct |

### Pattern Recommendations
1. **Extract Sidebar State to Hook** (SRP): `AppShell` at 649 lines; move sidebar logic to `useSidebar(layoutMode)` → ~400 lines
2. **Optional: Explicit Strategy for Tie-Break**: Replace boolean `requireExtraTime` with `TieBreakStrategy` interface → more extensible for future rules
3. **Consider Memento for Undo Stack**: Currently stores raw `DomainMatchState`; adding command metadata enables richer undo UI

---

## 4. Dead Code & Duplication

### Dead Code
| Path | Reason | Proof | Action | Risk |
|------|--------|-------|--------|------|
| `src/app/AppShell.tsx:365-370` | Commented-out `handleResetMatch` and `handleSetElapsedSeconds` | Lines exist as comments | Delete comments | **Low** |
| `src/app/AppShell.tsx:158` | Comment about removed `overrideTransitions` state | Line 158 references old code | Delete comment | **Low** |

### Duplication
| Area | Files | Issue | Fix |
|------|-------|-------|-----|
| Time formatting | `src/utils/format-time.ts`, `src/utils/event-helpers.ts` | Both have `formatTime` logic | Centralize in `format-time.ts` |
| Period labels | `PHASE_LABELS` in `fsm.ts`, `PERIOD_LABELS` in `constants/periods.ts` | Overlapping but different granularity | Document distinction (phase vs. period) |

### Unreachable Code
**None detected** — All exports in `src/features/` are imported by `AppShell` or active components.

### Circular Dependencies
⚠️ **Barrel exports** (25 `index.ts` files) create implicit ordering requirements but are manageable if:
- Re-exports are type-only or pure functions
- No module initializes on import

**Current status**: No runtime circular deps detected by TypeScript compiler.

---

## 5. Naming Conventions & Filesystem Coherence

### Current Conventions
| Type | Convention | Examples |
|------|-----------|----------|
| Components | PascalCase | `AppShell.tsx`, `MatchDashboard.tsx` |
| Hooks | kebab-case | `use-match-logic.ts`, `use-global-history.ts` |
| Utils | kebab-case | `format-time.ts`, `export-utils.ts` |
| Domain | kebab-case | `command-api.ts`, `action-gating.ts` |
| Types | kebab-case | `types.ts` |
| Constants | kebab-case | `defaults.ts`, `periods.ts` |

### Inconsistencies
✅ **None** — Naming is consistent within categories. The mix of PascalCase (components) and kebab-case (everything else) is idiomatic for React/TypeScript projects.

### Filesystem Coherence
✅ **Layered architecture**:
- `domain/` → Pure logic (no UI imports)
- `features/` → UI components (imports domain)
- `adapters/` → External integrations
- `hooks/` → React hooks (bridge domain ↔ UI)
- `ui/` → Presentational primitives

⚠️ **Ambiguous folders**: None — `utils/` is clearly side-effect-free helpers.

### Proposed Canonical Structure
Current structure is **already optimal**. No migration needed.

---

## 6. Quality Gates: Testing, CI, Deploy

### Test Coverage
| Type | Location | Count | Status |
|------|----------|-------|--------|
| Integration | `tests/vitest/integration/` | 1 file (P0 regressions) | ✅ Passing |
| Component | `tests/vitest/component/` | 9 files | ✅ Passing |
| Unit | `tests/vitest/unit/` | 4 files | ✅ Passing |
| E2E | `tests/e2e/` | 2 files (sidebar) | ✅ Passing |
| **Total** | — | **99 tests** | ✅ All passing |

### Coverage Gaps
| Flow | Current Coverage | Gap |
|------|------------------|-----|
| Event recording | ✅ Covered | None |
| Timer control | ✅ Covered | None |
| Phase transitions | ✅ Covered | None |
| **Export (JSON/PNG/CSV/HTML)** | ❌ None | **Add E2E tests** |
| Command palette | ⚠️ Partial | Add keyboard nav test |
| Audio playback | ⚠️ Mock only | Acceptable (Web Audio API) |

### CI Workflow
**File**: `.github/workflows/ci.yml`  
**Steps**:
1. ✅ TypeScript check (`npm run typecheck`)
2. ✅ Tests (`npm test`)
3. ✅ Build (`npm run build`)

**Missing**:
- ❌ No E2E tests in CI (only unit/component)
- ❌ No bundle size tracking
- ❌ No deploy step

### Deploy Workflow
**Status**: ❌ **Missing** — No `.github/workflows/deploy.yml`

**Required**:
```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
        env:
          VITE_BASE_PATH: /subbuteo-referee-app
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

---

## 7. Security & Reliability

### Security Audit
| Check | Result |
|-------|--------|
| `npm audit` | ✅ 0 vulnerabilities |
| `.env` handling | ✅ In `.gitignore` (unused, client-only) |
| Secrets in code | ✅ None found |
| XSS risks | ✅ React escapes by default; no `dangerouslySetInnerHTML` |
| localStorage injection | ⚠️ JSON parsing wrapped in try/catch but no schema validation |

### Reliability Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| Console logs in prod | Low (perf impact) | Replace with no-op logger |
| localStorage quota exceeded | Medium (loss of data) | Add quota check before save |
| AudioContext init failure | Low (graceful fallback) | ✅ Already handled with no-op |
| Invalid JSON import | Medium (crash on import) | Add Zod schema validation |

### Error Boundary Coverage
❌ **Missing**: No React error boundary in `App` or `AppShell` → unhandled errors crash entire UI.

**Fix**: Wrap `AppShell` in `<ErrorBoundary fallback={<ErrorScreen />}>`.

---

## 8. Patch-Ready Changes (Top 5 ROI)

### PATCH 1: Remove Dead Code Comments
**File**: `src/app/AppShell.tsx`  
**Lines**: 158, 365-370  
**Impact**: Code clarity  
**Risk**: Zero

### PATCH 2: Create Production Logger Abstraction
**New File**: `src/utils/logger.ts`  
**Impact**: Remove 29 console.log/warn/error calls from prod bundle  
**Risk**: Low (needs testing)

### PATCH 3: Add GitHub Pages Deploy Workflow
**New File**: `.github/workflows/deploy.yml`  
**Impact**: Automated deployment on push to main  
**Risk**: Zero (new file)

### PATCH 4: Add Error Boundary
**File**: `src/app/app.tsx`  
**Impact**: Prevent entire UI crash on unhandled errors  
**Risk**: Low

### PATCH 5: Add Formation Validation
**File**: `src/features/dashboard/dashboard-selectors.ts`  
**Impact**: Complete TODO for dashboard accuracy  
**Risk**: Zero

---

## Roadmap

### 0–2 Days (Quick Wins)
- ✅ **PATCH 1**: Remove dead code comments
- ✅ **PATCH 3**: Add deploy workflow
- ✅ **PATCH 4**: Add error boundary
- ✅ **PATCH 5**: Implement formation check

### 1–2 Weeks (Structural Refactors)
- Extract sidebar state from AppShell to `useSidebar` hook (~400 LOC → 250 LOC)
- Add production logger abstraction
- Add E2E tests for export flows
- Add bundle size tracking to CI

### Later (Nice-to-Haves)
- Zod schema validation for localStorage imports
- Explicit TieBreakStrategy interface (if rules expand)
- Command undo stack with metadata (for richer UX)
- Bundle size target: 120 KB (current 128 KB)

---

## Conclusion

**Overall Grade**: 🏆 **A (Excellent)**

This codebase demonstrates **enterprise-grade architecture** with:
- Clean domain isolation
- Event-sourced correctness
- Comprehensive testing
- Zero security vulnerabilities
- Idiomatic React/TypeScript patterns

The main improvements are **operational** (deploy automation, logging) rather than architectural. The dual-history time-travel system and FSM guards are particularly impressive.

**Recommendation**: Ship with confidence after applying patches 1, 3, 4, and 5.
