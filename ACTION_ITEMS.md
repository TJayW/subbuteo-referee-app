# Quick Reference — Post-Audit Action Items

## ✅ Completed (Immediate Deployment Ready)

### Patches Applied
- [x] **PATCH 1**: Dead code removed from AppShell
- [x] **PATCH 2**: Logger abstraction created (`src/utils/logger.ts`)
- [x] **PATCH 3**: GitHub Pages deploy workflow added
- [x] **PATCH 4**: Error boundary added to prevent UI crashes
- [x] **PATCH 5**: Formation validation completed in dashboard

### Verification
- [x] TypeScript compilation: ✅ Clean
- [x] Test suite: 131 passing (4 pre-existing E2E failures unrelated to patches)
- [x] npm audit: 0 vulnerabilities
- [x] Bundle size: ~128 KB (no regression)

---

## 📋 Next Steps (Priority Order)

### P0 — Immediate (Before First Deploy)
1. **Activate GitHub Pages**
   - Go to: Repository → Settings → Pages
   - Set Source: "GitHub Actions"
   - Push to `main` to trigger first deploy
   - Verify: Check that base path `/subbuteo-referee-app/` works correctly

### P1 — Short Term (1-2 Weeks)
2. **Replace console calls with logger** (29 occurrences)
   ```bash
   # Files to update:
   # src/adapters/audio/*.ts (11 calls)
   # src/hooks/*.ts (5 calls)
   # src/app/AppShell.tsx (2 calls)
   # src/features/**/*.tsx (6 calls)
   # src/utils/*.ts (2 calls)
   # src/adapters/storage/*.ts (3 calls)
   ```
   - Import `logger` from `@/utils/logger`
   - Replace `console.warn` → `logger.warn`
   - Replace `console.error` → `logger.error`

3. **Fix 4 pre-existing E2E test failures**
   - Files: `tests/vitest/integration/p0-regressions.test.tsx`, `tests/vitest/component/operator-visibility.test.tsx`
   - Issue: aria-label selectors outdated after Italian translations
   - Fix: Update test selectors to match current Italian strings

4. **Add E2E tests for export flows**
   ```typescript
   // tests/e2e/export.spec.ts
   test('JSON export downloads valid file', async ({ page }) => {
     // Click export → JSON
     // Verify download + JSON structure
   });
   test('PNG export captures screenshot', async ({ page }) => { ... });
   test('CSV export includes all events', async ({ page }) => { ... });
   test('HTML export renders correctly', async ({ page }) => { ... });
   ```

### P2 — Medium Term (2-4 Weeks)
5. **Refactor AppShell: Extract sidebar logic**
   - Current: 649 lines, mixed concerns
   - Target: ~400 lines
   - Extract: `useSidebar(layoutMode)` hook
   - Benefits: Better testability, cleaner separation

6. **Add bundle size tracking to CI**
   ```yaml
   # .github/workflows/ci.yml
   - name: Build and check bundle size
     run: |
       npm run build
       SIZE=$(du -sh dist | cut -f1)
       echo "Bundle size: $SIZE"
       # Fail if > 130KB
   ```

7. **Add Zod validation for localStorage imports**
   ```typescript
   // src/adapters/storage/schemas.ts
   import { z } from 'zod';
   export const MatchStateSchema = z.object({
     matchId: z.string(),
     events: z.array(...),
     // ... complete schema
   });
   ```

### P3 — Future (Nice-to-Have)
8. **Explicit TieBreakStrategy interface**
   - Replace boolean `requireExtraTime` with:
   ```typescript
   interface TieBreakStrategy {
     name: 'extra_time_then_pens' | 'extra_time_only' | 'pens_only';
     shouldPlayExtraTime(state: MatchState): boolean;
     getNextPhase(state: MatchState): MatchPhase;
   }
   ```

9. **Command undo stack with metadata**
   - Current: `undoStack: DomainMatchState[]`
   - Enhanced: `undoStack: { state, command, timestamp, description }[]`
   - Benefit: Richer undo UI ("Undo: Add Goal (23:45)")

---

## 🚨 Critical Dependencies

### Before Deploy
- Ensure `VITE_BASE_PATH` matches GitHub Pages URL
- Test locally: `VITE_BASE_PATH=/subbuteo-referee-app/ npm run build && npm run preview`

### Before Production Use
- Review console output in staging for any remaining debug logs
- Test localStorage import/export with sample match data
- Verify audio playback on iOS Safari (Web Audio API edge cases)

---

## 📊 Success Metrics

### Deployment
- [ ] GitHub Pages URL loads without 404
- [ ] All assets load (CSS, JS, fonts)
- [ ] No console errors on fresh load
- [ ] LocalStorage persistence works

### Quality Gates
- [ ] TypeScript: 0 errors
- [ ] Tests: ≥131 passing
- [ ] npm audit: 0 vulnerabilities
- [ ] Bundle size: ≤130 KB gzipped

### User Experience
- [ ] Timer starts/stops correctly
- [ ] Events log and undo work
- [ ] Export (JSON/PNG/CSV/HTML) all functional
- [ ] Sidebar resize smooth on desktop
- [ ] Bottom dock visible on mobile

---

## 🔗 Key Files Reference

### Documentation
- `AUDIT_REPORT.md` — Full audit with findings table
- `PATCH_SUMMARY.md` — Detailed patch descriptions
- `EXECUTIVE_SUMMARY.md` — High-level briefing
- `docs/spec.md` — Technical specification

### New Files (From Patches)
- `.github/workflows/deploy.yml` — Deployment automation
- `src/utils/logger.ts` — Production-safe logging
- `src/ui/components/ErrorBoundary.tsx` — Error handling

### Modified Files
- `src/app/AppShell.tsx` — Dead code removed
- `src/app/app.tsx` — Error boundary wrapper
- `src/features/dashboard/dashboard-selectors.ts` — Formation validation

---

## 🎯 Definition of Done

**Immediate (Pre-Deploy):**
✅ All patches applied  
✅ TypeScript clean  
✅ Tests passing (131/135)  
✅ Security audit clean  
⏳ GitHub Pages activated  

**Short-Term (P1):**
⏳ Console calls replaced with logger  
⏳ E2E test failures fixed  
⏳ Export flows E2E tested  

**Medium-Term (P2):**
⏳ AppShell refactored  
⏳ Bundle size tracking added  
⏳ Zod validation implemented  

---

## 📞 Support

**Questions?** Reference:
1. `AUDIT_REPORT.md` → Detailed findings
2. `PATCH_SUMMARY.md` → Patch implementation details
3. `docs/spec.md` → Architecture documentation
4. GitHub Issues → Track P1/P2 work

**Deploy Issues?**
- Check `.github/workflows/deploy.yml` logs
- Verify `VITE_BASE_PATH` setting
- Test locally: `npm run build && npm run preview`

---

**Last Updated:** 12 Gennaio 2026  
**Status:** ✅ Ready for Production Deployment
