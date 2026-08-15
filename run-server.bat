@echo off
title UniPrime Server
cd /d "%~dp0server"
echo Starting UniPrime API server...
echo Press Ctrl+C to stop.
echo.
call npm run dev
pause
