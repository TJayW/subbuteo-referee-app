# 🚀 GitHub Deployment Guide

## STEP 0: Pre-Push Checklist ✅

Verifica locale completata:
- ✅ TypeScript: 0 errori
- ✅ Build: Success (730.30 kB)
- ✅ Test: 115/125 pass
- ✅ .gitignore: Completo (.env, dist/, node_modules)
- ✅ Workflow CI/Pages: Creati
- ✅ Vite base path: Configurato

---

## STEP 1: Initialize Git & Create Repository

### Option A: Using VS Code (Recommended)

1. **Initialize Git in VS Code:**
   - Open Source Control panel (Cmd+Shift+G)
   - Click "Initialize Repository"
   - Stage all files (click + icon)
   - Commit with message: "Initial commit - production ready"

2. **Create Private GitHub Repo:**
   - Open Command Palette (Cmd+Shift+P)
   - Type: "GitHub: Publish to GitHub"
   - Select: **Private repository**
   - Name: `subbuteo-referee-app`
   - Click "Publish"

### Option B: Using CLI

```bash
cd /Users/tjw/Desktop/subbuteo-referee-app

# Initialize git
git init
git add .
git commit -m "Initial commit - production ready"

# Create repo using GitHub CLI (if installed)
gh repo create subbuteo-referee-app --private --source=. --remote=origin --push

# OR create manually on GitHub.com then:
git remote add origin git@github.com:YOUR_USERNAME/subbuteo-referee-app.git
git branch -M main
git push -u origin main
```

---

## STEP 2: Configure GitHub Pages

### In GitHub Repository Settings:

1. Go to: `https://github.com/YOUR_USERNAME/subbuteo-referee-app/settings/pages`

2. **Source:**
   - Select: "GitHub Actions"
   - (NOT "Deploy from a branch")

3. **Custom Domain:** (Optional)
   - Leave blank for default: `YOUR_USERNAME.github.io/subbuteo-referee-app`

4. **Save**

⚠️ **IMPORTANT - Private Repo & Public Pages:**
- With GitHub Free/Pro: Pages from private repos are PUBLIC
- Your code stays private, but the deployed site is accessible
- This is the intended behavior for this project
- If you need private Pages: Upgrade to GitHub Enterprise

---

## STEP 3: Branch Protection Rules

Go to: `Settings → Branches → Add rule`

**Branch name pattern:** `main`

Enable:
- ✅ Require a pull request before merging
- ✅ Require status checks to pass before merging
  - Add: `test` (from CI workflow)
- ✅ Require branches to be up to date before merging
- ✅ Do not allow bypassing the above settings

**Create Rule**

---

## STEP 4: Verify Deployment

### First Deployment:

1. **Check Actions:**
   - Go to: `https://github.com/YOUR_USERNAME/subbuteo-referee-app/actions`
   - You should see:
     - ✅ CI workflow (running or completed)
     - ✅ Deploy to GitHub Pages workflow (running or completed)

2. **Check Pages URL:**
   - After 2-3 minutes, visit:
   - `https://YOUR_USERNAME.github.io/subbuteo-referee-app/`
   - The app should load and work correctly

3. **Verify Routing:**
   - Click around in the app
   - Refresh a nested route (e.g., `/dashboard`)
   - Should NOT get 404 (SPA routing fixed)

### Troubleshooting:

**Problem: 404 on GitHub Pages**
- Check: Actions logs for build errors
- Check: `Settings → Pages` shows correct source
- Wait: Initial deployment can take 5-10 minutes

**Problem: Assets not loading (404 for CSS/JS)**
- Check: `vite.config.ts` has `base: process.env.VITE_BASE_PATH || '/'`
- Check: Pages workflow sets `VITE_BASE_PATH: /subbuteo-referee-app/`
- Rebuild: Re-run the Pages workflow manually

**Problem: Nested routes show 404**
- Check: `public/404.html` exists
- Check: `index.html` has SPA redirect script
- Check: Both files deployed in `dist/`

**Problem: CI workflow fails**
- Check: Actions logs for test failures
- Fix locally, commit, push
- Workflow will re-run automatically

---

## STEP 5: Development Workflow

### Making Changes:

```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes, test locally
npm run typecheck
npm test
npm run build

# Commit and push
git add .
git commit -m "feat: add new feature"
git push origin feature/your-feature
```

### Open Pull Request:

1. Go to GitHub → Pull Requests → New PR
2. Base: `main`, Compare: `feature/your-feature`
3. Fill out PR template
4. Wait for CI checks to pass
5. Request review (if team)
6. Merge when approved

### Deploy to Pages:

- **Automatic:** Every push to `main` triggers Pages deployment
- **Manual:** Go to Actions → Deploy to GitHub Pages → Run workflow

---

## STEP 6: Environment Variables & Secrets

### Current Setup:
- ✅ No secrets required (client-side only app)
- ✅ No API keys
- ✅ No backend services

### If You Add Secrets Later:

1. **Never commit `.env` files**
   - Already in `.gitignore`

2. **Use GitHub Secrets:**
   - Settings → Secrets and variables → Actions
   - Add secrets there
   - Reference in workflows: `${{ secrets.SECRET_NAME }}`

3. **For local development:**
   - Create `.env.local` (already gitignored)
   - Document required vars in README

---

## STEP 7: Maintenance

### Dependabot:
- Already configured (`.github/dependabot.yml`)
- Will create PRs weekly for dependency updates
- Review and merge after CI passes

### Monitoring:
- Check Actions tab for workflow failures
- Set up notifications: Settings → Notifications → Actions

### Updating Deployment:
- Just push to `main` or merge a PR
- Pages will auto-deploy in 2-3 minutes

---

## 📋 Definition of Done

- [ ] Git initialized and first commit made
- [ ] Private GitHub repo created
- [ ] All files pushed to `main`
- [ ] GitHub Pages configured (Actions source)
- [ ] First deployment successful
- [ ] Site accessible at `YOUR_USERNAME.github.io/subbuteo-referee-app`
- [ ] SPA routing works (no 404 on refresh)
- [ ] Branch protection enabled on `main`
- [ ] CI workflow runs on PRs
- [ ] Dependabot configured

---

## 🔗 Quick Links

After setup, bookmark these:

- **Live Site:** `https://YOUR_USERNAME.github.io/subbuteo-referee-app/`
- **Repository:** `https://github.com/YOUR_USERNAME/subbuteo-referee-app`
- **Actions:** `https://github.com/YOUR_USERNAME/subbuteo-referee-app/actions`
- **Settings:** `https://github.com/YOUR_USERNAME/subbuteo-referee-app/settings`
- **Pages Config:** `https://github.com/YOUR_USERNAME/subbuteo-referee-app/settings/pages`

---

## 📝 Notes

**Why Private Repo + Public Pages?**
- Code/history stays private (competitive advantage, clean commits)
- Deployed app is public (showcase, demo, user access)
- Standard practice for client-side apps

**Cost:**
- GitHub Free: Private repos + public Pages = $0/month
- No upgrade needed unless you need private Pages

**Security:**
- No secrets in code ✅
- No backend to secure ✅
- Client-side only, no data transmission ✅
- localStorage only (user's browser) ✅
