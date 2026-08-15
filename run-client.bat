@echo off
title UniPrime Client
cd /d "%~dp0client"
echo Starting UniPrime React app (http://localhost:5173)...
echo Press Ctrl+C to stop.
echo.
call npm run dev
pause
