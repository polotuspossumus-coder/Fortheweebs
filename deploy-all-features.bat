@echo off
echo ========================================
echo   Deploying ALL Features
echo ========================================
echo.
echo Features to deploy:
echo   1. $1000+ Tier Superpowers (AI Generator, AI Studio, Face Sorter)
echo   2. Viewer Payment System ($15/month adult access + per-creator fees)
echo   3. Admin QR Authentication
echo.

echo [1/6] Integrating superpowers...
node integrate-superpowers.js
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to integrate superpowers
    pause
    exit /b 1
)
echo.

echo [2/6] Integrating payment system...
node integrate-payment-system.js
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to integrate payment system
    pause
    exit /b 1
)
echo.

echo [3/6] Staging all changes...
git add .
echo.

echo [4/6] Creating commit...
git commit -m "Add complete platform: AI superpowers + viewer payment system + admin auth"
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: Nothing to commit or commit failed
)
echo.

echo [5/6] Pushing to GitHub...
git push origin backup-20251106
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: Git push failed, but continuing with deployment...
)
echo.

echo [6/6] Deploying to Vercel...
set VERCEL_ORG_ID=team_vxmbpP2GikFCSLlwHzh861kk
set VERCEL_PROJECT_ID=prj_KJjmrO2nXRZcaeNIn3fqaIenKxQA
vercel --prod --yes
echo.

echo ========================================
echo   Deployment Complete!
echo ========================================
echo.
echo Platform Features Now Live:
echo.
echo   ADMIN FEATURES (Owner Only):
echo     - QR Code Authentication
echo     - Family Access System
echo     - Earnings Dashboard
echo.
echo   $1000+ TIER SUPERPOWERS:
echo     - Universal AI Content Generator
echo     - AI Studio (Character Recognition + Voice + CGI)
echo     - Facial Media Sorter
echo     - FREE access to all content and creators
echo.
echo   PAYMENT SYSTEM:
echo     - Creators: FREE adult access
echo     - Viewers: $15/month for adult access
echo     - Per-Creator: Individual creator subscription fees
echo     - Owner + $1000 tier: FREE access to EVERYTHING
echo.
echo   GENERAL FEATURES:
echo     - Photo Tools Hub
echo     - Content Planner
echo     - AR/VR Studio
echo     - Influencer Verification
echo     - Legal Documents
echo.
echo Admin Access: ?admin=true
echo.
pause
