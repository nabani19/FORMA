#!/usr/bin/env pwsh
# Forma AI Backend - One-Click Setup & Start
# Usage: .\start.ps1 -GeminiKey "AIza..."
#    or: Set $env:GEMINI_API_KEY first, then run .\start.ps1

param(
    [string]$GeminiKey = $env:GEMINI_API_KEY
)

$ErrorActionPreference = "Stop"

# ── 1. Check Gemini API Key ─────────────────────────────────────────────────
if (-not $GeminiKey) {
    Write-Host ""
    Write-Host "  ERROR: GEMINI_API_KEY not set." -ForegroundColor Red
    Write-Host ""
    Write-Host "  Get your key at: https://aistudio.google.com/app/apikey" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  Then run ONE of:" -ForegroundColor Cyan
    Write-Host '    .\start.ps1 -GeminiKey "AIza..."' -ForegroundColor White
    Write-Host '    $env:GEMINI_API_KEY = "AIza..."; .\start.ps1' -ForegroundColor White
    Write-Host ""
    exit 1
}
$env:GEMINI_API_KEY = $GeminiKey

# ── 2. Verify Python ─────────────────────────────────────────────────────────
$pythonExe = $null
foreach ($candidate in @("python", "python3", "py")) {
    try {
        $ver = & $candidate --version 2>&1
        if ($ver -match "Python 3\.(1[0-9]|[89])") {
            $pythonExe = $candidate
            Write-Host "  Python found: $ver" -ForegroundColor Green
            break
        }
    } catch {}
}

if (-not $pythonExe) {
    Write-Host ""
    Write-Host "  ERROR: Python 3.10+ not found." -ForegroundColor Red
    Write-Host ""
    Write-Host "  Install Python from: https://www.python.org/downloads/" -ForegroundColor Yellow
    Write-Host "  IMPORTANT: Check 'Add Python to PATH' during install!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  After installing, open a NEW PowerShell window and run this script again." -ForegroundColor Cyan
    Write-Host ""
    exit 1
}

# ── 3. Create venv if needed ─────────────────────────────────────────────────
if (-not (Test-Path ".\.venv\Scripts\python.exe")) {
    Write-Host "  Creating virtual environment..." -ForegroundColor Cyan
    & $pythonExe -m venv .venv
}

# ── 4. Install / upgrade deps ────────────────────────────────────────────────
Write-Host "  Installing dependencies..." -ForegroundColor Cyan
& ".\.venv\Scripts\pip.exe" install -r requirements.txt --quiet --upgrade

# ── 5. Start server ──────────────────────────────────────────────────────────
Write-Host ""
Write-Host "  ✅  Forma AI Backend starting..." -ForegroundColor Green
Write-Host "  🌐  Open in browser: http://localhost:8000" -ForegroundColor Cyan
Write-Host "  📖  Swagger UI:      http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "  🔑  Using model:     gemini-2.5-flash" -ForegroundColor Cyan
Write-Host ""

& ".\.venv\Scripts\uvicorn.exe" main:app --reload --port 8000 --host 0.0.0.0
