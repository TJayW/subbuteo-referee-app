# GitHub Deployment Checklist

Print this page and check off each step as you complete it.

## PRE-DEPLOYMENT
- [ ] Run `./verify-ready.sh` - all checks pass
- [ ] Review `.gitignore` - no secrets/credentials
- [ ] Review `vite.config.ts` - base path configured
- [ ] Build succeeds locally: `npm run build`
- [ ] TypeScript clean: `npm run typecheck`

## STEP 1: INITIALIZE GIT (Choose one method)

### Method A: VS Code
- [ ] Open Source Control (Cmd+Shift+G)
- [ ] Click "Initialize Repository"
- [ ] Stage all files (+ icon)
- [ ] Commit: "Initial commit - production ready"
- [ ] Command Palette (Cmd+Shift+P)
- [ ] Type: "GitHub: Publish to GitHub"
- [ ] Select: **Private repository**
- [ ] Name: `subbuteo-referee-app`
- [ ] Click "Publish"

### Method B: Command Line
- [ ] `cd /Users/tjw/Desktop/subbuteo-referee-app`
- [ ] `git init`
- [ ] `git add .`
- [ ] `git commit -m "Initial commit - production ready"`
- [ ] `gh repo create subbuteo-referee-app --private --source=. --push`
- [ ] OR: Create at github.com/new, then push manually

## STEP 2: CONFIGURE GITHUB PAGES
- [ ] Go to: Settings → Pages
- [ ] Source: Select **"GitHub Actions"**
- [ ] Click "Save"
- [ ] Note your URL: `https://USERNAME.github.io/subbuteo-referee-app/`

## STEP 3: BRANCH PROTECTION
- [ ] Go to: Settings → Branches
- [ ] Click "Add rule"
- [ ] Branch name pattern: `main`
- [ ] Enable: ✅ Require pull request
- [ ] Enable: ✅ Require status checks: "test"
- [ ] Enable: ✅ Require branches up to date
- [ ] Click "Create rule"

## STEP 4: VERIFY DEPLOYMENT
- [ ] Go to: Actions tab
- [ ] See "CI" workflow completed ✅
- [ ] See "Deploy to GitHub Pages" workflow completed ✅
- [ ] Wait 2-3 minutes for propagation
- [ ] Visit: `https://USERNAME.github.io/subbuteo-referee-app/`
- [ ] App loads correctly
- [ ] Test navigation (click around)
- [ ] Refresh on nested route (no 404)
- [ ] Open browser DevTools → Console (no errors)
- [ ] Test on mobile device (if available)

## STEP 5: POST-DEPLOYMENT
- [ ] Update README with live URL
- [ ] Replace `YOUR_USERNAME` in CODEOWNERS with actual username
- [ ] Bookmark repository URL
- [ ] Bookmark live site URL
- [ ] Bookmark Actions page
- [ ] Share link with team/stakeholders

## TROUBLESHOOTING (If needed)
- [ ] Check Actions logs for errors
- [ ] Verify Pages source is "GitHub Actions"
- [ ] Re-run Pages workflow manually
- [ ] Check browser console for asset 404s
- [ ] Clear browser cache and retry
- [ ] Wait 10 minutes (first deploy can be slow)

## MAINTENANCE SETUP
- [ ] Set GitHub notification preferences
- [ ] Enable email for failed Actions
- [ ] Star the repository (for quick access)
- [ ] Add repository description
- [ ] Add repository topics/tags

## DONE! 🎉
- [ ] Repository is private ✅
- [ ] Site is public ✅
- [ ] CI runs on PRs ✅
- [ ] Auto-deploys on merge ✅
- [ ] Branch protection active ✅
- [ ] Dependabot configured ✅

---

**Completion Date:** ___________________

**Repository URL:** ___________________

**Live Site URL:** ___________________

**Notes:**

___________________________________________________

___________________________________________________

___________________________________________________
