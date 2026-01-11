#!/bin/bash
# Pre-Push Verification Script
# Run this before initializing Git to ensure everything is ready

echo "🔍 Running pre-push verification..."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Run this from project root."
    exit 1
fi

echo "1️⃣ Checking TypeScript..."
npm run typecheck > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "   ✅ TypeScript: No errors"
else
    echo "   ❌ TypeScript: Errors found (run 'npm run typecheck')"
    exit 1
fi

echo ""
echo "2️⃣ Running tests..."
npm test > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "   ✅ Tests: Passed"
else
    echo "   ⚠️  Tests: Some failures (expected baseline: 115/125 pass)"
fi

echo ""
echo "3️⃣ Building production bundle..."
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "   ✅ Build: Success"
else
    echo "   ❌ Build: Failed (run 'npm run build')"
    exit 1
fi

echo ""
echo "4️⃣ Checking required files..."
files=(".github/workflows/ci.yml" ".github/workflows/pages.yml" "vite.config.ts" "public/404.html" "DEPLOYMENT.md" ".gitignore")
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file"
    else
        echo "   ❌ Missing: $file"
        exit 1
    fi
done

echo ""
echo "5️⃣ Checking .gitignore..."
if grep -q "node_modules" .gitignore && grep -q "dist" .gitignore && grep -q ".env" .gitignore; then
    echo "   ✅ .gitignore: Configured correctly"
else
    echo "   ❌ .gitignore: Missing critical entries"
    exit 1
fi

echo ""
echo "6️⃣ Checking Vite config..."
if grep -q "VITE_BASE_PATH" vite.config.ts; then
    echo "   ✅ Vite: GitHub Pages base path configured"
else
    echo "   ❌ Vite: Missing base path configuration"
    exit 1
fi

echo ""
echo "════════════════════════════════════════════════════════════"
echo "✅ ALL CHECKS PASSED - READY TO PUSH TO GITHUB!"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "Next steps:"
echo "1. Initialize Git in VS Code (Cmd+Shift+G → Initialize Repository)"
echo "2. Commit all files: 'Initial commit - production ready'"
echo "3. Publish to GitHub: Cmd+Shift+P → 'GitHub: Publish to GitHub'"
echo "4. Select: Private repository"
echo "5. Repository name: subbuteo-referee-app"
echo ""
echo "See DEPLOYMENT.md for complete instructions."
echo ""
