#!/bin/bash

# Pre-Deployment Verification Script for ConfiaTour
# Run this before deploying to Render

echo "🚀 ConfiaTour - Pre-Deployment Checks"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0

# Check Node version
echo "📦 Checking Node.js version..."
NODE_VERSION=$(node -v)
if [[ $NODE_VERSION == v20* ]] || [[ $NODE_VERSION == v21* ]]; then
    echo -e "${GREEN}✓${NC} Node.js version: $NODE_VERSION"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} Node.js version: $NODE_VERSION (Required: >= 20.0.0)"
    ((FAILED++))
fi
echo ""

# Check npm version
echo "📦 Checking npm version..."
NPM_VERSION=$(npm -v)
if [[ $NPM_VERSION == 10.* ]] || [[ $NPM_VERSION == 9.* ]]; then
    echo -e "${GREEN}✓${NC} npm version: $NPM_VERSION"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠${NC} npm version: $NPM_VERSION (Recommended: >= 10.0.0)"
    ((PASSED++))
fi
echo ""

# Check if dependencies are installed
echo "📚 Checking dependencies..."
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} node_modules exists"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} node_modules not found. Run: npm install"
    ((FAILED++))
fi
echo ""

# Check environment file
echo "🔐 Checking environment variables..."
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✓${NC} .env.local exists"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠${NC} .env.local not found (OK for Render deployment)"
    ((PASSED++))
fi
echo ""

# Run type check
echo "🔍 Running TypeScript type check..."
npm run type-check > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Type check passed"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} Type check failed. Run: npm run type-check"
    ((FAILED++))
fi
echo ""

# Run build
echo "🏗️  Testing build..."
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Build successful"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} Build failed. Run: npm run build"
    ((FAILED++))
fi
echo ""

# Check for required files
echo "📄 Checking required files..."
REQUIRED_FILES=("package.json" "next.config.js" "tsconfig.json" ".nvmrc" "render.yaml")
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file exists"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} $file not found"
        ((FAILED++))
    fi
done
echo ""

# Check git status
echo "🔄 Checking git status..."
if [ -d ".git" ]; then
    UNCOMMITTED=$(git status --porcelain)
    if [ -z "$UNCOMMITTED" ]; then
        echo -e "${GREEN}✓${NC} No uncommitted changes"
        ((PASSED++))
    else
        echo -e "${YELLOW}⚠${NC} Uncommitted changes found:"
        echo "$UNCOMMITTED"
        ((PASSED++))
    fi
else
    echo -e "${RED}✗${NC} Not a git repository"
    ((FAILED++))
fi
echo ""

# Summary
echo "======================================"
echo "📊 Summary"
echo "======================================"
echo -e "${GREEN}Passed:${NC} $PASSED"
echo -e "${RED}Failed:${NC} $FAILED"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed! Ready to deploy to Render.${NC}"
    echo ""
    echo "Next steps:"
    echo "1. git add ."
    echo "2. git commit -m 'Ready for Render deployment'"
    echo "3. git push origin main"
    echo "4. Deploy on Render Dashboard"
    exit 0
else
    echo -e "${RED}❌ Some checks failed. Please fix the issues before deploying.${NC}"
    exit 1
fi
