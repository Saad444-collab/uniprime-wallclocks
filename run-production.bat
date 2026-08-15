@echo off
title UniPrime Production Build
echo ============================================
echo  UniPrime Wall Clocks - Production Build
echo ============================================
echo.
echo [1/2] Building React client...
cd /d "%~dp0client"
call npm run build
if errorlevel 1 (
  echo.
  echo BUILD FAILED - check the errors above.
  pause
  exit /b 1
)
echo.
echo [2/2] Starting production server (serves built client)...
cd /d "%~dp0server"
set NODE_ENV=production
call npm start
pause