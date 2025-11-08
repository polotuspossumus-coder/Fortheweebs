@echo off
echo ========================================
echo   Deploying $1000+ Tier Superpowers
echo ========================================
echo.

echo [1/5] Integrating superpowers into dashboard...
node integrate-superpowers.js
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to integrate superpowers
    pause
    exit /b 1
)
echo.

echo [2/5] Staging changes for Git...
git add .
echo.

echo [3/5] Creating commit...
git commit -m "Add $1000+ tier superpowers: AI Generator, AI Studio, Face Sorter"
echo.

echo [4/5] Pushing to GitHub...
git push origin backup-20251106
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: Git push failed, but continuing with deployment...
)
echo.

echo [5/5] Deploying to Vercel...
set VERCEL_ORG_ID=team_vxmbpP2GikFCSLlwHzh861kk
set VERCEL_PROJECT_ID=prj_KJjmrO2nXRZcaeNIn3fqaIenKxQA
vercel --prod --yes
echo.

echo ========================================
echo   Deployment Complete!
echo ========================================
echo.
echo Your superpowers are now live:
echo   - Universal AI Generator (any content from images + context)
echo   - AI Studio (character recognition + voice + CGI)
echo   - Facial Media Sorter (group by face + auto-name)
echo.
echo Access: Only visible to $1000+ tier holders
echo.
pause
