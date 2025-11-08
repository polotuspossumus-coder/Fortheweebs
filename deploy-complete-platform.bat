@echo off
echo ========================================
echo   COMPLETE PLATFORM DEPLOYMENT
echo ========================================
echo.
echo Integrating ALL features:
echo   - AI Superpowers ($1000+ tier)
echo   - Viewer Payment System
echo   - VIP Welcome Letter
echo   - Admin Authentication
echo.

echo [1/7] Integrating AI superpowers...
node integrate-superpowers.js
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to integrate superpowers
    pause
    exit /b 1
)
echo.

echo [2/7] Integrating payment system...
node integrate-payment-system.js
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to integrate payment system
    pause
    exit /b 1
)
echo.

echo [3/7] Integrating VIP welcome letter...
node integrate-vip-welcome.js
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to integrate VIP welcome
    pause
    exit /b 1
)
echo.

echo [4/7] Staging all changes...
git add .
echo.

echo [5/7] Creating commit...
git commit -m "Complete platform: AI superpowers + payment system + VIP welcome + admin auth"
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: Nothing to commit or commit failed
)
echo.

echo [6/7] Pushing to GitHub...
git push origin backup-20251106
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: Git push failed, continuing with deployment...
)
echo.

echo [7/7] Deploying to Vercel...
set VERCEL_ORG_ID=team_vxmbpP2GikFCSLlwHzh861kk
set VERCEL_PROJECT_ID=prj_KJjmrO2nXRZcaeNIn3fqaIenKxQA
vercel --prod --yes
echo.

echo ========================================
echo   DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo YOUR ADMIN ACCESS:
echo   https://fortheweebs-f52uym2b7-jacobs-projects-eac77986.vercel.app?admin=true
echo.
echo PLATFORM FEATURES:
echo.
echo   👑 OWNER FEATURES (You):
echo     - QR Authentication System
echo     - Family Access Codes
echo     - Earnings Dashboard
echo     - FREE access to everything
echo.
echo   💎 $1000 TIER (100 VIP Members):
echo     - 4-Page Welcome Letter
echo     - 3 AI Superpowers:
echo       * Universal AI Content Generator
echo       * AI Studio (Character + Voice + CGI)
echo       * Facial Media Sorter
echo     - FREE access to all content and creators
echo     - $0/month forever
echo.
echo   🎨 CREATORS:
echo     - FREE adult content access
echo     - Photo Tools Hub
echo     - Content Planner
echo     - AR/VR Studio
echo     - Influencer Verification
echo.
echo   👥 VIEWERS:
echo     - $15/month for adult access
echo     - Per-creator subscription fees
echo     - Standard features
echo.
echo Your secrets are safe - VIP letter is generic!
echo.
pause
