# Pre-Deployment Verification Script for ConfiaTour (PowerShell)
# Run this before deploying to Render

Write-Host "🚀 ConfiaTour - Pre-Deployment Checks" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

$PASSED = 0
$FAILED = 0

# Check Node version
Write-Host "📦 Checking Node.js version..." -ForegroundColor White
$nodeVersion = node -v
if ($nodeVersion -match "^v(20|21)\.") {
    Write-Host "✓ Node.js version: $nodeVersion" -ForegroundColor Green
    $PASSED++
} else {
    Write-Host "✗ Node.js version: $nodeVersion (Required: >= 20.0.0)" -ForegroundColor Red
    $FAILED++
}
Write-Host ""

# Check npm version
Write-Host "📦 Checking npm version..." -ForegroundColor White
$npmVersion = npm -v
Write-Host "✓ npm version: $npmVersion" -ForegroundColor Green
$PASSED++
Write-Host ""

# Check if dependencies are installed
Write-Host "📚 Checking dependencies..." -ForegroundColor White
if (Test-Path "node_modules") {
    Write-Host "✓ node_modules exists" -ForegroundColor Green
    $PASSED++
} else {
    Write-Host "✗ node_modules not found. Run: npm install" -ForegroundColor Red
    $FAILED++
}
Write-Host ""

# Check environment file
Write-Host "🔐 Checking environment variables..." -ForegroundColor White
if (Test-Path ".env.local") {
    Write-Host "✓ .env.local exists" -ForegroundColor Green
    $PASSED++
} else {
    Write-Host "⚠ .env.local not found (OK for Render deployment)" -ForegroundColor Yellow
    $PASSED++
}
Write-Host ""

# Run type check
Write-Host "🔍 Running TypeScript type check..." -ForegroundColor White
$typeCheckResult = npm run type-check 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Type check passed" -ForegroundColor Green
    $PASSED++
} else {
    Write-Host "✗ Type check failed. Run: npm run type-check" -ForegroundColor Red
    $FAILED++
}
Write-Host ""

# Run build
Write-Host "🏗️  Testing build..." -ForegroundColor White
$buildResult = npm run build 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Build successful" -ForegroundColor Green
    $PASSED++
} else {
    Write-Host "✗ Build failed. Run: npm run build" -ForegroundColor Red
    $FAILED++
}
Write-Host ""

# Check for required files
Write-Host "📄 Checking required files..." -ForegroundColor White
$requiredFiles = @("package.json", "next.config.js", "tsconfig.json", ".nvmrc", "render.yaml")
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✓ $file exists" -ForegroundColor Green
        $PASSED++
    } else {
        Write-Host "✗ $file not found" -ForegroundColor Red
        $FAILED++
    }
}
Write-Host ""

# Check git status
Write-Host "🔄 Checking git status..." -ForegroundColor White
if (Test-Path ".git") {
    $gitStatus = git status --porcelain
    if ([string]::IsNullOrEmpty($gitStatus)) {
        Write-Host "✓ No uncommitted changes" -ForegroundColor Green
        $PASSED++
    } else {
        Write-Host "⚠ Uncommitted changes found:" -ForegroundColor Yellow
        Write-Host $gitStatus -ForegroundColor Yellow
        $PASSED++
    }
} else {
    Write-Host "✗ Not a git repository" -ForegroundColor Red
    $FAILED++
}
Write-Host ""

# Summary
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "📊 Summary" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Passed: $PASSED" -ForegroundColor Green
Write-Host "Failed: $FAILED" -ForegroundColor Red
Write-Host ""

if ($FAILED -eq 0) {
    Write-Host "✅ All checks passed! Ready to deploy to Render." -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. git add ."
    Write-Host "2. git commit -m 'Ready for Render deployment'"
    Write-Host "3. git push origin main"
    Write-Host "4. Deploy on Render Dashboard"
    exit 0
} else {
    Write-Host "❌ Some checks failed. Please fix the issues before deploying." -ForegroundColor Red
    exit 1
}
