# 📋 GitHub Deployment - Quick Reference Card

## ARCHITECTURE DECISION
- **Repository:** Private (code stays confidential)
- **Deployment:** GitHub Pages (site publicly accessible)
- **Cost:** $0/month (GitHub Free tier)
- **Framework:** Vite 7 + React 19 + TypeScript 5.9
- **Output:** `dist/` folder
- **URL Pattern:** `https://USERNAME.github.io/subbuteo-referee-app/`

---

## WORKFLOW FILES CREATED

### `.github/workflows/ci.yml`
Runs on: Every push to `main` + all PRs
- ✅ TypeScript check
- ✅ Tests (Vitest)
- ✅ Production build
- 📦 Uses npm cache for speed

### `.github/workflows/pages.yml`
Runs on: Every push to `main` + manual trigger
- 🏗️ Builds with GitHub Pages base path
- 📤 Uploads artifact to GitHub Pages
- 🚀 Deploys to live site
- 🔒 Uses `pages: write` permission

---

## VITE CONFIGURATION

### `vite.config.ts`
```typescript
base: process.env.VITE_BASE_PATH || '/'
```

**Local development:** `base: '/'` (localhost:5173)
**GitHub Pages:** `base: '/subbuteo-referee-app/'` (injected by workflow)

---

## SPA ROUTING FIX

### Problem:
GitHub Pages returns 404 for `/dashboard` (direct URL access)

### Solution:
1. **`public/404.html`** - Catches 404s, stores path, redirects to index
2. **`index.html`** - Script restores original path from redirect

**Result:** Deep links work, no 404 errors ✅

---

## PROFESSIONAL FILES

| File | Purpose |
|------|---------|
| `DEPLOYMENT.md` | Complete deployment guide (this document) |
| `SECURITY.md` | Security policy |
| `CONTRIBUTING.md` | Development workflow |
| `LICENSE` | MIT License |
| `.editorconfig` | Editor consistency |
| `.github/dependabot.yml` | Weekly dependency updates |
| `.github/pull_request_template.md` | PR checklist |
| `.github/ISSUE_TEMPLATE/` | Bug/feature templates |

---

## GIT INITIALIZATION COMMANDS

### VS Code Method (RECOMMENDED):
```
1. Cmd+Shift+G (Source Control)
2. "Initialize Repository"
3. Stage all files (+ icon)
4. Commit: "Initial commit - production ready"
5. Cmd+Shift+P → "GitHub: Publish to GitHub"
6. Select: "Private repository"
7. Name: subbuteo-referee-app
8. Click "Publish"
```

### CLI Method:
```bash
cd /Users/tjw/Desktop/subbuteo-referee-app
git init
git add .
git commit -m "Initial commit - production ready"

# Option 1: GitHub CLI
gh repo create subbuteo-referee-app --private --source=. --remote=origin --push

# Option 2: Manual
# Go to github.com/new → Create private repo → Then:
git remote add origin git@github.com:USERNAME/subbuteo-referee-app.git
git branch -M main
git push -u origin main
```

---

## POST-PUSH CONFIGURATION

### 1. Enable GitHub Pages
```
URL: github.com/USERNAME/subbuteo-referee-app/settings/pages
Source: "GitHub Actions" (NOT "Deploy from a branch")
Save
```

### 2. Branch Protection
```
URL: github.com/USERNAME/subbuteo-referee-app/settings/branches
Add rule:
  Branch name: main
  ✅ Require pull request
  ✅ Require status checks: "test"
  ✅ Require branches up to date
Create rule
```

---

## VERIFICATION CHECKLIST

After first push:
- [ ] Go to Actions tab → See CI workflow running
- [ ] Wait 2-3 minutes for Pages deployment
- [ ] Visit: `https://USERNAME.github.io/subbuteo-referee-app/`
- [ ] App loads and works correctly
- [ ] Test SPA routing: refresh on `/dashboard` (should work)
- [ ] Test asset loading: CSS/JS load correctly
- [ ] Check branch protection: Try to push to main directly (should fail)

---

## TROUBLESHOOTING

### ❌ "404 - Site not found"
**Fix:** Settings → Pages → Ensure "GitHub Actions" is selected

### ❌ "Assets not loading (blank page)"
**Check:** 
- Workflow logs: `VITE_BASE_PATH` set correctly
- Browser console: Look for 404s on CSS/JS files
- **Fix:** Re-run Pages workflow

### ❌ "SPA routing broken (404 on refresh)"
**Check:**
- `public/404.html` exists in repo
- `dist/404.html` exists in g output
- **Fix:** Ensure `public/404.html` is not in `.gitignore`

### ❌ "CI workflow failing"
**Check:**
- Actions logs for error details
- **Common cause:** Test failures
- **Fix:** Fix tests locally, commit, push

---

## DEVELOPMENT WORKFLOW

### Make changes:
```bash
git checkout -b feature/my-feature
# ... make changes ...
npm run typecheck
npm test
npm run build
git add .
git commit -m "feat: add my feature"
git push origin feature/my-feature
```

### Open PR on GitHub:
- CI runs automatically
- Requires checks to pass
- Merge to `main` → Auto-deploys to Pages

---

## SECRETS & ENVIRONMENT VARIABLES

**Current status:** ✅ No secrets needed (client-side only app)

**If you add secrets later:**
1. Never commit `.env` files (already in `.gitignore`)
2. Use GitHub Secrets: Settings → Secrets and variables → Actions
3. Reference in workflows: `${{ secrets.SECRET_NAME }}`

---

## COST & PRIVACY

| Item | Status | Cost |
|------|--------|------|
| Private Repository | ✅ Yes | $0 |
| GitHub Actions (CI) | ✅ Enabled | $0 (2000 min/month free) |
| GitHub Pages | ✅ Public site | $0 |
| Custom domain | ❌ Not configured | $0 |

**Privacy note:** Code is private, deployed site is public. This is standard for client-side apps.

---

## USEFUL LINKS (After Setup)

Replace `USERNAME` with your GitHub username:

- **Live Site:** `https://USERNAME.github.io/subbuteo-referee-app/`
- **Repo:** `https://github.com/USERNAME/subbuteo-referee-app`
- **Actions:** `https://github.com/USERNAME/subbuteo-referee-app/actions`
- **Settings:** `https://github.com/USERNAME/subbuteo-referee-app/settings`
- **Pages Config:** `https://github.com/USERNAME/subbuteo-referee-app/settings/pages`
- **Branches:** `https://github.com/USERNAME/subbuteo-referee-app/settings/branches`

---

## MAINTENANCE

### Weekly:
- Review Dependabot PRs
- Merge after CI passes

### Monthly:
- Check Actions usage (should be <100 min/month)
- Review open issues/PRs

### On Release:
- Tag version: `git tag v1.0.0 && git push --tags`
- Create GitHub Release with notes

---

## FINAL VERIFICATION SCRIPT

Run before pushing:
```bash
./verify-ready.sh
```

This checks:
- TypeScript compiles ✅
- Tests pass ✅
- Build succeeds ✅
- All required files present ✅
- Configuration correct ✅

---

**Last Updated:** 11 gennaio 2026  
**Setup Time:** ~10 minutes  
**Maintenance:** <30 min/month  
**Status:** 🚀 Production Ready
